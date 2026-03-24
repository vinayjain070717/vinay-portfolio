import { NextRequest, NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  createServiceRoleClient,
  isSupabaseConfigured,
} from "@/lib/supabase-server";

const DEFAULT_SECTIONS = [
  {
    id: "1",
    section_key: "hero",
    label: "Hero",
    display_order: 1,
    is_visible: true,
  },
  {
    id: "2",
    section_key: "about",
    label: "About",
    display_order: 2,
    is_visible: true,
  },
  {
    id: "3",
    section_key: "services",
    label: "Services",
    display_order: 3,
    is_visible: true,
  },
  {
    id: "4",
    section_key: "skills",
    label: "Skills",
    display_order: 4,
    is_visible: true,
  },
  {
    id: "5",
    section_key: "experience",
    label: "Experience",
    display_order: 5,
    is_visible: true,
  },
  {
    id: "6",
    section_key: "education",
    label: "Education",
    display_order: 6,
    is_visible: true,
  },
  {
    id: "7",
    section_key: "projects",
    label: "Projects",
    display_order: 7,
    is_visible: true,
  },
  {
    id: "8",
    section_key: "certificates",
    label: "Certificates",
    display_order: 8,
    is_visible: true,
  },
  {
    id: "9",
    section_key: "coding-stats",
    label: "Coding Stats",
    display_order: 9,
    is_visible: true,
  },
  {
    id: "10",
    section_key: "journey",
    label: "Journey",
    display_order: 10,
    is_visible: true,
  },
  {
    id: "11",
    section_key: "resume",
    label: "Resume",
    display_order: 11,
    is_visible: true,
  },
  {
    id: "12",
    section_key: "contact",
    label: "Contact",
    display_order: 12,
    is_visible: true,
  },
];

const DEFAULT_NAV_ITEMS = [
  {
    id: "1",
    label: "About",
    section_key: "about",
    display_order: 1,
    is_visible: true,
  },
  {
    id: "2",
    label: "Skills",
    section_key: "skills",
    display_order: 2,
    is_visible: true,
  },
  {
    id: "3",
    label: "Experience",
    section_key: "experience",
    display_order: 3,
    is_visible: true,
  },
  {
    id: "4",
    label: "Projects",
    section_key: "projects",
    display_order: 4,
    is_visible: true,
  },
  {
    id: "5",
    label: "Certificates",
    section_key: "certificates",
    display_order: 5,
    is_visible: true,
  },
  {
    id: "6",
    label: "Journey",
    section_key: "journey",
    display_order: 6,
    is_visible: true,
  },
  {
    id: "7",
    label: "Contact",
    section_key: "contact",
    display_order: 7,
    is_visible: true,
  },
];

export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        sections: DEFAULT_SECTIONS,
        navItems: DEFAULT_NAV_ITEMS,
      });
    }
    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({
        sections: DEFAULT_SECTIONS,
        navItems: DEFAULT_NAV_ITEMS,
      });
    }

    const [sectionsResult, navItemsResult] = await Promise.all([
      supabase
        .from("site_sections")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("nav_items")
        .select("*")
        .order("display_order", { ascending: true }),
    ]);

    const sections =
      sectionsResult.error || !sectionsResult.data?.length
        ? DEFAULT_SECTIONS
        : sectionsResult.data;
    const navItems =
      navItemsResult.error || !navItemsResult.data?.length
        ? DEFAULT_NAV_ITEMS
        : navItemsResult.data;

    return NextResponse.json({ sections, navItems });
  } catch (err) {
    console.error("Sections API error:", err);
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
    const { type, items } = body;

    if (!type || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Body must include type ('sections' or 'nav_items') and items array" },
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

    const table =
      type === "sections" ? "site_sections" : type === "nav_items" ? "nav_items" : null;
    if (!table) {
      return NextResponse.json(
        { error: "type must be 'sections' or 'nav_items'" },
        { status: 400 }
      );
    }

    const upserted: unknown[] = [];
    for (const item of items) {
      const { id, ...rest } = item;
      if (!id) continue;
      const { data, error } = await serviceSupabase
        .from(table)
        .upsert({ id, ...rest }, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.error(`Sections upsert error (${table}):`, error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
      upserted.push(data);
    }

    return NextResponse.json({
      success: true,
      data: type === "sections" ? { sections: upserted } : { navItems: upserted },
    });
  } catch (err) {
    console.error("Sections API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
