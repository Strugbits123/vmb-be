const router = require("express").Router();
const auth = require("./auth.route");

router.use("/auth", auth);

module.exports = router;