import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  isSupabaseConfigured,
} from "@/lib/supabase-server";
import { siteConfig } from "@/lib/site.config";

function getFallbackProfile() {
  const p = siteConfig.profile;
  return {
    full_name: p.fullName,
    title: p.title,
    bio: p.bio,
    email: p.email,
    phone: p.phone,
    location: p.location,
    linkedin_url: p.linkedinUrl,
    github_url: p.githubUrl,
    hackerrank_url: p.hackerrankUrl,
    avatar_url: null,
    resume_url: null,
  };
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(getFallbackProfile());
    }
    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(getFallbackProfile());
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return NextResponse.json(getFallbackProfile());
    }

    if (!data) {
      return NextResponse.json(getFallbackProfile());
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Profile API error:", err);
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
    const serviceSupabase = createServiceRoleClient();
    if (!serviceSupabase) {
      return NextResponse.json(
        { error: "Supabase service role not configured" },
        { status: 503 }
      );
    }

    const { data, error } = await serviceSupabase
      .from("profiles")
      .upsert(body, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("Profile upsert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
