/**
 * Migrates one church and all of its related data from one database to
 * another (source → target) by copying every document scoped to that
 * church id, preserving each document's original _id so cross-collection
 * ObjectId references (member → church, attendance → member, etc.) stay
 * intact on the target side.
 *
 * Built for the jerur_next_dev → jerur_live incident: production's real
 * connection string was silently falling back to the dev database (see
 * utils/connectDb.js), so a church created against "production" actually
 * landed in jerur_next_dev. This script moves it — and everything that
 * belongs to it — into the database production should have been using.
 *
 * Deliberately does NOT hardcode either connection string (that hardcoded
 * fallback is what caused the incident this script is cleaning up after).
 * You must pass both explicitly:
 *
 *   SOURCE_MONGODB_URL="mongodb+srv://.../jerur_next_dev?..." \
 *   TARGET_MONGODB_URL="mongodb+srv://.../jerur_live?..." \
 *   npx tsx scripts/migrate-church-to-live.ts <churchId>
 *
 * Defaults to a DRY RUN — reports what it *would* copy without writing
 * anything. Add --execute to actually write, and you'll be asked to
 * type CONFIRM before anything touches the target database.
 *
 *   npx tsx scripts/migrate-church-to-live.ts <churchId> --execute
 *
 * Safe to re-run: writes are upserts keyed by _id, so running it again
 * (e.g. after more data accumulated in source) just re-syncs, it doesn't
 * duplicate.
 */
import readline from 'readline';
import mongoose from 'mongoose';
import Church from '../app/models/church';
import ServiceTime from '../app/models/serviceTime';
import User from '../app/models/user';
import Member from '../app/models/member';
import Testimonies from '../app/models/testimonies';
import Fellowship from '../app/models/fellowship';
import EventModel from '../app/models/event';
import Article from '../app/models/article';
import Attendance from '../app/models/attendance';
import Sermon from '../app/models/sermon';
import Campaign from '../app/models/campaign';
import Donation from '../app/models/donation';
import CareFollowUp from '../app/models/careFollowUp';

type ObjectId = mongoose.Types.ObjectId;

// Every collection that hangs directly off a church id, and which field
// on that collection holds it — the schemas aren't consistent about the
// field name (`church`, `suid`, or `churchId`), so this has to be spelled
// out per-model rather than assumed.
const RELATED_MODELS: { label: string; model: mongoose.Model<any>; field: string }[] = [
  { label: 'ServiceTime', model: ServiceTime, field: 'suid' },
  { label: 'User', model: User, field: 'church' },
  { label: 'Member', model: Member, field: 'church' },
  { label: 'Testimonies', model: Testimonies, field: 'church' },
  { label: 'Fellowship', model: Fellowship, field: 'suid' },
  { label: 'Event', model: EventModel, field: 'suid' },
  { label: 'Article', model: Article, field: 'church' },
  { label: 'Attendance', model: Attendance, field: 'church' },
  { label: 'Sermon', model: Sermon, field: 'churchId' },
  { label: 'Campaign', model: Campaign, field: 'suid' },
  { label: 'Donation', model: Donation, field: 'suid' },
];

function redact(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); }));
}

interface CollectionResult {
  label: string;
  found: number;
  migrated: number;
  ids: ObjectId[];
}

async function migrateCollection(
  label: string,
  sourceModel: mongoose.Model<any>,
  targetModel: mongoose.Model<any>,
  filter: Record<string, unknown>,
  execute: boolean
): Promise<CollectionResult> {
  const docs = await sourceModel.find(filter).lean();
  let migrated = 0;
  if (execute) {
    for (const doc of docs) {
      await targetModel.replaceOne({ _id: doc._id }, doc, { upsert: true });
      migrated++;
    }
  }
  return { label, found: docs.length, migrated, ids: docs.map((d) => d._id as ObjectId) };
}

