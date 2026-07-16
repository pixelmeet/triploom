import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyContact {
  label: string;
  number: string;
}

export interface ISafetyInfo extends Document {
  districtId: mongoose.Types.ObjectId;
  emergencyContacts: IEmergencyContact[];
  guidelines: string[];
}

const EmergencyContactSchema = new Schema({
  label: { type: String, required: true },
  number: { type: String, required: true },
});

const SafetyInfoSchema: Schema = new Schema({
  districtId: { type: Schema.Types.ObjectId, ref: 'District', required: true, unique: true },
  emergencyContacts: { type: [EmergencyContactSchema], default: [] },
  guidelines: { type: [String], default: [] },
});

export default mongoose.models.SafetyInfo || mongoose.model<ISafetyInfo>('SafetyInfo', SafetyInfoSchema);
