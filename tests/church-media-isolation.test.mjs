import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const service = fs.readFileSync(path.join(root, "app/services/churchService.js"), "utf8");
const searchRoute = fs.readFileSync(path.join(root, "app/api/church/search/route.js"), "utf8");
const about = fs.readFileSync(path.join(root, "app/protected/church/settings/about/index.jsx"), "utf8");

for (const protectedField of ["notification", "pastor_section", "secure_url", "public_id", "logo_url", "logo_id"]) {
  if (!service.includes(`delete fields.${protectedField}`)) {
    throw new Error(`Bulk settings update does not protect ${protectedField}`);
  }
}

if (!service.includes("notification.secure_url pastor_section.secure_url")) {
  throw new Error("Church search cannot detect legacy nested-image contamination");
}
if (!service.includes("isLegacyNestedImageUsedAsBanner") || !service.includes("secure_url: bannerIsLegacyNestedImage ? ''")) {
  throw new Error("Selected-church settings do not suppress legacy nested images used as banners");
}
if (!searchRoute.includes("bannerIsLegacyNestedImage")) {
  throw new Error("Church search does not suppress legacy notification/pastor images");
}
if (!searchRoute.includes("secure_url: bannerIsLegacyNestedImage ? '' : bannerUrl")) {
  throw new Error("Church search does not return the isolated church banner");
}
if (!about.includes("No church banner uploaded")) {
  throw new Error("About Us does not render an empty-banner placeholder");
}

console.log("Church banner, notification, logo and pastor media are isolated.");
