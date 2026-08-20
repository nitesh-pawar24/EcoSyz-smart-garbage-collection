import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/panchayats");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

export const uploadPanchayatDocs = multer({
  storage,
}).fields([
  { name: "inchargeIdProof", maxCount: 1 },
  { name: "registrationLetter", maxCount: 1 },
]);
