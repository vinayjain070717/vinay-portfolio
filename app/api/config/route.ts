import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient, isSupabaseConfigured } from "@/lib/supabase-server";
import { DEFAULT_CONFIG } from "@/lib/config";

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    const { data, error } = await supabase
      .from("site_config")
      .select("config_key, config_value");

    if (error) {
      console.error("Config fetch error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const configMap: Record<string, string> = {};
    for (const row of data ?? []) {
      configMap[row.config_key] = row.config_value ?? "";
    }

    return NextResponse.json(configMap);
  } catch (err) {
    console.error("Config API error:", err);
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
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Config key is required" },
        { status: 400 }
      );
    }

    const serviceSupabase = createServiceRoleClient();
    if (!serviceSupabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 503 }
      );
    }

    const { data, error } = await serviceSupabase
      .from("site_config")
      .upsert({ config_key: key, config_value: value }, { onConflict: "config_key" })
      .select()
      .single();

    if (error) {
      console.error("Config upsert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Config API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
