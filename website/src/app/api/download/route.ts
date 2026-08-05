import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export async function GET() {
  const filePath = join(process.cwd(), "public", "whatnext-extension.zip");

  if (!existsSync(filePath)) {
    return new NextResponse("Extension package zip not found.", { status: 404 });
  }

  const fileBuffer = readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="whatnext-extension.zip"',
      "Content-Length": fileBuffer.length.toString(),
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
