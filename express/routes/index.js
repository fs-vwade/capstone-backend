// express/routes/index.js

const express = require("express");
const router = express.Router();

const { authRoutes, authenticate } = require("../api/auth");
const { errorHandler } = require("../middleware");
const auth = require("../api/auth");

router.use(require("morgan")("dev"));
router.use(express.json());

router.use(authRoutes);
router.use("/playlists", authenticate, require("./playlists")); // this entire path requires authentication
router.use("/tracks", require("./tracks"));

module.exports = {
	routes: router,
	errorHandler,
};
