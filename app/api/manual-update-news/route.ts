import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Manually call the update-news endpoint
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = process.env.VERCEL_URL || "localhost:3000";
    
    const response = await fetch(`${protocol}://${host}/api/cron/update-news`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      message: "Manual news update triggered",
      result: data 
    });
  } catch (error) {
    console.error("[manual-update] Error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
