const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
	createToken: (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" }),
	verifyToken: async (req, res, next) => {
		try {
			/* TODO -- add verify logic here, may need to import prisma
				See my jukebox-pro auth for reference (vw)
			*/
			next();
		} catch (e) {
			next(e);
		}
	},
};
