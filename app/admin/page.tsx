"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Submission = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  currentRole: string;
  whyFit?: string;
  resumeUrl?: string | null;
  status?: SubmissionStatus;
};

type SubmissionStatus = "new" | "reviewed" | "shortlisted" | "rejected";

type SubmissionStats = {
  total: number;
  withResume: number;
  recent: number;
  byStatus?: {
    new: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
  };
};

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats>({ total: 0, withResume: 0, recent: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    const response = await fetch("/api/submissions");

    if (!response.ok) {
      throw new Error("Unable to load submissions.");
    }

    const data = (await response.json()) as {
      submissions?: Submission[];
      stats?: SubmissionStats;
    };

    setSubmissions(data.submissions ?? []);
    setStats(data.stats ?? { total: 0, withResume: 0, recent: 0 });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchSubmissions();
      } catch {
        setError("We could not load the current submissions. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredSubmissions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return submissions;
    }

    return submissions.filter((submission) => {
      const haystack = [
        submission.name,
        submission.email,
        submission.currentRole,
        submission.whyFit ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [searchTerm, submissions]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this submission? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/submissions?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete submission.");
      }

      await fetchSubmissions();
    } catch {
      setError("The submission could not be deleted right now. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, status: SubmissionStatus) => {
    try {
      setUpdatingId(id);
      const response = await fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        throw new Error("Unable to update status.");
      }

      await fetchSubmissions();
    } catch {
      setError("The status could not be updated right now. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCsv = () => {
    const rows = filteredSubmissions.map((submission) => ({
      name: submission.name,
      email: submission.email,
      phone: submission.phone ?? "",
      currentRole: submission.currentRole,
      linkedinUrl: submission.linkedinUrl ?? "",
      resumeUrl: submission.resumeUrl ?? "",
      createdAt: submission.createdAt,
      whyFit: submission.whyFit ?? "",
    }));

    const headers = [
      "name",
      "email",
      "phone",
      "currentRole",
      "linkedinUrl",
      "resumeUrl",
      "createdAt",
      "whyFit",
    ];

    const escapeCell = (value: string) => {
      const text = String(value ?? "").replace(/\r?\n/g, " ");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers.map((header) => escapeCell(String(row[header as keyof typeof row]))).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Hiring admin</p>
            <h1 className="mt-2 text-3xl font-semibold">AI Native Innovator interest submissions</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500"
          >
            View landing page
          </Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Total</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">With resume</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.withResume}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Last 7 days</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.recent}</p>
          </div>
        </div>

        {stats.byStatus ? (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            {Object.entries(stats.byStatus).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm capitalize text-slate-400">{key}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-md">
            <label htmlFor="search" className="mb-2 block text-sm text-slate-300">
              Search applicants
            </label>
            <input
              id="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, or role"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
            >
              Export CSV
            </button>
            <div className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
              {filteredSubmissions.length} shown
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-300">
            Loading submissions...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-100">
            {error}
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center text-slate-300">
            {searchTerm ? "No matching submissions found." : "No submissions yet."}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
                <thead className="bg-slate-800 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Current role</th>
                    <th className="px-4 py-3">Why fit</th>
                    <th className="px-4 py-3">Resume</th>
                    <th className="px-4 py-3">Submitted</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="align-top hover:bg-slate-800/70">
                      <td className="px-4 py-4 font-medium text-white">{submission.name}</td>
                      <td className="px-4 py-4">
                        <div>{submission.email}</div>
                        {submission.phone ? <div className="mt-1 text-slate-400">{submission.phone}</div> : null}
                        {submission.linkedinUrl ? (
                          <a
                            href={submission.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-cyan-300 underline decoration-cyan-500/60 underline-offset-4"
                          >
                            LinkedIn
                          </a>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">{submission.currentRole}</td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs whitespace-pre-line text-slate-300">
                          {submission.whyFit || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {submission.resumeUrl ? (
                          <a
                            href={submission.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-300 underline decoration-cyan-500/60 underline-offset-4"
                          >
                            Download
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        {new Date(submission.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <select
                            value={submission.status ?? "new"}
                            onChange={(event) =>
                              void handleStatusChange(submission.id, event.target.value as SubmissionStatus)
                            }
                            disabled={updatingId === submission.id}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="new">New</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => void handleDelete(submission.id)}
                            disabled={deletingId === submission.id}
                            className="rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === submission.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