async function main() {
  const args = process.argv.slice(2);
  const execute = args.includes('--execute');
  const churchIdArg = args.find((a) => !a.startsWith('--'));

  if (!churchIdArg) {
    console.error('Usage: tsx scripts/migrate-church-to-live.ts <churchId> [--execute]');
    process.exit(1);
  }
  if (!mongoose.isValidObjectId(churchIdArg)) {
    console.error(`"${churchIdArg}" is not a valid ObjectId.`);
    process.exit(1);
  }
  const churchId = new mongoose.Types.ObjectId(churchIdArg);

  const SOURCE_URI = process.env.SOURCE_MONGODB_URL;
  const TARGET_URI = process.env.TARGET_MONGODB_URL;
  if (!SOURCE_URI || !TARGET_URI) {
    console.error(
      'Set SOURCE_MONGODB_URL and TARGET_MONGODB_URL explicitly (no default is assumed — that silent-fallback pattern is exactly what caused the incident this script fixes).'
    );
    process.exit(1);
  }
  if (SOURCE_URI === TARGET_URI) {
    console.error('SOURCE_MONGODB_URL and TARGET_MONGODB_URL are identical — refusing to run.');
    process.exit(1);
  }

  console.log(`Mode:   ${execute ? 'EXECUTE (will write to target)' : 'DRY RUN (no writes)'}`);
  console.log(`Source: ${redact(SOURCE_URI)}`);
  console.log(`Target: ${redact(TARGET_URI)}`);
  console.log('');

  const sourceConn = await mongoose.createConnection(SOURCE_URI).asPromise();
  const targetConn = await mongoose.createConnection(TARGET_URI).asPromise();

  try {
    const SourceChurch = sourceConn.model('Church', Church.schema);
    const TargetChurch = targetConn.model('Church', Church.schema);

    const churchDoc = await SourceChurch.findById(churchId).lean();
    if (!churchDoc) {
      console.error(`No church with _id ${churchId} found in the source database.`);
      process.exit(1);
    }
    console.log(`Found church in source: "${(churchDoc as any).name}" (${churchId})`);

    const existingTarget = await TargetChurch.findById(churchId).lean();
    if (existingTarget) {
      console.log(
        `⚠️  Target already has a church at this _id: "${(existingTarget as any).name}". ` +
          (execute ? 'It will be overwritten (upsert).' : 'It would be overwritten (upsert) on --execute.')
      );
    }
    console.log('');

    if (execute) {
      const answer = await prompt(`Type CONFIRM to write "${(churchDoc as any).name}" and all related data into the TARGET database: `);
      if (answer !== 'CONFIRM') {
        console.log('Aborted — no changes made.');
        process.exit(1);
      }
      console.log('');
    }

    const results: CollectionResult[] = [];

    results.push(await migrateCollection('Church', SourceChurch, TargetChurch, { _id: churchId }, execute));

    const idsByLabel: Record<string, ObjectId[]> = {};
    for (const { label, model, field } of RELATED_MODELS) {
      const SourceModel = sourceConn.model(label, model.schema);
      const TargetModel = targetConn.model(label, model.schema);
      const r = await migrateCollection(label, SourceModel, TargetModel, { [field]: churchId }, execute);
      results.push(r);
      idsByLabel[label] = r.ids;
    }

    // CareFollowUp isn't church-scoped directly — it hangs off Member and
    // Attendance, so it's migrated transitively via the ids just found for
    // those two (only meaningful once Member/Attendance have actually run,
    // which they have by this point).
    const memberIds = idsByLabel.Member ?? [];
    const attendanceIds = idsByLabel.Attendance ?? [];
    if (memberIds.length || attendanceIds.length) {
      const SourceCFU = sourceConn.model('CareFollowUp', CareFollowUp.schema);
      const TargetCFU = targetConn.model('CareFollowUp', CareFollowUp.schema);
      const filter = { $or: [{ memberId: { $in: memberIds } }, { attendanceId: { $in: attendanceIds } }] };
      results.push(await migrateCollection('CareFollowUp', SourceCFU, TargetCFU, filter, execute));
    }

    console.log('');
    console.table(results.map(({ label, found, migrated }) => ({ collection: label, found, migrated })));

    if (!execute) {
      console.log('\nDry run only — nothing was written. Re-run with --execute to actually migrate.');
    }
  } finally {
    await sourceConn.close();
    await targetConn.close();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
