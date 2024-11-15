// express/routes/submissions/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");

router.put("/", async (req, res, next) => {
	try {
		const { studentId, projectId } = req.body;

		if (!(studentId === req.user.id))
			return res.status(401).send("Submission rejected. Invalid ID.");

		// this is just to simulate variance in the grading process, remove later
		const grade = req.body.grade * 0.5 * Math.pow(2.5, Math.random());
		const assignment = await prisma.assignment.findUnique({
			where: {
				studentId_projectId: {
					studentId: studentId,
					projectId: projectId,
				},
			},
		});
		if (assignment) {
			if (assignment.grade < grade) {
				const evaluation = await prisma.assignment.update({
					where: { id: assignment.id },
					data: { grade },
				});
				res.status(200).json({ evaluation });
			} else {
				res
					.status(200)
					.send(`Existing grade is ${assignment.grade}. No evaluation.`);
			}
		} else next({ status: 403, message: "No evaluation." });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
