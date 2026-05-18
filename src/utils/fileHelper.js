/*

const fs = require('fs');
const path = require('path');
const { logger } = require('../config/logger');
const cloudinary = require('../config/cloudinary'); // ← NEW

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads'); // keep for old data

const deleteUploadedFile = (storedPath) => {
  if (!storedPath) return;

  // ─── NEW: Cloudinary URL detected ─────────────────────────────────────
  if (/^https?:\/\/res\.cloudinary\.com/i.test(storedPath)) {
    const publicId = getPublicIdFromCloudinaryUrl(storedPath);
    if (publicId) {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          logger.error('Failed to delete from Cloudinary', { publicId, error: error.message });
        } else {
          logger.debug('Deleted image from Cloudinary', { publicId, result });
        }
      });
    }
    return; // fire-and-forget (safe for delete operations)
  }

  // ─── OLD: local disk (kept for backward compatibility) ─────────────────
  if (!/^\/uploads\//.test(storedPath)) return;

  const filename = path.basename(storedPath);
  const fullPath = path.join(UPLOAD_DIR, filename);

  if (!fullPath.startsWith(UPLOAD_DIR)) {
    logger.warn('Blocked suspicious file deletion path', { storedPath });
    return;
  }

  if (!fs.existsSync(fullPath)) return;

  try {
    fs.unlinkSync(fullPath);
    logger.debug('Purged local upload file', { filename });
  } catch (err) {
    logger.error('Failed to purge local upload file', { filename, error: err.message });
  }
};

const getPublicIdFromCloudinaryUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;

  let publicId = parts.slice(uploadIndex + 1).join('/');
  publicId = publicId.replace(/^v\d+\//, '');   // remove version
  publicId = publicId.replace(/\.\w+$/, '');    // remove .webp
  return publicId;
};

module.exports = { deleteUploadedFile };
*/

const fs = require('fs');
const path = require('path');
const { logger } = require('../config/logger');
const { UTApi } = require('uploadthing/server');

const utapi = new UTApi();
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads'); // Legacy backward fallback

const deleteUploadedFile = async (storedPath) => {
  if (!storedPath) return;

  // ─── NEW: Uploadthing Storage Drops ─────────────────────────────────
  if (storedPath.includes('utfs.io') || storedPath.includes('ufs.sh')) {
    const fileKey = storedPath.split('/f/')[1];
    if (fileKey) {
      try {
        await utapi.deleteFiles(fileKey);
        logger.debug('Asset cleared successfully from Uploadthing cloud', { fileKey });
      } catch (error) {
        logger.error('Failed to clear asset from Uploadthing bucket', { fileKey, error: error.message });
      }
    }
    return;
  }

  // ─── OLD: Local drive fallback (Backward compatibility) ─────────────
  if (!/^\/uploads\//.test(storedPath)) return;
  const filename = path.basename(storedPath);
  const fullPath = path.join(UPLOAD_DIR, filename);

  if (fullPath.startsWith(UPLOAD_DIR) && fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      logger.debug('Purged legacy local directory asset', { filename });
    } catch (err) {
      logger.error('Failed to delete asset locally', { filename, error: err.message });
    }
  }
};

module.exports = { deleteUploadedFile };