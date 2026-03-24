import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  isSupabaseConfigured,
} from "@/lib/supabase-server";
import { servicesData } from "@/lib/data";

function getFallbackData() {
  return servicesData.map((item, idx) => ({ ...item, id: `fallback-${idx}` }));
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
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Services fetch error:", error);
      return NextResponse.json(getFallbackData());
    }

    return NextResponse.json(data ?? getFallbackData());
  } catch (err) {
    console.error("Services API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
      .from("services")
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error("Services insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Services API error:", err);
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
        { error: "Service id is required" },
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
      .from("services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Services update error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Services API error:", err);
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
        { error: "Service id is required" },
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
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Services delete error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Services API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
