import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Task from "@/models/Task";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const tasks = await Task.find({ userId: (session.user as any).id });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, completed, focusTime } = await req.json();
  await dbConnect();
  
  const task = await Task.create({
    userId: (session.user as any).id,
    title,
    completed,
    focusTime
  });

  return NextResponse.json(task);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title, completed, focusTime } = await req.json();
  await dbConnect();

  const task = await Task.findOneAndUpdate(
    { _id: id, userId: (session.user as any).id },
    { title, completed, focusTime },
    { new: true }
  );

  return NextResponse.json(task);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await dbConnect();

  await Task.deleteOne({ _id: id, userId: (session.user as any).id });

  return NextResponse.json({ success: true });
}
