import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "InsightFlow - Product Insight Copilot",
  description: "AI-powered workflow converting raw customer reviews into actionable product updates and support explainer collateral.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${plusJakartaSans.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-obsidian text-foreground overflow-hidden flex font-sans">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Workspapce Container */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Sticky Header */}
          <Header />

          {/* Page Workspace View */}
          <main className="flex-1 overflow-y-auto p-6 relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
