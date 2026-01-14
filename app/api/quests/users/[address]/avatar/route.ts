import { NextRequest, NextResponse } from "next/server"
import { updateAvatar } from "@/lib/services/dbService"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params
    const { avatar_url } = await request.json()

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { message: "Invalid wallet address" },
        { status: 400 }
      )
    }

    if (!avatar_url || typeof avatar_url !== "string" || avatar_url.trim().length === 0) {
      return NextResponse.json(
        { message: "Avatar URL is required" },
        { status: 400 }
      )
    }

    // Validate URL format (allow http/https/data URLs)
    if (!avatar_url.startsWith("http") && !avatar_url.startsWith("data:image")) {
      return NextResponse.json(
        { message: "Invalid avatar URL format" },
        { status: 400 }
      )
    }

    const user = await updateAvatar(address, avatar_url.trim())

    return NextResponse.json({
      success: true,
      message: "Avatar updated successfully",
      user: {
        user_id: user.id,
        wallet_address: user.wallet_address,
        avatar_url: user.avatar_url,
      },
    })
  } catch (error: any) {
    if (error.message?.includes("Invalid avatar") || error.message?.includes("Avatar URL")) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
    console.error("Error updating avatar:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
