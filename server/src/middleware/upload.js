// ===================================================================
// Multer configuration for handling file uploads.
// Uses memory storage — file bytes live only long enough to extract text,
// then get dropped. This keeps things stateless and works on ephemeral
// hosting (Render, Vercel, etc.) where the local filesystem is read-only
// or wiped between requests.
// Limits: 5MB, PDF or TXT only.
// ===================================================================

import multer from "multer";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
]);

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
