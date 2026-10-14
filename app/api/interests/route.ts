import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { readSubmissions, writeSubmission } from "@/lib/submissions";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(?:\+?\d[\d\s().-]{7,}\d)$/;

function sanitize(value: FormDataEntryValue | null, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = sanitize(formData.get("name"));
    const email = sanitize(formData.get("email")).toLowerCase();
    const phone = sanitize(formData.get("phone"));
    const linkedinUrl = sanitize(formData.get("linkedinUrl"));
    const currentRole = sanitize(formData.get("currentRole"));
    const whyFit = sanitize(formData.get("whyFit"));
    const file = formData.get("resume");

    const errors: Record<string, string> = {};

    if (!name) {
      errors.name = "Please enter your full name.";
    }

    if (!email) {
      errors.email = "Please enter your email address.";
    } else if (!emailPattern.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!phone) {
      errors.phone = "Please enter your phone number.";
    } else if (!phonePattern.test(phone)) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (!linkedinUrl) {
      errors.linkedinUrl = "Please share your LinkedIn or portfolio URL.";
    } else if (!isValidUrl(linkedinUrl)) {
      errors.linkedinUrl = "Please enter a valid URL.";
    }

    if (!currentRole) {
      errors.currentRole = "Please tell us your current role.";
    }

    if (!whyFit) {
      errors.whyFit = "Please tell us why you're a fit for this role.";
    } else if (whyFit.length < 50) {
      errors.whyFit = "Please share a bit more detail so we understand your fit.";
    }

    if (file && file instanceof File && file.size > 0) {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
        errors.resume = "Resume must be a PDF or DOC/DOCX file.";
      }

      if (file.size > 5 * 1024 * 1024) {
        errors.resume = "Resume must be under 5 MB.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const existingSubmissions = await readSubmissions();
    const duplicate = existingSubmissions.some(
      (submission) => submission.email.toLowerCase() === email,
    );

    if (duplicate) {
      return NextResponse.json(
        {
          errors: {
            email: "This email has already been submitted. If needed, contact the team directly.",
          },
        },
        { status: 409 },
      );
    }

    let resumeUrl: string | null = null;

    if (file && file instanceof File && file.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const safeName = `${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "resume"}`;
      const extension = path.extname(file.name) || ".pdf";
      const destination = path.join(uploadDir, `${safeName}${extension}`);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      await fs.writeFile(destination, fileBuffer);
      resumeUrl = `/uploads/${path.basename(destination)}`;
    }

    const submission = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      name,
      email,
      phone,
      linkedinUrl,
      currentRole,
      whyFit,
      resumeUrl,
      source: "ai-native-innovator-landing-page",
      status: "new" as const,
    };

    await writeSubmission(submission);

    return NextResponse.json(
      {
        success: true,
        message: "Thanks! Your interest has been received.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      {
        errors: {
          form: "Something went wrong while submitting your interest. Please try again.",
        },
      },
      { status: 500 },
    );
  }
}
