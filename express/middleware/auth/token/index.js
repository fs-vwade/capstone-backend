const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const prisma = require("../../../../prisma");

module.exports = {
	createToken: (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" }),
	verifyToken: async (req, res, next) => {
		try {
			const token = req.headers.authorization
				?.replace(/(?:Bearer )/, "")
				.trim();

			console.log("token:", token);
			console.log("JWT_SECRET:", JWT_SECRET);
			const decodedToken = jwt.decode(token);
			console.log("Decoded token:", decodedToken);
			if (!token) return next();

			const { id } = jwt.verify(token, JWT_SECRET);
			console.log(id, JWT_SECRET);
			const user = await prisma.student.findUniqueOrThrow({ where: { id } });
			req.user = user;
		} catch (e) {
			next(e);
		}
	},
};
