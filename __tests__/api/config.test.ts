import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockQueryBuilder,
  createMockServiceClient,
  createMockAuthClient,
} from "../helpers/mock-supabase";
import { createPUTRequest } from "../helpers/mock-request";
import { DEFAULT_CONFIG } from "@/lib/config";

describe("GET /api/config", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns DEFAULT_CONFIG when not configured", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: false,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/config/route");
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual(DEFAULT_CONFIG);
  });

  it("returns DEFAULT_CONFIG when service client is null", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(null),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/config/route");
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual(DEFAULT_CONFIG);
  });

  it("returns mapped config from DB rows", async () => {
    const rows = [
      { config_key: "primary_color", config_value: "#111111" },
      { config_key: "site_title", config_value: "Custom" },
      { config_key: "nullable_key", config_value: null as unknown as string },
    ];
    const qb = createMockQueryBuilder(rows, null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/config/route");
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual({
      primary_color: "#111111",
      site_title: "Custom",
      nullable_key: "",
    });
  });

  it("returns 500 on DB query error (not default)", async () => {
    const qb = createMockQueryBuilder(null, { message: "query failed" });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/config/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("query failed");
  });

  it("returns 500 on exception", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockImplementation(() => {
        throw new Error("boom");
      }),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/config/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });

  it("returns empty object when DB returns empty array", async () => {
    const qb = createMockQueryBuilder([], null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/config/route");
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual({});
  });
});

describe("PUT /api/config", () => {
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
    const { PUT } = await import("@/app/api/config/route");
    const req = createPUTRequest({ key: "primary_color", value: "#fff" });
    const res = await PUT(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe("Supabase not configured");
  });

  it("returns 503 when server Supabase client is null", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn().mockResolvedValue(null),
    }));
    const { PUT } = await import("@/app/api/config/route");
    const req = createPUTRequest({ key: "k", value: "v" });
    const res = await PUT(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe("Supabase not configured");
  });

  it("returns 401 when unauthenticated", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(createMockServiceClient(createMockQueryBuilder({}, null))),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient(null)),
    }));
    const { PUT } = await import("@/app/api/config/route");
    const req = createPUTRequest({ key: "primary_color", value: "#fff" });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when key is missing", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(createMockServiceClient(createMockQueryBuilder({}, null))),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/config/route");
    const req = createPUTRequest({ value: "only" });
    const res = await PUT(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Config key is required");
  });

  it("returns success on valid upsert", async () => {
    const saved = { config_key: "primary_color", config_value: "#abcdef" };
    const qb = createMockQueryBuilder(saved, null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/config/route");
    const req = createPUTRequest({ key: "primary_color", value: "#abcdef" });
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(saved);
    expect(qb.upsert).toHaveBeenCalledWith(
      { config_key: "primary_color", config_value: "#abcdef" },
      { onConflict: "config_key" }
    );
  });

  it("returns 500 on upsert error", async () => {
    const qb = createMockQueryBuilder(null, { message: "conflict" });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/config/route");
    const req = createPUTRequest({ key: "k", value: "v" });
    const res = await PUT(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("conflict");
  });
});
