import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockQueryBuilder,
  createMockServiceClient,
  createMockAuthClient,
} from "../helpers/mock-supabase";
import { createPUTRequest } from "../helpers/mock-request";

function createDualTableServiceClient(
  sectionsData: unknown,
  sectionsError: unknown,
  navData: unknown,
  navError: unknown
) {
  const sectionsQb = createMockQueryBuilder(sectionsData, sectionsError);
  const navQb = createMockQueryBuilder(navData, navError);
  return {
    from: vi.fn((table: string) => {
      if (table === "nav_items") return navQb;
      return sectionsQb;
    }),
  };
}

const DEFAULT_SECTIONS_LEN = 12;
const DEFAULT_NAV_LEN = 7;

describe("GET /api/sections", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns defaults when not configured", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: false,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/sections/route");
    const res = await GET();
    const body = await res.json();
    expect(body.sections).toHaveLength(DEFAULT_SECTIONS_LEN);
    expect(body.navItems).toHaveLength(DEFAULT_NAV_LEN);
    expect(body.sections[0].section_key).toBe("hero");
    expect(body.navItems[0].label).toBe("About");
  });

  it("returns defaults when service client is null", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(null),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/sections/route");
    const res = await GET();
    const body = await res.json();
    expect(body.sections).toHaveLength(DEFAULT_SECTIONS_LEN);
    expect(body.navItems).toHaveLength(DEFAULT_NAV_LEN);
  });

  it("returns DB data on success", async () => {
    const sectionsRows = [{ id: "s1", section_key: "hero", label: "H", display_order: 1, is_visible: true }];
    const navRows = [{ id: "n1", label: "Nav", section_key: "about", display_order: 1, is_visible: true }];
    const service = createDualTableServiceClient(sectionsRows, null, navRows, null);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/sections/route");
    const res = await GET();
    const body = await res.json();
    expect(body.sections).toEqual(sectionsRows);
    expect(body.navItems).toEqual(navRows);
  });

  it("uses defaults for sections when sections query errors but nav succeeds", async () => {
    const navRows = [{ id: "n1", label: "Nav", section_key: "about", display_order: 1, is_visible: true }];
    const service = createDualTableServiceClient(null, { message: "sections fail" }, navRows, null);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/sections/route");
    const res = await GET();
    const body = await res.json();
    expect(body.sections).toHaveLength(DEFAULT_SECTIONS_LEN);
    expect(body.navItems).toEqual(navRows);
  });

  it("uses defaults when data is empty array", async () => {
    const service = createDualTableServiceClient([], null, [], null);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/sections/route");
    const res = await GET();
    const body = await res.json();
    expect(body.sections).toHaveLength(DEFAULT_SECTIONS_LEN);
    expect(body.navItems).toHaveLength(DEFAULT_NAV_LEN);
  });

  it("returns 500 on exception", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockImplementation(() => {
        throw new Error("boom");
      }),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/sections/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });
});

describe("PUT /api/sections", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns 503 when not configured", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: false,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/sections/route");
    const req = createPUTRequest({ type: "sections", items: [] });
    const res = await PUT(req);
    expect(res.status).toBe(503);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient(null)),
    }));
    const { PUT } = await import("@/app/api/sections/route");
    const req = createPUTRequest({ type: "sections", items: [] });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when type or items missing", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/sections/route");

    const r1 = await PUT(createPUTRequest({ items: [] }));
    expect(r1.status).toBe(400);

    const r2 = await PUT(createPUTRequest({ type: "sections" }));
    expect(r2.status).toBe(400);

    const r3 = await PUT(createPUTRequest({ type: "sections", items: "bad" }));
    expect(r3.status).toBe(400);
  });

  it("returns 400 when type is invalid", async () => {
    const qb = createMockQueryBuilder();
    const sc = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(sc),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/sections/route");
    const res = await PUT(createPUTRequest({ type: "other", items: [] }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("sections");
  });

  it("returns 503 when service role client is null", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(null),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/sections/route");
    const res = await PUT(createPUTRequest({ type: "sections", items: [{ id: "1" }] }));
    expect(res.status).toBe(503);
  });

  it("upserts sections correctly", async () => {
    const row1 = { id: "1", section_key: "hero", label: "Hero", display_order: 1, is_visible: true };
    const row2 = { id: "2", section_key: "about", label: "About", display_order: 2, is_visible: true };
    const qb = createMockQueryBuilder(null, null);
    qb.single = vi
      .fn()
      .mockResolvedValueOnce({ data: row1, error: null })
      .mockResolvedValueOnce({ data: row2, error: null });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/sections/route");
    const items = [
      { id: "1", section_key: "hero", label: "Hero", display_order: 1, is_visible: true },
      { id: "2", section_key: "about", label: "About", display_order: 2, is_visible: true },
    ];
    const res = await PUT(createPUTRequest({ type: "sections", items }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.sections).toEqual([row1, row2]);
    expect(service.from).toHaveBeenCalledWith("site_sections");
    expect(qb.upsert).toHaveBeenNthCalledWith(1, { id: "1", section_key: "hero", label: "Hero", display_order: 1, is_visible: true }, { onConflict: "id" });
    expect(qb.upsert).toHaveBeenNthCalledWith(2, { id: "2", section_key: "about", label: "About", display_order: 2, is_visible: true }, { onConflict: "id" });
  });

  it("upserts nav_items correctly", async () => {
    const row1 = { id: "n1", label: "About", section_key: "about", display_order: 1, is_visible: true };
    const qb = createMockQueryBuilder(null, null);
    qb.single = vi.fn().mockResolvedValueOnce({ data: row1, error: null });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/sections/route");
    const items = [{ id: "n1", label: "About", section_key: "about", display_order: 1, is_visible: true }];
    const res = await PUT(createPUTRequest({ type: "nav_items", items }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.navItems).toEqual([row1]);
    expect(service.from).toHaveBeenCalledWith("nav_items");
  });

  it("skips items without id silently", async () => {
    const row1 = { id: "only", label: "L", section_key: "about", display_order: 1, is_visible: true };
    const qb = createMockQueryBuilder(null, null);
    qb.single = vi.fn().mockResolvedValueOnce({ data: row1, error: null });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/sections/route");
    const items = [{ label: "no id" }, { id: "only", label: "L", section_key: "about", display_order: 1, is_visible: true }];
    const res = await PUT(createPUTRequest({ type: "nav_items", items }));
    expect(res.status).toBe(200);
    expect(qb.upsert).toHaveBeenCalledTimes(1);
    const body = await res.json();
    expect(body.data.navItems).toEqual([row1]);
  });

  it("returns 500 on upsert error", async () => {
    const qb = createMockQueryBuilder(null, null);
    qb.single = vi.fn().mockResolvedValueOnce({
      data: null,
      error: { message: "upsert failed" },
    });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/sections/route");
    const res = await PUT(
      createPUTRequest({ type: "sections", items: [{ id: "1", section_key: "x" }] })
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("upsert failed");
  });
});
