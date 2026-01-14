import { NextResponse } from "next/server"
import { env } from "@/lib/config/env"

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    network: env.RPC_URL 
  })
}
