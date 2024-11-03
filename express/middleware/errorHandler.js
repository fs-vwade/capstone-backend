// express/middleware/errorHandler.js

const express = require("express");
const errorHandler = express.Router();

errorHandler.use((req, res, next) => {
	next({ status: 404, message: "Endpoint not found." });
});

errorHandler.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status ?? 500);
	res.json(err.message ?? "Sorry, something broke :(");
	console.log("caught something");
});

module.exports = errorHandler;
