export interface WeatherData {
  tempC: number;
  condition: string;
  humidity: number;
  windSpeedKmh: number;
}

export class WeatherError extends Error {
  reason: 'not_found' | 'network' | 'unknown';
  status?: number;

  constructor(message: string, reason: 'not_found' | 'network' | 'unknown', status?: number) {
    super(message);
    this.name = 'WeatherError';
    this.reason = reason;
    this.status = status;
  }
}

/**
 * Fetch current weather for a district in India using OpenWeatherMap API.
 * Always fetches fresh data on every invocation.
 */
export async function getWeatherForDistrict(district: {
  name: string;
  coordinates?: { lat: number; lng: number };
}): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('Please define the OPENWEATHER_API_KEY environment variable inside .env');
  }

  const isDev = process.env.NODE_ENV === 'development';
  const districtName = district.name.trim();

  if (isDev) {
    console.log('[DEBUG] Fetching live weather for district:', districtName);
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    districtName
  )},IN&appid=${apiKey}&units=metric`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error: any) {
    if (isDev) {
      console.error('[DEBUG] OpenWeatherMap network error:', error);
    }
    throw new WeatherError(
      `Network error calling weather service: ${error?.message || error}`,
      'network'
    );
  }

  if (response.status === 404) {
    throw new WeatherError(
      `Weather information for district "${districtName}" was not found`,
      'not_found',
      404
    );
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error response');
    if (isDev) {
      console.error(`[DEBUG] OpenWeatherMap failed with status ${response.status}: ${errorText}`);
    }
    throw new WeatherError(
      `OpenWeatherMap API returned error status ${response.status}`,
      'unknown',
      response.status
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch (error: any) {
    if (isDev) {
      console.error('[DEBUG] Failed to parse weather response JSON:', error);
    }
    throw new WeatherError('Failed to parse weather API response JSON', 'unknown');
  }

  if (
    !data ||
    !data.main ||
    typeof data.main.temp !== 'number' ||
    typeof data.main.humidity !== 'number' ||
    !Array.isArray(data.weather)
  ) {
    if (isDev) {
      console.error('[DEBUG] Weather response structure is invalid:', data);
    }
    throw new WeatherError('Invalid weather data structure received from OpenWeatherMap', 'unknown');
  }

  const tempC = Math.round(data.main.temp);
  const condition = data.weather[0]?.main || 'Clear';
  const humidity = data.main.humidity;
  const windMps = data.wind?.speed ?? 0;
  const windSpeedKmh = Math.round(windMps * 3.6);

  return {
    tempC,
    condition,
    humidity,
    windSpeedKmh,
  };
}
