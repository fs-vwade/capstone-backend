// express/middleware/cors.js

const cors = require("cors");

const corsOptions = {
	origin: "http://localhost:1337", // Replace with your client origin
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: [
		"Origin",
		"X-Requested-With",
		"Content-Type",
		"Accept",
		"Authorization",
	],
};

module.exports = cors(corsOptions);
