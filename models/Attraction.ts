import mongoose, { Schema, Document } from 'mongoose';

export interface IAttraction extends Document {
  name: string;
  districtId: mongoose.Types.ObjectId;
  type: string;
  tags: string[];
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const AttractionSchema: Schema = new Schema({
  name: { type: String, required: true },
  districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true },
  type: { type: String, required: true },
  tags: { type: [String], default: [] },
  description: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

export default mongoose.models.Attraction || mongoose.model<IAttraction>('Attraction', AttractionSchema);
