const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");

const seed = async (project_seeds = 25) => {
	const projects = await prisma.project.createMany({
		data: Array.from({ length: project_seeds }, (e) => ({
			name: faker.hacker.abbreviation(),
			type: "Individual",
			description: faker.lorem.sentences(),
			exp: 100 * Math.pow(2.5, Math.floor(Math.random() * 3)),
		})),
	});
};

seed()
	.then(async () => await prisma.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
