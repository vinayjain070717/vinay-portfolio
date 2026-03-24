import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { siteConfig } from "@/lib/site.config";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.siteTitle,
  description: siteConfig.siteDescription,
  keywords: siteConfig.siteKeywords,
  authors: [{ name: siteConfig.siteAuthor }],
  openGraph: {
    title: siteConfig.siteTitle,
    description: siteConfig.siteDescription,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.siteLanguage} className="dark" suppressHydrationWarning>
      <head>
        <link
          href={siteConfig.googleFontsUrl}
          rel="stylesheet"
        />
      </head>
      <body className="font-[Inter] antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
