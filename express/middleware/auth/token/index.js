// express/middleware/auth/token/index.js

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const prisma = require("../../../../prisma");

module.exports = {
	createToken: (id, username) =>
		jwt.sign({ id, username }, JWT_SECRET, { expiresIn: "1d" }),
	verifyToken: async (req, res, next) => {
		try {
			const token = req.headers.authorization
				?.replace(/(?:Bearer )/, "")
				.trim();
			if (!token) return next();

			const { id } = jwt.verify(token, JWT_SECRET);
			const user = await prisma.student.findUniqueOrThrow({ where: { id } });
			req.user = user;
			next();
		} catch (e) {
			res
				.status(401)
				.json({ message: "Unauthorized access: invalid or expired token" });
		}
	},
};
