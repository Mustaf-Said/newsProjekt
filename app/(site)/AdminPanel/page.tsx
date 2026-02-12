"use client";

import { useState } from "react";
import { Shield } from "lucide-react";

export default function AdminPanel() {
  const [tab, setTab] = useState("news");
  const [publishing, setPublishing] = useState(false);

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

      <div className="text-center py-20">
        <Shield className="w-16 h-16 mx-auto text-[var(--text-secondary)] opacity-30 mb-4" />
        <p className="text-lg font-semibold text-[var(--text-secondary)]">Admin panel temporarily unavailable</p>
        <p className="text-sm text-[var(--text-secondary)]">This feature is currently being updated</p>
      </div>
    </div>
  );
}

    <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} placeholder="Full article content..." /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {["politics", "economy", "society", "culture", "sports", "technology", "other"].map((c) => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Image</Label>
        <div className="flex gap-2">
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL or upload..." className="flex-1" />
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
  </CardContent >
</Card >
  </TabsContent >

  <TabsContent value="manage-news">
    <div className="space-y-3">
      {localNews.map((n: any) => (
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
        {allPending.map((item: any) => (
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
      {users.map((u: any) => (
        <div key={u.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
            {(u.full_name || u.email)?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm">{u.full_name || "No name"}</p>
            <p className="text-xs text-[var(--text-secondary)]">{u.email}</p>
          </div>
          <span className="text-xs text-[var(--text-secondary)]">{moment(u.created_date).fromNow()}</span>
        </div>
      ))}
    </div>
  </TabsContent>
</Tabs >
    </div >
  );
}
