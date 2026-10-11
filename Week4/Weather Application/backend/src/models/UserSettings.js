import mongoose from 'mongoose';

/**
 * Per-user severe-weather alert preferences — the MERN equivalent of the
 * plan's `user_settings` table (row-level scoping via the user id: one
 * document per user, readable/writable only by that user).
 */
export const DEFAULT_SETTINGS = {
  alertEnabled: true, // master switch for custom threshold alerts
  minTempAlert: 5, // °C — alert when the temperature falls below this
  maxWindAlert: 20 // m/s — alert when the wind exceeds this
};

const userSettingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    alertEnabled: { type: Boolean, default: DEFAULT_SETTINGS.alertEnabled },
    minTempAlert: { type: Number, default: DEFAULT_SETTINGS.minTempAlert, min: -60, max: 60 },
    maxWindAlert: { type: Number, default: DEFAULT_SETTINGS.maxWindAlert, min: 0, max: 120 }
  },
  { timestamps: true }
);

export default mongoose.model('UserSettings', userSettingsSchema);
