const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const UPLOAD_ROOT = path.join(__dirname, '../../uploads');

// Completely generic compression middleware
// Works for ANY service (ministries, sermons, events, gallery, pastors, etc.)
const compressImage = async (req, res, next) => {
  try {
    if (!req.file && !req.files) return next();

    // Auto-detect folder name from the route path
    // e.g. /api/v1/ministries → "ministries"
    // e.g. /api/v1/events → "events"
    let resourceName = req.baseUrl.split('/').pop(); // last part of URL

    // Create folder if it doesn't exist
    const folderPath = path.join(UPLOAD_ROOT, resourceName);
    await fs.mkdir(folderPath, { recursive: true });

    const processFile = async (file) => {
      const outputFilename = file.filename.replace(/\.[^/.]+$/, '.webp');
      const outputPath = path.join(folderPath, outputFilename);

      await sharp(file.buffer)
        .resize(1200, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Update file info so controller gets correct path
      file.filename = outputFilename;
      file.path = `/uploads/${resourceName}/${outputFilename}`;
    };

    // Handle single file (e.g. sermon thumbnail)
    if (req.file) {
      await processFile(req.file);
    }

    // Handle multiple files (e.g. ministry headImage + icon)
    if (req.files) {
      for (const field in req.files) {
        if (Array.isArray(req.files[field])) {
          for (const file of req.files[field]) {
            await processFile(file);
          }
        }
      }
    }

    next();
  } catch (err) {
    console.error('❌ Image compression failed:', err);
    next(err);
  }
};

module.exports = compressImage;