import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateVCard(profile: {
  full_name: string;
  email: string;
  phone: string;
  title: string;
  location: string;
  linkedin_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
}): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.full_name}`,
    `TITLE:${profile.title}`,
    `TEL;TYPE=CELL:${profile.phone}`,
    `EMAIL:${profile.email}`,
    `ADR;TYPE=HOME:;;${profile.location}`,
  ];
  if (profile.linkedin_url) lines.push(`URL;TYPE=LinkedIn:${profile.linkedin_url}`);
  if (profile.github_url) lines.push(`URL;TYPE=GitHub:${profile.github_url}`);
  if (profile.website_url) lines.push(`URL:${profile.website_url}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export function downloadVCard(vcard: string, filename: string) {
  const blob = new Blob([vcard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.vcf`;
  a.click();
  URL.revokeObjectURL(url);
}
