import { promises as fs } from "fs";
import path from "path";

export type SubmissionStatus = "new" | "reviewed" | "shortlisted" | "rejected";

export type Submission = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  currentRole: string;
  whyFit: string;
  resumeUrl?: string | null;
  source: string;
  status?: SubmissionStatus;
};

const dataDir = path.join(process.cwd(), "data");
const submissionsFile = path.join(dataDir, "submissions.json");

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(submissionsFile);
  } catch {
    await fs.writeFile(submissionsFile, "[]", "utf8");
  }
}

export async function readSubmissions(): Promise<Submission[]> {
  await ensureStorage();

  const raw = await fs.readFile(submissionsFile, "utf8");

  try {
    const parsed = JSON.parse(raw) as Submission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function sortSubmissions(submissions: Submission[]) {
  return [...submissions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function summarizeSubmissions(submissions: Submission[]) {
  const recentWindowMs = 7 * 24 * 60 * 60 * 1000;
  const recentCutoff = Date.now() - recentWindowMs;

  return {
    total: submissions.length,
    withResume: submissions.filter((entry) => Boolean(entry.resumeUrl)).length,
    recent: submissions.filter((entry) => new Date(entry.createdAt).getTime() >= recentCutoff).length,
    byStatus: {
      new: submissions.filter((entry) => (entry.status ?? "new") === "new").length,
      reviewed: submissions.filter((entry) => (entry.status ?? "new") === "reviewed").length,
      shortlisted: submissions.filter((entry) => (entry.status ?? "new") === "shortlisted").length,
      rejected: submissions.filter((entry) => (entry.status ?? "new") === "rejected").length,
    },
  };
}

export async function writeSubmission(submission: Submission) {
  await ensureStorage();

  const entries = await readSubmissions();
  entries.push(submission);
  await fs.writeFile(submissionsFile, JSON.stringify(entries, null, 2), "utf8");
}

export async function deleteSubmission(id: string) {
  await ensureStorage();

  const entries = await readSubmissions();
  const nextEntries = entries.filter((entry) => entry.id !== id);

  if (nextEntries.length === entries.length) {
    return false;
  }

  await fs.writeFile(submissionsFile, JSON.stringify(nextEntries, null, 2), "utf8");
  return true;
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  await ensureStorage();

  const entries = await readSubmissions();
  const index = entries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return false;
  }

  entries[index] = { ...entries[index], status };
  await fs.writeFile(submissionsFile, JSON.stringify(entries, null, 2), "utf8");
  return true;
}
