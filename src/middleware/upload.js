const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../config/logger');

// Resolve upload directory relative to project root — works on cPanel, AWS, anywhere
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');

// Ensure the directory exists at startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  logger.info('Created upload directory', { path: UPLOAD_DIR });
}

// ─── Multer: memory storage so sharp can process before writing to disk ───────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap
});

// ─── Sharp: compress + convert to WebP, then write to disk ───────────────────
const compressAndSave = async (req, res, next) => {
  // Nothing to process
  if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
    return next();
  }

  // Flatten both single-file (req.file) and multi-field (req.files) shapes
  const entries = req.file
    ? [{ key: req.file.fieldname, file: req.file }]
    : Object.entries(req.files).flatMap(([key, arr]) =>
        arr.map((file) => ({ key, file }))
      );

  try {
    for (const { file } of entries) {
      const filename = `${uuidv4()}.webp`;
      const outputPath = path.join(UPLOAD_DIR, filename);

      await sharp(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true }) // Never upscale
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Attach the stored relative path back onto the file object
      file.filename = filename;
      file.storedPath = `/uploads/${filename}`; // Relative — domain-agnostic

      logger.debug('Image compressed and saved', { filename, originalSize: file.size });
    }

    next();
  } catch (err) {
    logger.error('Image compression failed', { error: err.message });
    next(err);
  }
};

/**
 * createUploadMiddleware(fields)
 *
 * Generic factory — not tied to any single route or model.
 *
 * @param {Array<{ name: string, maxCount?: number }>} fields
 *   e.g. [{ name: 'headImage', maxCount: 1 }, { name: 'banner', maxCount: 1 }]
 * @returns Express middleware array [multerFields, compressAndSave]
 *
 * Usage in any route file:
 *   const { createUploadMiddleware } = require('../middleware/upload.middleware');
 *   router.post('/', createUploadMiddleware([{ name: 'thumbnail' }]), controller.create);
 */
const createUploadMiddleware = (fields = []) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('createUploadMiddleware requires a non-empty fields array');
  }
  return [multerUpload.fields(fields), compressAndSave];
};

module.exports = { createUploadMiddleware };