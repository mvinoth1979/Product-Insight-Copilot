"use client";

import { usePathname } from "next/navigation";
import { Cpu, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getPageTitle = (path: string): string => {
    switch (path) {
      case "/":
        return "Review Intelligence Hub";
      case "/approval":
        return "Human-in-the-Loop Approval Workspace";
      case "/console":
        return "Live Stream Console";
      case "/settings":
        return "System Settings & Integrations";
      default:
        return "InsightFlow";
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Reload local reviews cache or trigger ingestion
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e) {
      console.error("Refresh failed:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="h-[70px] border-b border-border-stroke bg-obsidian/40 backdrop-blur-xl px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
      {/* Title */}
      <h1 className="font-heading text-xl font-semibold tracking-tight text-white">
        {getPageTitle(pathname)}
      </h1>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Sync Button */}
        {pathname === "/" && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-stroke bg-surface-card/40 hover:bg-surface-overlay text-text-muted hover:text-white transition-all text-xs font-medium cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-accent-teal" : ""}`} />
            Refresh Reviews
          </button>
        )}

        {/* Engine Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success-emerald/10 border border-success-emerald/20">
          <Cpu className="w-3.5 h-3.5 text-success-emerald" />
          <span className="text-xs font-mono font-medium text-success-emerald leading-none">
            Gemini 1.5 Flash
          </span>
        </div>
      </div>
    </header>
  );
}
