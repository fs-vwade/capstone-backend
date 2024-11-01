// express/routes/submissions/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");

router.put("/", async (req, res, next) => {
	try {
		const { studentId, projectId, grade } = req.body;
		const assignment = await prisma.assignment.update({
			where: { studentId: req.user.id, currentProjectId: projectId },
		});
		if (assignment) res.status(200).json(student);
		else next({ error: 404, message: "Student must be enrolled." });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
