"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Terminal, 
  Settings, 
  Zap 
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Review Approval", href: "/approval", icon: ClipboardCheck },
    { name: "Live Console", href: "/console", icon: Terminal },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-60 border-r border-border-stroke bg-surface-card/60 backdrop-blur-xl flex flex-col h-full shrink-0">
      {/* Brand Header */}
      <div className="h-[70px] px-6 flex items-center border-b border-border-stroke gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-indigo to-accent-royal flex items-center justify-center shadow-lg shadow-accent-indigo/35">
          <Zap className="w-4.5 h-4.5 text-white fill-white/20" />
        </div>
        <div>
          <span className="font-heading text-lg font-bold tracking-tight bg-gradient-to-r from-white to-text-muted bg-clip-text text-transparent">
            InsightFlow
          </span>
          <span className="block text-[10px] font-mono text-accent-teal uppercase tracking-widest font-semibold leading-none mt-0.5">
            Copilot
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-sans text-sm font-medium ${
                isActive
                  ? "bg-accent-indigo text-white shadow-lg shadow-accent-indigo/25"
                  : "text-text-muted hover:text-white hover:bg-surface-overlay/50"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-text-muted hover:text-white"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border-stroke bg-obsidian/40 shrink-0">
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success-emerald"></span>
          </span>
          <span className="text-xs font-mono text-text-muted">MCP Status: Live</span>
        </div>
      </div>
    </aside>
  );
}
