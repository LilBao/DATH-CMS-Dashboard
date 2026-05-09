export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "Không tìm thấy file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Đường dẫn lưu file: public/posters
    const path = join(process.cwd(), "public", "posters");
    
    // Đảm bảo thư mục tồn tại
    try {
      await mkdir(path, { recursive: true });
    } catch (e) {}

    // Tạo tên file duy nhất để tránh trùng lặp
    const uniqueFileName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
    const filePath = join(path, uniqueFileName);

    // Ghi file vào ổ cứng
    await writeFile(filePath, buffer);
    
    // Trả về đường dẫn mà trình duyệt có thể đọc được
    return NextResponse.json({ 
      success: true, 
      url: `/posters/${uniqueFileName}` 
    });

  } catch (error) {
    console.error("Lỗi Upload:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống khi upload" }, { status: 500 });
  }
}