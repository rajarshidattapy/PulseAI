import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const filePath = join(process.cwd(), "../webpage.html");
  try {
    const fileContents = readFileSync(filePath, "utf8");
    return new NextResponse(fileContents, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}
