/**
 * MongoDB migration runner.
 *
 * Usage: npm run migrate
 *
 * Executes every migration file in /migrations, in filename order, that
 * hasn't already been recorded in the `migrations` history collection.
 * This never runs automatically as part of the app - only via the command
 * above (see migrations/README.md for the full writeup).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { mongoConnect } from '../utils/connectDb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');

// Unlike `next dev`/`next build`/`next start`, running this script directly
// via tsx does NOT get Next.js's automatic .env loading - without this,
// utils/connectDb.js would silently fall back to the hardcoded default
// connection string baked into that file instead of honouring whichever
// .env file actually configures this environment. Mirrors Next.js's own
// precedence so `npm run migrate` targets the same database the app would:
// .env.<NODE_ENV>.local > .env.local > .env.<NODE_ENV> > .env (first file
// to define a given variable wins - dotenv does not override already-set
// values by default).
function loadEnv() {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const candidates = [`.env.${NODE_ENV}.local`, '.env.local', `.env.${NODE_ENV}`, '.env'];

  const loaded = [];
  for (const file of candidates) {
    const fullPath = path.resolve(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath });
      loaded.push(file);
    }
  }

  console.log(`NODE_ENV=${NODE_ENV} - env files loaded (highest priority first): ${loaded.join(', ') || '(none found)'}`);
}

// Zero-padded numeric prefix (001-, 002-, ...) so a plain alphabetical sort
// is also the correct execution order - see migrations/README.md.
const MIGRATION_FILE_PATTERN = /^\d+-.+\.js$/;

// Self-contained history ledger. Deliberately not one of the app's domain
// models under app/models/ - the API layer never reads or writes this, it
// exists only for this script.
const migrationHistorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    executedAt: { type: Date, required: true, default: Date.now }
  },
  { collection: 'migrations' }
);
const MigrationHistory =
  mongoose.models.MigrationHistory || mongoose.model('MigrationHistory', migrationHistorySchema);

function listMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => MIGRATION_FILE_PATTERN.test(file))
    .sort();
}

// MongoDB transactions require a replica set (Atlas deployments, which this
// project uses, always are one). A plain standalone mongod isn't, so probe
// once up front and fall back to running without a session rather than
// crashing the whole run on environments where that's true.
async function detectTransactionSupport() {
  let session;
  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {});
    return true;
  } catch (error) {
    return false;
  } finally {
    if (session) await session.endSession();
  }
}

function migrationNameFor(fileName) {
  return fileName.replace(/\.js$/, '');
}

async function loadMigration(fileName) {
  const modulePath = path.join(MIGRATIONS_DIR, fileName);
  const migrationModule = await import(pathToFileURL(modulePath).href);
  const migrate = migrationModule.default;

  if (typeof migrate !== 'function') {
    throw new Error(`${fileName} must have a default export: "export default async function migrate() { ... }"`);
  }

  return migrate;
}

async function runMigration(fileName, useTransactions) {
  const name = migrationNameFor(fileName);

  const alreadyExecuted = await MigrationHistory.exists({ name });
  if (alreadyExecuted) {
    console.log(`Skipped: ${name} (already executed)`);
    return { name, status: 'skipped' };
  }

  console.log(`Running migration: ${name}...`);
  const migrate = await loadMigration(fileName);

  let session = null;
  let result;

  try {
    if (useTransactions) {
      session = await mongoose.startSession();
      await session.withTransaction(async () => {
        result = await migrate(session);
        await MigrationHistory.create([{ name, executedAt: new Date() }], { session });
      });
    } else {
      result = await migrate(null);
      await MigrationHistory.create({ name, executedAt: new Date() });
    }
  } finally {
    if (session) await session.endSession();
  }

  const resultSuffix = result ? ` (${JSON.stringify(result)})` : '';
  console.log(`Completed: ${name}${resultSuffix}`);
  return { name, status: 'completed', result };
}

function printSummary(summary) {
  console.log('\nSummary:');
  if (!summary.length) {
    console.log('  (no migrations found)');
    return;
  }
  for (const item of summary) {
    const resultSuffix = item.result ? ` - ${JSON.stringify(item.result)}` : '';
    console.log(`  [${item.status}] ${item.name}${resultSuffix}`);
  }
}

function maskedConnectionTarget() {
  const url = process.env.NEXT_PUBLIC_MONGODB_URL || '';
  // mongodb+srv://user:pass@cluster/dbname?params -> cluster/dbname, no credentials.
  const match = url.match(/@([^/]+)\/([^?]+)/);
  return match ? `${match[1]}/${match[2]}` : '(using utils/connectDb.js hardcoded default - NEXT_PUBLIC_MONGODB_URL is not set)';
}

async function main() {
  loadEnv();
  console.log(`Connecting to database: ${maskedConnectionTarget()}`);
  await mongoConnect();

  if (mongoose.connection.readyState !== 1) {
    console.error('Failed: could not establish a database connection. Aborting.');
    process.exit(1);
  }

  const useTransactions = await detectTransactionSupport();
  if (!useTransactions) {
    console.log('Note: this database deployment does not support transactions - running without them.');
  }

  const files = listMigrationFiles();
  if (files.length === 0) {
    console.log('No migration files found in /migrations.');
  }

  const summary = [];

  for (const file of files) {
    try {
      summary.push(await runMigration(file, useTransactions));
    } catch (error) {
      console.error(`Failed: ${migrationNameFor(file)}`);
      console.error(error);
      console.log('\nMigration run stopped due to failure. Migrations after this one were not attempted.');
      printSummary(summary);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  console.log('\nAll migrations processed.');
  printSummary(summary);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error('Failed: unexpected error while running migrations.');
  console.error(error);
  process.exit(1);
});
