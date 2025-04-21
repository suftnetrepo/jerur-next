import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import Campaign from '../../models/campaign';
import User from '../../models/user';
import Church from '../../models/church';
import Donation from '../../models/donation';
import Event from '../../models/event';
import Fellowship from '../../models/fellowship';
import Member from '../../models/member';
import ServiceTime from '../../models/serviceTime';
import Testimonies from '../../models/testimonies';
import Attendance from '../../models/attendance';

import { NextResponse } from 'next/server';
import { mongoConnect } from '../../../utils/connectDb';

mongoConnect();

const UK_CITIES = ['London', 'Peterborough', 'Manchester', 'Birmingham', 'Leeds'];
const dayToNumber = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

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
    await Church.deleteMany({});
    await User.deleteMany({});
    await Campaign.deleteMany({});
    await Attendance.deleteMany({});
    await Donation.deleteMany({});
    await Event.deleteMany({});
    await Fellowship.deleteMany({});
    await Member.deleteMany({});
    await ServiceTime.deleteMany({});
    await Testimonies.deleteMany({});
    console.log('Existing seeds cleared');
  } catch (error) {
    console.error('Error clearing seeds:', error);
    throw error;
  }
};

const generateRandomChurch = () => {
  return new Church({
    name: faker.company.name(),
    mobile: faker.phone.number(),
    email: faker.internet.email(),
    description: faker.lorem.paragraph(),
    address: {
      addressLine1: faker.location.streetAddress(),
      county: faker.location.county(),
      town: faker.location.city(),
      country: faker.location.country(),
      country_code: faker.location.countryCode(),
      postcode: faker.location.zipCode(),
      completeAddress: faker.location.streetAddress(true),
      location: {
        type: 'Point',
        coordinates: [parseFloat(faker.location.longitude()), parseFloat(faker.location.latitude())]
      }
    },
    features: [faker.company.catchPhrase(), faker.company.catchPhrase()],
    sliders: Array.from({ length: 5 }, () => ({
      title: faker.lorem.words(3),
      message: faker.lorem.sentence(),
      secure_url: faker.image.url(),
      public_id: faker.string.uuid(),
      status: true,
      imageOnly: faker.datatype.boolean()
    })),
    contacts: Array.from({ length: 5 }, () => ({
      title: faker.person.jobTitle(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      phone: faker.phone.number(),
      status: faker.datatype.boolean()
    })),
    notifications: [
      {
        title: 'New Service',
        icon: 'bell',
        time: new Date().toISOString(),
        type: 'event',
        status: true,
        description: faker.lorem.sentence()
      }
    ],
    push_notifications: Array.from({ length: 5 }, () => ({
      title: faker.lorem.words(2),
      message: faker.lorem.sentence(),
      status: true
    })),
    onboardingComplete: faker.datatype.boolean(),
    stripe_user_id: faker.string.uuid(),
    currency: faker.finance.currencySymbol(),
    tax_rate: faker.number.int({ min: 0, max: 9 }),
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    trial_start: faker.date.past(),
    trial_end: faker.date.future(),
    status: faker.helpers.arrayElement(['active', 'inactive']),
    isSearchable: true,
    subscriptionId: faker.string.uuid(),
    plan: faker.helpers.arrayElement(['basic', 'premium']),
    priceId: faker.string.uuid(),
    stripeCustomerId: faker.string.uuid(),
    fcm_token: faker.string.uuid(),
    logo_url: faker.image.avatar(),
    logo_id: faker.string.uuid(),
    secure_url: faker.image.avatar(),
    public_id: faker.string.uuid(),
    sort_code: faker.finance.routingNumber(),
    account_number: faker.finance.accountNumber(),
    bank_name: faker.company.name(),
    reference: faker.string.uuid(),
    prayer_request_email: faker.internet.email(),
    giving_url: faker.internet.url(),
    enable_url_giving: true,
    enable_bank_transfer: true,
    enable_app_giving: true,
    facebook_url: 'https://facebook.com/' + faker.internet.userName(),
    instagram_url: 'https://instagram.com/' + faker.internet.userName(),
    youtube_url: 'https://youtube.com/' + faker.internet.userName()
  });
};

const generateServiceTimesForChurch = (churchId) => {
  const days = ['Sunday', 'Wednesday', 'Friday'];
  const serviceTimes = [];

  days.forEach((day, index) => {
    const dayNumber = dayToNumber[day];
    const startHour = 9 + index * 2; // e.g., 9, 11, 13
    const endHour = startHour + 2;

    serviceTimes.push(
      new ServiceTime({
        suid: churchId,
        title: `${day} Service`,
        start_time: `${startHour}:00`,
        end_time: `${endHour}:00`,
        description: `Our special ${day} worship service.`,
        status: true,
        remote: faker.datatype.boolean(),
        remote_link: faker.internet.url(),
        sequency_no: index + 1,
        days: [dayNumber],
        agenda: Array.from({ length: 3 }, (_, i) => ({
          title: faker.lorem.words(3),
          start_time: `${startHour + i}:00`,
          end_time: `${startHour + i + 1}:00`,
          description: faker.lorem.sentence(),
          status: true,
          sequency_no: i + 1,
          facilitator: faker.person.firstName()
        }))
      })
    );
  });

  return serviceTimes;
};

const generateEventsForChurch = (churchId) => {
  const events = [];

  for (let i = 0; i < 10; i++) {
    const startDate = faker.date.soon({ days: faker.number.int({ min: 1, max: 30 }) });
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const startHour = faker.number.int({ min: 9, max: 15 });
    const endHour = startHour + 2;

    events.push(
      new Event({
        suid: churchId,
        title: `${faker.word.words(2)} Conference`,
        start_time: `${startHour}:00`,
        end_time: `${endHour}:00`,
        start_date: startDate,
        end_date: endDate,
        secure_url: faker.image.url(),
        public_id: faker.string.uuid(),
        description: faker.lorem.sentence(),
        addressLine1: faker.location.streetAddress(),
        completeAddress: faker.location.streetAddress(true),
        county: faker.location.county(),
        town: faker.location.city(),
        country: faker.location.country(),
        postcode: faker.location.zipCode(),
        location: {
          type: 'Point',
          coordinates: [parseFloat(faker.location.longitude()), parseFloat(faker.location.latitude())]
        },
        status: true,
        can_register: faker.datatype.boolean(),
        agenda: Array.from({ length: 3 }, (_, i) => ({
          title: faker.lorem.words(3),
          start_time: `${startHour + i}:00`,
          end_time: `${startHour + i + 1}:00`,
          description: faker.lorem.sentence(),
          status: true,
          sequency_no: i + 1,
          facilitator: faker.person.firstName()
        })),
        register: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          mobile: faker.phone.number(),
          email: faker.internet.email()
        }))
      })
    );
  }

  return events;
};

