// Stub for optional packages that fastest-validator's debug-only
// humanize() helper lazily requires (see next.config.js). Neither
// `prettier` nor `cli-highlight` is an actual dependency of this app,
// and that code path is never called, so this empty module is never
// touched — it only exists to satisfy Turbopack/webpack's static
// module resolution.
module.exports = {};
