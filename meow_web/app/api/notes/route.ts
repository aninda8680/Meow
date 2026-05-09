import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Note from "@/models/Note";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const notes = await Note.find({ userId: (session.user as any).id }).sort({ createdAt: -1 });
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  await dbConnect();
  
  const note = await Note.create({
    userId: (session.user as any).id,
    content,
  });

  return NextResponse.json(note);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, content } = await req.json();
  await dbConnect();

  const note = await Note.findOneAndUpdate(
    { _id: id, userId: (session.user as any).id },
    { content },
    { new: true }
  );

  return NextResponse.json(note);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await dbConnect();

  await Note.deleteOne({ _id: id, userId: (session.user as any).id });

  return NextResponse.json({ success: true });
}
