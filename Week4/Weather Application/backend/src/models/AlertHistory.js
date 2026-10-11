import mongoose from 'mongoose';

/** A user-scoped record of a threshold or official warning detected in a check. */
const alertHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    city: { type: String, required: true, trim: true, lowercase: true },
    country: { type: String, default: '', trim: true },
    type: { type: String, required: true },
    source: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    value: { type: Number, default: null },
    threshold: { type: Number, default: null },
    forecastFor: { type: String, default: '' },
    detectedAt: { type: Date, default: Date.now, index: true },
    fingerprint: { type: String, required: true }
  },
  { timestamps: true }
);

alertHistorySchema.index({ user: 1, fingerprint: 1 }, { unique: true });

export default mongoose.model('AlertHistory', alertHistorySchema);
