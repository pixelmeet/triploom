import mongoose, { Schema, Document } from 'mongoose';

export interface IDistrict extends Document {
  name: string;
  region: string;
  bestSeason: string;
  overviewCached: string;
  lastGeneratedAt: Date | null;
  weatherAdviceCached?: string;
  weatherAdviceGeneratedAt?: Date | null;
}

const DistrictSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  region: { type: String, required: true },
  bestSeason: { type: String, required: true },
  overviewCached: { type: String, default: '' },
  lastGeneratedAt: { type: Date, default: null },
  weatherAdviceCached: { type: String, default: '' },
  weatherAdviceGeneratedAt: { type: Date, default: null },
});

export default mongoose.models.District || mongoose.model<IDistrict>('District', DistrictSchema);
