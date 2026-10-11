import UserSettings, { DEFAULT_SETTINGS } from '../models/UserSettings.js';

/**
 * Alert-preference CRUD — always scoped to req.user.id so a signed-in
 * user can only ever read or write their own row.
 */

/** Current preferences (defaults when the user never saved any). */
export async function getSettings(req, res, next) {
  try {
    const doc = await UserSettings.findOne({ user: req.user.id }).lean();
    res.json({ ok: true, data: doc || { ...DEFAULT_SETTINGS } });
  } catch (err) {
    next(err);
  }
}

/** Create-or-update preferences (validated by settingsSchema). */
export async function updateSettings(req, res, next) {
  try {
    const doc = await UserSettings.findOneAndUpdate(
      { user: req.user.id },
      { $set: { ...req.body, user: req.user.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
    ).lean();
    res.json({ ok: true, data: doc });
  } catch (err) {
    next(err);
  }
}
