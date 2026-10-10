import mongoose from 'mongoose';

/**
 * Saved / favorite locations (the MERN equivalent of the plan's
 * `saved_locations` table with row-level security: every document is
 * scoped to a user id, so users only ever see their own rows).
 */
const favoriteCitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    city: { type: String, required: true, trim: true, lowercase: true, maxlength: 60 },
    country: { type: String, default: '', trim: true },
    label: { type: String, default: '', trim: true },
    coords: {
      lat: { type: Number, default: null },
      lon: { type: Number, default: null }
    }
  },
  { timestamps: true }
);

// row-level uniqueness: one saved entry per city per user
favoriteCitySchema.index({ user: 1, city: 1 }, { unique: true });

export default mongoose.model('FavoriteCity', favoriteCitySchema);
