import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { path } = await request.json();
  if (typeof path !== "string") return NextResponse.json({ ok: false }, { status: 400 });
  revalidatePath(path);
  return NextResponse.json({ ok: true });
}
