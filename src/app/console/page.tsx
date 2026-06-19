"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Activity, 
  Play, 
  Pause, 
  Terminal, 
  AlertTriangle, 
  Search, 
  CheckCircle,
  Filter
} from "lucide-react";

interface StreamItem {
  timestamp: string;
  reviewerName: string;
  reviewText: string;
  rating: number;
  sentiment: "positive" | "neutral" | "negative";
  detectedIssue: string;
}

interface AnomalyData {
  countInLastHour: number;
  threshold: number;
  alerted: boolean;
}

export default function LiveConsole() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [items, setItems] = useState<StreamItem[]>([]);
  const [anomaly, setAnomaly] = useState<AnomalyData>({ countInLastHour: 0, threshold: 5, alerted: false });
  const [alerts, setAlerts] = useState<string[]>([]);
  
  const [filterKeyword, setFilterKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const eventSourceRef = useRef<EventSource | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    console.log("Console: Opening EventSource stream...");
    const es = new EventSource("/api/stream");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "item") {
          setItems((prev) => [data.item, ...prev].slice(0, 50)); // Keep last 50 items
          if (data.anomaly) {
            setAnomaly(data.anomaly);
          }
        } else if (data.type === "alert") {
          setAlerts((prev) => [data.alertMsg, ...prev].slice(0, 10)); // Keep last 10 alerts
          if (data.anomaly) {
            setAnomaly(data.anomaly);
          }
        }
      } catch (err) {
        console.error("Failed to parse SSE payload:", err);
      }
    };

    es.onerror = (err) => {
      console.error("EventSource error:", err);
      es.close();
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [isPlaying]);

  const handleClearFilters = () => {
    setFilterKeyword("");
    setActiveFilter("");
  };

  const filteredItems = items.filter((item) => {
    if (!activeFilter) return true;
    const lowerFilter = activeFilter.toLowerCase();
    return (
      item.reviewText.toLowerCase().includes(lowerFilter) ||
      item.reviewerName.toLowerCase().includes(lowerFilter) ||
      item.detectedIssue.toLowerCase().includes(lowerFilter)
    );
  });

  return (
    <div className="space-y-6">
      {/* Stream Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stream Status Panel */}
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-between border-l-2 border-l-accent-teal col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent-teal/10 text-accent-teal">
              <Activity className={`w-6 h-6 ${isPlaying ? "animate-pulse" : ""}`} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-white">Gemini Live Client</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Status: {isPlaying ? "Listening via EventSource..." : "Paused"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-overlay border border-border-stroke hover:bg-surface-overlay/80 text-sm font-semibold text-white transition-all cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause Stream
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Resume Stream
              </>
            )}
          </button>
        </div>

        {/* Anomaly Dashboard */}
        <div className={`glass-panel rounded-2xl p-6 border-l-2 ${anomaly.alerted ? "border-l-error-rose shadow-lg shadow-error-rose/5" : "border-l-success-emerald"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
              Anomaly Detector
            </span>
            {anomaly.alerted ? (
              <AlertTriangle className="w-4.5 h-4.5 text-error-rose animate-bounce" />
            ) : (
              <CheckCircle className="w-4.5 h-4.5 text-success-emerald" />
            )}
          </div>
          <div className="mt-2">
            <h3 className="font-heading text-2xl font-bold text-white leading-none">
              {anomaly.countInLastHour} <span className="text-xs text-text-muted font-normal font-mono">fee complaints/hr</span>
            </h3>
            <p className="text-xs text-text-muted mt-2">
              Alert threshold: <span className="font-bold text-white">{anomaly.threshold}</span> complaints.
            </p>
          </div>
        </div>
      </div>

      {/* Alert surges overlay */}
      {anomaly.alerted && (
        <div className="p-4 rounded-xl bg-error-rose/10 border border-error-rose/25 text-xs text-error-rose flex gap-2 items-center animate-pulse">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold block">Surge Threshold Exceeded!</span>
            The system has detected a surge in Exit Load complaints ({anomaly.countInLastHour} in the last hour). Support leads have been alerted.
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Terminal log view (8 cols) */}
        <section className="glass-panel rounded-2xl p-6 lg:col-span-8 flex flex-col h-[500px]">
          <div className="flex items-center gap-2 pb-4 border-b border-border-stroke/60 mb-4 shrink-0 justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-accent-teal" />
              <span className="text-xs font-semibold uppercase tracking-wider font-mono text-white">
                Live Ingest Stream logs
              </span>
            </div>
            {activeFilter && (
              <span className="text-[10px] font-mono bg-accent-indigo/15 text-accent-indigo px-2 py-0.5 rounded border border-accent-indigo/20 flex items-center gap-1">
                Filter: &quot;{activeFilter}&quot;
              </span>
            )}
          </div>

          {/* Logs scrollbox */}
          <div className="flex-1 overflow-y-auto font-mono text-xs space-y-3 pr-2">
            {filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted gap-2">
                <Filter className="w-8 h-8 text-border-stroke" />
                <p>No streamed logs match the active filter criteria.</p>
              </div>
            ) : (
              filteredItems.map((log, idx) => {
                const isFee = log.detectedIssue !== "None";
                
                let sentimentColor = "text-success-emerald bg-success-emerald/10";
                if (log.sentiment === "neutral") sentimentColor = "text-text-muted bg-surface-overlay";
                if (log.sentiment === "negative") sentimentColor = "text-error-rose bg-error-rose/10";

                return (
                  <div key={idx} className="p-3 rounded-xl border border-border-stroke/30 bg-obsidian/45 space-y-2 hover:border-border-stroke/70 transition-colors">
                    <div className="flex justify-between items-center text-[10px] text-text-muted">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.reviewerName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase leading-none ${sentimentColor}`}>
                          {log.sentiment}
                        </span>
                      </div>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-text-muted leading-relaxed text-sm font-sans">{log.reviewText}</p>
                    {isFee && (
                      <div className="flex items-center gap-1.5 text-[10px] text-error-rose font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-error-rose/20 font-bold border border-error-rose/30">
                          Surge Flag: {log.detectedIssue}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef}></div>
          </div>
        </section>

        {/* Filter and alerts ledger (4 cols) */}
        <section className="lg:col-span-4 space-y-6">
          {/* Keyword filter card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="font-heading text-sm font-semibold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-accent-teal" />
              Stream Filter
            </h3>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search reviews, names, or flags..."
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border-stroke bg-obsidian/60 text-xs text-foreground focus:outline-none focus:border-accent-teal"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter(filterKeyword)}
                className="flex-1 py-2 rounded-xl bg-accent-teal hover:bg-accent-teal/90 text-white text-xs font-semibold transition-all cursor-pointer text-center"
              >
                Apply Filter
              </button>
              {(activeFilter || filterKeyword) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 rounded-xl bg-surface-overlay border border-border-stroke text-text-muted hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Triggered alerts card */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-heading text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-error-rose" />
              Triggered Alerts Ledger
            </h3>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <p className="text-xs text-text-muted font-mono py-4 text-center">No alerts triggered in window.</p>
              ) : (
                alerts.map((al, idx) => (
                  <div key={idx} className="p-3 rounded-lg border border-error-rose/20 bg-error-rose/5 text-[10px] font-mono text-error-rose leading-relaxed">
                    {al}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
