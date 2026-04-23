import multer from "multer";

// Only allow these file types.
const ALLOWED_TYPES = ["application/pdf", "text/plain"];

function fileFilter(req, file, cb) {
  let allowed = false;
  for (let i = 0; i < ALLOWED_TYPES.length; i++) {
    if (ALLOWED_TYPES[i] === file.mimetype) {
      allowed = true;
      break;
    }
  }
  if (!allowed) {
    return cb(new Error("Unsupported file type: " + file.mimetype));
  }
  cb(null, true);
}

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
