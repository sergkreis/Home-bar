import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const config = JSON.parse(readFileSync(new URL("../../app.json", import.meta.url), "utf8"));
describe("Android release privacy configuration", () => {
  it("blocks dependency permissions unrelated to cocktail recipes", () => {
    expect(config.expo.android.blockedPermissions).toEqual(expect.arrayContaining([
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.VIBRATE",
    ]));
  });
  it("excludes local account state from Android backups", () => {
    expect(config.expo.android.allowBackup).toBe(false);
  });
});
