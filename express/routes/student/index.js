// express/routes/student/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");

router.get("/", async (req, res, next) => {
	console.log(req.user);
	try {
		const { id } = req.user;
		const student = await prisma.student.findUnique({
			where: { id },
			include: { projects: true, password: false },
		});
		res.status(200).json({ student });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
