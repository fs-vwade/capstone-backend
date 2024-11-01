// express/routes/projects/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");
const authenticate = require("../../middleware/auth/authenticate");

router.get("/", authenticate, async (req, res, next) => {
	try {
		const projects = await prisma.projects.findMany();
		res.json(projects);
	} catch (e) {
		next(e);
	}
});

router.get("/:id", authenticate, async (req, res, next) => {
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

module.exports = router;
