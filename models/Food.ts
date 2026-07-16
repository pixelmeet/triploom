import mongoose, { Schema, Document } from 'mongoose';

export interface IFood extends Document {
  name: string;
  districtId: mongoose.Types.ObjectId;
  type: 'veg' | 'non-veg' | 'street' | 'restaurant';
  description: string;
  priceRange: string;
  aiBlurb: string;
  aiBlurbGeneratedAt: Date | null;
}

const FoodSchema: Schema = new Schema({
  name: { type: String, required: true },
  districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true },
  type: {
    type: String,
    enum: ['veg', 'non-veg', 'street', 'restaurant'],
    required: true,
  },
  description: { type: String, required: true },
  priceRange: { type: String, required: true },
  aiBlurb: { type: String, default: '' },
  aiBlurbGeneratedAt: { type: Date, default: null },
});

export default mongoose.models.Food || mongoose.model<IFood>('Food', FoodSchema);
