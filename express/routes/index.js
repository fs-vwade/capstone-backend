// express/routes/index.js

const express = require("express");
const router = express.Router();

const { authRoutes, authenticate } = require("../middleware");

router.use(require("morgan")("dev"));
router.use(express.json());

router.use(authRoutes);
router.use("/submissions", authenticate, require("./submissions"));
router.use("/projects", authenticate, require("./projects"));
router.use("/info", authenticate, require("./student"));
router.use("/profile", require("./student/profile"));

module.exports = router;
