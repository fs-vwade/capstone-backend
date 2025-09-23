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

const seed = async (project_seeds = 25, instructor_seeds = 5) => {
        const projectsData = Array.from({ length: project_seeds }, () => ({
                name: faker.hacker.abbreviation(),
                type: "Individual",
                description: faker.lorem.sentences(),
                exp: 100 * Math.pow(2.5, Math.floor(Math.pow(Math.random(), 3) * 4)),
        }));
        const projects = await Promise.all(
                projectsData.map(
                        async (project, id) =>
                                await prisma.project.upsert({
                                        where: { id },
                                        update: project,
                                        create: project,
                                })
                )
        );
        const instructorsData = Array.from({ length: instructor_seeds }, (_, idx) => ({
                name: faker.person.fullName(),
                email: `instructor_${idx + 1}@example.com`,
        }));
        const instructors = await Promise.all(
                instructorsData.map(
                        async (instructor) =>
                                await prisma.instructor.upsert({
                                        where: { email: instructor.email },
                                        update: instructor,
                                        create: instructor,
                                })
                )
        );
        const studentsData = Array.from({ length: 30 }, (_, idx) => ({
                username: `student_${idx + 1}_${faker.string.alphanumeric({ length: 5 }).toLowerCase()}`,
                password: faker.internet.password(),
                exp: 0,
                level: 0,
        }));
        const students = await Promise.all(
                studentsData.map(async (student) => {
                        const instructor = faker.helpers.arrayElement(instructors);
                        return prisma.student.upsert({
                                where: { username: student.username },
                                update: {
                                        ...student,
                                        instructor: {
                                                connect: {
                                                        id: instructor.id,
                                                },
                                        },
                                },
                                create: {
                                        ...student,
                                        instructor: {
                                                connect: {
                                                        id: instructor.id,
                                                },
                                        },
                                },
                        });
                })
        );

        const cohortsByKey = new Map();
        for (const project of projects) {
                for (const instructor of instructors) {
                        const cohortCount = faker.number.int({ min: 1, max: 3 });
                        for (let cohortNumber = 1; cohortNumber <= cohortCount; cohortNumber++) {
                                const cohort = await prisma.cohort.upsert({
                                        where: {
                                                instructorId_projectId_cohortNumber: {
                                                        instructorId: instructor.id,
                                                        projectId: project.id,
                                                        cohortNumber,
                                                },
                                        },
                                        update: {},
                                        create: {
                                                cohortNumber,
                                                instructor: { connect: { id: instructor.id } },
                                                project: { connect: { id: project.id } },
                                        },
                                });

                                const key = `${project.id}:${instructor.id}`;
                                const cohorts = cohortsByKey.get(key) ?? [];
                                cohorts.push(cohort);
                                cohortsByKey.set(key, cohorts);
                        }
                }
        }

        for (const cohorts of cohortsByKey.values()) {
                cohorts.sort((a, b) => a.cohortNumber - b.cohortNumber);
        }

        // assignments should not be seeded, but we can simulate the enrollment process
        for (const student of students) {
                const enrollmentLimit = Math.ceil(Math.random() * projects.length * 0.5);
                const enrollments = random_shuffle(projects).slice(0, enrollmentLimit);

                for (const enrollment of enrollments) {
                        const enrollmentData = {
                                grade: 25 + 10 * Math.pow(10, Math.random()),
                                student: { connect: { id: student.id } },
                                project: { connect: { id: enrollment.id } },
                        };

                        if (student.instructorId) {
                                const key = `${enrollment.id}:${student.instructorId}`;
                                const cohorts = cohortsByKey.get(key) ?? [];
                                if (cohorts.length && Math.random() < 0.6) {
                                        const cohort = faker.helpers.arrayElement(cohorts);
                                        enrollmentData.cohort = { connect: { id: cohort.id } };
                                }
                        }

                        try {
                                await prisma.assignment.create({ data: enrollmentData });
                        } catch (e) {
                                console.info(
                                        `Duplicate enrollment skipped: Student ${student.id} for Project ${enrollment.id}`
                                );
                        }
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
