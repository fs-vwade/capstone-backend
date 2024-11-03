// express/routes/submissions/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");

router.put("/", async (req, res, next) => {
	try {
		const { studentId, projectId, grade } = req.body;
		const assignment = await prisma.assignment.update({
			where: {
				studentId_currentProjectId: {
					studentId: studentId,
					currentProjectId: projectId,
				},
			},
			// this is just to simulate variance in the grading process, remove later
			data: { grade: grade * 0.5 * Math.pow(2.5, Math.random) },
		});
		if (assignment) res.status(200).json({ assignment });
		else next({ status: 403, message: "Cannot grade if not enrolled." });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
