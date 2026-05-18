/**
 * fileHelper.js — Generic utility for purging uploaded files from disk
 *
 * Place at: src/utils/fileHelper.js
 *
 * Works on any environment (local, cPanel, AWS local storage, etc.)
 * as long as files are stored in public/uploads/ relative to the project root.
 */

const fs = require('fs');
const path = require('path');
const { logger } = require('../config/logger');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

/**
 * Deletes a stored upload file from disk given its relative path.
 *
 * @param {string|null|undefined} storedPath  e.g. "/uploads/abc.webp"
 *
 * Silent no-op if:
 *   - storedPath is empty / null
 *   - path is an external URL (http/https) — not our file to delete
 *   - file does not exist on disk (already purged or never saved)
 */
const deleteUploadedFile = (storedPath) => {
  if (!storedPath) return;

  // External URL — not our file
  if (/^https?:\/\//i.test(storedPath)) return;

  // Extract just the filename from "/uploads/abc.webp"
  const filename = path.basename(storedPath);
  const fullPath = path.join(UPLOAD_DIR, filename);

  // Resolve and confirm it stays inside the upload directory (path traversal guard)
  if (!fullPath.startsWith(UPLOAD_DIR)) {
    logger.warn('Blocked suspicious file deletion path', { storedPath });
    return;
  }

  if (!fs.existsSync(fullPath)) return; // already gone — fine

  try {
    fs.unlinkSync(fullPath);
    logger.debug('Purged upload file', { filename });
  } catch (err) {
    // Non-fatal — log and continue. A missing file should never break a DB update.
    logger.error('Failed to purge upload file', { filename, error: err.message });
  }
};

module.exports = { deleteUploadedFile };