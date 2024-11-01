// express/routes/projects/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");
const authenticate = require("../../middleware/auth/authenticate");

router.get("/", async (req, res, next) => {
	try {
		const projects = await prisma.projects.findMany();
		res.json(projects);
	} catch (e) {
		next(e);
	}
});

router.get("/:id", async (req, res, next) => {
	const { id } = req.params;
	try {
		const projects = await prisma.projects.findUniqueOrThrow({
			where: { id: +id },
		});
		if (projects.userId !== req.user.id) {
			next({ status: 403, message: "You are not logged in" });
		}
		res.json(projects);
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
			return next({ error: 401, message: "Assignment already exists" });

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
