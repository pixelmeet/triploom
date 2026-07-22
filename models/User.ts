import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email: string;
  passwordHash?: string;
  image?: string;
  provider: 'credentials' | 'google';
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  image: { type: String, default: '' },
  provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
