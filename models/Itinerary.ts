import mongoose, { Schema, Document } from 'mongoose';

export interface IItineraryItem {
  time: string;
  name: string;
  type: 'attraction' | 'food' | 'hidden_gem';
  estimatedCost: number;
  notes: string;
}

export interface IItineraryDay {
  day: number;
  district: string;
  items: IItineraryItem[];
  dailyEstimatedCost: number;
}

export interface IItinerary extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  days: IItineraryDay[];
  budget: number;
  interests: string[];
  generatedAt: Date;
  status: string;
}

const ItineraryItemSchema = new Schema({
  time: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['attraction', 'food', 'hidden_gem'], required: true },
  estimatedCost: { type: Number, required: true },
  notes: { type: String, default: '' },
}, { _id: false });

const ItineraryDaySchema = new Schema({
  day: { type: Number, required: true },
  district: { type: String, required: true },
  items: [ItineraryItemSchema],
  dailyEstimatedCost: { type: Number, required: true },
}, { _id: false });

const ItinerarySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  days: [ItineraryDaySchema],
  budget: { type: Number, required: true },
  interests: [{ type: String }],
  generatedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },
});

export default mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
