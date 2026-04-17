import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Activity from "@/models/Activity";

// This endpoint might be called by the local tracker
// In a real app, we'd use an API key for authentication here.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await dbConnect();

    // If body is an array, insert many, else insert one
    if (Array.isArray(body)) {
      const activities = await Activity.insertMany(body);
      return NextResponse.json(activities);
    } else {
      const activity = await Activity.create(body);
      return NextResponse.json(activity);
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  // Optional: fetch all activity logs
  await dbConnect();
  const activities = await Activity.find().sort({ timestamp: -1 }).limit(100);
  return NextResponse.json(activities);
}
