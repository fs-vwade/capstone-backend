const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient().$extends({
	model: {
		user: {
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

module.exports = prisma;
