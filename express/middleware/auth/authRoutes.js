const prisma = require("../../../prisma");
const express = require("express");
const router = express.Router();
const { createToken, verifyToken } = require("./token");

router.use(verifyToken);

router.post("/register", async (req, res, next) => {
	const { username, password } = req.body;
	try {
		const student = await prisma.student.register(username, password);
		const token = createToken(student.id);
		res.status(201).json({ token });
	} catch (e) {
		if (e.message.includes("Username taken")) {
			return res.status(400).send("Username already exists.");
		}
		next(e); // General error handling
	}
});

router.post("/login", async (req, res, next) => {
	const { username, password } = req.body;
	try {
		const student = await prisma.student.login(username, password);
		const token = createToken(student.id);
		res.json({ token });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
