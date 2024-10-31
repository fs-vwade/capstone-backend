// authentication function
module.exports = (req, res, next) => {
	if (req.user) next();
	else next({ status: 401, message: "Unauthorized." });
}; // intentionally left blank
