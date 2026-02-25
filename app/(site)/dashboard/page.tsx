"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { supabase } from "@/api/supabaseClient";
import CreateAdForm from "@/components/dashboard/CreateAdForm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Loader2, MessageCircle, Star } from "lucide-react";

const DEFAULT_LISTING_IMAGE_BY_CATEGORY: Record<string, string> = {
  car: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200",
  house: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200",
  land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200",
  other: "/contactMe.jpg"
};

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: authUser, isLoading: authLoading } = useQuery({
    queryKey: ["dashboard-user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user || null;
    }
  });

  const userId = authUser?.id || null;

  const { data: profile } = useQuery({
    queryKey: ["dashboard-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data || null;
    }
  });

  const { data: myAds = [], isLoading: adsLoading } = useQuery({
    queryKey: ["my-ads", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, status, category, details, listing_type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const { data: messagesCount = 0 } = useQuery({
    queryKey: ["messages-count", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("comments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (error) throw error;
      return count || 0;
    }
  });

  const approvedCount = useMemo(() => myAds.filter((item: any) => item.status === "approved").length, [myAds]);

  const handleAdSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ["my-ads", userId] });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : authUser?.email ? `, ${authUser.email}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "My Ads", value: myAds.length },
          { label: "Messages", value: messagesCount },
          { label: "Favorites", value: 0 },
          { label: "Approved", value: approvedCount }
        ].map((stat) => (
          <Card key={stat.label} className="border border-[var(--border)]">
            <CardContent className="p-5">
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl font-black text-[var(--text-primary)] mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="ads" className="space-y-6">
        <TabsList className="bg-[var(--bg-secondary)]">
          <TabsTrigger value="ads">My Ads</TabsTrigger>
          <TabsTrigger value="create">Create Ad</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="ads">
          {authLoading || adsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" />
            </div>
          ) : myAds.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">No ads yet. Create your first listing.</div>
          ) : (
            <div className="space-y-3">
              {myAds.map((item: any) => {
                const details = item.details || {};
                const category = item.category || "other";
                const image = details.images?.[0] || DEFAULT_LISTING_IMAGE_BY_CATEGORY[category] || DEFAULT_LISTING_IMAGE_BY_CATEGORY.other;
                const price = details.price ? `$${Number(details.price).toLocaleString()}` : "N/A";
                const statusColor = item.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : item.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-800";

                return (
                  <div key={item.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${statusColor} border-0 text-[10px]`}>{item.status}</Badge>
                        <span className="text-xs text-[var(--text-secondary)]">{moment(item.created_at).fromNow()}</span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-amber-600">{price}</div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card className="border border-[var(--border)]">
            <CardContent className="p-6">
              <CreateAdForm onSuccess={handleAdSubmitted} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <div className="text-center py-16 text-[var(--text-secondary)]">
            <MessageCircle className="w-12 h-12 mx-auto opacity-30 mb-3" />
            <p>No messages yet</p>
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="text-center py-16 text-[var(--text-secondary)]">
            <Star className="w-12 h-12 mx-auto opacity-30 mb-3" />
            <p>No favorites yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
