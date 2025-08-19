import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Upload directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Math.round(Math.random() * 1e9);
    const baseName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    cb(null, baseName + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });
