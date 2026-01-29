import { NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";

export const runtime = "nodejs";

const VehicleSchema = z.object({
  year: z.number().int().min(1980).max(new Date().getFullYear() + 1),
  make: z.string().min(1).max(40),
  model: z.string().min(1).max(60),
  mileage: z.number().int().min(0).max(1_000_000).optional(),
  trim: z.string().max(60).optional(),
  engine: z.string().max(60).optional(),
  location: z.string().max(60).optional(),
});

const BodySchema = z.object({
  vehicle: VehicleSchema,
  question: z.string().min(2).max(800),
});

const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const body = BodySchema.parse(await req.json());
    const { vehicle, question } = body;

    const vehicleLine = [
      `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      vehicle.trim && `trim: ${vehicle.trim}`,
      vehicle.engine && `engine: ${vehicle.engine}`,
      typeof vehicle.mileage === "number" && `mileage: ${vehicle.mileage}`,
      vehicle.location && `location: ${vehicle.location}`,
    ]
      .filter(Boolean)
      .join(" | ");

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `You are an AI Car Ownership Assistant.

Return responses in this format:

Urgency: LOW | MEDIUM | HIGH
Summary:
Likely causes:
What to do now:
Ballpark cost:
Questions to refine:`,
        },
        {
          role: "user",
          content: `Vehicle: ${vehicleLine}\nQuestion: ${question}`,
        },
      ],
      max_output_tokens: 500,
    });

    return NextResponse.json({
      answer: response.output_text,
    });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 400 });
  }
}
