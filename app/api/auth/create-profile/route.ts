import { getSupabaseServer } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const { userId, fullName, email } = await request.json();

    if (!userId || !fullName || !email) {
      return NextResponse.json(
        { error: "Missing required fields: userId, fullName, email" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();

    // Retry logic: wait for user to be available in auth.users table
    let lastError: any = null;
    const maxRetries = 5;
    const retryDelays = [100, 200, 500, 1000, 2000]; // Exponential backoff

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: fullName,
            email: email,
            role: "member",
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          lastError = error;
          // If it's a foreign key error, retry
          if (error.code === "23503") {
            console.warn(
              `Attempt ${attempt + 1}: Foreign key error, retrying...`,
              error.message
            );
            if (attempt < maxRetries - 1) {
              await sleep(retryDelays[attempt]);
              continue;
            }
          }
          throw error;
        }

        // Success
        return NextResponse.json(
          { success: true, data: data },
          { status: 201 }
        );
      } catch (error: any) {
        lastError = error;
        if (attempt < maxRetries - 1 && error.code === "23503") {
          await sleep(retryDelays[attempt]);
          continue;
        }
        throw error;
      }
    }

    // All retries failed
    throw lastError;
  } catch (error: any) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 400 }
    );
  }
}
