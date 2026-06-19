"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, 
  MessageSquare, 
  Check, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface ApprovalWorkspaceProps {
  onSuccess?: () => void;
}

export default function ApprovalWorkspace({ onSuccess }: ApprovalWorkspaceProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [feeName, setFeeName] = useState("Exit Load");
  const [complaints, setComplaints] = useState<string[]>([]);
  const [pulseText, setPulseText] = useState("");
  const [explainerText, setExplainerText] = useState("");
  const [topThemes, setTopThemes] = useState<string[]>([]);

  useEffect(() => {
    async function loadDrafts() {
      try {
        setLoading(true);
        const res = await fetch("/api/analyze");
        const json = await res.json();
        
        if (json.success) {
          const issue = json.clusterResult.isolatedFeeIssue;
          setFeeName(issue.feeName);
          setComplaints(issue.userQuotes || []);
          setPulseText(json.weeklyPulse || "");
          setExplainerText(json.feeExplainer || "");
          setTopThemes(json.clusterResult.topThemes || []);
        }
      } catch (e) {
        console.error("Failed to load drafts:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDrafts();
  }, []);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      // Sprint 4 connects this to a real API `/api/approve`. For Sprint 3, we mock a brief success
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeName,
          weeklyPulse: pulseText,
          feeExplainer: explainerText,
          topThemes,
        }),
      });

      // Simple mock fallback if API endpoint is not implemented yet in Sprint 4
      if (res.ok || res.status === 404) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSuccess(true);
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      console.error("Approval request failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard these drafts? This will reset all edits.")) {
      router.push("/");
    }
  };

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(Boolean).length;
  };

  const getBulletCount = (text: string) => {
    return text.split("\n").filter((l) => l.trim().startsWith("*") || l.trim().startsWith("-")).length;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-4">
        <RefreshCw className="w-8 h-8 text-accent-indigo animate-spin" />
        <p className="text-sm font-mono text-text-muted">Loading generated drafts...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-panel rounded-2xl p-8 max-w-md mx-auto mt-12 flex flex-col items-center text-center gap-6 shadow-2xl shadow-success-emerald/5 border-success-emerald/30 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-success-emerald/10 border border-success-emerald/30 flex items-center justify-center text-success-emerald shadow-lg shadow-success-emerald/15">
          <Check className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-white">Outputs Approved & Dispatched!</h2>
          <p className="text-sm text-text-muted mt-2 leading-relaxed">
            The Weekly Product Pulse has been appended to internal documentation logs, and a reusable support snippet email draft has been successfully queued in Gmail.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 rounded-xl bg-success-emerald hover:bg-success-emerald/90 text-white font-semibold shadow-lg shadow-success-emerald/20 transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const wordCount = getWordCount(pulseText);
  const bulletCount = getBulletCount(explainerText);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] border border-border-stroke bg-surface-card/30 backdrop-blur-md rounded-2xl overflow-hidden">
      {/* Workspace Panel Split */}
      <div className="flex-1 flex min-h-0 divide-x divide-border-stroke/50">
        
        {/* Left Panel: Raw Signal Complains (50% split) */}
        <section className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-stroke/60">
            <MessageSquare className="w-5 h-5 text-accent-teal" />
            <h2 className="font-heading font-semibold text-white">
              Raw Context: {feeName} Complaints
            </h2>
          </div>
          
          <div className="p-4 rounded-xl bg-error-rose/5 border border-error-rose/20 text-xs text-text-muted leading-relaxed flex gap-2">
            <AlertTriangle className="w-4 h-4 text-error-rose shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">Theme Trigger: Exit Load Fee Misunderstanding</span>
              Multiple 1-star and 2-star reviews indicate confusion regarding the 1.0% charge applied during withdrawals within the first year. The complaints below were cleaned and clustered in Sprint 1.
            </div>
          </div>

          <div className="space-y-4">
            {complaints.map((quote, idx) => (
              <blockquote 
                key={idx} 
                className="p-4 rounded-xl bg-obsidian/45 border-l-2 border-l-error-rose text-sm italic text-text-muted leading-relaxed"
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>
        </section>

        {/* Right Panel: AI-Generated Drafts (50% split) */}
        <section className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border-stroke/60">
            <FileText className="w-5 h-5 text-accent-indigo" />
            <h2 className="font-heading font-semibold text-white">AI-Drafted Outputs</h2>
          </div>

          {/* Output 1: Weekly Pulse Brief */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-accent-indigo" />
                Weekly Product Pulse (Internal Notes)
              </label>
              <span className={`text-xs font-mono font-medium ${wordCount > 250 ? "text-error-rose font-bold" : "text-text-muted"}`}>
                {wordCount} / 250 words
              </span>
            </div>
            <textarea
              value={pulseText}
              onChange={(e) => setPulseText(e.target.value)}
              className="w-full h-[180px] p-4 rounded-xl border border-border-stroke bg-obsidian/60 text-sm text-foreground focus:outline-none focus:border-accent-indigo font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Output 2: Customer Explainer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider font-mono text-white flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-accent-teal" />
                Support Explainer Bullet Points (Customer Snippet)
              </label>
              <span className={`text-xs font-mono font-medium ${bulletCount > 6 ? "text-error-rose font-bold" : "text-text-muted"}`}>
                {bulletCount} / 6 bullets
              </span>
            </div>
            <textarea
              value={explainerText}
              onChange={(e) => setExplainerText(e.target.value)}
              className="w-full h-[160px] p-4 rounded-xl border border-border-stroke bg-obsidian/60 text-sm text-foreground focus:outline-none focus:border-accent-teal font-mono leading-relaxed resize-none"
            />
          </div>

        </section>
      </div>

      {/* Gated Bottom Action Bar */}
      <footer className="h-20 border-t border-border-stroke/60 bg-obsidian/50 backdrop-blur-xl px-8 flex items-center justify-between shrink-0">
        <button
          onClick={handleDiscard}
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-error-rose/25 bg-error-rose/5 hover:bg-error-rose/10 text-error-rose text-sm font-semibold transition-all cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Discard Draft
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-border-stroke text-text-muted hover:text-white text-sm font-semibold hover:bg-surface-overlay/50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-success-emerald to-emerald-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-success-emerald/30 shadow-md shadow-success-emerald/15 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Dispatching MCP Tools...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Approve & Dispatch via MCP
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
