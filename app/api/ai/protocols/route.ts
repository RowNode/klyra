import { NextResponse } from "next/server"
import { getAllProtocols } from "@/lib/api-services/protocols"

export async function GET() {
  const protocols = getAllProtocols()
  return NextResponse.json({ protocols })
}
