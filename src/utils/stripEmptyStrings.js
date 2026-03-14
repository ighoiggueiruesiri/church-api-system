/**
 * Removes every key whose value is an empty string.
 *
 * Swagger (and most multipart form clients) send unfilled fields as "".
 * Stripping them here means only fields the caller actually filled in
 * reach the DTO and the DB — so a PUT with only { headName: "X" } will
 * not overwrite title, desc, etc. with empty strings.
 */
const stripEmptyStrings = (body) =>
  Object.fromEntries(Object.entries(body).filter(([, v]) => v !== ''));

module.exports = { stripEmptyStrings };