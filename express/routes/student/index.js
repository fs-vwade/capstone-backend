// express/routes/student/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");

router.get("/", async (req, res, next) => {
	try {
		const student = await prisma.student.findUnique({
			where: { id: req.user.id },
			include: { projects: true },
			omit: { password: true },
		});
		res.status(200).json(student);
	} catch (e) {
		next(e);
	}
});

module.exports = router;
