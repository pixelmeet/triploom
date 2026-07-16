import mongoose, { Schema, Document } from 'mongoose';

export interface IHiddenGem extends Document {
  name: string;
  districtId: mongoose.Types.ObjectId;
  tags: string[];
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const HiddenGemSchema: Schema = new Schema({
  name: { type: String, required: true },
  districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true },
  tags: { type: [String], default: [] },
  description: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

export default mongoose.models.HiddenGem || mongoose.model<IHiddenGem>('HiddenGem', HiddenGemSchema);
