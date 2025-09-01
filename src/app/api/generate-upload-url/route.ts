import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const GenerateUploadUrlRequestSchema = z.object({
  filename: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    GenerateUploadUrlRequestSchema.parse(body);

    // Generate a unique upload URL for Pinata
    const uploadUrl = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    return NextResponse.json({ url: uploadUrl });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
