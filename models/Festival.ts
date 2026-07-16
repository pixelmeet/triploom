import mongoose, { Schema, Document } from 'mongoose';

export interface IFestival extends Document {
  name: string;
  districtId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  description: string;
}

const FestivalSchema: Schema = new Schema({
  name: { type: String, required: true },
  districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String, required: true },
});

export default mongoose.models.Festival || mongoose.model<IFestival>('Festival', FestivalSchema);
