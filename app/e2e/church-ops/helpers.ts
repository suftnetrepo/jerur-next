import bcrypt from 'bcryptjs';
import Church from '../../models/church';
import User from '../../models/user';
import Member from '../../models/member';
import ServiceTime from '../../models/serviceTime';
import Attendance from '../../models/attendance';
import CareFollowUp from '../../models/careFollowUp';
import Sermon from '../../models/sermon';
import { createAttendance } from '../../services/attendanceService';
import { mongoConnect } from '../../../utils/connectDb';

const baseUrl = 'http://localhost:3000';
const testRunId = Date.now();

const attendanceStatuses = [
  'PRESENT_IN_CHURCH',
  'JOINED_ONLINE',
  'ABSENT',
  'SICK',
  'TRAVELLING',
  'WORKING',
  'FAMILY_COMMITMENT',
  'NEEDS_PRAYER',
  'OTHER'
] as const;

type SetupData = {
  churchId: string;
  primaryUserId: string;
  secondaryUserId: string;
  email: string;
  password: string;
  serviceIds: {
    sunday: string;
    midweek: string;
    submission: string;
  };
  attendanceMemberNames: string[];
  attendanceSearchName: string;
  midweekAttendanceSearchName: string;
  pastoralSearchName: string;
  submissionMembers: Record<(typeof attendanceStatuses)[number], string>;
  creatableAttendance: {
    attendanceId: string;
    memberId: string;
  };
  pastoralCaseId: string;
};

const identifiers = {
  churchName: `E2E Church Ops ${testRunId}`,
  churchEmail: `e2e-church-${testRunId}@example.com`,
  primaryEmail: `e2e-admin-${testRunId}@example.com`,
  secondaryEmail: `e2e-pastor-${testRunId}@example.com`,
  sermonTitle: `E2E Sermon ${testRunId}`
};

const buildChurch = () => ({
  name: identifiers.churchName,
  email: identifiers.churchEmail,
  mobile: '07123456789',
  status: 'active',
  isSearchable: true,
  address: {
    addressLine1: '1 E2E Street',
    county: 'Greater London',
    town: 'London',
    country: 'United Kingdom',
    country_code: 'GB',
    postcode: 'SW1A 1AA',
    completeAddress: '1 E2E Street, London, SW1A 1AA',
    location: {
      type: 'Point',
      coordinates: [-0.1278, 51.5074]
    }
  }
});

const buildService = (churchId: string, title: string, sequency_no: number, day: number) => ({
  suid: churchId,
  title,
  start_time: `${9 + sequency_no}:00`,
  end_time: `${10 + sequency_no}:30`,
  description: `${title} service for E2E validation`,
  status: true,
  remote: false,
  remote_link: '',
  service_type: 'prayer',
  sequency_no,
  days: [day],
  agenda: []
});

const buildMember = (churchId: string, first_name: string, last_name: string, index: number) => ({
  church: churchId,
  first_name,
  last_name,
  mobile: `07000000${String(index).padStart(3, '0')}`,
  status: 'active',
  email: `${first_name.toLowerCase()}.${last_name.toLowerCase()}.${testRunId}.${index}@example.com`,
  pin: 1000 + index,
  role: 'member'
});

