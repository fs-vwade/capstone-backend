// express/routes/student/profile.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");

router.get("/:username", async (req, res, next) => {
	try {
		const { username } = req.params;
		const student = await prisma.student.findUnique({
			where: { username },
			include: { id: false, password: false, projects: false },
		});
		if (student) res.status(200).json(student);
		else next({ error: 404, message: "No student exists with that username." });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
