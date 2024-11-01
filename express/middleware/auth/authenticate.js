const prisma = require("../../../prisma");

// authentication function
module.exports = (req, res, next) => {
	if (req.user) next();
	else next({ status: 401, message: "You must be logged in." });
};
