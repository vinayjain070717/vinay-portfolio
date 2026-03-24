import { NextResponse } from "next/server";

export const revalidate = 3600;

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  language: string | null;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const res = await fetch(
      "https://api.github.com/users/vinayjain070717/repos?per_page=100",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "portfolio-website",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${res.status}` },
        { status: res.status }
      );
    }

    const repos: GitHubRepo[] = await res.json();

    const totalRepos = repos.length;
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);

    const languageCounts: Record<string, number> = {};
    for (const repo of repos) {
      const lang = repo.language ?? "Other";
      languageCounts[lang] = (languageCounts[lang] ?? 0) + 1;
    }

    const topLanguages = Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      totalRepos,
      totalStars,
      topLanguages,
    });
  } catch (err) {
    console.error("GitHub stats API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
