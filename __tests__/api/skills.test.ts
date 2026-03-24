import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockQueryBuilder,
  createMockServiceClient,
  createMockAuthClient,
} from "../helpers/mock-supabase";
import { createPOSTRequest, createPUTRequest, createDELETERequest } from "../helpers/mock-request";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [], set: vi.fn() }),
}));

const ROUTE = "@/app/api/skills/route";
const API_URL = "http://localhost:3000/api/skills";

describe("/api/skills", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("GET", () => {
    it("returns fallback data when Supabase not configured", async () => {
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: false,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import(ROUTE);
      const res = await GET();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].id).toBe("fallback-0");
    });

    it("returns fallback when service client null", async () => {
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import(ROUTE);
      const res = await GET();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data[0].id).toBe("fallback-0");
    });

    it("returns DB data when configured", async () => {
      const dbRows = [{ id: "1", name: "Java", category: "Lang", display_order: 1 }];
      const qb = createMockQueryBuilder(dbRows);
      const sc = createMockServiceClient(qb);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import(ROUTE);
      const res = await GET();
      const data = await res.json();
      expect(data).toEqual(dbRows);
    });

    it("returns fallback on DB error", async () => {
      const qb = createMockQueryBuilder([], { message: "fetch failed" });
      const sc = createMockServiceClient(qb);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import(ROUTE);
      const res = await GET();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data[0].id).toBe("fallback-0");
    });

    it("returns fallback on exception (catch -> 200)", async () => {
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue({
          from: vi.fn(() => {
            throw new Error("boom");
          }),
        }),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import(ROUTE);
      const res = await GET();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data[0].id).toBe("fallback-0");
    });

    it("returns fallback when data is null", async () => {
      const qb = createMockQueryBuilder(null);
      const sc = createMockServiceClient(qb);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import(ROUTE);
      const res = await GET();
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data[0].id).toBe("fallback-0");
    });
  });

  describe("POST", () => {
    it("returns 503 not configured", async () => {
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: false,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { POST } = await import(ROUTE);
      const req = createPOSTRequest({ name: "Go" }, API_URL);
      const res = await POST(req);
      expect(res.status).toBe(503);
    });

    it("returns 401 unauthenticated", async () => {
      const auth = createMockAuthClient(null);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { POST } = await import(ROUTE);
      const req = createPOSTRequest({ name: "Go" }, API_URL);
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("returns success", async () => {
      const inserted = { id: "sk-1", name: "Go", category: "Lang", display_order: 1 };
      const qb = createMockQueryBuilder(inserted);
      const serviceSc = createMockServiceClient(qb);
      const auth = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(serviceSc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { POST } = await import(ROUTE);
      const req = createPOSTRequest({ name: "Go", category: "Lang", display_order: 1 }, API_URL);
      const res = await POST(req);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true, data: inserted });
    });

    it("returns 500 on DB error", async () => {
      const qb = createMockQueryBuilder(null, { message: "insert failed" });
      const serviceSc = createMockServiceClient(qb);
      const auth = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(serviceSc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { POST } = await import(ROUTE);
      const req = createPOSTRequest({ name: "Bad" }, API_URL);
      const res = await POST(req);
      const body = await res.json();
      expect(res.status).toBe(500);
      expect(body.error).toBe("insert failed");
    });
  });

  describe("PUT", () => {
    it("returns 400 no id", async () => {
      const auth = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn(),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { PUT } = await import(ROUTE);
      const req = createPUTRequest({ name: "X" }, API_URL);
      const res = await PUT(req);
      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.error).toBe("Skill id is required");
    });
  });

  describe("DELETE", () => {
    it("returns 400 no id", async () => {
      const auth = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn(),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { DELETE } = await import(ROUTE);
      const req = createDELETERequest(API_URL);
      const res = await DELETE(req);
      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.error).toBe("Skill id is required");
    });

    it("returns success", async () => {
      const qb = createMockQueryBuilder(null, null);
      const serviceSc = createMockServiceClient(qb);
      const auth = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(serviceSc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { DELETE } = await import(ROUTE);
      const req = createDELETERequest(`${API_URL}?id=sk-1`);
      const res = await DELETE(req);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true });
    });
  });
});
