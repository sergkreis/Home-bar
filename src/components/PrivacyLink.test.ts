import { describe, expect, it, vi } from "vitest";
vi.mock("react-native", () => ({ Linking: { openURL: vi.fn() }, Pressable: {}, StyleSheet: { create: (x: unknown) => x }, Text: {}, View: {} }));
vi.mock("../theme", () => ({ colors: { teal: "teal", danger: "red" }, pressed: { opacity: 0.7 } }));
import { openPrivacyPolicy, PRIVACY_URL } from "./PrivacyLink";

describe("privacy link", () => {
  it("opens the published policy URL and reports a failed browser handoff", async () => {
    const open = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("no handler"));
    expect(await openPrivacyPolicy(open)).toBe(true);
    expect(await openPrivacyPolicy(open)).toBe(false);
    expect(open).toHaveBeenCalledTimes(2);
    expect(open).toHaveBeenCalledWith(PRIVACY_URL);
  });
});
