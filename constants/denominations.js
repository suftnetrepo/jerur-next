/**
 * Hardcoded list of church denominations, selectable by a church admin on
 * Settings -> About Us (see app/protected/church/settings/about/index.jsx)
 * and persisted on Church.denomination (see app/models/church.js) — one
 * denomination per church, not a list.
 *
 * `id` is what's stored in MongoDB (stable, never changes even if `label`'s
 * wording does later) — `label` is display-only. Same pattern as
 * constants/mobileFeatures.js: church admins pick a label, the id is what
 * persists, and any UI that needs to show a saved id back as text goes
 * through getDenominationLabel() below rather than assuming id === label.
 *
 * The mobile app carries an exact copy of this list — see
 * winners-chapel-mobile's src/config/denominations.ts. Update both files
 * together if this list ever changes.
 */
export const DENOMINATIONS = [
  { id: 'pentecostal', label: 'Pentecostal' },
  { id: 'evangelical', label: 'Evangelical' },
  { id: 'baptist', label: 'Baptist' },
  { id: 'methodist', label: 'Methodist' },
  { id: 'anglican', label: 'Anglican' },
  { id: 'catholic', label: 'Catholic' },
  { id: 'presbyterian', label: 'Presbyterian' },
  { id: 'reformed', label: 'Reformed' },
  { id: 'lutheran', label: 'Lutheran' },
  { id: 'orthodox', label: 'Orthodox' },
  { id: 'apostolic', label: 'Apostolic' },
  { id: 'charismatic', label: 'Charismatic' },
  { id: 'non-denominational', label: 'Non-denominational' },
  { id: 'full-gospel', label: 'Full Gospel' },
  { id: 'church-of-god', label: 'Church of God' },
  { id: 'assemblies-of-god', label: 'Assemblies of God' },
  { id: 'foursquare-gospel', label: 'Foursquare Gospel' },
  { id: 'redeemed-christian-church-of-god', label: 'Redeemed Christian Church of God' },
  { id: 'living-faith-church', label: 'Living Faith Church (Winners Chapel)' },
  { id: 'christ-embassy', label: 'Christ Embassy' },
  { id: 'mountain-of-fire-and-miracles', label: 'Mountain of Fire and Miracles' },
  { id: 'deeper-life-bible-church', label: 'Deeper Life Bible Church' },
  { id: 'salvation-ministries', label: 'Salvation Ministries' },
  { id: 'seventh-day-adventist', label: 'Seventh-day Adventist' },
  { id: 'jehovahs-witnesses', label: "Jehovah's Witnesses" },
  { id: 'other', label: 'Other' }
];

export const getDenominationById = (id) => DENOMINATIONS.find((d) => d.id === id);

export const getDenominationLabel = (id) => getDenominationById(id)?.label ?? id;
