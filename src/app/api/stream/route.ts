import { NextRequest } from "next/server";
import { reviewStreamer, ReviewStreamItem } from "@/backend/services/streamer";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    start(controller) {
      // Callback when a review item streams in
      const handleItem = (item: ReviewStreamItem) => {
        const anomaly = reviewStreamer.getStatus();
        const payload = JSON.stringify({ type: "item", item, anomaly });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      // Callback when a fee surge alert is triggered
      const handleAlert = (alertMsg: string) => {
        const anomaly = reviewStreamer.getStatus();
        const payload = JSON.stringify({ type: "alert", alertMsg, anomaly });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      // Register listeners and start simulator
      reviewStreamer.start(handleItem, handleAlert);

      // Listen for client disconnect
      request.signal.addEventListener("abort", () => {
        console.log("Stream API: Client closed stream connection.");
        reviewStreamer.stop();
      });
    },
  });

  return new Response(customStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
