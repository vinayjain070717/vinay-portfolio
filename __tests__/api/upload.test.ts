import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import path from "path";

function setupLocalSupabaseMock() {
  vi.doMock("@/lib/supabase-server", () => ({
    isSupabaseConfigured: false,
    createServerSupabaseClient: vi.fn().mockResolvedValue(null),
  }));
}

function setupFsMock(overrides: {
  writeFile?: ReturnType<typeof vi.fn>;
  mkdir?: ReturnType<typeof vi.fn>;
  readdir?: ReturnType<typeof vi.fn>;
  unlink?: ReturnType<typeof vi.fn>;
} = {}) {
  vi.doMock("fs/promises", () => ({
    writeFile: overrides.writeFile ?? vi.fn().mockResolvedValue(undefined),
    mkdir: overrides.mkdir ?? vi.fn().mockResolvedValue(undefined),
    readdir: overrides.readdir ?? vi.fn().mockResolvedValue([]),
    unlink: overrides.unlink ?? vi.fn().mockResolvedValue(undefined),
  }));
}

describe("POST /api/upload", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns 400 when no file in FormData", async () => {
    setupLocalSupabaseMock();
    setupFsMock();
    const { POST } = await import("@/app/api/upload/route");

    const formData = new FormData();
    formData.append("type", "resume");
    const req = new NextRequest("http://localhost:4000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("No file provided");
  });

  it("saves resume to local public/resume.pdf when not configured", async () => {
    const writeFile = vi.fn().mockResolvedValue(undefined);
    const mkdir = vi.fn().mockResolvedValue(undefined);
    setupLocalSupabaseMock();
    setupFsMock({ writeFile, mkdir });
    const { POST } = await import("@/app/api/upload/route");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["resume-bytes"], { type: "application/pdf" }),
      "ignored-name.pdf"
    );
    formData.append("type", "resume");
    const req = new NextRequest("http://localhost:4000/api/upload", {
      method: "POST",
      body: formData,
    });

    await POST(req);

    const expectedPath = path.join(process.cwd(), "public", "resume.pdf");
    expect(writeFile).toHaveBeenCalledWith(
      expectedPath,
      expect.any(Buffer)
    );
    expect((writeFile.mock.calls[0][1] as Buffer).toString()).toBe("resume-bytes");
  });

  it("saves profile-photo locally with correct extension", async () => {
    const writeFile = vi.fn().mockResolvedValue(undefined);
    setupLocalSupabaseMock();
    setupFsMock({ writeFile });
    const { POST } = await import("@/app/api/upload/route");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["img"], { type: "image/png" }),
      "avatar.PNG"
    );
    formData.append("type", "profile-photo");
    const req = new NextRequest("http://localhost:4000/api/upload", {
      method: "POST",
      body: formData,
    });

    await POST(req);

    expect(writeFile).toHaveBeenCalledWith(
      path.join(process.cwd(), "public", "profile-photo.PNG"),
      expect.any(Buffer)
    );
  });

  it("saves project-media locally under public/projects/", async () => {
    vi.spyOn(Date, "now").mockReturnValue(99_000);
    const writeFile = vi.fn().mockResolvedValue(undefined);
    const mkdir = vi.fn().mockResolvedValue(undefined);
    setupLocalSupabaseMock();
    setupFsMock({ writeFile, mkdir });
    const { POST } = await import("@/app/api/upload/route");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["m"], { type: "image/jpeg" }),
      "shot.jpg"
    );
    formData.append("type", "project-media");
    formData.append("projectTitle", "My App!");
    const req = new NextRequest("http://localhost:4000/api/upload", {
      method: "POST",
      body: formData,
    });

    await POST(req);

    expect(writeFile).toHaveBeenCalledWith(
      path.join(
        process.cwd(),
        "public",
        "projects",
        "My_App_-99000-shot.jpg"
      ),
      expect.any(Buffer)
    );
    vi.restoreAllMocks();
  });

  it("project-media without projectTitle falls to general path", async () => {
    vi.spyOn(Date, "now").mockReturnValue(42);
    const writeFile = vi.fn().mockResolvedValue(undefined);
    setupLocalSupabaseMock();
    setupFsMock({ writeFile });
    const { POST } = await import("@/app/api/upload/route");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["x"], { type: "application/octet-stream" }),
      "file.bin"
    );
    formData.append("type", "project-media");
    const req = new NextRequest("http://localhost:4000/api/upload", {
      method: "POST",
      body: formData,
    });

    await POST(req);

    expect(writeFile).toHaveBeenCalledWith(
      path.join(process.cwd(), "public", "42-file.bin"),
      expect.any(Buffer)
    );
    vi.restoreAllMocks();
  });

  it("returns 401 when Supabase configured but user unauthenticated", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServerSupabaseClient: vi.fn().mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      }),
    }));
    setupFsMock();
    process.env.SUPABASE_SERVICE_ROLE_KEY = "svc";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";

    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn().mockReturnValue({
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn(),
            getPublicUrl: vi.fn(),
          }),
        },
      }),
    }));

    const { POST } = await import("@/app/api/upload/route");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["a"], { type: "application/pdf" }),
      "r.pdf"
    );
    formData.append("type", "resume");
    const req = new NextRequest("http://localhost:4000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 503 when getServiceClient returns null (configured but no service key)", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServerSupabaseClient: vi.fn().mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
        },
      }),
    }));
    setupFsMock();
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";

    const { POST } = await import("@/app/api/upload/route");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["a"], { type: "application/pdf" }),
      "r.pdf"
    );
    formData.append("type", "resume");
    const req = new NextRequest("http://localhost:4000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "Storage not configured" });
  });

  it("returns success with url on local upload", async () => {
    setupLocalSupabaseMock();
    setupFsMock();
    const { POST } = await import("@/app/api/upload/route");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["ok"], { type: "text/plain" }),
      "note.txt"
    );
    formData.append("type", "general");
    const req = new NextRequest("http://localhost:4000/api/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.path).toMatch(/^\//);
    expect(body.url).toMatch(/^\//);
    expect(body.path).toBe(body.url);
  });
});

