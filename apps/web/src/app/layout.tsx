import "@/styles/tailwind.css";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { APP_NAME } from "./consts";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { CSPostHogProvider } from "./providers";

export const metadata: Metadata = {
  title: {
    template: `%s - ${APP_NAME}`,
    default: `${APP_NAME} - AI Tutor RAG Service platform.`,
  },
  description: "Build powerful RAG applications with any data source, at any scale with AI Tutor RAG API.",
  metadataBase: new URL("https://rag-api-aitutor-beta.up.railway.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rag-api-aitutor-beta.up.railway.app",
    title: `${APP_NAME} - AI Tutor RAG Service platform`,
    description: "Build powerful RAG applications with any data source, at any scale with AI Tutor RAG API.",
    siteName: APP_NAME,
    images: [
      {
        url: "https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1744259046793-meta.png",
        width: 1200,
        height: 630,
        alt: "AI Tutor RAG API",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - AI Tutor RAG Service platform`,
    description: "Build powerful RAG applications with any data source, at any scale with AI Tutor RAG API.",
    images: ["https://pixiomedia.nyc3.digitaloceanspaces.com/uploads/1744259046793-meta.png"],
    creator: "@tsi_org",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <CSPostHogProvider>
        <body className="min-h-screen bg-background antialiased w-full mx-auto scroll-smooth font-sans">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </body>
      </CSPostHogProvider>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS!} />
    </html>
  );
}
