// routes/common/auth.js
const express = require("express");
const router = express.Router();
const upload = require("../../middleware/upload");
const {
  registerCustomer,
  registerSaloonOwner,
  login,
  getCurrentUser,
  registerAdmin,
} = require("../../controllers/authController");
const { protect } = require("../../middleware/auth");

// Multer fields for saloon owner
const saloonUpload = upload.fields([
  { name: "licenseDocument", maxCount: 1 },
  { name: "profilePic", maxCount: 1 },
  { name: "saloonPhotos", maxCount: 10 },
]);

// router.post("/signup/admin", registerAdmin);
router.post("/signup/customer", registerCustomer);
router.post("/signup/saloonowner", saloonUpload, registerSaloonOwner);
router.post("/signin", login);
router.get("/me", protect, getCurrentUser);
router.post("/logout", (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out" });
});
module.exports = router;