async function setupChurchOpsFixtures(): Promise<SetupData> {
  await mongoConnect();

  await cleanupChurchOpsFixtures();

  const church = await Church.create(buildChurch());
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const primaryUser = await User.create({
    church: church._id,
    first_name: 'Primary',
    last_name: 'Pastor',
    mobile: '07111111111',
    email: identifiers.primaryEmail,
    role: 'admin',
    password: hashedPassword,
    user_status: true
  });

  const secondaryUser = await User.create({
    church: church._id,
    first_name: 'Assistant',
    last_name: 'Pastor',
    mobile: '07222222222',
    email: identifiers.secondaryEmail,
    role: 'user',
    password: hashedPassword,
    user_status: true
  });

  const [sundayService, midweekService, submissionService] = await ServiceTime.insertMany([
    buildService(String(church._id), 'Sunday Worship', 1, 0),
    buildService(String(church._id), 'Midweek Prayer', 2, 3),
    buildService(String(church._id), 'Attendance Submission Service', 3, 5)
  ]);

  const memberDefinitions = [
    ['Alpha', 'Member'],
    ['Bravo', 'Member'],
    ['Charlie', 'Member'],
    ['Delta', 'Member'],
    ['Echo', 'Member'],
    ['Foxtrot', 'Member'],
    ['Gamma', 'Member'],
    ['Hotel', 'Member'],
    ['India', 'Member'],
    ['Juliet', 'Member'],
    ['Kilo', 'Member'],
    ['Lima', 'Member'],
    ['Searchable', 'Saint'],
    ['Pagination', 'Saint'],
    ['Drawer', 'Saint'],
    ['Submit', 'Present'],
    ['Submit', 'Online'],
    ['Submit', 'Absent'],
    ['Submit', 'Sick'],
    ['Submit', 'Travelling'],
    ['Submit', 'Working'],
    ['Submit', 'Family'],
    ['Submit', 'Prayer'],
    ['Submit', 'Other']
  ] as const;

  const members = await Member.insertMany(
    memberDefinitions.map(([first_name, last_name], index) => buildMember(String(church._id), first_name, last_name, index + 1))
  );

  const attendanceMembers = members.slice(0, 15);
  const submissionMembersMap = {
    PRESENT_IN_CHURCH: String(members[15]._id),
    JOINED_ONLINE: String(members[16]._id),
    ABSENT: String(members[17]._id),
    SICK: String(members[18]._id),
    TRAVELLING: String(members[19]._id),
    WORKING: String(members[20]._id),
    FAMILY_COMMITMENT: String(members[21]._id),
    NEEDS_PRAYER: String(members[22]._id),
    OTHER: String(members[23]._id)
  };

  const attendanceDefinitions = [
    { serviceId: sundayService._id, memberId: attendanceMembers[0]._id, status: 'PRESENT_IN_CHURCH', message: 'Present and serving', wantsPastorContact: false, submittedAt: new Date('2026-07-01T09:00:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[1]._id, status: 'JOINED_ONLINE', message: 'Watching online today', wantsPastorContact: false, submittedAt: new Date('2026-07-01T09:10:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[2]._id, status: 'ABSENT', message: 'Out of town', wantsPastorContact: false, submittedAt: new Date('2026-07-01T09:20:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[3]._id, status: 'SICK', message: 'Need prayers', wantsPastorContact: true, submittedAt: new Date('2026-07-01T09:30:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[4]._id, status: 'TRAVELLING', message: 'Travelling', wantsPastorContact: false, submittedAt: new Date('2026-07-01T09:40:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[5]._id, status: 'WORKING', message: 'At work', wantsPastorContact: false, submittedAt: new Date('2026-07-01T09:50:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[6]._id, status: 'FAMILY_COMMITMENT', message: 'Family event', wantsPastorContact: false, submittedAt: new Date('2026-07-01T10:00:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[7]._id, status: 'NEEDS_PRAYER', message: 'Please pray for me', wantsPastorContact: true, submittedAt: new Date('2026-07-01T10:10:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[8]._id, status: 'OTHER', message: 'Special circumstance', wantsPastorContact: false, submittedAt: new Date('2026-07-01T10:20:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[9]._id, status: 'PRESENT_IN_CHURCH', message: 'Here early', wantsPastorContact: false, submittedAt: new Date('2026-07-01T10:30:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[10]._id, status: 'JOINED_ONLINE', message: 'Streaming from home', wantsPastorContact: false, submittedAt: new Date('2026-07-01T10:40:00Z') },
    { serviceId: sundayService._id, memberId: attendanceMembers[11]._id, status: 'ABSENT', message: 'Unavailable', wantsPastorContact: false, submittedAt: new Date('2026-07-01T10:50:00Z') },
    { serviceId: midweekService._id, memberId: attendanceMembers[12]._id, status: 'SICK', message: 'Recovering', wantsPastorContact: true, submittedAt: new Date('2026-07-02T18:00:00Z') },
    { serviceId: midweekService._id, memberId: attendanceMembers[13]._id, status: 'ABSENT', message: 'Missed this week', wantsPastorContact: false, submittedAt: new Date('2026-07-02T18:10:00Z') },
    { serviceId: midweekService._id, memberId: attendanceMembers[14]._id, status: 'NEEDS_PRAYER', message: 'Need support', wantsPastorContact: true, submittedAt: new Date('2026-07-02T18:20:00Z') }
  ];

  const savedAttendance = [];
  for (const definition of attendanceDefinitions) {
    const created = await createAttendance({
      memberId: String(definition.memberId),
      serviceId: String(definition.serviceId),
      status: definition.status,
      message: definition.message,
      checkedInVia: 'MANUAL',
      wantsPastorContact: definition.wantsPastorContact,
      churchId: String(church._id)
    });

    const updated = await Attendance.findByIdAndUpdate(
      created._id,
      {
        submittedAt: definition.submittedAt,
        createdAt: definition.submittedAt,
        updatedAt: definition.submittedAt
      },
      { new: true }
    );

    savedAttendance.push(updated);
  }

  await CareFollowUp.deleteMany({
    attendanceId: { $in: savedAttendance.map((attendance) => attendance._id) }
  });

  const savedFollowUps = await CareFollowUp.insertMany([
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[0]._id,
      attendanceId: savedAttendance[0]._id,
      assignedTo: primaryUser._id,
      reason: 'OTHER',
      note: 'Welcome follow-up',
      priority: 'LOW',
      status: 'OPEN',
      createdAt: new Date('2026-07-01T10:55:00Z'),
      updatedAt: new Date('2026-07-01T11:05:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[1]._id,
      attendanceId: savedAttendance[1]._id,
      assignedTo: secondaryUser._id,
      reason: 'OTHER',
      note: 'Online attendee check-in',
      priority: 'MEDIUM',
      status: 'CONTACTED',
      createdAt: new Date('2026-07-01T11:10:00Z'),
      updatedAt: new Date('2026-07-01T11:15:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[3]._id,
      attendanceId: savedAttendance[3]._id,
      assignedTo: primaryUser._id,
      reason: 'SICK',
      note: 'Call and pray',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: new Date('2026-07-01T11:00:00Z'),
      updatedAt: new Date('2026-07-01T11:30:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[4]._id,
      attendanceId: savedAttendance[4]._id,
      assignedTo: primaryUser._id,
      reason: 'OTHER',
      note: 'Travel follow-up',
      priority: 'LOW',
      status: 'VISITED',
      createdAt: new Date('2026-07-01T11:35:00Z'),
      updatedAt: new Date('2026-07-01T11:40:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[5]._id,
      attendanceId: savedAttendance[5]._id,
      assignedTo: secondaryUser._id,
      reason: 'OTHER',
      note: 'Work schedule noted',
      priority: 'MEDIUM',
      status: 'OPEN',
      createdAt: new Date('2026-07-01T11:45:00Z'),
      updatedAt: new Date('2026-07-01T11:50:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[6]._id,
      attendanceId: savedAttendance[6]._id,
      assignedTo: primaryUser._id,
      reason: 'OTHER',
      note: 'Family commitment noted',
      priority: 'LOW',
      status: 'CLOSED',
      createdAt: new Date('2026-07-01T11:55:00Z'),
      updatedAt: new Date('2026-07-01T12:00:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[7]._id,
      attendanceId: savedAttendance[7]._id,
      assignedTo: secondaryUser._id,
      reason: 'NEEDS_PRAYER',
      note: 'Share prayer points',
      priority: 'HIGH',
      status: 'CONTACTED',
      createdAt: new Date('2026-07-01T12:00:00Z'),
      updatedAt: new Date('2026-07-01T12:30:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[8]._id,
      attendanceId: savedAttendance[8]._id,
      assignedTo: primaryUser._id,
      reason: 'OTHER',
      note: 'Other reason follow-up',
      priority: 'MEDIUM',
      status: 'OPEN',
      createdAt: new Date('2026-07-01T12:35:00Z'),
      updatedAt: new Date('2026-07-01T12:40:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[9]._id,
      attendanceId: savedAttendance[9]._id,
      assignedTo: secondaryUser._id,
      reason: 'OTHER',
      note: 'Serving team check-in',
      priority: 'LOW',
      status: 'CONTACTED',
      createdAt: new Date('2026-07-01T12:45:00Z'),
      updatedAt: new Date('2026-07-01T12:50:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[10]._id,
      attendanceId: savedAttendance[10]._id,
      assignedTo: primaryUser._id,
      reason: 'OTHER',
      note: 'Online follow-up',
      priority: 'MEDIUM',
      status: 'VISITED',
      createdAt: new Date('2026-07-01T12:55:00Z'),
      updatedAt: new Date('2026-07-01T13:00:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[11]._id,
      attendanceId: savedAttendance[11]._id,
      assignedTo: secondaryUser._id,
      reason: 'ABSENT',
      note: 'Follow up on absence',
      priority: 'MEDIUM',
      status: 'VISITED',
      createdAt: new Date('2026-07-01T13:00:00Z'),
      updatedAt: new Date('2026-07-01T13:30:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[12]._id,
      attendanceId: savedAttendance[12]._id,
      assignedTo: primaryUser._id,
      reason: 'SICK',
      note: 'Hospital visit logged',
      priority: 'HIGH',
      status: 'CLOSED',
      createdAt: new Date('2026-07-02T19:00:00Z'),
      updatedAt: new Date('2026-07-02T19:30:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[13]._id,
      attendanceId: savedAttendance[13]._id,
      assignedTo: primaryUser._id,
      reason: 'ABSENT',
      note: 'Pending callback',
      priority: 'LOW',
      status: 'OPEN',
      createdAt: new Date('2026-07-02T20:00:00Z'),
      updatedAt: new Date('2026-07-02T20:30:00Z')
    },
    {
      userId: primaryUser._id,
      memberId: attendanceMembers[14]._id,
      attendanceId: savedAttendance[14]._id,
      assignedTo: secondaryUser._id,
      reason: 'NEEDS_PRAYER',
      note: 'Prayer team contact',
      priority: 'MEDIUM',
      status: 'CONTACTED',
      createdAt: new Date('2026-07-02T21:00:00Z'),
      updatedAt: new Date('2026-07-02T21:30:00Z')
    }
  ]);

  await Sermon.create({
    title: identifiers.sermonTitle,
    preacher: 'E2E Pastor',
    scripture: 'John 3:16',
    description: 'Sermon used for regression validation',
    sermonDate: new Date('2026-07-06T10:00:00Z'),
    tags: ['e2e'],
    createdBy: primaryUser._id
  });

  return {
    churchId: String(church._id),
    primaryUserId: String(primaryUser._id),
    secondaryUserId: String(secondaryUser._id),
    email: identifiers.primaryEmail,
    password,
    serviceIds: {
      sunday: String(sundayService._id),
      midweek: String(midweekService._id),
      submission: String(submissionService._id)
    },
    attendanceMemberNames: attendanceMembers.map((member) => `${member.first_name} ${member.last_name}`),
    attendanceSearchName: `${attendanceMembers[8].first_name} ${attendanceMembers[8].last_name}`,
    midweekAttendanceSearchName: `${attendanceMembers[12].first_name} ${attendanceMembers[12].last_name}`,
    pastoralSearchName: `${attendanceMembers[13].first_name} ${attendanceMembers[13].last_name}`,
    submissionMembers: submissionMembersMap,
    creatableAttendance: {
      attendanceId: String(savedAttendance[2]._id),
      memberId: String(attendanceMembers[2]._id)
    },
    pastoralCaseId: String(savedFollowUps[9]._id)
  };
}

async function cleanupChurchOpsFixtures() {
  await mongoConnect();

  const church = await Church.findOne({ email: identifiers.churchEmail });
  const primaryUser = await User.findOne({ email: identifiers.primaryEmail });
  const secondaryUser = await User.findOne({ email: identifiers.secondaryEmail });

  const churchId = church?._id;
  const userIds = [primaryUser?._id, secondaryUser?._id].filter(Boolean);
  const memberIds = churchId ? await Member.find({ church: churchId }).distinct('_id') : [];
  const attendanceIds = churchId ? await Attendance.find({ church: churchId }).distinct('_id') : [];

  await CareFollowUp.deleteMany({
    $or: [
      { attendanceId: { $in: attendanceIds } },
      { memberId: { $in: memberIds } },
      { assignedTo: { $in: userIds } },
      { userId: { $in: userIds } }
    ]
  });

  await Sermon.deleteMany({ title: identifiers.sermonTitle });
  await Attendance.deleteMany({ church: churchId });
  await ServiceTime.deleteMany({ suid: churchId });
  await Member.deleteMany({ church: churchId });
  await User.deleteMany({ email: { $in: [identifiers.primaryEmail, identifiers.secondaryEmail] } });
  await Church.deleteMany({ email: identifiers.churchEmail });
}

async function login(page: any, email: string, password: string) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.goto(`${baseUrl}/login`);
    await page.locator('#email').fill(email);
    await page.locator('#loginPassword').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    try {
      await page.waitForURL('**/protected/church/dashboard', { timeout: 15000 });
      await page.waitForFunction(async () => {
        const response = await fetch('/api/sermon?action=latest&limit=1');
        const contentType = response.headers.get('content-type') || '';

        return response.ok && contentType.includes('application/json');
      }, { timeout: 15000 });
      return;
    } catch (error) {
      const hasInvalidAlert = await page.getByText('Invalid email or password').isVisible().catch(() => false);

      if (attempt === 1 || !hasInvalidAlert) {
        throw error;
      }
    }
  }
}

async function createAttendanceViaApi(page: any, payload: Record<string, unknown>) {
  return page.evaluate(async (body) => {
    const response = await fetch('/api/attendance/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();
    return {
      ok: response.ok,
      status: response.status,
      body: json
    };
  }, payload);
}

async function createDuplicateCareCaseViaApi(page: any, payload: Record<string, unknown>) {
  return page.evaluate(async (body) => {
    const response = await fetch('/api/careFollowUp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();
    return {
      ok: response.ok,
      status: response.status,
      body: json
    };
  }, payload);
}

export {
  attendanceStatuses,
  baseUrl,
  cleanupChurchOpsFixtures,
  createAttendanceViaApi,
  createDuplicateCareCaseViaApi,
  login,
  setupChurchOpsFixtures,
  type SetupData
};