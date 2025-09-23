// express/routes/projects/index.js

const express = require("express");
const router = express.Router();
const prisma = require("../../../prisma");

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
                const id = Number(req.params.id);
                const projectData = await prisma.project.findUnique({
                        where: { id },
                });

                if (!projectData) return res.status(404).send("Project not found.");

                const assignmentPromise = prisma.assignment.findUnique({
                        where: {
                                studentId_projectId: {
                                        studentId: req.user.id,
                                        projectId: projectData.id,
                                },
                        },
                        include: {
                                project: true,
                                cohort: {
                                        include: {
                                                instructor: true,
                                        },
                                },
                        },
                });
                const cohortsPromise = req.user.instructorId
                        ? prisma.cohort.findMany({
                                  where: {
                                          projectId: projectData.id,
                                          instructorId: req.user.instructorId,
                                  },
                                  include: {
                                          instructor: true,
                                  },
                                  orderBy: { cohortNumber: "asc" },
                          })
                        : Promise.resolve([]);

                const [assignment, cohorts] = await Promise.all([
                        assignmentPromise,
                        cohortsPromise,
                ]);
                const enrolled = !!assignment;
                const project = {
                        name: projectData.name,
                        enrolled,
                        grade: assignment?.grade,
			exp: projectData.exp,
			type: projectData.type,
			description: projectData.description,
                        studentId: req.user.id,
                        projectId: id,
                        cohorts: cohorts.map((cohort) => ({
                                id: cohort.id,
                                cohortNumber: cohort.cohortNumber,
                                instructorId: cohort.instructorId,
                                instructor: cohort.instructor && {
                                        id: cohort.instructor.id,
                                        name: cohort.instructor.name,
                                        email: cohort.instructor.email,
                                },
                        })),
                        // we will seed this to the database later
                        links: Array.from(
                                { length: Math.floor(2 + Math.random() * 4) },
                                (e, idx) =>
                                        `/projects/${id}/resources/${
						idx ? `resource_${idx}.pdf` : "subject.pdf"
					}`
			),
		};

		res.json({ project, assignment });
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
					studentId_projectId: {
						studentId: req.user.id,
						projectId: projectId,
					},
				},
			})
		)
			return res.status(403).send("Already enrolled.");

		// create new assignment
		const assignment = await prisma.assignment.create({
			data: {
				student: { connect: { id: req.user.id } },
				project: { connect: { id: projectId } },
			},
		});
		res.status(201).send("Student enrolled successfully.");
	} catch (e) {
		next(e);
	}
});

router.post("/:id/cohorts/:cohortId", async (req, res, next) => {
        try {
                const projectId = Number(req.params.id);
                const cohortId = Number(req.params.cohortId);

                if (Number.isNaN(projectId) || Number.isNaN(cohortId))
                        return res.status(400).send("Invalid identifiers provided.");

                const assignment = await prisma.assignment.findUnique({
                        where: {
                                studentId_projectId: {
                                        studentId: req.user.id,
                                        projectId,
                                },
                        },
                });

                if (!assignment)
                        return res
                                .status(403)
                                .send("Student must enroll in the class before joining a cohort.");

                if (!req.user.instructorId)
                        return res
                                .status(403)
                                .send("Student must be assigned to an instructor before joining a cohort.");

                const cohort = await prisma.cohort.findUnique({
                        where: { id: cohortId },
                        include: { instructor: true },
                });

                if (!cohort || cohort.projectId !== projectId)
                        return res.status(404).send("Cohort not found for this project.");

                if (cohort.instructorId !== req.user.instructorId)
                        return res
                                .status(403)
                                .send("Cohort does not belong to the student's instructor.");

                const updatedAssignment = await prisma.assignment.update({
                        where: { id: assignment.id },
                        data: {
                                cohort: { connect: { id: cohort.id } },
                        },
                        include: {
                                cohort: {
                                        include: {
                                                instructor: true,
                                        },
                                },
                        },
                });

                res.status(200).json({
                        message: "Student enrolled in cohort successfully.",
                        cohort: updatedAssignment.cohort,
                });
        } catch (e) {
                next(e);
        }
});

router.delete("/:id/cohorts", async (req, res, next) => {
        try {
                const projectId = Number(req.params.id);

                const assignment = await prisma.assignment.findUnique({
                        where: {
                                studentId_projectId: {
                                        studentId: req.user.id,
                                        projectId,
                                },
                        },
                        include: { cohort: true },
                });

                if (!assignment || !assignment.cohortId)
                        return res.status(404).send("Cohort enrollment not found.");

                await prisma.assignment.update({
                        where: { id: assignment.id },
                        data: { cohort: { disconnect: true } },
                });

                res.status(204).send();
        } catch (e) {
                next(e);
        }
});

router.delete("/:id", async (req, res, next) => {
        try {
                const projectId = Number(req.params.id);

		const assignment = await prisma.assignment.findUnique({
			where: {
				studentId_projectId: {
					studentId: req.user.id,
					projectId: projectId,
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
