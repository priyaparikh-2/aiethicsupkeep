import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { deliveryTime, timezone, recipientEmail, weeklyReviewDay } = body;
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: { deliveryTime, timezone, recipientEmail, weeklyReviewDay },
    create: { id: 1, deliveryTime, timezone, recipientEmail, weeklyReviewDay },
  });
  return NextResponse.json(settings);
}
