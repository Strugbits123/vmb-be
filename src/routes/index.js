const router = require("express").Router();
const auth = require("./auth.route");
const user = require("./user.route");
const admin = require("./admin.route");

router.use("/admin", admin);
router.use("/auth", auth);
router.use("/user", user);

module.exports = router;