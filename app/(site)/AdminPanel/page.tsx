"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { supabase } from "@/api/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CheckCircle,
  Loader2,
  Shield,
  Trash2,
  Upload,
  XCircle
} from "lucide-react";

const CATEGORY_OPTIONS = [
  "local",
  "world",
  "football",
  "politics",
  "economy",
  "society",
  "culture",
  "sports",
  "technology",
  "other"
];

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [publishing, setPublishing] = useState(false);
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("local");
  const [imageUrl, setImageUrl] = useState("");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [articlesCount, pendingCount, usersCount, totalAdsCount] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("announcements").select("id", { count: "exact", head: true })
      ]);

      return {
        publishedNews: articlesCount.count || 0,
        pendingAds: pendingCount.count || 0,
        users: usersCount.count || 0,
        totalAds: totalAdsCount.count || 0
      };
    }
  });

  const { data: localNews = [], isLoading: loadingNews } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, category, published_at, created_at")
        .order("created_at", { ascending: false })
        .limit(15);

      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const { data: pendingAds = [], isLoading: loadingAds } = useQuery({
    queryKey: ["admin-pending-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, category, listing_type, details, status, created_at, user_id")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const pendingUserIds = useMemo(() => {
    const ids = new Set<string>();
    pendingAds.forEach((item: any) => {
      if (item.user_id) {
        ids.add(item.user_id);
      }
    });
    return Array.from(ids);
  }, [pendingAds]);

  const { data: pendingAuthors = [] } = useQuery({
    queryKey: ["admin-pending-authors", pendingUserIds.join(",")],
    queryFn: async () => {
      if (pendingUserIds.length === 0) {
        return [];
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", pendingUserIds);

      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const authorMap = useMemo(() => {
    const map = new Map<string, { full_name: string | null; username: string | null }>();
    pendingAuthors.forEach((author: any) => {
      map.set(author.id, { full_name: author.full_name || null, username: author.username || null });
    });
    return map;
  }, [pendingAuthors]);

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, role, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);
  };

  const publishNews = async () => {
    if (!headline.trim() || !content.trim()) {
      toast.error("Headline and content are required.");
      return;
    }

    setPublishing(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id || null;
    const safeImageUrl = imageUrl.startsWith("blob:") ? "" : imageUrl;

    const imageBlock = safeImageUrl ? `<img src=\"${safeImageUrl}\" alt=\"\" />\n\n` : "";
    const summaryBlock = summary.trim() ? `<p>${summary.trim()}</p>\n\n` : "";
    const composedContent = `${imageBlock}${summaryBlock}${content}`.trim();

    const { error } = await supabase.from("articles").insert({
      title: headline.trim(),
      content: composedContent || content.trim(),
      category,
      author_id: userId,
      published_at: new Date().toISOString()
    });

    if (error) {
      console.error(error);
      toast.error("Failed to publish news. Check your permissions.");
      setPublishing(false);
      return;
    }

    toast.success("News published successfully!");
    setHeadline("");
    setSummary("");
    setContent("");
    setImageUrl("");
    setPublishing(false);
    queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const deleteNews = async (id: number) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete article.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-news"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const updateAdStatus = async (id: number, status: "approved" | "rejected") => {
    const { error } = await supabase.from("announcements").update({ status }).eq("id", id);
    if (error) {
      toast.error("Failed to update ad status.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-pending-ads"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const deleteAd = async (id: number) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete ad.");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-pending-ads"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Admin Panel</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Published News", value: stats?.publishedNews ?? 0 },
          { label: "Pending Ads", value: stats?.pendingAds ?? 0 },
          { label: "Users", value: stats?.users ?? 0 },
          { label: "Total Ads", value: stats?.totalAds ?? 0 }
        ].map((stat) => (
          <Card key={stat.label} className="border border-[var(--border)]">
            <CardContent className="p-5">
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-black text-[var(--text-primary)] mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="publish" className="space-y-6">
        <TabsList className="bg-[var(--bg-secondary)]">
          <TabsTrigger value="publish">Publish News</TabsTrigger>
          <TabsTrigger value="manage">Manage News</TabsTrigger>
          <TabsTrigger value="ads">Approve Ads</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="publish">
          <Card className="border border-[var(--border)]">
            <CardContent className="space-y-4">
              <div>
                <Label>Headline *</Label>
                <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Enter headline..." />
              </div>
              <div>
                <Label>Summary</Label>
                <Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary..." />
              </div>
              <div>
                <Label>Content *</Label>
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Full article content..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((item) => (
                        <SelectItem key={item} value={item} className="capitalize">{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Image</Label>
                  <div className="flex gap-2">
                    <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL or upload..." className="flex-1" />
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span><Upload className="w-4 h-4" /></span>
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  {imageUrl && (
                    <img src={imageUrl} alt="" className="mt-2 w-32 h-20 object-cover rounded-lg" />
                  )}
                </div>
              </div>
              <Button onClick={publishNews} disabled={publishing} className="bg-amber-500 hover:bg-amber-600 text-white">
                {publishing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Publish Now
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          {loadingNews ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" />
            </div>
          ) : (
            <div className="space-y-3">
              {localNews.map((item: any) => (
                <div key={item.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-green-100 text-green-800 border-0 text-[10px]">published</Badge>
                      <span className="text-xs text-[var(--text-secondary)]">{moment(item.created_at).fromNow()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteNews(item.id)} className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {localNews.length === 0 && (
                <div className="text-center py-10 text-[var(--text-secondary)]">No news yet.</div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ads">
          {loadingAds ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" />
            </div>
          ) : pendingAds.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">
              <CheckCircle className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <p>No pending ads to review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAds.map((item: any) => {
                const details = item.details || {};
                const image = details.images?.[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200";
                const city = details.city || details.location_details || "Unknown";
                const price = details.price ? `$${Number(details.price).toLocaleString()}` : "N/A";
                const author = authorMap.get(item.user_id || "");
                const byName = author?.full_name || author?.username || (item.user_id ? `${item.user_id.slice(0, 6)}...` : "Unknown");

                return (
                  <div key={item.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px] uppercase">{item.category || "listing"}</Badge>
                        <h3 className="font-bold text-sm truncate">{item.title}</h3>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{city} • {price} • by {byName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => updateAdStatus(item.id, "approved")}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => updateAdStatus(item.id, "rejected")}>
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteAd(item.id)} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          {loadingUsers ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" />
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user: any) => (
                <div key={user.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                    {(user.full_name || user.username || "U")[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{user.full_name || user.username || "No name"}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Role: {user.role || "member"}</p>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">{moment(user.created_at).fromNow()}</span>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-10 text-[var(--text-secondary)]">No users found.</div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
