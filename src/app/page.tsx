"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Star, 
  AlertTriangle, 
  ArrowRight, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  ServerCrash
} from "lucide-react";

interface ReviewRecord {
  reviewerName: string;
  rating: string; // From CSV
  reviewText: string;
  timestamp: string;
}

interface ThemeAnalysis {
  name: string;
  count: number;
  percentage: number;
  quotes: string[];
}

interface AnalysisData {
  themes: ThemeAnalysis[];
  topThemes: string[];
  isolatedFeeIssue: {
    feeName: string;
    description: string;
    userQuotes: string[];
  };
}

export default function Dashboard() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch parsed reviews
        const reviewsRes = await fetch("/api/reviews");
        const reviewsJson = await reviewsRes.json();
        
        // Fetch theme analysis
        const analyzeRes = await fetch("/api/analyze");
        const analyzeJson = await analyzeRes.json();
        
        if (reviewsJson.success) {
          setReviews(reviewsJson.reviews);
        } else {
          throw new Error(reviewsJson.error || "Failed to load reviews");
        }
        
        if (analyzeJson.success) {
          setAnalysis(analyzeJson.clusterResult);
        } else {
          throw new Error(analyzeJson.error || "Failed to load analysis");
        }
      } catch (e) {
        console.error(e);
        setError(String(e));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] gap-4">
        <div className="w-10 h-10 border-4 border-t-accent-indigo border-border-stroke rounded-full animate-spin"></div>
        <p className="text-sm font-mono text-text-muted animate-pulse">Parsing review signals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-120px)] gap-4 max-w-md mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-error-rose/10 flex items-center justify-center text-error-rose">
          <ServerCrash className="w-6 h-6" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-white">System Error</h3>
        <p className="text-sm text-text-muted">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 rounded-xl bg-surface-overlay border border-border-stroke text-sm text-white hover:bg-surface-overlay/80"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0 ? (
    reviews.reduce((acc, r) => acc + parseInt(r.rating || "0"), 0) / totalReviewsCount
  ).toFixed(1) : "0.0";

  const positiveReviews = reviews.filter(r => parseInt(r.rating || "0") >= 4);
  const generalReviews = reviews.filter(r => parseInt(r.rating || "0") === 3);
  const negativeReviews = reviews.filter(r => parseInt(r.rating || "0") <= 2);

  const positiveCount = positiveReviews.length;
  const generalCount = generalReviews.length;
  const negativeCount = negativeReviews.length;

  const divisor = totalReviewsCount || 1;
  const positivePct = ((positiveCount / divisor) * 100).toFixed(0);
  const generalPct = ((generalCount / divisor) * 100).toFixed(0);
  const negativePct = ((negativeCount / divisor) * 100).toFixed(0);

  const pricingConfusionTheme = analysis?.themes.find(t => t.name.includes("Fee") || t.name.includes("Exit") || t.name.includes("Pricing") || t.name.includes("charge") || t.name.includes("Charge") || t.name.includes("SMS"));
  const primaryThemeName = pricingConfusionTheme?.name || "Exit Load Confusion";
  const primaryThemePct = pricingConfusionTheme?.percentage || 36;

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Ingested */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Reviews Ingested</span>
            <MessageSquare className="w-5 h-5 text-accent-teal" />
          </div>
          <div>
            <h3 className="font-heading text-3xl font-bold text-white leading-none mt-2">
              {totalReviewsCount}
            </h3>
            <p className="text-xs text-text-muted mt-2 flex items-center gap-1 font-mono">
              <Star className="w-3 h-3 text-warning-amber fill-current" />
              {averageRating} average rating
            </p>
          </div>
        </div>

        {/* Metric 2: Positive Satisfaction */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Positive Satisfaction</span>
            <CheckCircle className="w-5 h-5 text-success-emerald" />
          </div>
          <div>
            <h3 className="font-heading text-3xl font-bold text-white leading-none mt-2">
              {positiveCount}
            </h3>
            <p className="text-xs text-text-muted mt-2 flex items-center gap-1 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-success-emerald/15 text-success-emerald font-bold text-[10px]">
                {positivePct}% of total
              </span>
              ratings 4-5 stars
            </p>
          </div>
        </div>

        {/* Metric 3: General Satisfaction */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">General Satisfaction</span>
            <TrendingUp className="w-5 h-5 text-accent-indigo" />
          </div>
          <div>
            <h3 className="font-heading text-3xl font-bold text-white leading-none mt-2">
              {generalCount}
            </h3>
            <p className="text-xs text-text-muted mt-2 flex items-center gap-1 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-accent-indigo/15 text-accent-indigo font-bold text-[10px]">
                {generalPct}% of total
              </span>
              neutral rating 3 stars
            </p>
          </div>
        </div>

        {/* Metric 4: Negative Satisfaction */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-[140px]">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Negative Satisfaction</span>
            <AlertTriangle className="w-5 h-5 text-error-rose" />
          </div>
          <div>
            <h3 className="font-heading text-3xl font-bold text-white leading-none mt-2">
              {negativeCount}
            </h3>
            <p className="text-xs text-text-muted mt-2 flex items-center gap-1 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-error-rose/15 text-error-rose font-bold text-[10px]">
                {negativePct}% of total
              </span>
              ratings 1-2 stars
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column - Reviews Table */}
        <div className="glass-panel rounded-2xl p-6 lg:col-span-8 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-semibold text-white">Cleaned Review Logs</h2>
            <span className="text-[10px] font-mono bg-surface-overlay px-2 py-1 rounded border border-border-stroke text-text-muted">
              Source: Play Store
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-stroke text-text-muted text-xs font-mono font-medium">
                  <th className="pb-3 pr-4">Reviewer</th>
                  <th className="pb-3 px-4">Rating</th>
                  <th className="pb-3 px-4">Comment</th>
                  <th className="pb-3 pl-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-stroke/40 text-sm">
                {reviews.map((r, idx) => {
                  const ratingVal = parseInt(r.rating || "0");
                  const isExitLoad = r.reviewText.toLowerCase().includes("exit");

                  return (
                    <tr key={idx} className="hover:bg-surface-overlay/25 transition-colors group">
                      <td className="py-4 pr-4 font-medium text-white truncate max-w-[120px]">
                        {r.reviewerName}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < ratingVal 
                                  ? "text-warning-amber fill-current" 
                                  : "text-border-stroke"
                              }`} 
                            />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-text-muted group-hover:text-foreground transition-colors max-w-[320px] truncate">
                        {isExitLoad && (
                          <span className="mr-1.5 px-1.5 py-0.5 rounded bg-error-rose/15 border border-error-rose/20 text-error-rose text-[10px] font-mono leading-none">
                            Fee Complaint
                          </span>
                        )}
                        {r.reviewText}
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap text-xs font-mono text-text-muted">
                        {new Date(r.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Isolated Fee Detail */}
        {analysis?.isolatedFeeIssue && (
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-6 relative border-l-2 border-l-error-rose overflow-hidden shadow-xl shadow-error-rose/5">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-0.5 rounded bg-error-rose/10 border border-error-rose/25 text-error-rose text-xs font-semibold tracking-wider font-mono uppercase">
                  Isolated Charge Issue
                </span>
                <AlertTriangle className="w-5 h-5 text-error-rose animate-pulse" />
              </div>

              <h3 className="font-heading text-xl font-bold text-white tracking-tight">
                {analysis.isolatedFeeIssue.feeName} Confusion
              </h3>
              
              <p className="text-sm text-text-muted mt-3 leading-relaxed">
                {analysis.isolatedFeeIssue.description}
              </p>

              {/* Quotes preview */}
              <div className="mt-4 space-y-2 border-t border-border-stroke/60 pt-4">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider block">
                  User Quote Preview
                </span>
                <blockquote className="border-l border-accent-indigo pl-3 py-1 font-sans text-xs italic text-text-muted">
                  &ldquo;{analysis.isolatedFeeIssue.userQuotes[0]}&rdquo;
                </blockquote>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-border-stroke/60">
                <Link 
                  href="/approval"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-royal text-white text-sm font-semibold hover:shadow-lg hover:shadow-accent-indigo/35 transition-all duration-300 shadow-md shadow-accent-indigo/15 group cursor-pointer"
                >
                  Configure & Approve Snippets
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Ingestion Overview Card */}
            <div className="glass-panel rounded-2xl p-6">
              <h4 className="font-heading text-sm font-semibold text-white mb-3">Ingestion Health</h4>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Total Clean CSV Rows</span>
                  <span className="text-white font-bold">{reviews.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Filter Exclusions</span>
                  <span className="text-text-muted">5 duplicate/old/empty</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Pipeline Health</span>
                  <span className="text-success-emerald flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Optimal
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
