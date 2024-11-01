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
			include: { currentProject: true },
		});

		const XP = assignments.reduce(
			(exp, assignment) =>
				exp + (assignment.grade / 100) * assignment.currentProject.exp,
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
			register: async (username, password) =>
				await prisma.student.create({
					data: {
						username,
						password: await bcrypt.hash(String(password), 10),
					},
				}),
			login: async (username, password) => {
				const student = await prisma.student.findUniqueOrThrow({
					where: { username },
				});
				if (await bcrypt.compare(String(password), student.password))
					return student;
				throw Error("Invalid password");
			},
		},
	},
});
