import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lid = searchParams.get("lid") ?? "";
  const sig = searchParams.get("sig") ?? "";

  if (!lid || !sig || !verifyUnsubscribeToken(lid, sig)) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }

  await prisma.lead.update({
    where: { id: lid },
    data: { unsubscribed: true },
  });

  return NextResponse.redirect(
    new URL("/unsubscribed", req.url)
  );
}
