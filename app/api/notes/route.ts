import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Note } from "@/app/lib/models/Note";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

// GET - listar notas do usuário
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  await connectToDatabase();
  const notes = await Note.find({ userId, deletedAt: null }).sort({ createdAt: -1 });

  return NextResponse.json(notes);
}

// POST - criar nota
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { title, content } = await req.json();

  await connectToDatabase();
  const note = await Note.create({
    userId,
    title: title || "Nova anotação",
    content: content || "",
    deletedAt: null,
  });

  return NextResponse.json(note, { status: 201 });
}

// PUT - atualizar nota
export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id, title, content } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID da nota é obrigatório" }, { status: 400 });
  }

  await connectToDatabase();
  const note = await Note.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...(title !== undefined && { title }), ...(content !== undefined && { content }) },
    { new: true }
  );

  if (!note) {
    return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 });
  }

  return NextResponse.json(note);
}

// DELETE - soft delete da nota
export async function DELETE(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID da nota é obrigatório" }, { status: 400 });
  }

  await connectToDatabase();
  const note = await Note.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!note) {
    return NextResponse.json({ error: "Nota não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
