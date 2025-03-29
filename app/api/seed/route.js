import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import Category from '../../models/category';
import User from '../../models/user';
import Course from '../../models/course';
import Section from '../../models/section';
import Lesson from '../../models/lesson';
import Enrollment from '../../models/enrollment';
import Review from '../../models/review';
import Certificate from '../../models/certificate';
import { NextResponse } from 'next/server';
import { mongoConnect } from '../../../utils/connectDb';
import Payment from '../../models/payment';
mongoConnect();
export async function GET() {
  try {
    await clearSeeds();
    await seedDatabase();
    return NextResponse.json({ message: 'Database cleared and seeded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in clearing or seeding database:', error);
    return NextResponse.json({ message: 'Failed to clear or seed database', error: error.message }, { status: 500 });
  }
}

const clearSeeds = async () => {
  try {
    await Category.deleteMany({});
    await User.deleteMany({});
    await Course.deleteMany({});
    await Section.deleteMany({});
    await Lesson.deleteMany({});
    await Enrollment.deleteMany({});
    await Review.deleteMany({});
    await Certificate.deleteMany({});
    await Payment.deleteMany({});
    console.log('Existing seeds cleared');
  } catch (error) {
    console.error('Error clearing seeds:', error);
    throw error;
  }
};

const seedCertificates = async () => {
  try {
    // Find completed enrollments (progress === 100)
    const completedEnrollments = await Enrollment.find({ progress: 100 }).populate(['student', 'course']);

    const certificates = [];

    for (const enrollment of completedEnrollments) {
      // Avoid duplicate certificates
      const existing = await Certificate.findOne({
        student: enrollment.student._id,
        course: enrollment.course._id,
      });

      if (existing) continue;

      const certificate = new Certificate({
        student: enrollment.student._id,
        course: enrollment.course._id,
        certificateUrl: faker.internet.url() + '/certificate/' + faker.string.uuid() + '.pdf',
        issuedAt: faker.date.recent({ days: 90 }),
      });

      certificates.push(certificate);
    }

    if (certificates.length) {
      await Certificate.insertMany(certificates);
      console.log(`${certificates.length} Certificates successfully inserted`);
    } else {
      console.log('All completed enrollments already have certificates');
    }
  } catch (error) {
    console.error('Error seeding certificates:', error);
    throw error;
  }
};


const seedReviews = async () => {
  try {
    const students = await User.find({ role: 'student' });
    const courses = await Course.find({});


    const reviews = [];

    for (let i = 0; i < 30; i++) {
      const student = faker.helpers.arrayElement(students);
      const course = faker.helpers.arrayElement(courses);

      // Prevent duplicate reviews by same student on same course
      const alreadyReviewed = await Review.findOne({
        student: student._id,
        course: course._id,
      });

      if (alreadyReviewed) {
        i--;
        continue;
      }

      const review = new Review({
        course: course._id,
        student: student._id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentences(2),
        createdAt: faker.date.recent({ days: 180 }),
      });

      reviews.push(review);
    }

    await Review.insertMany(reviews);
    console.log('30 Reviews successfully inserted');
  } catch (error) {
    console.error('Error seeding reviews:', error);
    throw error;
  }
};


const seedPayments = async () => {
  try {
    const students = await User.find({ role: 'student' });
    const courses = await Course.find({});


    const payments = [];

    for (let i = 0; i < 30; i++) {
      const student = faker.helpers.arrayElement(students);
      const course = faker.helpers.arrayElement(courses);

      // Use course price or fallback to random price
      const amount = course.price || faker.number.float({ min: 10, max: 200, precision: 0.01 });

      const payment = new Payment({
        student: student._id,
        course: course._id,
        amount,
        paymentStatus: faker.helpers.arrayElement(["completed", "pending", "failed"]),
        transactionId: faker.string.uuid(),
        createdAt: faker.date.recent({ days: 60 }), // within last 2 months
      });

      payments.push(payment);
    }

    await Payment.insertMany(payments);
    console.log('30 Payments successfully inserted');
  } catch (error) {
    console.error('Error seeding payments:', error);
    throw error;
  }
};


const seedEnrollments = async () => {
  try {
    const students = await User.find({ role: 'student' });
    const courses = await Course.find({});

    const enrollments = [];

    for (let i = 0; i < 20; i++) {
      const student = faker.helpers.arrayElement(students);
      const course = faker.helpers.arrayElement(courses);

      const existing = await Enrollment.findOne({ student: student._id, course: course._id });
      if (existing) {
        i--;
        continue;
      }

      const startDate = faker.date.recent({ days: 180 });
      const endDate = faker.date.soon({ days: faker.number.int({ min: 7, max: 84 }), refDate: startDate });

      const now = new Date();
      const status = endDate < now ? 'expired' : 'ongoing';

      const enrollment = new Enrollment({
        student: student._id,
        course: course._id,
        progress: faker.number.int({ min: 0, max: 100 }),
        enrolledAt: startDate,
        startDate,
        endDate,
        status,
      });

      enrollments.push(enrollment);
    }

    await Enrollment.insertMany(enrollments);
    console.log('20 Enrollments with status, start and end dates seeded successfully');
  } catch (error) {
    console.error('Error seeding enrollments:', error);
    throw error;
  }
};


const seedCourses = async () => {
  try {
    const categories = await Category.find({});
    const instructors = await User.find({ role: 'instructor' });

    const allCourses = [];

    for (const category of categories) {
      for (let i = 0; i < 5; i++) {
        const course = new Course({
          title: faker.company.catchPhrase(),
          description: faker.lorem.paragraph(),
          price: parseFloat(faker.commerce.price({ min: 10, max: 200 })),
          instructor: faker.helpers.arrayElement(instructors)._id,
          category: category._id,
          isPublished: faker.datatype.boolean(),
          thumbnail: faker.image.urlPicsumPhotos({ width: 640, height: 480 })
        });

        await course.save();

        const numberOfSections = faker.number.int({ min: 3, max: 5 });
        const sectionDocs = [];

        for (let pos = 1; pos <= numberOfSections; pos++) {
          const section = await new Section({
            course: course._id,
            title: faker.lorem.words(3),
            position: pos,
            
          }).save();

          // const numberOfLessons = faker.number.int({ min: 3, max: 6 });
          // const lessonDocs = [];

          // for (let lessonPos = 1; lessonPos <= numberOfLessons; lessonPos++) {
          //   const lesson = await new Lesson({
          //     section: section._id,
          //     title: faker.lorem.sentence(3),
          //     videoUrl: faker.internet.url(),
          //     content: faker.lorem.paragraphs(2),
          //     position: lessonPos
          //   }).save();

          //   lessonDocs.push(lesson);
          // }

          // section.lessons = lessonDocs.map((l) => l._id);
          await section.save();

          sectionDocs.push(section);
        }

        course.sections = sectionDocs.map((s) => s._id);
        await course.save();

        allCourses.push(course);
      }
    }

    console.log(`${allCourses.length} Courses, Sections, and Lessons seeded successfully`);
  } catch (error) {
    console.error('Error seeding courses with sections and lessons:', error);
    throw error;
  }
};

const generateRandomCategory = () => {
  return new Category({
    name: faker.commerce.department() + ' ' + faker.string.alphanumeric(5), // Ensures uniqueness
    description: faker.commerce.productDescription(),
    status: faker.datatype.boolean()
  });
};

const generateRandomUser = async () => {
  const password = faker.internet.password();
  const email = faker.internet.email();

  console.log('..................................................email', email);
  console.log('..................................................password', password);

  const hashedPassword = await bcrypt.hash(password, 10);

  return new User({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    mobile: faker.phone.number(),
    user_status: faker.datatype.boolean(),
    email: email,
    otp: faker.string.numeric(6),
    role: faker.helpers.arrayElement(['student', 'instructor', 'admin']),
    password: hashedPassword,
    secure_url: faker.image.avatar(),
    public_id: faker.string.alphanumeric(10),
    fcm: faker.string.alphanumeric(10),
    profilePicture: faker.image.avatar(),
    bio: faker.lorem.sentence()
  });
};

const seedDatabase = async () => {
  try {
    const users = await Promise.all(Array.from({ length: 100 }, () => generateRandomUser()));

    await User.insertMany(users);

    const categories = Array.from({ length: 10 }, () => generateRandomCategory());
    await Category.insertMany(categories);

    await seedCourses();
    await seedEnrollments()
    await seedPayments()
    await seedReviews()
    await seedCertificates()
    console.log('10 Users successfully inserted');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
