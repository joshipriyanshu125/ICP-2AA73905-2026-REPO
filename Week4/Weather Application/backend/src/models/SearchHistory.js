import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    city: { type: String, required: true, unique: true, trim: true, lowercase: true },
    country: { type: String, default: '', trim: true },
    coords: {
      lat: { type: Number, default: null },
      lon: { type: Number, default: null }
    },
    count: { type: Number, default: 1 },
    lastIcon: { type: String, default: '' },
    lastTemp: { type: Number, default: null }
  },
  { timestamps: true }
);

searchHistorySchema.index({ searchedAt: -1 });

export default mongoose.model('SearchHistory', searchHistorySchema);
