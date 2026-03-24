import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockQueryBuilder,
  createMockServiceClient,
  createMockAuthClient,
} from "../helpers/mock-supabase";
import { createPUTRequest } from "../helpers/mock-request";
import { siteConfig } from "@/lib/site.config";

describe("GET /api/profile", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns fallback profile when not configured (avatar_url and resume_url null)", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: false,
      createServiceRoleClient: vi.fn(),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/profile/route");
    const res = await GET();
    const body = await res.json();
    expect(body.avatar_url).toBeNull();
    expect(body.resume_url).toBeNull();
    expect(body.full_name).toBe(siteConfig.profile.fullName);
    expect(body.title).toBe(siteConfig.profile.title);
    expect(body.bio).toBe(siteConfig.profile.bio);
    expect(body.email).toBe(siteConfig.profile.email);
    expect(body.phone).toBe(siteConfig.profile.phone);
    expect(body.location).toBe(siteConfig.profile.location);
    expect(body.linkedin_url).toBe(siteConfig.profile.linkedinUrl);
    expect(body.github_url).toBe(siteConfig.profile.githubUrl);
    expect(body.hackerrank_url).toBe(siteConfig.profile.hackerrankUrl);
  });

  it("returns fallback when service client is null", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(null),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/profile/route");
    const res = await GET();
    const body = await res.json();
    expect(body.full_name).toBe(siteConfig.profile.fullName);
    expect(body.avatar_url).toBeNull();
    expect(body.resume_url).toBeNull();
  });

  it("returns fallback on DB error", async () => {
    const qb = createMockQueryBuilder(null, { message: "db error" });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/profile/route");
    const res = await GET();
    const body = await res.json();
    expect(body.full_name).toBe(siteConfig.profile.fullName);
    expect(body.avatar_url).toBeNull();
  });

  it("returns fallback when data is null (maybeSingle)", async () => {
    const qb = createMockQueryBuilder(null, null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/profile/route");
    const res = await GET();
    const body = await res.json();
    expect(body.full_name).toBe(siteConfig.profile.fullName);
    expect(body.avatar_url).toBeNull();
  });

  it("returns 500 on exception", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockImplementation(() => {
        throw new Error("boom");
      }),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/profile/route");
    const res = await GET();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });

  it("returns DB row on success", async () => {
    const row = {
      id: "u1",
      full_name: "DB User",
      title: "Title",
      bio: "Bio",
      email: "e@e.com",
      phone: "1",
      location: "X",
      linkedin_url: "https://li",
      github_url: "https://gh",
      hackerrank_url: "https://hr",
      avatar_url: "https://av",
      resume_url: "https://cv",
    };
    const qb = createMockQueryBuilder(row, null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn(),
    }));
    const { GET } = await import("@/app/api/profile/route");
    const res = await GET();
    const body = await res.json();
    expect(body).toEqual(row);
  });
});

describe("PUT /api/profile", () => {
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
    const { PUT } = await import("@/app/api/profile/route");
    const req = createPUTRequest({ id: "u1", full_name: "A" });
    const res = await PUT(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe("Supabase is not configured");
  });

  it("returns 503 when service role client is null", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(null),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/profile/route");
    const req = createPUTRequest({ id: "u1" });
    const res = await PUT(req);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe("Supabase service role not configured");
  });

  it("returns 401 when unauthenticated", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(createMockServiceClient(createMockQueryBuilder({}, null))),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient(null)),
    }));
    const { PUT } = await import("@/app/api/profile/route");
    const req = createPUTRequest({ id: "u1" });
    const res = await PUT(req);
    expect(res.status).toBe(401);
  });

  it("returns success on valid upsert", async () => {
    const upsertBody = { id: "u1", full_name: "Updated" };
    const returnedRow = { ...upsertBody, title: "T" };
    const qb = createMockQueryBuilder(returnedRow, null);
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "admin" })),
    }));
    const { PUT } = await import("@/app/api/profile/route");
    const req = createPUTRequest(upsertBody);
    const res = await PUT(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual(returnedRow);
    expect(qb.upsert).toHaveBeenCalledWith(upsertBody, { onConflict: "id" });
  });

  it("returns 500 on upsert error", async () => {
    const qb = createMockQueryBuilder(null, { message: "upsert failed" });
    const service = createMockServiceClient(qb);
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServiceRoleClient: vi.fn().mockReturnValue(service),
      createServerSupabaseClient: vi.fn().mockResolvedValue(createMockAuthClient({ id: "1" })),
    }));
    const { PUT } = await import("@/app/api/profile/route");
    const req = createPUTRequest({ id: "u1" });
    const res = await PUT(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("upsert failed");
  });
});
