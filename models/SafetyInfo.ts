import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyContact {
  label: string;
  number: string;
}

export interface ISafetyInfo extends Document {
  districtId: mongoose.Types.ObjectId;
  emergencyContacts: IEmergencyContact[];
  guidelines: string[];
  guidelinesToneCached?: string[];
  guidelinesToneGeneratedAt?: Date | null;
}

const EmergencyContactSchema = new Schema({
  label: { type: String, required: true },
  number: { type: String, required: true },
});

const SafetyInfoSchema: Schema = new Schema({
  districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true, unique: true },
  emergencyContacts: { type: [EmergencyContactSchema], default: [] },
  guidelines: { type: [String], default: [] },
  guidelinesToneCached: { type: [String], default: [] },
  guidelinesToneGeneratedAt: { type: Date, default: null },
});

export default mongoose.models.SafetyInfo || mongoose.model<ISafetyInfo>('SafetyInfo', SafetyInfoSchema);
