/**
 * imageUrl.js  —  Relative-path resolver for uploaded images
 *
 * Strategy: store and return RELATIVE paths (/uploads/abc.webp).
 * The frontend prepends its own API base URL — this means the same
 * database record works on localhost, cPanel, AWS, or anywhere else
 * with zero server-side config changes.
 *
 * toAbsoluteUrl() is kept as a utility in case you ever need it
 * (e.g. generating email links server-side), but it is NOT called
 * in the response pipeline.
 */

const isPlainObject = (val) =>
  val !== null &&
  typeof val === 'object' &&
  !Array.isArray(val) &&
  !Buffer.isBuffer(val) &&
  !(val instanceof Date) &&
  (val.constructor === Object || val.constructor == null);

const isUploadPath = (value) =>
  typeof value === 'string' && value.startsWith('/uploads/');

/**
 * Kept as a utility for server-side use cases (e.g. email links).
 * NOT used in API responses.
 */
const toAbsoluteUrl = (relativePath) => {
  if (!relativePath) return null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const base = (process.env.APP_URL || '').replace(/\/$/, '');
  return base ? `${base}${relativePath}` : relativePath;
};

/**
 * Walks a plain object or array.
 * Values that are stored upload paths (/uploads/...) are left as-is —
 * they are already the correct relative URL for any client to use.
 * All other values (CSS classes, icon names, colours, etc.) are untouched.
 *
 * This function exists purely to ensure ObjectIds, Dates, and Buffers are
 * not accidentally spread into the response (the isPlainObject guard).
 */
const resolveImageUrls = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(resolveImageUrls);
  }

  if (!isPlainObject(data)) return data;

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      // Upload paths are already correct relative URLs — return as-is
      if (isUploadPath(value)) return [key, value];
      return [key, resolveImageUrls(value)];
    })
  );
};

module.exports = { toAbsoluteUrl, resolveImageUrls };