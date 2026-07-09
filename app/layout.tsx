import type { Metadata } from "next";
import { headers } from "next/headers";
import { fontVariables } from "@/lib/fonts";
import { siteMetadata } from "@/data";
import "./globals.css";

export const dynamic = "force-dynamic";

const themeScript = `try {
  var theme = window.localStorage.getItem("grantclient:theme");
  var dark = theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
} catch (_) {}`;

export const metadata: Metadata = {
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script
          id="grantclient-theme"
          {...(nonce ? { nonce } : {})}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        {children}
      </body>
    </html>
  );
}
