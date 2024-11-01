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
				studentId: req.user.id,
				currentProjectId: +id,
			},
			include: { currentProject: true },
		});
		const enrolled = !!assignment;

		res.json({
			name: assignment.currentProject.name,
			grade: assignment.grade,
			enrolled,
			project: enrolled ?? {
				exp: assignment.currentProject.exp,
				type: assignment.currentProject.type,
				description: assignment.currentProject.description,
				links: Array.from(
					{ length: Math.floor(2 + Math.random() * 3) },
					(e, idx) =>
						`/projects/${id}/resources/${
							idx ? faker.system.fileName() : "subject.pdf"
						}`
				),
			},
		});
	} catch (e) {
		next(e);
	}
});

router.post("/:id", async (req, res, next) => {
	try {
		const id = Number(req.params.id);

		// check if already enrolled
		if (
			await prisma.assignment.findUnique({
				where: {
					studentId: req.user.id,
					currentProjectId: id,
				},
			})
		)
			return next({ status: 401, message: "Assignment already exists" });

		// create new assignment
		const assignment = await prisma.assignment.create({
			data: {
				grade: 0,
				studentId: { connect: { id: req.user.id } },
				currentProjectId: { connect: { id } },
			},
		});
	} catch (e) {
		next(e);
	}
});

module.exports = router;
