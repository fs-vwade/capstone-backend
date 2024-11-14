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
	const projectsData = Array.from({ length: project_seeds }, () => ({
		name: faker.hacker.abbreviation(),
		type: "Individual",
		description: faker.lorem.sentences(),
		exp: 100 * Math.pow(2.5, Math.floor(Math.pow(Math.random(), 3) * 4)),
	}));
	const projects = await Promise.all(
		projectsData.map(
			async (project) =>
				await prisma.project.upsert({
					where: { name: project.name },
					update: project,
					create: project,
				})
		)
	);
	const studentsData = Array.from({ length: 30 }, () => ({
		username: faker.internet.username(),
		password: faker.internet.password(),
		exp: 0,
		level: 0,
	}));
	const students = await Promise.all(
		studentsData.map(
			async (student) =>
				await prisma.student.upsert({
					where: { username: student.username },
					update: student,
					create: student,
				})
		)
	);

	// assignments should not be seeded, but we can simulate the enrollment process
	for (const student of students) {
		const enrollments = random_shuffle(projects).slice(
			(end = Math.ceil(Math.random() * projects.length * 0.5))
		);
		const enrollmentData = enrollments.map((enrollment) => ({
			grade: 25 + 10 * Math.pow(10, Math.random()),
			student: { connect: { id: student.id } },
			project: { connect: { id: enrollment.id } },
		}));
		const assignments = [];
		for (const enrollment of enrollments) {
			assignments.push(
				await prisma.assignment.upsert({
					where: {
						studentId_projectId: {
							studentId: student.id,
							projectId: enrollment.id,
						},
					},
					update: enrollment,
					create: enrollment,
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
