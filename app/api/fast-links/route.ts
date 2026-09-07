import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { FastLink } from "@/app/lib/models/FastLink";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

// GET - listar links do usuário
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  await connectToDatabase();
  const links = await FastLink.find({ userId, deletedAt: null }).sort({ createdAt: 1 });

  return NextResponse.json(links);
}

// POST - criar link
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { label, url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
  }

  await connectToDatabase();
  const link = await FastLink.create({
    userId,
    label: label || url,
    url,
    deletedAt: null,
  });

  return NextResponse.json(link, { status: 201 });
}

// PUT - atualizar link
export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id, label, url } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID do link é obrigatório" }, { status: 400 });
  }

  await connectToDatabase();
  const link = await FastLink.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { ...(label !== undefined && { label }), ...(url !== undefined && { url }) },
    { new: true }
  );

  if (!link) {
    return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
  }

  return NextResponse.json(link);
}

// DELETE - soft delete do link
export async function DELETE(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID do link é obrigatório" }, { status: 400 });
  }

  await connectToDatabase();
  const link = await FastLink.findOneAndUpdate(
    { _id: id, userId, deletedAt: null },
    { deletedAt: new Date() },
    { new: true }
  );

  if (!link) {
    return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
