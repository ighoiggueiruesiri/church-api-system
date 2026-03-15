const multer = require('multer');
const sharp = require('sharp');                    // ← still used (pre-compress)
const cloudinary = require('../config/cloudinary'); // ← NEW
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../config/logger');

// ─── Multer: memory storage (unchanged) ─────────────────────────────────────
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB cap
});

// ─── NEW: Sharp compress → Cloudinary upload (replaces old compressAndSave) ──
const compressAndUploadToCloudinary = async (req, res, next) => {
  if (!req.file && (!req.files || Object.keys(req.files).length === 0)) {
    return next();
  }

  const entries = req.file
    ? [{ key: req.file.fieldname, file: req.file }]
    : Object.entries(req.files).flatMap(([key, arr]) =>
        arr.map((file) => ({ key, file }))
      );

  try {
    for (const { file } of entries) {
      const compressedBuffer = await sharp(file.buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      // ✅ Convert Buffer → base64 data URI before uploading
      const base64Uri = `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
      const publicId = uuidv4();

      const result = await cloudinary.uploader.upload(base64Uri, {
        public_id: publicId,
        folder: 'dcchevron',
        resource_type: 'image'
      });

      file.filename = `${publicId}.webp`;
      file.storedPath = result.secure_url;
      file.publicId = result.public_id;

      logger.debug('Image uploaded to Cloudinary', {
        publicId: result.public_id,
        url: result.secure_url,
        originalSize: file.size
      });
    }

    next();
  } catch (err) {
    logger.error('Image upload to Cloudinary failed', { error: err.message });
    next(err);
  }
};

/**
 * createUploadMiddleware (exactly the same API as before!)
 */
const createUploadMiddleware = (fields = []) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('createUploadMiddleware requires a non-empty fields array');
  }
  return [multerUpload.fields(fields), compressAndUploadToCloudinary];
};

module.exports = { createUploadMiddleware };