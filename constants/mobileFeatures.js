/**
 * Configuration for the optional, church-toggleable features shown in the
 * member-facing mobile app. This drives the "Mobile Features" card grid in
 * Settings -> More... -> Mobile Features.
 *
 * Only the `id` of each enabled feature is ever persisted, on
 * Church.features (see app/models/church.js). Everything else here
 * (label, description, category, icon, color) is presentation metadata and
 * must never be written to MongoDB.
 *
 * NOTE: the home Slider is not listed here - it is always available and is
 * not gated behind a feature flag.
 */

export const FEATURE_CATEGORIES = ['Church', 'Community', 'Finance', 'Media', 'Communication', 'Members'];

export const MOBILE_FEATURES = [
  {
    id: 'giving',
    label: 'Giving',
    description: 'Allow members to make donations, tithes and offerings through the mobile app.',
    category: 'Finance',
    icon: 'payments',
    color: '#A16207',
    enabledByDefault: true
  },
  {
    id: 'campaigns',
    label: 'Campaigns',
    description: 'Let members view and contribute to active fundraising campaigns.',
    category: 'Finance',
    icon: 'campaign',
    color: '#0E7490',
    enabledByDefault: false
  },
  {
    id: 'prayer-request',
    label: 'Prayer Request',
    description: 'Members can submit prayer requests directly to the church.',
    category: 'Communication',
    icon: 'front_hand',
    color: '#0D9488',
    enabledByDefault: true
  },
  {
    id: 'testimony',
    label: 'Testimony',
    description: 'Let members share testimonies of what God has done in their lives.',
    category: 'Church',
    icon: 'record_voice_over',
    color: '#84CC16',
    enabledByDefault: true
  },
  {
    id: 'house-fellowship',
    label: 'House Fellowship',
    description: 'Help members find and join a house fellowship group near them.',
    category: 'Community',
    icon: 'groups',
    color: '#4338CA',
    enabledByDefault: true
  },
  {
    id: 'register-member',
    label: 'Register Member',
    description: 'Allow visitors to register as a church member directly from the mobile app.',
    category: 'Members',
    icon: 'person_add',
    color: '#0284C7',
    enabledByDefault: true
  },
  {
    id: 'hymns',
    label: 'Hymns',
    description: 'Give members access to a library of hymns and worship lyrics.',
    category: 'Media',
    icon: 'library_music',
    color: '#44403C',
    enabledByDefault: false
  },
  {
    id: 'attendance',
    label: 'Attendance',
    description: 'Let members check in and view their attendance history from the app.',
    category: 'Church',
    icon: 'how_to_reg',
    color: '#059669',
    enabledByDefault: true
  },
  {
    id: 'upcoming-events',
    label: 'Upcoming Events',
    description: 'Show members a calendar of upcoming church events.',
    category: 'Church',
    icon: 'event',
    color: '#7C3AED',
    enabledByDefault: true
  },
  {
    id: 'service-times',
    label: 'Service Times',
    description: "Show members the church's regular service and prayer meeting times.",
    category: 'Church',
    icon: 'schedule',
    color: '#C026D3',
    enabledByDefault: true
  },
  {
    id: 'contact-us',
    label: 'Contact Us',
    description: 'Let members reach the church office directly from the app.',
    category: 'Communication',
    icon: 'call',
    color: '#E11D48',
    enabledByDefault: true
  },
  {
    id: 'community-food-bank',
    label: 'Community Food Bank',
    description: 'Share food bank schedules and let members request or offer support.',
    category: 'Community',
    icon: 'restaurant',
    color: '#EA580C',
    enabledByDefault: false
  },
  {
    id: 'free-transport',
    label: 'Free Transport',
    description: 'Let members request free transport to church services and events.',
    category: 'Community',
    icon: 'directions_bus',
    color: '#2563EB',
    enabledByDefault: false
  },
  {
    id: 'believers-foundation-class',
    label: "Believers Foundation Class",
    description: 'New members can enrol in the Believers Foundation class.',
    category: 'Church',
    icon: 'school',
    color: '#9333EA',
    enabledByDefault: false
  },
  {
    id: 'wofbi-basic-certificate',
    label: 'Wofbi Basic Certificate Course',
    description: 'Members can enrol in the Wofbi Basic Certificate course.',
    category: 'Church',
    icon: 'workspace_premium',
    color: '#B91C1C',
    enabledByDefault: false
  },
  {
    id: 'note',
    label: 'Note',
    description: 'Let members take and save personal notes during sermons and services.',
    category: 'Media',
    icon: 'edit_note',
    color: '#DB2777',
    enabledByDefault: false
  },
  {
    id: 'bible',
    label: 'Bible',
    description: 'Give members in-app access to a full Bible reader.',
    category: 'Media',
    icon: 'menu_book',
    color: '#1E3A8A',
    enabledByDefault: false
  },
  {
    id: 'sermons',
    label: 'Sermons',
    description: 'Let members watch or listen to past and recent sermons.',
    category: 'Media',
    icon: 'ondemand_video',
    color: '#16A34A',
    enabledByDefault: true
  },
  {
    id: 'prayer-hour',
    label: 'Prayer Hour',
    description: "Notify members of and let them join the church's dedicated prayer hour sessions.",
    category: 'Church',
    icon: 'self_improvement',
    color: '#115E59',
    enabledByDefault: true
  }
];

/**
 * Feature ids a newly created Church starts with — used as
 * Church.features' schema default (see app/models/church.js) and to
 * backfill existing churches that have no configured selection yet (see
 * migrations/003-default-mobile-features.js). This is a deliberately
 * hand-picked, curated list, not derived from each feature's
 * `enabledByDefault` flag above (that flag is presentation-only, driving
 * nothing else) - so it's free to differ, and it intentionally does:
 * `sermons` and `prayer-hour` are `enabledByDefault: true` above but not
 * included here, and `notifications` is included here but has no matching
 * entry in MOBILE_FEATURES at all (it isn't a member-facing toggleable
 * feature - it's a baseline platform capability every church gets).
 */
export const DEFAULT_ENABLED_FEATURE_IDS = [
  'service-times',
  'upcoming-events',
  'contact-us',
  'giving',
  'prayer-request',
  'testimony',
  'house-fellowship',
  'attendance',
  'register-member',
  'notifications'
];

export const getFeatureById = (id) => MOBILE_FEATURES.find((feature) => feature.id === id);

export const groupFeaturesByCategory = (features = MOBILE_FEATURES) =>
  FEATURE_CATEGORIES.reduce((groups, category) => {
    const categoryFeatures = features.filter((feature) => feature.category === category);
    if (categoryFeatures.length) {
      groups.push({ category, features: categoryFeatures });
    }
    return groups;
  }, []);
