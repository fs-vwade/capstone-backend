const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");

function random_shuffle(input) {
	const array = Array.from(input);
	let ndx = array.length;

	while (--ndx) {
		const rdx = 1 < ndx ? Math.floor(Math.random() * (ndx + 1)) : ndx;
		[array[ndx], array[rdx]] = [array[rdx], array[ndx]];
	}
	return array;
}

const seed = async (project_seeds = 25) => {
	const projects = await prisma.project.createManyAndReturn({
		data: Array.from({ length: project_seeds }, () => ({
			name: faker.hacker.abbreviation(),
			type: "Individual",
			description: faker.lorem.sentences(),
			exp: 100 * Math.pow(2.5, Math.floor(Math.random() * 4)),
		})),
	});
	const students = await prisma.student.createManyAndReturn({
		data: Array.from({ length: 30 }, () => ({
			username: faker.internet.username(),
			password: faker.internet.password(),
			exp: 0,
			level: 0,
		})),
	});

	// assignments should not be seeded, but we can simulate the enrollment process
	for (const student of students) {
		const enrollments = random_shuffle(projects).slice(
			(end = Math.ceil((Math.random() / 2) * projects.length))
		);
		const assignments = [];
		for (const enrollment of enrollments) {
			assignments.push(
				await prisma.assignment.create({
					data: {
						grade: 125 * Math.random(),
						student: { connect: { id: student.id } },
						currentProject: { connect: { id: enrollment.id } },
					},
				})
			);
		}
	}
};

seed()
	.then(async () => await prisma.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
