import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield, Newspaper, Car, Building2, Map, Users,
  CheckCircle, XCircle, Trash2, Loader2, Upload, Plus, Eye
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("news");
  const queryClient = useQueryClient();

  // News form state
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("other");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u.role !== "admin") {
        window.location.href = "/";
        return;
      }
      setUser(u);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: localNews = [] } = useQuery({
    queryKey: ["adminLocalNews"],
    queryFn: () => base44.entities.LocalNews.list("-created_date", 50),
  });

  const { data: pendingCars = [] } = useQuery({
    queryKey: ["pendingCars"],
    queryFn: () => base44.entities.CarListing.filter({ status: "pending" }),
  });

  const { data: pendingHouses = [] } = useQuery({
    queryKey: ["pendingHouses"],
    queryFn: () => base44.entities.HouseListing.filter({ status: "pending" }),
  });

  const { data: pendingLands = [] } = useQuery({
    queryKey: ["pendingLands"],
    queryFn: () => base44.entities.LandListing.filter({ status: "pending" }),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => base44.entities.User.list("-created_date", 50),
  });

  const publishNews = async () => {
    if (!headline) return toast.error("Headline is required");
    setPublishing(true);
    await base44.entities.LocalNews.create({
      headline, summary, content, image_url: imageUrl, category,
      status: "published", publish_date: new Date().toISOString(), is_featured: false
    });
    setHeadline(""); setSummary(""); setContent(""); setImageUrl("");
    setPublishing(false);
    queryClient.invalidateQueries({ queryKey: ["adminLocalNews"] });
    toast.success("News published!");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
  };

  const approveAd = async (type, id) => {
    const entityMap = { car: "CarListing", house: "HouseListing", land: "LandListing" };
    await base44.entities[entityMap[type]].update(id, { status: "approved" });
    queryClient.invalidateQueries();
    toast.success("Ad approved!");
  };

  const rejectAd = async (type, id) => {
    const entityMap = { car: "CarListing", house: "HouseListing", land: "LandListing" };
    await base44.entities[entityMap[type]].update(id, { status: "rejected" });
    queryClient.invalidateQueries();
    toast.success("Ad rejected");
  };

  const deleteAd = async (type, id) => {
    const entityMap = { car: "CarListing", house: "HouseListing", land: "LandListing" };
    await base44.entities[entityMap[type]].delete(id);
    queryClient.invalidateQueries();
    toast.success("Ad deleted");
  };

  const deleteNews = async (id) => {
    await base44.entities.LocalNews.delete(id);
    queryClient.invalidateQueries({ queryKey: ["adminLocalNews"] });
    toast.success("News deleted");
  };

  const allPending = [
    ...pendingCars.map(c => ({ ...c, _type: "car" })),
    ...pendingHouses.map(h => ({ ...h, _type: "house" })),
    ...pendingLands.map(l => ({ ...l, _type: "land" })),
  ];

  if (!user) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)]">Admin Panel</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Published News", value: localNews.filter(n => n.status === "published").length, color: "from-amber-400 to-amber-600" },
          { label: "Pending Ads", value: allPending.length, color: "from-yellow-400 to-yellow-600" },
          { label: "Users", value: users.length, color: "from-blue-400 to-blue-600" },
          { label: "Total Ads", value: pendingCars.length + pendingHouses.length + pendingLands.length, color: "from-green-400 to-green-600" },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-5">
            <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
            <p className="text-xs text-[var(--text-secondary)]">{s.label}</p>
          </div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="news"><Newspaper className="w-4 h-4 mr-1" /> Publish News</TabsTrigger>
          <TabsTrigger value="manage-news"><Eye className="w-4 h-4 mr-1" /> Manage News</TabsTrigger>
          <TabsTrigger value="ads"><CheckCircle className="w-4 h-4 mr-1" /> Approve Ads ({allPending.length})</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Create Local News</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Headline *</Label><Input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Enter headline..." /></div>
              <div><Label>Summary</Label><Input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Short summary..." /></div>
              <div><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="Full article content..." /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["politics", "economy", "society", "culture", "sports", "technology", "other"].map(c => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Image</Label>
                  <div className="flex gap-2">
                    <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL or upload..." className="flex-1" />
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild><span><Upload className="w-4 h-4" /></span></Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  {imageUrl && <img src={imageUrl} alt="" className="mt-2 w-32 h-20 object-cover rounded-lg" />}
                </div>
              </div>
              <Button onClick={publishNews} disabled={publishing} className="bg-amber-500 hover:bg-amber-600 text-white">
                {publishing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Publish Now
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-news">
          <div className="space-y-3">
            {localNews.map(n => (
              <div key={n.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                {n.image_url && <img src={n.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{n.headline}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${n.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"} border-0 text-[10px]`}>{n.status}</Badge>
                    <span className="text-xs text-[var(--text-secondary)]">{moment(n.created_date).fromNow()}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteNews(n.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ads">
          {allPending.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">
              <CheckCircle className="w-12 h-12 mx-auto opacity-30 mb-3" />
              <p>No pending ads to review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allPending.map(item => (
                <div key={item.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.images?.[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200"} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px] uppercase">{item._type}</Badge>
                      <h3 className="font-bold text-sm truncate">{item.title}</h3>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{item.city} • ${item.price?.toLocaleString()} • by {item.created_by}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => approveAd(item._type, item.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => rejectAd(item._type, item.id)}>
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteAd(item._type, item.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                  {(u.full_name || u.email)?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{u.full_name || "No name"}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{u.email}</p>
                </div>
                <Badge className={`${u.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"} border-0`}>{u.role}</Badge>
                <span className="text-xs text-[var(--text-secondary)]">{moment(u.created_date).fromNow()}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}