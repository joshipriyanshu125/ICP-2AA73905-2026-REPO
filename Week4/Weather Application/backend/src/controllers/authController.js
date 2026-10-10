import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { httpError } from '../middleware/errorHandler.js';

const ROUNDS = 10;

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) throw httpError(409, 'An account with this email already exists.');

    const passwordHash = await bcrypt.hash(password, ROUNDS);
    const user = await User.create({ name, email, passwordHash });

    res.status(201).json({
      ok: true,
      data: { token: signToken(user), user: user.toSafeJSON() }
    });
  } catch (err) {
    next(err);
  }
}

export async function signin(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!valid) throw httpError(401, 'Incorrect email or password.');

    res.json({ ok: true, data: { token: signToken(user), user: user.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw httpError(401, 'Account no longer exists.');
    res.json({ ok: true, data: { user: user.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
}
