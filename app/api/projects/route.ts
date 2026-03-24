import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  isSupabaseConfigured,
} from "@/lib/supabase-server";
import { projectsData } from "@/lib/data";

function getFallbackData() {
  return projectsData.map((item, idx) => ({
    ...item,
    id: `fallback-${idx}`,
    media: [],
  }));
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(getFallbackData());
    }
    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(getFallbackData());
    }
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_media:project_media(media_url, media_type, display_order)
      `)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Projects fetch error:", error);
      return NextResponse.json(getFallbackData());
    }

    type MediaRow = { media_url: string; media_type: string; display_order?: number };
    const projects = (data ?? []).map((p: { project_media?: MediaRow[] }) => ({
      ...p,
      media: (p.project_media ?? [])
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((m) => ({ media_url: m.media_url, media_type: m.media_type })),
      project_media: undefined,
    }));

    return NextResponse.json(projects);
  } catch (err) {
    console.error("Projects API error:", err);
    return NextResponse.json(getFallbackData());
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 }
      );
    }
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const serviceSupabase = createServiceRoleClient();
    if (!serviceSupabase) {
      return NextResponse.json(
        { error: "Supabase service role not configured" },
        { status: 503 }
      );
    }
    const { data, error } = await serviceSupabase
      .from("projects")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Project insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Projects API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 }
      );
    }
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Project id is required" },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceRoleClient();
    if (!serviceSupabase) {
      return NextResponse.json(
        { error: "Supabase service role not configured" },
        { status: 503 }
      );
    }
    const { data, error } = await serviceSupabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Project update error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Projects API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 }
      );
    }
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project id is required" },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceRoleClient();
    if (!serviceSupabase) {
      return NextResponse.json(
        { error: "Supabase service role not configured" },
        { status: 503 }
      );
    }
    const { error } = await serviceSupabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Project delete error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Projects API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
