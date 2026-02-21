import cron, { ScheduledTask } from "node-cron";

let cronJobInitialized = false;
let scheduledTask: ScheduledTask | null = null;

export function initializeNewsCronJob() {
  // Prevent duplicate cron jobs
  if (cronJobInitialized) {
    console.log("[news-cron] Cron job already initialized");
    return;
  }

  try {
    // Run every day at midnight UTC
    // Format: "0 0 * * *" = 0 minutes, 0 hours, every day, every month, every day of week
    scheduledTask = cron.schedule("0 0 * * *", async () => {
      console.log("[news-cron] Starting scheduled news update...");
      try {
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const host = process.env.VERCEL_URL || "localhost:3000";
        const response = await fetch(`${protocol}://${host}/api/cron/update-news`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("[news-cron] Update completed:", data);
      } catch (error) {
        console.error("[news-cron] Failed to update news:", error);
      }
    });

    // Also run on startup (after a 5-second delay to ensure server is ready)
    setTimeout(async () => {
      console.log("[news-cron] Running initial news update on startup...");
      try {
        const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
        const host = process.env.VERCEL_URL || "localhost:3000";
        const response = await fetch(`${protocol}://${host}/api/cron/update-news`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log("[news-cron] Initial update completed:", data);
      } catch (error) {
        console.error("[news-cron] Failed to run initial update:", error);
      }
    }, 5000);

    cronJobInitialized = true;
    console.log("[news-cron] Cron job initialized - will run every day at midnight UTC");
  } catch (error) {
    console.error("[news-cron] Failed to initialize cron job:", error);
  }
}

export function stopNewsCronJob() {
  try {
    if (scheduledTask) {
      scheduledTask.stop();
      scheduledTask = null;
    }
    cronJobInitialized = false;
    console.log("[news-cron] Cron job stopped");
  } catch (error) {
    console.error("[news-cron] Error stopping cron job:", error);
  }
}
