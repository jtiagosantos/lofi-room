import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { connectToDatabase } from "@/app/lib/mongodb";
import { Wallpaper } from "@/app/lib/models/Wallpaper";

async function getAuthUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

// GET - retorna o wallpaper salvo do usuário
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  await connectToDatabase();
  const wallpaper = await Wallpaper.findOne({ userId });

  if (!wallpaper) {
    return NextResponse.json({ url: null });
  }

  return NextResponse.json({ url: wallpaper.url });
}

// PUT - salva/atualiza o wallpaper do usuário
export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
  }

  await connectToDatabase();
  const wallpaper = await Wallpaper.findOneAndUpdate(
    { userId },
    { url },
    { upsert: true, new: true }
  );

  return NextResponse.json({ url: wallpaper.url });
}
