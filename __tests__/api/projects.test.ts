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

const ROUTE = "@/app/api/projects/route";
const API_URL = "http://localhost:3000/api/projects";

describe("/api/projects", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("GET", () => {
    it("returns fallback when not configured (items have id fallback-0 and media: [])", async () => {
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
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].id).toBe("fallback-0");
      expect(data[0].media).toEqual([]);
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
      expect(data[0].media).toEqual([]);
    });

    it("returns mapped DB data (project_media converted to media array)", async () => {
      const dbRows = [
        {
          id: "1",
          title: "App",
          display_order: 1,
          project_media: [
            { media_url: "a.png", media_type: "image", display_order: 2 },
            { media_url: "b.png", media_type: "image", display_order: 1 },
          ],
        },
      ];
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
      expect(res.status).toBe(200);
      expect(data).toEqual([
        {
          id: "1",
          title: "App",
          display_order: 1,
          media: [
            { media_url: "b.png", media_type: "image" },
            { media_url: "a.png", media_type: "image" },
          ],
        },
      ]);
    });

    it("returns fallback on DB query error", async () => {
      const qb = createMockQueryBuilder([], { message: "query failed" });
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
      expect(data[0].media).toEqual([]);
    });

    it("returns fallback on exception (catch -> 200, not 500)", async () => {
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
      expect(data[0].media).toEqual([]);
    });

    it("returns [] when DB data is null", async () => {
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
      expect(data).toEqual([]);
    });

    it("handles project_media being null on a row", async () => {
      const dbRows = [{ id: "2", title: "Solo", display_order: 1, project_media: null }];
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
      expect(res.status).toBe(200);
      expect(data).toEqual([
        { id: "2", title: "Solo", display_order: 1, media: [] },
      ]);
    });
  });

  describe("POST", () => {
    it("returns 503 when not configured", async () => {
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: false,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { POST } = await import(ROUTE);
      const req = createPOSTRequest({ title: "New" }, API_URL);
      const res = await POST(req);
      expect(res.status).toBe(503);
    });

    it("returns 401 when unauthenticated", async () => {
      const auth = createMockAuthClient(null);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { POST } = await import(ROUTE);
      const req = createPOSTRequest({ title: "New" }, API_URL);
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("returns success with valid auth", async () => {
      const inserted = { id: "new-1", title: "New Project" };
      const qb = createMockQueryBuilder(inserted);
      const serviceSc = createMockServiceClient(qb);
      const auth = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(serviceSc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { POST } = await import(ROUTE);
      const req = createPOSTRequest({ title: "New Project" }, API_URL);
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
      const req = createPOSTRequest({ title: "Bad" }, API_URL);
      const res = await POST(req);
      const body = await res.json();
      expect(res.status).toBe(500);
      expect(body.error).toBe("insert failed");
    });
  });

  describe("PUT", () => {
    it("returns 400 when id missing", async () => {
      const auth = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn(),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { PUT } = await import(ROUTE);
      const req = createPUTRequest({ title: "No id" }, API_URL);
      const res = await PUT(req);
      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.error).toBe("Project id is required");
    });

    it("returns success", async () => {
      const updated = { id: "p1", title: "Updated" };
      const qb = createMockQueryBuilder(updated);
      const serviceSc = createMockServiceClient(qb);
      const auth = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(serviceSc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(auth),
      }));
      const { PUT } = await import(ROUTE);
      const req = createPUTRequest({ id: "p1", title: "Updated" }, API_URL);
      const res = await PUT(req);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true, data: updated });
    });
  });

  describe("DELETE", () => {
    it("returns 400 when id query param missing", async () => {
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
      expect(body.error).toBe("Project id is required");
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
      const req = createDELETERequest(`${API_URL}?id=p1`);
      const res = await DELETE(req);
      const body = await res.json();
      expect(res.status).toBe(200);
      expect(body).toEqual({ success: true });
    });
  });
});
