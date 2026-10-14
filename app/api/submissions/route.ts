import { NextResponse } from "next/server";

import {
  deleteSubmission,
  readSubmissions,
  sortSubmissions,
  summarizeSubmissions,
  updateSubmissionStatus,
  type SubmissionStatus,
} from "@/lib/submissions";

export async function GET() {
  const submissions = sortSubmissions(await readSubmissions());
  return NextResponse.json({
    submissions,
    stats: summarizeSubmissions(submissions),
  });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; status?: SubmissionStatus };
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Submission id is required." }, { status: 400 });
    }

    if (!status || !["new", "reviewed", "shortlisted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required." }, { status: 400 });
    }

    const updated = await updateSubmissionStatus(id, status);

    if (!updated) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, id, status });
  } catch {
    return NextResponse.json({ error: "Unable to update submission status." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Submission id is required." }, { status: 400 });
  }

  const deleted = await deleteSubmission(id);

  if (!deleted) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, deletedId: id });
}
