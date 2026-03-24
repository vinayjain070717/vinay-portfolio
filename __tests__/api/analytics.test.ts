import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createMockQueryBuilder,
  createMockServiceClient,
  createMockAuthClient,
} from "../helpers/mock-supabase";
import { NextRequest } from "next/server";
import { createPOSTRequest } from "../helpers/mock-request";

describe("POST /api/analytics", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("no-ops when not configured", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: false,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn(),
    }));
    const { POST } = await import("@/app/api/analytics/route");
    const res = await POST(createPOSTRequest({ page_path: "/" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true });
  });

  it("no-ops when service client is null", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(null),
      createServerSupabaseClient: vi.fn(),
    }));
    const { POST } = await import("@/app/api/analytics/route");
    const res = await POST(createPOSTRequest({ page_path: "/about" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true });
  });

  it("returns 400 when page_path is missing", async () => {
    const qb = createMockQueryBuilder(null, null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { POST } = await import("@/app/api/analytics/route");
    const res = await POST(createPOSTRequest({ visitor_id: "v1" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("page_path is required");
  });

  it("inserts with correct fields (visitor_id defaults to anonymous)", async () => {
    const qb = createMockQueryBuilder(null, null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { POST } = await import("@/app/api/analytics/route");
    const res = await POST(
      createPOSTRequest({
        page_path: "/projects",
        referrer: "https://google.com",
        user_agent: "Vitest",
      })
    );
    expect(res.status).toBe(200);
    expect(qb.insert).toHaveBeenCalledWith({
      page_path: "/projects",
      visitor_id: "anonymous",
      referrer: "https://google.com",
      user_agent: "Vitest",
    });
  });

  it("returns 500 on insert error", async () => {
    const qb = createMockQueryBuilder(null, { message: "insert failed" });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { POST } = await import("@/app/api/analytics/route");
    const res = await POST(createPOSTRequest({ page_path: "/" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("insert failed");
  });

  it("returns 500 on invalid JSON", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(createMockServiceClient(createMockQueryBuilder(null, null))),
      createServerSupabaseClient: vi.fn(),
    }));
    const { POST } = await import("@/app/api/analytics/route");
    const req = new NextRequest("http://localhost/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json{",
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });
});

describe("GET /api/analytics", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-24T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns zeros when not configured", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: false,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/analytics/route");
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual({ totalViews: 0, uniqueVisitors: 0, viewsPerDay: [] });
  });

  it("returns zeros when auth client is null", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn().mockResolvedValue(null),
    }));
    const { GET } = await import("@/app/api/analytics/route");
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual({ totalViews: 0, uniqueVisitors: 0, viewsPerDay: [] });
  });

  it("returns 401 when unauthenticated", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(createMockServiceClient(createMockQueryBuilder([], null))),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient(null)),
    }));
    const { GET } = await import("@/app/api/analytics/route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns computed stats correctly", async () => {
    const views = [
      { id: "1", visitor_id: "a", created_at: "2025-03-20T10:00:00.000Z" },
      { id: "2", visitor_id: "b", created_at: "2025-03-20T11:00:00.000Z" },
      { id: "3", visitor_id: null, created_at: "2025-03-21T00:00:00.000Z" },
    ];
    const qb = createMockQueryBuilder(views, null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "admin" })),
    }));
    const { GET } = await import("@/app/api/analytics/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.totalViews).toBe(3);
    expect(body.uniqueVisitors).toBe(3);
    expect(body.viewsPerDay).toEqual(
      expect.arrayContaining([
        { date: "2025-03-20", count: 2 },
        { date: "2025-03-21", count: 1 },
      ])
    );
    const byDate = Object.fromEntries(body.viewsPerDay.map((x: { date: string; count: number }) => [x.date, x.count]));
    expect(byDate["2025-03-20"]).toBe(2);
    expect(byDate["2025-03-21"]).toBe(1);
  });

  it("excludes rows with null created_at", async () => {
    const views = [
      { id: "skip", visitor_id: "x", created_at: null },
      { id: "keep", visitor_id: "y", created_at: "2025-03-23T00:00:00.000Z" },
    ];
    const qb = createMockQueryBuilder(views, null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "admin" })),
    }));
    const { GET } = await import("@/app/api/analytics/route");
    const res = await GET();
    const body = await res.json();
    expect(body.totalViews).toBe(1);
    expect(body.uniqueVisitors).toBe(1);
  });

  it("returns 500 on DB error", async () => {
    const qb = createMockQueryBuilder(null, { message: "select failed" });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "admin" })),
    }));
    const { GET } = await import("@/app/api/analytics/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("select failed");
  });
});