describe("GET /api/upload", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns local file info scanning public directory", async () => {
    setupLocalSupabaseMock();
    vi.doMock("fs/promises", () => ({
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi
        .fn()
        .mockImplementationOnce(
          async () => ["resume.pdf", "profile-photo.jpg", "other.txt"]
        )
        .mockResolvedValueOnce(["a.png", "b.png"]),
      unlink: vi.fn(),
    }));
    const { GET } = await import("@/app/api/upload/route");

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      source: "local",
      resume: "/resume.pdf",
      profilePhoto: "/profile-photo.jpg",
      projectMedia: ["/projects/a.png", "/projects/b.png"],
    });
  });

  it("returns nulls when public directory empty or projects folder missing", async () => {
    setupLocalSupabaseMock();
    vi.doMock("fs/promises", () => ({
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn().mockImplementation(async (dir: string) => {
        const norm = dir.replace(/\\/g, "/");
        if (norm.endsWith("/projects")) {
          throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
        }
        return [];
      }),
      unlink: vi.fn(),
    }));
    const { GET } = await import("@/app/api/upload/route");

    const res = await GET();
    expect(await res.json()).toEqual({
      source: "local",
      resume: null,
      profilePhoto: null,
      projectMedia: [],
    });
  });

  it("returns supabase source with correct structure when configured", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServerSupabaseClient: vi.fn(),
    }));

    vi.doMock("fs/promises", () => ({
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn(),
      unlink: vi.fn(),
    }));

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service";

    const { GET } = await import("@/app/api/upload/route");

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("supabase");
    expect(body).toHaveProperty("resume");
    expect(body).toHaveProperty("profilePhoto");
    expect(body).toHaveProperty("projectMedia");
    expect(Array.isArray(body.projectMedia)).toBe(true);
  });

  it("returns nulls when getServiceClient is null in Supabase mode", async () => {
    vi.doMock("@/lib/supabase-server", () => ({
      isSupabaseConfigured: true,
      createServerSupabaseClient: vi.fn(),
    }));
    vi.doMock("fs/promises", () => ({
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn(),
      unlink: vi.fn(),
    }));
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const { GET } = await import("@/app/api/upload/route");

    const res = await GET();
    expect(await res.json()).toEqual({
      source: "supabase",
      resume: null,
      profilePhoto: null,
      projectMedia: [],
    });
  });
});

describe("DELETE /api/upload", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("returns 400 when url param missing", async () => {
    setupLocalSupabaseMock();
    setupFsMock();
    const { DELETE } = await import("@/app/api/upload/route");

    const req = new NextRequest("http://localhost:4000/api/upload", {
      method: "DELETE",
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "url parameter required" });
  });

  it("returns 400 when URL does not match projects pattern", async () => {
    setupLocalSupabaseMock();
    setupFsMock();
    const { DELETE } = await import("@/app/api/upload/route");

    const req = new NextRequest(
      "http://localhost:4000/api/upload?url=/not-projects/foo",
      { method: "DELETE" }
    );
    const res = await DELETE(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid project media URL" });
  });

  it("deletes local file on valid project path", async () => {
    const unlink = vi.fn().mockResolvedValue(undefined);
    setupLocalSupabaseMock();
    setupFsMock({ unlink });
    const { DELETE } = await import("@/app/api/upload/route");

    const req = new NextRequest(
      "http://localhost:4000/api/upload?url=/projects/screenshot.png",
      { method: "DELETE" }
    );
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(unlink).toHaveBeenCalledWith(
      path.join(process.cwd(), "public", "projects", "screenshot.png")
    );
  });

  it("returns 500 when unlink fails (ENOENT)", async () => {
    const err = Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    const unlink = vi.fn().mockRejectedValue(err);
    setupLocalSupabaseMock();
    setupFsMock({ unlink });
    const { DELETE } = await import("@/app/api/upload/route");

    const req = new NextRequest(
      "http://localhost:4000/api/upload?url=/projects/missing.png",
      { method: "DELETE" }
    );
    const res = await DELETE(req);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
