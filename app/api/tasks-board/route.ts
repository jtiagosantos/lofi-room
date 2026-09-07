import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { TasksBoard } from "@/app/lib/models/TasksBoard";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

// GET - retorna o board do usuário
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  await connectToDatabase();
  const board = await TasksBoard.findOne({ userId, deletedAt: null });

  if (!board) {
    return NextResponse.json({ columns: [] });
  }

  return NextResponse.json({ columns: board.columns });
}

// PUT - salva/atualiza o board inteiro do usuário
export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { columns } = await req.json();
  if (!Array.isArray(columns)) {
    return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
  }

  await connectToDatabase();
  const board = await TasksBoard.findOneAndUpdate(
    { userId, deletedAt: null },
    { columns, deletedAt: null },
    { upsert: true, returnDocument: "after" }
  );

  return NextResponse.json({ columns: board.columns });
}
