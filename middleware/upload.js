// middleware/upload.js
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

// Configure AWS S3 Client (v3)
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    file.originalname.toLowerCase().split(".").pop()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg, .jpeg, .pdf allowed"));
  }
};

const upload = multer({
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  storage: multerS3({
    s3, // ✅ Using S3Client from AWS SDK v3
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const folder =
        file.fieldname.includes("saloonPhotos")
          ? "saloon-photos"
          : file.fieldname === "licenseDocument"
          ? "licenses"
          : file.fieldname === "profilePic"
          ? "profiles"
          : "misc";

      const fileName = `${folder}/${Date.now().toString()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

module.exports = upload;
