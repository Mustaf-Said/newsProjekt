import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function isBucketNotFoundError(error: any) {
  return typeof error?.message === "string" && error.message.toLowerCase().includes("bucket not found");
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServer();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const configuredBucket = process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "announcements";
    const bucketCandidates = Array.from(new Set([
      configuredBucket,
      "announcements",
      "images",
      "public"
    ].filter(Boolean)));

    const safeName = sanitizeFileName(file.name);
    const path = `announcements/${authData.user.id}/${Date.now()}-${safeName}`;

    let lastError: any = null;
    let uploadedBucket: string | null = null;

    for (const bucket of bucketCandidates) {
      const uploadOnce = async () => {
        return supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "application/octet-stream"
        });
      };

      let { error } = await uploadOnce();

      if (error && isBucketNotFoundError(error)) {
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: true,
          fileSizeLimit: "10MB"
        });

        if (createError && !String(createError.message || "").toLowerCase().includes("already exists")) {
          lastError = createError;
          continue;
        }

        ({ error } = await uploadOnce());
      }

      if (!error) {
        uploadedBucket = bucket;
        break;
      }

      lastError = error;
      if (!isBucketNotFoundError(error)) {
        break;
      }
    }

    if (!uploadedBucket) {
      return NextResponse.json(
        { error: lastError?.message || "Upload failed" },
        { status: 400 }
      );
    }

    const { data } = supabase.storage.from(uploadedBucket).getPublicUrl(path);

    return NextResponse.json({
      url: data.publicUrl,
      bucket: uploadedBucket
    });
  } catch (error: any) {
    console.error("upload-image error", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
