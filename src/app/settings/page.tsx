"use client";

import { useEffect, useState } from "react";
import { 
  Save, 
  Database, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  RefreshCw,
  Mail,
  AlertCircle
} from "lucide-react";

export default function Settings() {
  const [configStatus, setConfigStatus] = useState<Record<string, boolean>>({});
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  
  const [notionKey, setNotionKey] = useState("");
  const [notionDb, setNotionDb] = useState("");
  
  const [gmailClient, setGmailClient] = useState("");
  const [gmailSecret, setGmailSecret] = useState("");
  const [gmailRefresh, setGmailRefresh] = useState("");

  const [testingMap, setTestingMap] = useState<Record<string, boolean>>({});
  const [statusMap, setStatusMap] = useState<Record<string, { success: boolean; msg: string } | null>>({});

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.success) {
          setConfigStatus(json.keys);
        }
      } catch (e) {
        console.error("Failed to load settings configuration status:", e);
      }
    }
    loadStatus();
  }, []);

  const testConnection = async (type: "gemini" | "groq" | "notion") => {
    setTestingMap(prev => ({ ...prev, [type]: true }));
    setStatusMap(prev => ({ ...prev, [type]: null }));

    let key = "";
    let extraId = "";

    if (type === "gemini") key = geminiKey;
    if (type === "groq") key = groqKey;
    if (type === "notion") {
      key = notionKey;
      extraId = notionDb;
    }

    try {
      const res = await fetch("/api/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, key, extraId }),
      });
      const json = await res.json();
      setStatusMap(prev => ({
        ...prev,
        [type]: { success: json.success, msg: json.message },
      }));
    } catch (e) {
      setStatusMap(prev => ({
        ...prev,
        [type]: { success: false, msg: `HTTP request failed: ${String(e)}` },
      }));
    } finally {
      setTestingMap(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Informative Banner */}
      <div className="p-4 rounded-xl bg-accent-indigo/10 border border-accent-indigo/25 text-xs text-text-muted flex gap-2">
        <AlertCircle className="w-5 h-5 text-accent-indigo shrink-0" />
        <div>
          <span className="font-bold text-white block">Environment Variable Configuration</span>
          API Keys and database IDs should be added to a local <code className="font-mono text-accent-teal">.env.local</code> file in your root folder for execution. 
          The fields below allow you to enter and test connections in real-time.
        </div>
      </div>

      {/* Model Settings Card */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="font-heading text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-accent-indigo" />
          Model Configuration & Keys
        </h2>
        
        <div className="space-y-6">
          {/* Gemini */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end border-b border-border-stroke/40 pb-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
                Google Gemini API Key
                {configStatus.gemini && (
                  <span className="text-[10px] text-success-emerald bg-success-emerald/10 px-1.5 py-0.5 rounded uppercase font-bold leading-none">
                    Configured in Env
                  </span>
                )}
              </label>
              <input
                type="password"
                placeholder={configStatus.gemini ? "••••••••••••••••••••" : "Enter Gemini Key to test"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-stroke bg-obsidian/60 text-sm text-foreground focus:outline-none focus:border-accent-indigo font-mono"
              />
            </div>
            <div>
              <button
                onClick={() => testConnection("gemini")}
                disabled={testingMap.gemini}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-overlay border border-border-stroke hover:bg-surface-overlay/80 text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
              >
                {testingMap.gemini ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-accent-indigo" />
                ) : (
                  "Test Gemini Key"
                )}
              </button>
            </div>
            {statusMap.gemini && (
              <div className="md:col-span-3 text-xs mt-2 flex items-center gap-1.5">
                {statusMap.gemini.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-success-emerald" />
                    <span className="text-success-emerald">{statusMap.gemini.msg}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-error-rose" />
                    <span className="text-error-rose">{statusMap.gemini.msg}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Groq */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted flex items-center gap-2">
                Groq API Key (Fallback)
                {configStatus.groq && (
                  <span className="text-[10px] text-success-emerald bg-success-emerald/10 px-1.5 py-0.5 rounded uppercase font-bold leading-none">
                    Configured in Env
                  </span>
                )}
              </label>
              <input
                type="password"
                placeholder={configStatus.groq ? "••••••••••••••••••••" : "Enter Groq Key to test"}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-stroke bg-obsidian/60 text-sm text-foreground focus:outline-none focus:border-accent-indigo font-mono"
              />
            </div>
            <div>
              <button
                onClick={() => testConnection("groq")}
                disabled={testingMap.groq}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-surface-overlay border border-border-stroke hover:bg-surface-overlay/80 text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
              >
                {testingMap.groq ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-accent-indigo" />
                ) : (
                  "Test Groq Key"
                )}
              </button>
            </div>
            {statusMap.groq && (
              <div className="md:col-span-3 text-xs mt-2 flex items-center gap-1.5">
                {statusMap.groq.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-success-emerald" />
                    <span className="text-success-emerald">{statusMap.groq.msg}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-error-rose" />
                    <span className="text-error-rose">{statusMap.groq.msg}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notion Settings Card */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="font-heading text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-accent-teal" />
          Model Context Protocol (MCP) — Notion Connection
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
                Notion Integration API Key
              </label>
              <input
                type="password"
                placeholder={configStatus.notion ? "••••••••••••••••••••" : "secret_..."}
                value={notionKey}
                onChange={(e) => setNotionKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-stroke bg-obsidian/60 text-sm text-foreground focus:outline-none focus:border-accent-teal font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
                Notion Database ID
              </label>
              <input
                type="text"
                placeholder={configStatus.notion ? "Configured" : "Enter Database ID"}
                value={notionDb}
                onChange={(e) => setNotionDb(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-stroke bg-obsidian/60 text-sm text-foreground focus:outline-none focus:border-accent-teal font-mono"
              />
            </div>
          </div>
          
          <div className="pt-2 flex items-center justify-between gap-4">
            {statusMap.notion ? (
              <div className="text-xs flex items-center gap-1.5">
                {statusMap.notion.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-success-emerald" />
                    <span className="text-success-emerald">{statusMap.notion.msg}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-error-rose" />
                    <span className="text-error-rose">{statusMap.notion.msg}</span>
                  </>
                )}
              </div>
            ) : (
              <span></span>
            )}
            <button
              onClick={() => testConnection("notion")}
              disabled={testingMap.notion}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-overlay border border-border-stroke hover:bg-surface-overlay/80 text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
            >
              {testingMap.notion ? (
                <RefreshCw className="w-4.5 h-4.5 animate-spin text-accent-teal" />
              ) : (
                "Test Notion Database Link"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gmail OAuth Settings Card */}
      <div className="glass-panel rounded-2xl p-6">
        <h2 className="font-heading text-lg font-semibold text-white mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-warning-amber" />
            <span>Model Context Protocol (MCP) — Gmail Client Options</span>
          </div>
          {configStatus.gmail && (
            <span className="text-[10px] text-success-emerald bg-success-emerald/10 px-1.5 py-0.5 rounded uppercase font-bold leading-none font-mono">
              Configured in Env
            </span>
          )}
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
                OAuth2 Client ID
              </label>
              <input
                type="text"
                placeholder={configStatus.gmail ? "Configured" : "Enter Client ID"}
                value={gmailClient}
                onChange={(e) => setGmailClient(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-stroke bg-obsidian/60 text-sm text-foreground focus:outline-none focus:border-warning-amber"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
                OAuth2 Client Secret
              </label>
              <input
                type="password"
                placeholder={configStatus.gmail ? "••••••••••••••••••••" : "Enter Client Secret"}
                value={gmailSecret}
                onChange={(e) => setGmailSecret(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-stroke bg-obsidian/60 text-sm text-foreground focus:outline-none focus:border-warning-amber font-mono"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
              OAuth2 Refresh Token
            </label>
            <input
              type="password"
              placeholder={configStatus.gmail ? "••••••••••••••••••••" : "Enter OAuth Refresh Token"}
              value={gmailRefresh}
              onChange={(e) => setGmailRefresh(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border-stroke bg-obsidian/60 text-sm text-foreground focus:outline-none focus:border-warning-amber font-mono"
            />
          </div>
        </div>
      </div>

      {/* Save Info */}
      <div className="flex items-center justify-between pt-4">
        <span className="text-xs text-text-muted">
          Active integrations sync post-approval inside the Human-in-the-loop workspace.
        </span>
        <button
          onClick={() => alert("Credentials saved locally in transient memory. Set variables in .env.local to persist.")}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-royal text-white text-sm font-semibold hover:shadow-lg hover:shadow-accent-indigo/35 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
