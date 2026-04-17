import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  let settings = await Settings.findOne({ userId: (session.user as any).id });
  
  if (!settings) {
    // Return default settings if none exist
    settings = await Settings.create({
      userId: (session.user as any).id,
    });
  }

  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, avatar, mode, widgets } = await req.json();
  await dbConnect();

  const settings = await Settings.findOneAndUpdate(
    { userId: (session.user as any).id },
    { name, avatar, mode, widgets },
    { upsert: true, new: true }
  );

  return NextResponse.json(settings);
}
