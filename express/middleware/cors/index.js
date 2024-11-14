// express/middleware/cors.js

HOST_URL = "https://intra-75.netlify.app";

module.exports = (req, res, next) => {
	res.header("Access-Control-Allow-Origin", HOST_URL); // Change to your specific origin
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	if (req.method === "OPTIONS") {
		return res.sendStatus(200);
	}
	next();
};
