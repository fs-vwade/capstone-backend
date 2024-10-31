// express/middleware/index.js

module.exports = {
	errorHandler: require("./errorHandler"),
	authRoutes: require("./auth/authRoutes"),
	authenticate: require("./auth/authenticate"),
};
