import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PinataSDK } from "pinata";
import { publicEnv } from "@/publicEnv";
import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_FILE_SIZE,
} from "@ecp.eth/react-editor";

const PayloadSchema = z.object({
  filename: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = PayloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const pinataJwt = process.env.PINATA_JWT;
    if (!pinataJwt) {
      console.error("Missing PINATA_JWT env var");
      return NextResponse.json(
        { error: "Server misconfiguration: PINATA_JWT missing" },
        { status: 500 }
      );
    }

    const pinata = new PinataSDK({
      pinataJwt,
      pinataGateway: publicEnv.NEXT_PUBLIC_PINATA_GATEWAY_URL,
    });

    const url = await pinata.upload.public.createSignedURL({
      mimeTypes: Array.from(ALLOWED_UPLOAD_MIME_TYPES),
      expires: 60, // seconds
      name: parsed.data.filename,
      maxFileSize: MAX_UPLOAD_FILE_SIZE,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
