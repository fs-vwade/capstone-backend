const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

prisma.$extends({
	model: {
		student: {
			register: async (username, password) =>
				await prisma.user.create({
					data: { username, password: await bcrypt.hash(String(password), 10) },
				}),
			login: async (username, password) => {
				const user = await prisma.user.findUniqueOrThrow({
					where: { username },
				});
				if (await bcrypt.compare(String(password), user.password)) return user;
				throw Error("Invalid password");
			},
		},
	},
});

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

		await prisma.student.update({
			where: { id: studentId },
			data: {
				exp: assignments.reduce(
					(exp, assignment) =>
						exp + (assignment.grade / 100) * assignment.currentProject.exp,
					0
				),
			},
		});

		return result;
	}

	return next(params);
});

module.exports = prisma;
