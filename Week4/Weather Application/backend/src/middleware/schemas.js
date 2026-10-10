import { z } from 'zod';

/* ---------------- weather query ---------------- */

const optionalLat = z.coerce
  .number({ invalid_type_error: 'lat must be a number' })
  .min(-90, 'lat must be between -90 and 90')
  .max(90, 'lat must be between -90 and 90')
  .optional();

const optionalLon = z.coerce
  .number({ invalid_type_error: 'lon must be a number' })
  .min(-180, 'lon must be between -180 and 180')
  .max(180, 'lon must be between -180 and 180')
  .optional();

const cityString = z
  .string({ required_error: 'city is required' })
  .trim()
  .min(2, 'City name must be at least 2 characters')
  .max(60, 'City name must be at most 60 characters');

/** Either ?city=… or ?lat=…&lon=… (geolocation) — never both required. */
export const weatherQuerySchema = z
  .object({
    city: cityString.optional(),
    lat: optionalLat,
    lon: optionalLon
  })
  .refine((v) => v.city || (v.lat !== undefined && v.lon !== undefined), {
    message: 'Provide a city name or both lat and lon coordinates.'
  })
  .refine((v) => !(v.lat === undefined || v.lon === undefined) || v.city, {
    message: 'Both lat and lon query parameters are required together.'
  });

/* ---------------- geocoding search ---------------- */

export const searchQuerySchema = z.object({
  q: cityString
});

/* ---------------- auth ---------------- */

export const signupSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters')
});

export const signinSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Enter a valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required')
});

/* ---------------- favorites ---------------- */

export const favoriteSchema = z.object({
  city: cityString,
  country: z.string().trim().max(10).optional().default(''),
  label: z.string().trim().max(40).optional().default(''),
  coords: z
    .object({
      lat: optionalLat,
      lon: optionalLon
    })
    .optional()
    .default(null)
    .nullable()
});
