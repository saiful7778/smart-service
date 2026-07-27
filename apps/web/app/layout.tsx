import "../server/orpc.server-client";

import { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "react-hot-toast";

import { DirectionProvider } from "@workspace/ui/components/direction";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";

import { env } from "@/lib/env";

import { DevPanel } from "@/components/dev-panel";
import { ProgressBarProvider } from "@/components/providers/progress-bar-provider";
import TanstackQueryProvider from "@/components/providers/tanstack-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" });

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${env.NEXT_PUBLIC_SITE_NAME} - All in one service management platform`,
    template: `%s | ${env.NEXT_PUBLIC_SITE_NAME} - Service management software`,
  },
  description:
    "All-in-one field service management software for plumbers, cleaners, electricians and others. Manage leads, scheduling, employees, and invoicing.",
  keywords: [
    "field service management",
    "plumbing business software",
    "cleaning business software",
    "electrical business software",
    "service dispatch software",
    "work order management",
    "technician scheduling",
    "customer management",
    "invoice software",
    "mobile workforce management",
  ],

  alternates: {
    canonical: env.NEXT_PUBLIC_SITE_URL,
  },

  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),

  openGraph: {
    title: `${env.NEXT_PUBLIC_SITE_NAME} - Field Service Management Software`,
    description:
      "Streamline your plumbing, cleaning, or electrical service business with our comprehensive management software.",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: env.NEXT_PUBLIC_SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${env.NEXT_PUBLIC_SITE_NAME} - Field Service Management Software`,
    description:
      "Streamline your plumbing, cleaning, or electrical service business with our comprehensive management software.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        montserrat.variable,
        geistHeading.variable
      )}
    >
      <body>
        <DirectionProvider direction="ltr">
          <ProgressBarProvider>
            <TooltipProvider>
              <ThemeProvider>
                <NuqsAdapter>
                  <TanstackQueryProvider>{children}</TanstackQueryProvider>
                </NuqsAdapter>
                <Toaster
                  position="top-center"
                  reverseOrder={true}
                  gutter={6}
                  toastOptions={{
                    duration: 3000,
                    removeDelay: 2000,
                    className: "__react-hot-toast",
                  }}
                />
                <DevPanel
                  currentEnv={env.NODE_ENV}
                  envVars={Object.entries(process.env)
                    .filter(
                      ([k]) => k.startsWith("NEXT_PUBLIC_") || k === "NODE_ENV"
                    )
                    .map(([key, value]) => ({ key, value: value ?? "" }))}
                />
              </ThemeProvider>
            </TooltipProvider>
          </ProgressBarProvider>
        </DirectionProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
