import multer from "multer";
import path from "path";
import fs from "fs";

/* ---------- UPLOAD DIRECTORY ---------- */
const uploadDir = path.join("uploads", "employees");
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
  // PHOTO → image only
  if (file.fieldname === "photo") {
    if (!file.mimetype.startsWith("image/")) {
      return cb(
        new Error("Employee photo must be an image (jpg, png, webp)")
      );
    }
  }

  // DOCUMENTS → image or pdf
  if (["idProof", "license"].includes(file.fieldname)) {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error("Documents must be image or PDF files")
      );
    }
  }

  cb(null, true);
};

/* ---------- EXPORT ---------- */
export const employeeUpload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // ✅ 10 MB PER FILE (REAL 10MB)
  },
  fileFilter,
});
