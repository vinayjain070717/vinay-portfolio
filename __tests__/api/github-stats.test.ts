import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("GET /api/github-stats", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns totalRepos, totalStars, topLanguages on success", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { name: "a", stargazers_count: 3, language: "TypeScript" },
        { name: "b", stargazers_count: 2, language: "Java" },
      ],
    } as Response);

    const { GET } = await import("@/app/api/github-stats/route");
    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.totalRepos).toBe(2);
    expect(body.totalStars).toBe(5);
    expect(body.topLanguages).toEqual(
      expect.arrayContaining([
        { name: "TypeScript", count: 1 },
        { name: "Java", count: 1 },
      ])
    );
    expect(body.topLanguages).toHaveLength(2);
  });

  it("caps topLanguages at 10 items, sorted descending by count", async () => {
    const repos = Array.from({ length: 12 }, (_, i) => ({
      name: `r${i}`,
      stargazers_count: 0,
      language: `Lang${i}`,
    }));

    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => repos,
    } as Response);

    const { GET } = await import("@/app/api/github-stats/route");
    const body = await (await GET()).json();

    expect(body.topLanguages).toHaveLength(10);
    const counts = body.topLanguages.map((x: { count: number }) => x.count);
    expect(counts.every((c) => c === 1)).toBe(true);
    for (let i = 0; i < counts.length - 1; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i + 1]);
    }
  });

  it('buckets null language repos as "Other"', async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        { name: "n1", stargazers_count: 0, language: null },
        { name: "n2", stargazers_count: 0, language: null },
        { name: "go", stargazers_count: 1, language: "Go" },
      ],
    } as Response);

    const { GET } = await import("@/app/api/github-stats/route");
    const body = await (await GET()).json();

    const other = body.topLanguages.find((x: { name: string }) => x.name === "Other");
    expect(other).toEqual({ name: "Other", count: 2 });
  });

  it("returns error with matching status on GitHub API non-200", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    } as Response);

    const { GET } = await import("@/app/api/github-stats/route");
    const res = await GET();
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "GitHub API error: 403",
    });
  });

  it("returns 500 on fetch exception", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockRejectedValue(new Error("network down"));

    const { GET } = await import("@/app/api/github-stats/route");
    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });

  it("empty repo list returns zeros and empty topLanguages", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    } as Response);

    const { GET } = await import("@/app/api/github-stats/route");
    const body = await (await GET()).json();
    expect(body).toEqual({
      totalRepos: 0,
      totalStars: 0,
      topLanguages: [],
    });
  });

  it("non-array JSON from GitHub leads to 500", async () => {
    const fetchMock = vi.mocked(globalThis.fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ notAnArray: true }),
    } as Response);

    const { GET } = await import("@/app/api/github-stats/route");
    const res = await GET();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });
});
