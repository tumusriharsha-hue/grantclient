import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { fontVariables } from "@/lib/fonts";
import { siteMetadata } from "@/data";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const GOOGLE_ANALYTICS_ID = "G-FLEYCLF72B";
const EXISTING_GOOGLE_SITE_VERIFICATION =
  "LzJ_3_KFx3nMPHSkwLLpICYtycVM9SmE4ZIaWIGndoU";
const NEW_GOOGLE_SITE_VERIFICATION =
  "LEx0qfp_RzqtRxgi0GBVBuwrBdPnjCsSHadSp3DFUAU";
const googleSiteVerificationTokens = [
  EXISTING_GOOGLE_SITE_VERIFICATION,
  NEW_GOOGLE_SITE_VERIFICATION,
  process.env.GOOGLE_SITE_VERIFICATION,
].filter((token): token is string => Boolean(token));

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  applicationName: siteMetadata.title,
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  verification: {
    google: googleSiteVerificationTokens,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteMetadata.title,
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Grantclient — find grants, apply faster, get funded",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteMetadata.title,
    description: siteMetadata.description,
    images: ["/opengraph-image"],
  },
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
      className={`${fontVariables} h-full font-sans antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
          nonce={nonce}
        />
        <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
