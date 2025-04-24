import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json(
      { error: "Path parameter is required" },
      { status: 400 }
    );
  }

  try {
    const content = fs.readFileSync(
      path.join(process.cwd(), "src/content", filePath),
      "utf-8"
    );
    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
