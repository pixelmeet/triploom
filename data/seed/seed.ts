import dbConnect from '../../lib/db';
import District from '../../models/District';
import Attraction from '../../models/Attraction';
import HiddenGem from '../../models/HiddenGem';
import Food from '../../models/Food';
import Festival from '../../models/Festival';
import SafetyInfo from '../../models/SafetyInfo';

import {
  rawDistricts,
  rawAttractions,
  rawHiddenGems,
  rawFood,
  rawFestivals,
  rawSafetyInfo
} from './raw';

import * as dotenv from 'dotenv';
import path from 'path';

// Load env variables from .env in root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function seed() {
  const uri = process.env.MONGODB_URI || '';
  const isDevOrLocal = uri.includes('dev') || uri.includes('localhost');
  const hasForceFlag = process.argv.includes('--force');

  if (!isDevOrLocal && !hasForceFlag) {
    console.warn('WARNING: Target database MONGODB_URI does not appear to be a development or localhost database.');
    console.warn('To override and force seeding on this database, run: npm run db:seed -- --force');
    console.warn('Exiting cleanly without performing database deletion or seeding.');
    process.exit(0);
  }

  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected to database.');

    // Clear existing collections
    console.log('Clearing existing data...');
    await District.deleteMany({});
    await Attraction.deleteMany({});
    await HiddenGem.deleteMany({});
    await Food.deleteMany({});
    await Festival.deleteMany({});
    await SafetyInfo.deleteMany({});
    console.log('Database cleared.');

    // Insert Districts
    console.log('Seeding districts...');
    const createdDistricts = await District.insertMany(rawDistricts);
    console.log(`Seeded ${createdDistricts.length} districts.`);

    // Map District Name to ID
    const districtMap: Record<string, string> = {};
    for (const district of createdDistricts) {
      districtMap[district.name] = district._id.toString();
    }

    // Insert Attractions
    console.log('Seeding attractions...');
    const attractionsWithId = rawAttractions.map(attr => {
      const districtId = districtMap[attr.districtName];
      if (!districtId) {
        throw new Error(`District not found for attraction: ${attr.name}`);
      }
      return {
        name: attr.name,
        districtId,
        type: attr.type,
        tags: attr.tags,
        description: attr.description,
        coordinates: attr.coordinates
      };
    });
    const createdAttractions = await Attraction.insertMany(attractionsWithId);
    console.log(`Seeded ${createdAttractions.length} attractions.`);

    // Insert Hidden Gems
    console.log('Seeding hidden gems...');
    const gemsWithId = rawHiddenGems.map(gem => {
      const districtId = districtMap[gem.districtName];
      if (!districtId) {
        throw new Error(`District not found for hidden gem: ${gem.name}`);
      }
      return {
        name: gem.name,
        districtId,
        tags: gem.tags,
        description: gem.description,
        coordinates: gem.coordinates
      };
    });
    const createdGems = await HiddenGem.insertMany(gemsWithId);
    console.log(`Seeded ${createdGems.length} hidden gems.`);

    // Insert Food items
    console.log('Seeding food recommendations...');
    const foodWithId = rawFood.map(item => {
      const districtId = districtMap[item.districtName];
      if (!districtId) {
        throw new Error(`District not found for food item: ${item.name}`);
      }
      return {
        name: item.name,
        districtId,
        type: item.type,
        description: item.description,
        priceRange: item.priceRange
      };
    });
    const createdFood = await Food.insertMany(foodWithId);
    console.log(`Seeded ${createdFood.length} food items.`);

    // Insert Festivals
    console.log('Seeding festivals...');
    const festivalsWithId = rawFestivals.map(fest => {
      const districtId = districtMap[fest.districtName];
      if (!districtId) {
        throw new Error(`District not found for festival: ${fest.name}`);
      }
      return {
        name: fest.name,
        districtId,
        startDate: fest.startDate,
        endDate: fest.endDate,
        description: fest.description
      };
    });
    const createdFestivals = await Festival.insertMany(festivalsWithId);
    console.log(`Seeded ${createdFestivals.length} festivals.`);

    // Insert Safety Info
    console.log('Seeding safety info...');
    const safetyWithId = rawSafetyInfo.map(info => {
      const districtId = districtMap[info.districtName];
      if (!districtId) {
        throw new Error(`District not found for safety info: ${info.districtName}`);
      }
      return {
        districtId,
        emergencyContacts: info.emergencyContacts,
        guidelines: info.guidelines
      };
    });
    const createdSafety = await SafetyInfo.insertMany(safetyWithId);
    console.log(`Seeded safety info for ${createdSafety.length} districts.`);

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
