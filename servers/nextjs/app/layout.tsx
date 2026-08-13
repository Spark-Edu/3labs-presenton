import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import MixpanelInitializer from "./MixpanelInitializer";
import { SsoParamCapture } from "./SsoParamCapture";
import { AuthGuard } from "./AuthGuard";
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://app.3labs.ca"),
  title: "3Labs - AI-powered Learning Platform",
  description: "AI-powered blended learning platform for Vietnamese training centers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {/* AuthGuard wraps everything below: it renders nothing until it has
            confirmed identity (query param or localStorage), so an
            unauthenticated visitor never sees the app — not even a flash of
            it — before being bounced to app.3labs.ca. See app/AuthGuard.tsx. */}
        <AuthGuard>
          {/* First child on purpose: sibling effects run in render order, so
              the capture lands before any page-level redirect effect
              (e.g. Home's router.push("/upload")) can navigate the params away. */}
          <SsoParamCapture />
          <Providers>
            <MixpanelInitializer>

              {children}

            </MixpanelInitializer>
          </Providers>
          <Toaster position="top-center" />
        </AuthGuard>
      </body>
    </html>
  );
}
