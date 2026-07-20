import { describe, expect, it } from "vitest";
import { formatDateTime } from "./formatDateTime";

describe("formatDateTime", () => {
  it("formate une date ISO en français", () => {
    // No assertion on the time: it depends on the machine's timezone.
    expect(formatDateTime("2026-06-28T09:12:00.000Z")).toMatch(/28 juin 2026/);
  });

  it("replie sur « — » pour une date invalide", () => {
    expect(formatDateTime("pas-une-date")).toBe("—");
  });
});
