import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase-server";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import path from "path";

function sanitizeForFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/_+/g, "_");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (formData.get("type") as string) || "general";
    const projectTitle = (formData.get("projectTitle") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isSupabaseConfigured) {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      let filePath: string;

      if (uploadType === "project-media" && projectTitle) {
        const sanitizedTitle = sanitizeForFilename(projectTitle);
        filePath = `projects/${sanitizedTitle}-${timestamp}-${sanitizedName}`;
      } else {
        filePath = `${user.id}/${timestamp}-${sanitizedName}`;
      }

      const { data, error } = await supabase.storage
        .from("uploads")
        .upload(filePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from("uploads")
        .getPublicUrl(data.path);

      return NextResponse.json({
        success: true,
        path: data.path,
        url: urlData.publicUrl,
      });
    }

    const publicDir = path.join(process.cwd(), "public");
    await mkdir(publicDir, { recursive: true });

    let fileName: string;
    if (uploadType === "resume") {
      fileName = "resume.pdf";
    } else if (uploadType === "profile-photo") {
      const ext = path.extname(file.name) || ".jpg";
      fileName = `profile-photo${ext}`;
    } else if (uploadType === "project-media" && projectTitle) {
      const projectsDir = path.join(publicDir, "projects");
      await mkdir(projectsDir, { recursive: true });
      const sanitizedTitle = sanitizeForFilename(projectTitle);
      const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      fileName = `projects/${sanitizedTitle}-${Date.now()}-${sanitized}`;
    } else {
      const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      fileName = `${Date.now()}-${sanitized}`;
    }

    const filePath = path.join(publicDir, fileName);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      path: `/${fileName}`,
      url: `/${fileName}`,
    });
  } catch (err) {
    console.error("Upload API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (isSupabaseConfigured) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const { data: listData } = await supabase.storage
        .from("uploads")
        .list("projects", { limit: 500 });
      const projectMedia: string[] = [];
      if (listData) {
        for (const item of listData) {
          if (item.name) {
            const { data: urlData } = supabase.storage
              .from("uploads")
              .getPublicUrl(`projects/${item.name}`);
            projectMedia.push(urlData.publicUrl);
          }
        }
      }
      return NextResponse.json({
        source: "supabase",
        projectMedia,
      });
    }

    const publicDir = path.join(process.cwd(), "public");
    try {
      const files = await readdir(publicDir);
      const resumeFile = files.find((f) => f.startsWith("resume"));
      const profilePhoto = files.find((f) => f.startsWith("profile-photo"));

      let projectMedia: string[] = [];
      try {
        const projectsDir = path.join(publicDir, "projects");
        const projectFiles = await readdir(projectsDir);
        projectMedia = projectFiles.map((f) => `/projects/${f}`);
      } catch {
        // projects folder may not exist
      }

      return NextResponse.json({
        source: "local",
        resume: resumeFile ? `/${resumeFile}` : null,
        profilePhoto: profilePhoto ? `/${profilePhoto}` : null,
        projectMedia,
      });
    } catch {
      return NextResponse.json({
        source: "local",
        resume: null,
        profilePhoto: null,
        projectMedia: [],
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (isSupabaseConfigured) {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "url parameter required" }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      const match = url.match(/\/projects\/([^/?]+)$/) || url.match(/projects\/([^/?]+)$/);
      if (!match) {
        return NextResponse.json({ error: "Invalid project media URL" }, { status: 400 });
      }
      const filePath = `projects/${match[1]}`;
      const { error } = await supabase.storage.from("uploads").remove([filePath]);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    const match = url.match(/^\/?projects\/([^/]+)$/);
    if (!match) {
      return NextResponse.json({ error: "Invalid project media URL" }, { status: 400 });
    }
    const fileName = match[1];
    const filePath = path.join(process.cwd(), "public", "projects", fileName);
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Upload DELETE error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
