import mongoose from 'mongoose';

const favoriteCitySchema = new mongoose.Schema(
  {
    city: { type: String, required: true, unique: true, trim: true, lowercase: true },
    country: { type: String, default: '', trim: true },
    coords: {
      lat: { type: Number, default: null },
      lon: { type: Number, default: null }
    },
    label: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('FavoriteCity', favoriteCitySchema);
