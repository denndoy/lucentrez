import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ message: "Failed to delete gallery item", error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
