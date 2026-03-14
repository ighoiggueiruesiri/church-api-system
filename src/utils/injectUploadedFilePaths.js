// ─── Helper: extract uploaded file paths from req.files into req.body ─────────
// Generic — works for any controller that uses createUploadMiddleware.
// Maps each multer field → its stored relative path string so DTO validation
// receives a plain string, not a file buffer.
const injectUploadedFilePaths = (req) => {
  if (!req.files || typeof req.files !== 'object') return;
  for (const [fieldName, fileArray] of Object.entries(req.files)) {
    if (fileArray?.[0]?.storedPath) {
      req.body[fieldName] = fileArray[0].storedPath;
    }
  }
};

module.exports = { injectUploadedFilePaths };