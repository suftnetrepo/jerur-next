import assert from "node:assert/strict";
import fs from "node:fs";

const registrySource = fs.readFileSync(new URL("../constants/mobileFeatures.js", import.meta.url), "utf8");
const registry = await import(`data:text/javascript;base64,${Buffer.from(registrySource).toString("base64")}`);
const { DEFAULT_ENABLED_FEATURE_IDS, getFeatureById, toggleFeatureId } = registry;

const feature = getFeatureById("bible-discovery");
assert.equal(feature?.label, "Bible Discovery", "Bible Discovery must be registered");
assert.equal(feature?.enabledByDefault, false, "Bible Discovery must be disabled by default");
assert.equal(DEFAULT_ENABLED_FEATURE_IDS.includes("bible-discovery"), false, "Bible Discovery must not be enabled for existing churches");
assert.deepEqual(toggleFeatureId([], "bible-discovery", true), ["bible-discovery"], "Church must be able to enable Bible Discovery");
assert.deepEqual(toggleFeatureId(["bible-discovery", "bible"], "bible-discovery", false), ["bible"], "Church must be able to disable Bible Discovery without changing other flags");
const route = fs.readFileSync(new URL("../app/api/church/get/route.js", import.meta.url), "utf8");
assert.match(route, /enabledFeatureIds:\s*data\?\.features\s*\|\|\s*\[\]/, "Church API must expose enabledFeatureIds");
console.log("Bible Discovery backend feature tests passed.");
