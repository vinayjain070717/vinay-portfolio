import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient, isSupabaseConfigured } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const { page_path, visitor_id, referrer, user_agent } = body;

    if (!page_path) {
      return NextResponse.json(
        { error: "page_path is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from("page_views").insert({
      page_path,
      visitor_id: visitor_id || "anonymous",
      referrer: referrer ?? null,
      user_agent: user_agent ?? null,
    });

    if (error) {
      console.error("Analytics insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analytics API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        totalViews: 0,
        uniqueVisitors: 0,
        viewsPerDay: [],
      });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        totalViews: 0,
        uniqueVisitors: 0,
        viewsPerDay: [],
      });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceSupabase = createServiceRoleClient();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: views, error: viewsError } = await serviceSupabase
      .from("page_views")
      .select("id, visitor_id, created_at");

    if (viewsError) {
      console.error("Analytics fetch error:", viewsError);
      return NextResponse.json(
        { error: viewsError.message },
        { status: 500 }
      );
    }

    type PageViewRow = { id: string; visitor_id: string | null; created_at: string | null };
    const filteredViews: PageViewRow[] = (views ?? []).filter(
      (v: PageViewRow) => v.created_at && new Date(v.created_at) >= thirtyDaysAgo
    );

    const totalViews = filteredViews.length;
    const uniqueVisitors = new Set(
      filteredViews.map((v: PageViewRow) => v.visitor_id ?? v.id).filter(Boolean)
    ).size;

    const viewsPerDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      viewsPerDay[key] = 0;
    }

    for (const v of filteredViews) {
      if (v.created_at) {
        const key = new Date(v.created_at).toISOString().split("T")[0];
        if (key in viewsPerDay) {
          viewsPerDay[key]++;
        }
      }
    }

    const viewsPerDayArray = Object.entries(viewsPerDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      totalViews,
      uniqueVisitors,
      viewsPerDay: viewsPerDayArray,
    });
  } catch (err) {
    console.error("Analytics API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
