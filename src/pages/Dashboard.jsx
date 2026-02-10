import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Plus, Heart, MessageSquare, Trash2,
  Pencil, Car, Building2, Map, Loader2, Clock, CheckCircle, XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CreateAdForm from "../components/dashboard/CreateAdForm";
import moment from "moment";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("ads");
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: cars = [] } = useQuery({
    queryKey: ["myCars", user?.email],
    queryFn: () => base44.entities.CarListing.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: houses = [] } = useQuery({
    queryKey: ["myHouses", user?.email],
    queryFn: () => base44.entities.HouseListing.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: lands = [] } = useQuery({
    queryKey: ["myLands", user?.email],
    queryFn: () => base44.entities.LandListing.filter({ created_by: user.email }),
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["myMessages", user?.email],
    queryFn: () => base44.entities.Message.filter({ to_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["myFavorites", user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const allAds = [
    ...cars.map(c => ({ ...c, _type: "car", _icon: Car })),
    ...houses.map(h => ({ ...h, _type: "house", _icon: Building2 })),
    ...lands.map(l => ({ ...l, _type: "land", _icon: Map })),
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const deleteListing = async (item) => {
    const entityMap = { car: "CarListing", house: "HouseListing", land: "LandListing" };
    await base44.entities[entityMap[item._type]].delete(item.id);
    queryClient.invalidateQueries();
    toast.success("Listing deleted");
  };

  const statusColor = { pending: "bg-yellow-100 text-yellow-800", approved: "bg-green-100 text-green-800", rejected: "bg-red-100 text-red-800" };

  if (!user) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-secondary)]">Welcome, {user.full_name || user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "My Ads", value: allAds.length, icon: LayoutDashboard, color: "from-amber-400 to-amber-600" },
          { label: "Messages", value: messages.length, icon: MessageSquare, color: "from-blue-400 to-blue-600" },
          { label: "Favorites", value: favorites.length, icon: Heart, color: "from-red-400 to-red-600" },
          { label: "Approved", value: allAds.filter(a => a.status === "approved").length, icon: CheckCircle, color: "from-green-400 to-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
            <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="ads">My Ads</TabsTrigger>
          <TabsTrigger value="create">Create Ad</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="ads">
          {allAds.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">
              <LayoutDashboard className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <p>No ads yet. Create your first listing!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allAds.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.images?.[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <item._icon className="w-4 h-4 text-[var(--text-secondary)]" />
                      <h3 className="font-bold text-sm truncate">{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColor[item.status]} border-0 text-[10px]`}>{item.status}</Badge>
                      <span className="text-xs text-[var(--text-secondary)]">{moment(item.created_date).fromNow()}</span>
                    </div>
                  </div>
                  <span className="font-bold text-amber-600">${item.price?.toLocaleString()}</span>
                  <Button variant="ghost" size="icon" onClick={() => deleteListing(item)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader><CardTitle>Create New Listing</CardTitle></CardHeader>
            <CardContent>
              <CreateAdForm onSuccess={() => { queryClient.invalidateQueries(); setTab("ads"); }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">
              <MessageSquare className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={m.id} className={`bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5 ${!m.is_read ? "border-l-4 border-l-amber-500" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{m.from_name || m.from_email}</span>
                    <span className="text-xs text-[var(--text-secondary)]">{moment(m.created_date).fromNow()}</span>
                  </div>
                  {m.subject && <p className="text-sm font-medium mb-1">{m.subject}</p>}
                  <p className="text-sm text-[var(--text-secondary)]">{m.body}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">
              <Heart className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <p>No favorites yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((f, i) => (
                <div key={f.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <div>
                    <p className="text-sm font-medium capitalize">{f.listing_type} Listing</p>
                    <p className="text-xs text-[var(--text-secondary)]">ID: {f.listing_id}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={async () => {
                    await base44.entities.Favorite.delete(f.id);
                    queryClient.invalidateQueries();
                  }}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}