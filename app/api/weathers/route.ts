import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Weather } from "@/app/lib/models/Weather";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

// GET - retorna o CEP salvo do usuário
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  await connectToDatabase();
  const weather = await Weather.findOne({ userId });

  if (!weather) {
    return NextResponse.json({ cep: null });
  }

  return NextResponse.json({ cep: weather.cep });
}

// PUT - salva/atualiza o CEP do usuário
export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { cep } = await req.json();
  if (!cep) {
    return NextResponse.json({ error: "CEP é obrigatório" }, { status: 400 });
  }

  await connectToDatabase();
  const weather = await Weather.findOneAndUpdate(
    { userId },
    { cep },
    { upsert: true, new: true }
  );

  return NextResponse.json({ cep: weather.cep });
}
