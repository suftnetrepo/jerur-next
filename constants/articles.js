/**
 * Christian Articles - shared constants. Same pattern as
 * constants/mobileFeatures.js / constants/denominations.js: one file both
 * the server (validation, limit enforcement) and the client (UI copy,
 * disabling "+ Add Article") import from, so there is exactly one place
 * that defines what these values are.
 */

// Initial per-church cap on published/draft articles combined. Deliberately
// a named constant rather than a literal `4` scattered through the
// codebase - raising this later (e.g. as a paid-plan perk) is a one-line
// change here, not a hunt through validators/services/UI copy.
export const MAX_ARTICLES_PER_CHURCH = 4;

export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published'
};

export const ARTICLE_STATUS_VALUES = Object.values(ARTICLE_STATUS);

export const ARTICLE_STATUS_OPTIONS = [
  { id: ARTICLE_STATUS.DRAFT, title: 'Draft', value: ARTICLE_STATUS.DRAFT },
  { id: ARTICLE_STATUS.PUBLISHED, title: 'Published', value: ARTICLE_STATUS.PUBLISHED }
];
