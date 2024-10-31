// express/routes/index.js

const express = require("express");
const router = express.Router();

const { authRoutes, authenticate, errorHandler } = require("../middleware");

router.use(require("morgan")("dev"));
router.use(express.json());

router.use(authRoutes);
router.use("/projects", authenticate, require("./projects")); // this entire path requires authentication
router.use("/info", authenticate, require("./student"));
router.use("/profile", require("./student/profile"));

debugger;
module.exports = router;
