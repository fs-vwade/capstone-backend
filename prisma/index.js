const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
	if (
		params.model === "Assignment" &&
		["create", "update", "delete"].includes(params.action)
	) {
		const result = await next(params);
		const studentId = result.studentId;
		const assignments = await prisma.assignment.findMany({
			where: { studentId },
			include: { project: true },
		});

		const XP = assignments.reduce(
			(exp, assignment) =>
				exp + (assignment.grade / 100) * assignment.project.exp,
			0
		);

		await prisma.student.update({
			where: { id: studentId },
			data: {
				exp: XP,
				level: parseFloat(
					Number(Math.log(1 + (0.25 * XP) / 80) / Math.log(1.25)).toFixed(15)
				),
			},
		});

		return result;
	}

	return next(params);
});

module.exports = prisma.$extends({
	model: {
		student: {
			register: async (username, password) => {
				const exists = await prisma.student.findUnique({
					where: { username },
				});

				if (exists) throw new Error("Username taken");

				const student = await prisma.student.create({
					data: {
						username,
						password: await bcrypt.hash(String(password), 10),
					},
				});

				student.password = undefined;

				return student;
			},
                        login: async (username, password) => {
                                const student = await prisma.student.findUniqueOrThrow({
                                        where: { username },
                                        include: {
                                                instructor: true,
                                                projects: {
                                                        include: {
                                                                cohort: {
                                                                        include: {
                                                                                instructor: true,
                                                                        },
                                                                },
                                                        },
                                                },
                                        },
                                });
                                if (await bcrypt.compare(String(password), student.password))
                                        return student;
                                throw Error("Invalid password");
                        },
                },
	},
});
