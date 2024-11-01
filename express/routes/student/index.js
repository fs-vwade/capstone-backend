// express/routes/student/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");

router.get("/", async (req, res, next) => {
	try {
		const student = await prisma.student.findUnique({
			where: { id: req.user.id },
			include: { projects },
			omit: { password: true },
		});
		res.status(200).json(student); /**{
			name: student.name,
			username: student.username,
			level: student.level,
			exp: student.exp,
			projects: student.projects,
		} */
	} catch (e) {
		next(e);
	}
});

module.exports = router;