const generateUsersForChurch = async (churchId) => {
  const users = [];

  for (let i = 0; i < 20; i++) {
    const password = faker.internet.password();
    const hashedPassword = await bcrypt.hash(password, 10);

    const email = faker.internet.email();

    console.log(`Generated user: ${email} / ${password}`); // Optional for testing

    users.push(
      new User({
        church: churchId,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        mobile: faker.phone.number(),
        user_status: faker.datatype.boolean(),
        otp: faker.string.numeric(6),
        email: email.toLowerCase(),
        role: faker.helpers.arrayElement(['user', 'admin']),
        profilePicture: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        password: hashedPassword,
        secure_url: faker.image.avatar(),
        public_id: faker.string.uuid(),
        fcm: faker.string.uuid()
      })
    );
  }

  return users;
};

const generateMembersForChurch = (churchId) => {
  const members = [];

  for (let i = 0; i < 20; i++) {
    members.push(
      new Member({
        church: churchId,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        mobile: faker.phone.number(),
        status: faker.helpers.arrayElement(['active', 'provisional', 'inactive', 'under discipline']),
        email: faker.internet.email(),
        pin: faker.number.int({ min: 1000, max: 9999 }),
        role: faker.helpers.arrayElement(['member', 'volunteer', 'leader', 'pastor'])
      })
    );
  }

  return members;
};

const generateFellowshipsForChurch = (churchId) => {
  const fellowships = [];

  UK_CITIES.forEach((city) => {
    for (let i = 0; i < 5; i++) {
      fellowships.push(
        new Fellowship({
          name: `${city} Fellowship ${i + 1}`,
          addressLine1: faker.location.streetAddress(),
          completeAddress: faker.location.streetAddress(true),
          county: faker.location.county(),
          town: city,
          country: 'United Kingdom',
          postcode: faker.location.zipCode(),
          location: {
            type: 'Point',
            coordinates: [parseFloat(faker.location.longitude()), parseFloat(faker.location.latitude())]
          },
          status: faker.datatype.boolean(),
          mobile: faker.phone.number(),
          suid: churchId
        })
      );
    }
  });

  return fellowships;
};

