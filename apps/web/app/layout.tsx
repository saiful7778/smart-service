import { Geist, Geist_Mono, Montserrat } from "next/font/google";

import { Toaster } from "react-hot-toast";

import { DirectionProvider } from "@workspace/ui/components/direction";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";

import { env } from "@/lib/env";

import { DevPanel } from "@/components/dev-panel";
import { ThemeProvider } from "@/components/theme-provider";

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" });

const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

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
          <TooltipProvider>
            <ThemeProvider>
              {children}
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
        </DirectionProvider>
      </body>
    </html>
  );
}
