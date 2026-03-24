import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createMockQueryBuilder,
  createMockServiceClient,
  createMockAuthClient,
} from "../helpers/mock-supabase";
import {
  createPOSTRequest,
  createPUTRequest,
  createDELETERequest,
} from "../helpers/mock-request";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ getAll: () => [], set: vi.fn() }),
}));

const API_BASE = "http://localhost:4000/api/social-links";

describe("/api/social-links", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("GET", () => {
    it("returns fallback when not configured", async () => {
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: false,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import("@/app/api/social-links/route");
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data[0].id).toBe("fallback-0");
    });

    it("returns fallback when service client null", async () => {
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import("@/app/api/social-links/route");
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data[0].id).toBe("fallback-0");
    });

    it("returns DB data when configured", async () => {
      const rows = [
        {
          id: "sl1",
          platform_name: "LinkedIn",
          url: "https://linkedin.com/in/test",
          icon_name: "Linkedin",
          display_order: 1,
          is_visible: true,
        },
      ];
      const qb = createMockQueryBuilder(rows, null);
      const sc = createMockServiceClient(qb);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import("@/app/api/social-links/route");
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(rows);
    });

    it("returns fallback on DB query error", async () => {
      const qb = createMockQueryBuilder([], { message: "query failed" });
      const sc = createMockServiceClient(qb);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import("@/app/api/social-links/route");
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data[0].id).toBe("fallback-0");
    });

    it("returns 500 on unexpected exception", async () => {
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn(() => {
          throw new Error("boom");
        }),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import("@/app/api/social-links/route");
      const res = await GET();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("Internal server error");
    });

    it("returns fallback when data is null", async () => {
      const qb = createMockQueryBuilder(null, null);
      const sc = createMockServiceClient(qb);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import("@/app/api/social-links/route");
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data[0].id).toBe("fallback-0");
    });

    it("returns empty array when DB returns empty array", async () => {
      const qb = createMockQueryBuilder([], null);
      const sc = createMockServiceClient(qb);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { GET } = await import("@/app/api/social-links/route");
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual([]);
    });
  });

  describe("POST", () => {
    const postBody = {
      platform_name: "Mastodon",
      url: "https://mastodon.social/@test",
      icon_name: "Globe",
      display_order: 99,
      is_visible: true,
    };

    it("returns 503 when not configured", async () => {
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: false,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(null),
      }));
      const { POST } = await import("@/app/api/social-links/route");
      const req = createPOSTRequest(postBody, API_BASE);
      const res = await POST(req);
      expect(res.status).toBe(503);
    });

    it("returns 401 when unauthenticated", async () => {
      const authClient = createMockAuthClient(null);
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(null),
        createServerSupabaseClient: vi.fn().mockResolvedValue(authClient),
      }));
      const { POST } = await import("@/app/api/social-links/route");
      const req = createPOSTRequest(postBody, API_BASE);
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("creates record with valid auth", async () => {
      const row = { id: "1", ...postBody };
      const qb = createMockQueryBuilder(row, null);
      const sc = createMockServiceClient(qb);
      const ac = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(ac),
      }));
      const { POST } = await import("@/app/api/social-links/route");
      const req = createPOSTRequest(postBody, API_BASE);
      const res = await POST(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(row);
    });

    it("returns 500 on DB insert error", async () => {
      const qb = createMockQueryBuilder(null, { message: "insert failed" });
      const sc = createMockServiceClient(qb);
      const ac = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(ac),
      }));
      const { POST } = await import("@/app/api/social-links/route");
      const req = createPOSTRequest(postBody, API_BASE);
      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("insert failed");
    });
  });

  describe("PUT", () => {
    it("returns 400 when id missing", async () => {
      const ac = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn(),
        createServerSupabaseClient: vi.fn().mockResolvedValue(ac),
      }));
      const { PUT } = await import("@/app/api/social-links/route");
      const req = createPUTRequest({ platform_name: "No id" }, API_BASE);
      const res = await PUT(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Social link id is required");
    });

    it("returns success on valid update", async () => {
      const updated = {
        id: "1",
        platform_name: "Updated",
        url: "https://example.com",
        icon_name: "Globe",
        display_order: 1,
        is_visible: true,
      };
      const qb = createMockQueryBuilder(updated, null);
      const sc = createMockServiceClient(qb);
      const ac = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(ac),
      }));
      const { PUT } = await import("@/app/api/social-links/route");
      const req = createPUTRequest({ id: "1", platform_name: "Updated" }, API_BASE);
      const res = await PUT(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updated);
    });

    it("returns 500 on DB update error", async () => {
      const qb = createMockQueryBuilder(null, { message: "update failed" });
      const sc = createMockServiceClient(qb);
      const ac = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(ac),
      }));
      const { PUT } = await import("@/app/api/social-links/route");
      const req = createPUTRequest({ id: "1", platform_name: "X" }, API_BASE);
      const res = await PUT(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("update failed");
    });
  });

  describe("DELETE", () => {
    it("returns 400 when id query param missing", async () => {
      const ac = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn(),
        createServerSupabaseClient: vi.fn().mockResolvedValue(ac),
      }));
      const { DELETE } = await import("@/app/api/social-links/route");
      const req = createDELETERequest(API_BASE);
      const res = await DELETE(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Social link id is required");
    });

    it("returns success on valid delete", async () => {
      const qb = createMockQueryBuilder(null, null);
      const sc = createMockServiceClient(qb);
      const ac = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(ac),
      }));
      const { DELETE } = await import("@/app/api/social-links/route");
      const req = createDELETERequest(`${API_BASE}?id=1`);
      const res = await DELETE(req);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("returns 500 on DB delete error", async () => {
      const qb = createMockQueryBuilder(null, { message: "delete failed" });
      const sc = createMockServiceClient(qb);
      const ac = createMockAuthClient({ id: "user-1" });
      vi.doMock("@/lib/supabase-server", () => ({
        isSupabaseConfigured: true,
        createServiceRoleClient: vi.fn().mockReturnValue(sc),
        createServerSupabaseClient: vi.fn().mockResolvedValue(ac),
      }));
      const { DELETE } = await import("@/app/api/social-links/route");
      const req = createDELETERequest(`${API_BASE}?id=1`);
      const res = await DELETE(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe("delete failed");
    });
  });
});
