import bcrypt from 'bcryptjs';
import Member from '../app/models/member';

const PIN_SALT_ROUNDS = 10;

/**
 * The member auth rollout replaced the legacy numeric `pin` field with
 * `pinHash`. Existing MongoDB documents kept `pin` but could no longer log in.
 * Hash valid legacy PINs and remove the plaintext value after conversion.
 */
export default async function migrate(session) {
  const members = await Member.collection
    .find({ pinHash: { $exists: false }, pin: { $exists: true } }, { session })
    .toArray();

  const operations = [];
  let skippedCount = 0;

  for (const member of members) {
    const pin = String(member.pin ?? '').trim();

    if (!/^\d{4,6}$/.test(pin)) {
      skippedCount += 1;
      continue;
    }

    operations.push({
      updateOne: {
        filter: { _id: member._id, pinHash: { $exists: false } },
        update: {
          $set: { pinHash: await bcrypt.hash(pin, PIN_SALT_ROUNDS) },
          $unset: { pin: '' }
        }
      }
    });
  }

  const result = operations.length
    ? await Member.collection.bulkWrite(operations, { session })
    : { matchedCount: 0, modifiedCount: 0 };

  return {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    skippedCount
  };
}
