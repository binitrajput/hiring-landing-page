import test from "node:test";
import assert from "node:assert/strict";

import { sortSubmissions, summarizeSubmissions } from "./submissions";

const now = Date.now();

const records = [
  {
    id: "older",
    createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    name: "Older Applicant",
    email: "older@example.com",
    phone: "+1 555 000 0000",
    linkedinUrl: "https://example.com/older",
    currentRole: "Designer",
    whyFit: "A long time ago.",
    resumeUrl: null,
    source: "test",
  },
  {
    id: "newer",
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    name: "New Applicant",
    email: "new@example.com",
    phone: "+1 555 111 1111",
    linkedinUrl: "https://example.com/new",
    currentRole: "Engineer",
    whyFit: "Recently applied.",
    resumeUrl: "/uploads/demo.pdf",
    source: "test",
  },
];

test("sortSubmissions sorts newest entries first", () => {
  const sorted = sortSubmissions(records);

  assert.equal(sorted[0]?.id, "newer");
  assert.equal(sorted[1]?.id, "older");
});

test("summarizeSubmissions returns counts for total and resume submissions", () => {
  const summary = summarizeSubmissions(records);

  assert.equal(summary.total, 2);
  assert.equal(summary.withResume, 1);
  assert.equal(summary.recent, 1);
});
