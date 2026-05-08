import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No video file found" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const path = join(process.cwd(), "public", "videos");
    
    try {
      await mkdir(path, { recursive: true });
    } catch (e) {}

    const uniqueFileName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
    const filePath = join(path, uniqueFileName);

    await writeFile(filePath, buffer);
    
    return NextResponse.json({ 
      success: true, 
      url: `/videos/${uniqueFileName}` 
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "System error during video upload" }, { status: 500 });
  }
}