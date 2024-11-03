// express/routes/projects/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");
const authenticate = require("../../middleware/auth/authenticate");

const faker = require("@faker-js/faker");

router.get("/", async (req, res, next) => {
	try {
		const projects = await prisma.project.findMany();
		res.json({ projects });
	} catch (e) {
		next(e);
	}
});

router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const assignment = await prisma.assignment.findUnique({
			where: {
				studentId_currentProjectId: {
					studentId: req.user.id,
					currentProjectId: Number(id),
				},
			},
			include: { currentProject: true },
		});
		const enrolled = !!assignment;

		res.json({
			name: assignment?.currentProject.name,
			grade: assignment?.grade,
			enrolled,
			project: enrolled
				? {
						exp: assignment?.currentProject.exp,
						type: assignment?.currentProject.type,
						description: assignment?.currentProject.description,
						// we will seed this to the database later
						links: Array.from(
							{ length: Math.floor(2 + Math.random() * 4) },
							(e, idx) =>
								`/projects/${id}/resources/${
									idx ? `resource_${idx}.pdf` : "subject.pdf"
								}`
						),
				  }
				: undefined,
		});
	} catch (e) {
		next(e);
	}
});

router.post("/:id", async (req, res, next) => {
	try {
		const projectId = Number(req.params.id);

		// check if already enrolled
		if (
			await prisma.assignment.findUnique({
				where: {
					studentId_currentProjectId: {
						studentId: req.user.id,
						currentProjectId: projectId,
					},
				},
			})
		)
			return res.status(403).send("Already enrolled.");

		// create new assignment
		const assignment = await prisma.assignment.create({
			data: {
				student: { connect: { id: req.user.id } },
				currentProject: { connect: { id: projectId } },
			},
		});
		res.status(201).send("Student enrolled successfully.");
		console.log(assignment);
	} catch (e) {
		next(e);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		const projectId = Number(req.params.id);

		const assignment = await prisma.assignment.findUnique({
			where: {
				studentId_currentProjectId: {
					studentId: req.user.id,
					currentProjectId: projectId,
				},
			},
		});

		// Check if the assignment was found and has a grade of 0
		if (!assignment) {
			return res.status(404).send("Assignment not found.");
		}
		if (0 !== assignment.grade) {
			return res
				.status(403)
				.send("Resignation failed. The student is already graded.");
		}

		await prisma.assignment.delete({ where: { id: assignment.id } });

		res.status(204).json({ message: "Student successfully resigned." });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
