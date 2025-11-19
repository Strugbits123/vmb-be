const router = require("express").Router();
const auth = require("./auth.route");
const user = require("./user.route");
const admin = require("./admin.route");
const salonService = require("./salon-service.route");
const wallet = require("./wallet.route");

router.use("/admin", admin);
router.use("/auth", auth);
router.use("/user", user);
router.use("/salon", salonService);
router.use("/wallet", wallet);

module.exports = router;