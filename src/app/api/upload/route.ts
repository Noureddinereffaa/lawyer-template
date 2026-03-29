import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    
    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload to Supabase Storage Bucket
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("ticket_attachments")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file to storage" }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase
      .storage
      .from("ticket_attachments")
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      success: true, 
      url: publicUrlData.publicUrl 
    }, { status: 201 });

  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
