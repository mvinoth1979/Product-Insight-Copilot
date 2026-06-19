import { EventEmitter } from "events";

export interface ReviewStreamItem {
  timestamp: string;
  reviewerName: string;
  reviewText: string;
  rating: number;
  sentiment: "positive" | "neutral" | "negative";
  detectedIssue: string;
}

export interface AnomalyStatus {
  countInLastHour: number;
  threshold: number;
  alerted: boolean;
}

class ReviewStreamManager extends EventEmitter {
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private complaintTimestamps: number[] = [];
  private alertThreshold: number = 5; // Alert if >= 5 fee issues/hour
  private mockIndex: number = 0;

  // Stream mock dataset
  private streamMockData = [
    { name: "Vijay Nair", rating: 5, text: "Excellent transaction speed! Direct bank transfer works instantly.", issue: "None", sentiment: "positive" as const },
    { name: "John Doe", rating: 1, text: "Wait, exits are charged? Why is there an exit load fee of 1%?", issue: "Exit Load Confusion", sentiment: "negative" as const },
    { name: "Sarah Connor", rating: 5, text: "Love the biometric login. Unbelievably fast.", issue: "None", sentiment: "positive" as const },
    { name: "Elena Rostova", rating: 1, text: "Got charged a 1% exit load! This exit fee is a complete scam, it should be disclosed.", issue: "Exit Load Confusion", sentiment: "negative" as const },
    { name: "Ramesh Kumar", rating: 4, text: "Dashboard shows all my holdings in real-time. Sleek UI.", issue: "None", sentiment: "positive" as const },
    { name: "Priya Patel", rating: 2, text: "Unannounced exit load fees deducted. Why is there a charge when withdrawing early?", issue: "Exit Load Confusion", sentiment: "negative" as const },
    { name: "Aarav Sharma", rating: 1, text: "Charging exit loads without warnings? The deposit screen is deceptive.", issue: "Exit Load Confusion", sentiment: "negative" as const },
    { name: "Carlos Ray", rating: 3, text: "Average app, loading times could be better.", issue: "None", sentiment: "neutral" as const },
    { name: "Amit Verma", rating: 2, text: "Confusion about exit load charges. Make the exit fee slider visible.", issue: "Exit Load Confusion", sentiment: "negative" as const },
    { name: "Neha Gupta", rating: 5, text: "Highly recommend for micro-investments.", issue: "None", sentiment: "positive" as const },
    { name: "Deepak Joshi", rating: 1, text: "I did not expect this exit load fee. I was charged exit load upon redemption! Fix this.", issue: "Exit Load Confusion", sentiment: "negative" as const },
  ];

  constructor() {
    super();
  }

  public start(
    onItem: (item: ReviewStreamItem) => void,
    onAlert: (alertMsg: string) => void
  ) {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log("Streamer: Starting review WebSocket client simulator...");

    // Setup listener triggers
    this.on("item", onItem);
    this.on("alert", onAlert);

    // Simulate review ingestion loop
    this.intervalId = setInterval(() => {
      if (!this.isRunning) return;

      const mock = this.streamMockData[this.mockIndex];
      const item: ReviewStreamItem = {
        timestamp: new Date().toISOString(),
        reviewerName: mock.name,
        reviewText: mock.text,
        rating: mock.rating,
        sentiment: mock.sentiment,
        detectedIssue: mock.issue,
      };

      this.emit("item", item);

      // Run anomaly detector
      if (mock.issue !== "None") {
        this.registerComplaint();
      }

      this.mockIndex = (this.mockIndex + 1) % this.streamMockData.length;
    }, 3000); // Emits a review every 3 seconds
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.removeAllListeners();
    console.log("Streamer: Review WebSocket simulator stopped.");
  }

  public getStatus(): AnomalyStatus {
    this.cleanOutdatedComplaints();
    return {
      countInLastHour: this.complaintTimestamps.length,
      threshold: this.alertThreshold,
      alerted: this.complaintTimestamps.length >= this.alertThreshold,
    };
  }

  public setThreshold(val: number) {
    this.alertThreshold = val;
  }

  private registerComplaint() {
    const now = Date.now();
    this.complaintTimestamps.push(now);
    this.cleanOutdatedComplaints();

    console.log(`Streamer Anomaly check: ${this.complaintTimestamps.length}/${this.alertThreshold} fee issues in last hour.`);

    if (this.complaintTimestamps.length >= this.alertThreshold) {
      const alertMsg = `CRITICAL ALERT: Detected a surge in fee complaints! ${this.complaintTimestamps.length} issues occurred within the sliding window (Threshold: ${this.alertThreshold}).`;
      this.emit("alert", alertMsg);
    }
  }

  private cleanOutdatedComplaints() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.complaintTimestamps = this.complaintTimestamps.filter((t) => t >= oneHourAgo);
  }
}

// Singleton streamer instance
export const reviewStreamer = new ReviewStreamManager();
