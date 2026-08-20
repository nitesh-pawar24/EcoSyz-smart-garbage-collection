import multer from "multer";
import path from "path";
import fs from "fs";

/* ---------- UPLOAD DIRECTORY ---------- */
const uploadDir = path.join("uploads", "complaints");
fs.mkdirSync(uploadDir, { recursive: true });

/* ---------- STORAGE ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + ext);
  },
});

/* ---------- FILE FILTER ---------- */
const fileFilter = (req, file, cb) => {
  // Allow images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

/* ---------- EXPORT ---------- */
export const complaintUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter,
});
