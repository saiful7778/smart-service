import { Geist, Geist_Mono, Montserrat } from "next/font/google";

import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