const generateTestimoniesForChurch = (churchId) => {
  const testimonies = [];

  for (let i = 0; i < 20; i++) {
    testimonies.push(
      new Testimonies({
        church: churchId,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        description: faker.lorem.paragraph(),
        status: faker.datatype.boolean()
      })
    );
  }

  return testimonies;
};

const generateCampaignsForChurch = (churchId) => {
  const campaigns = [];

  for (let i = 0; i < 20; i++) {
    const startDate = faker.date.soon({ days: faker.number.int({ min: 1, max: 30 }) });
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + faker.number.int({ min: 15, max: 60 }));

    const targetAmount = faker.number.int({ min: 1000, max: 10000 });
    const contributionsCount = faker.number.int({ min: 2, max: 5 });

    const contributions = Array.from({ length: contributionsCount }, () => ({
      amount: faker.number.int({ min: 20, max: 200 }),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email()
    }));

    const currentAmountFunded = contributions.reduce((acc, c) => acc + c.amount, 0);

    campaigns.push(
      new Campaign({
        suid: churchId,
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        target_amount: targetAmount,
        current_amount_funded: currentAmountFunded,
        start_date: startDate,
        end_date: endDate,
        status: faker.datatype.boolean(),
        secure_url: faker.image.url(),
        public_id: faker.string.uuid(),
        contribution: contributions
      })
    );
  }

  return campaigns;
};

const generateDonationsForChurch = (churchId) => {
  const donationTypes = ['tithe', 'offering', 'seed', 'building fund', 'partnership'];

  const donations = [];

  for (let i = 0; i < 20; i++) {
    donations.push(
      new Donation({
        suid: churchId,
        donation_type: faker.helpers.arrayElement(donationTypes),
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        amount: faker.number.int({ min: 5, max: 500 }),
        date_donated: faker.date.recent({ days: 60 }),
        online: faker.datatype.boolean()
      })
    );
  }

  return donations;
};

const generateAttendanceForChurch = (churchId, serviceTimes, options = {}) => {
  const { lookbackDays = 30 } = options;
  const attendances = [];
  const today = new Date();
  
  // Create a map to track used dates for each day of week
  const usedDates = new Map();
  
  serviceTimes.forEach((service) => {
    if (!Array.isArray(service.days) || service.days.length === 0) return;

    const targetDay = service.days[0];
    
    // Find an available date for this service day that hasn't been used yet
    for (let i = 0; i < lookbackDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      if (date.getDay() === targetDay && !usedDates.has(date.toDateString())) {
        const [startHourStr, startMinuteStr = '00'] = service.start_time.split(':');
        const hour = parseInt(startHourStr, 10);
        const minute = parseInt(startMinuteStr, 10);

        const randomOffset = faker.number.int({ min: -10, max: 10 });

        const checkInTime = new Date(date);
        checkInTime.setHours(hour, minute + randomOffset, 0, 0);

        const attendance = new Attendance({
          church: churchId,
          service: service._id,
          checkInTime,
          count: faker.number.int({ min: 1, max: 10 })
        });

        attendances.push(attendance);
        usedDates.set(date.toDateString(), true); // Mark this date as used
        break;
      }
    }
  });

  return attendances;
};

const seedDatabase = async () => {
  try {
    const churches = Array.from({ length: 5 }, () => generateRandomChurch());
    const savedChurches = await Church.insertMany(churches);

    const users = (await Promise.all(savedChurches.map((church) => generateUsersForChurch(church._id)))).flat();
    await User.insertMany(users);

    const serviceTimes = savedChurches.flatMap((church) => generateServiceTimesForChurch(church._id));
    await ServiceTime.insertMany(serviceTimes);

    const events = savedChurches.flatMap((church) => generateEventsForChurch(church._id));
    await Event.insertMany(events);

    const members = savedChurches.flatMap((church) => generateMembersForChurch(church._id));
    await Member.insertMany(members);

    const fellowships = savedChurches.flatMap((church) => generateFellowshipsForChurch(church._id));
    await Fellowship.insertMany(fellowships);

    const testimonies = savedChurches.flatMap((church) => generateTestimoniesForChurch(church._id));
    await Testimonies.insertMany(testimonies);

    const campaigns = savedChurches.flatMap((church) => generateCampaignsForChurch(church._id));
    await Campaign.insertMany(campaigns);

    const donations = savedChurches.flatMap((church) => generateDonationsForChurch(church._id));
    await Donation.insertMany(donations);

    const attendances = savedChurches.flatMap((church) => generateAttendanceForChurch(church._id, serviceTimes));
    await Attendance.insertMany(attendances);

    console.log('10 Users and 5 Churches successfully inserted');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
