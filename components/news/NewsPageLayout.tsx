"use client";

import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import { useEffect, useState } from "react";
import { supabase } from "@/api/supabaseClient";

type CommentRow = {
  id: number;
  content: string;
  created_at: string | null;
  user_id: string | null;
  profiles?: {
    full_name: string | null;
  } | null;
};

function RelativeTime({ date }: { date?: string | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!date || !mounted) {
    return <>Recently</>;
  }

  return <>{moment(date).fromNow()}</>;
}

function FeaturedStory({ article, onReadMore }: { article: any; onReadMore: () => void }) {
  if (!article) return null;
  return (
    <div className="relative rounded-2xl overflow-hidden mb-10 group">
      <div className="aspect-[21/9] md:aspect-[21/8]">
        <img
          src={article.image || "https://images.pexels.com/photos/10131170/pexels-photo-10131170.jpeg"}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-full ${article.tagColor || "bg-amber-500"} mb-3`}>
          Featured
        </span>
        <h1 className="text-2xl md:text-4xl font-black text-white leading-tight mb-2">{article.title}</h1>
        {article.description && (
          <p className="text-white/70 text-sm md:text-base max-w-2xl line-clamp-2">{article.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-white/50 text-xs">
          {article.source && <span>{article.source}</span>}
          {article.date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /><RelativeTime date={article.date} /></span>}
        </div>
        <button
          onClick={onReadMore}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors"
        >
          Read More
          <span aria-hidden>›</span>
        </button>
      </div>
    </div>
  );
}

function ArticleCard({ article, index, onClick }: { article: any; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group bg-[var(--bg-card)] rounded-xl overflow-hidden border border-[var(--border)] hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        <img
          src={article.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600"}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm text-[var(--text-primary)] line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-2">{article.description}</p>
        )}
        <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)]">
          {article.source && <span>{article.source}</span>}
          {article.date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /><RelativeTime date={article.date} /></span>}
        </div>
      </div>
    </motion.div>
  );
}

function TrendingSidebar({ articles }: { articles: any[] }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
      <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <div className="w-1 h-5 bg-amber-500 rounded-full" />
        Trending Now
      </h3>
      <div className="space-y-4">
        {articles.slice(0, 5).map((a, i) => (
          <div key={i} className="flex gap-3 group cursor-pointer">
            <span className="text-2xl font-black text-amber-500/30 w-8 flex-shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-amber-600 transition-colors">{a.title}</p>
              {a.date && <p className="text-[10px] text-[var(--text-secondary)] mt-1"><RelativeTime date={a.date} /></p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type NewsPageLayoutProps = {
  title: string;
  tagColor: string;
  articles: any[];
  enableComments?: boolean;
};


export default function NewsPageLayout({
  title,
  tagColor,
  articles,
  enableComments = false,
}: NewsPageLayoutProps) {

  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const featured = articles?.[0] ?? null;
  const remaining = articles?.slice(1) ?? [];
  const selectedArticleId = selectedArticle?.id ?? null;
  const selectedBodyText = (selectedArticle?.content || selectedArticle?.description || "")
    .replace(/<[^>]*>/g, "")
    .trim();

  useEffect(() => {
    const loadComments = async () => {
      if (!enableComments || !selectedArticleId) {
        setComments([]);
        return;
      }

      const { data, error } = await (supabase
        .from("comments") as any)
        .select("id, content, created_at, user_id, profiles(full_name)")
        .eq("article_id", selectedArticleId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        setCommentError("Could not load comments.");
        return;
      }

      setCommentError(null);
      setComments((data || []) as CommentRow[]);
    };

    loadComments();
  }, [enableComments, selectedArticleId]);

  useEffect(() => {
    if (!enableComments) {
      setCurrentUserId(null);
      return;
    }

    let isMounted = true;

    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (isMounted) {
        setCurrentUserId(data.user?.id || null);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [enableComments]);

  const handleSubmitComment = async () => {
    if (!enableComments || !selectedArticleId || !commentText.trim()) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setCommentError("Please sign in to comment.");
      setIsSubmittingComment(false);
      return;
    }

    const { error: insertError } = await supabase.from("comments").insert({
      article_id: selectedArticleId,
      content: commentText.trim(),
      user_id: authData.user.id,
    });

    if (insertError) {
      setCommentError(insertError.message || "Could not post comment.");
      setIsSubmittingComment(false);
      return;
    }

    const { data, error } = await (supabase
      .from("comments") as any)
      .select("id, content, created_at, user_id, profiles(full_name)")
      .eq("article_id", selectedArticleId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error) {
      setComments((data || []) as CommentRow[]);
    }

    setCommentText("");
    setIsSubmittingComment(false);
  };

  if (!articles?.length) {
    return <p>No articles available</p>;
  }


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-1.5 h-10 rounded-full ${tagColor || "bg-amber-500"}`} />
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">{title}</h1>
      </div>

      <FeaturedStory article={featured} onReadMore={() => setSelectedArticle(featured)} />

      {selectedArticle ? (
        <div className="mb-10">
          <button onClick={() => setSelectedArticle(null)} className="text-sm text-amber-600 hover:text-amber-500 mb-4 flex items-center gap-1">
            ← Back to articles
          </button>
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 md:p-10">
            {selectedArticle.image && (
              <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full rounded-xl mb-6 max-h-96 object-cover" />
            )}
            <h2 className="text-2xl md:text-3xl font-black mb-4">{selectedArticle.title}</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{selectedBodyText}</p>

            {enableComments && selectedArticleId && (
              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Comments</h3>

                <div className="space-y-3 mb-4">
                  {comments.length === 0 ? (
                    <p className="text-sm text-[var(--text-secondary)]">No comments yet.</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="rounded-lg border border-[var(--border)] p-3">
                        <p className="text-xs font-semibold text-[var(--text-secondary)] mb-1">
                          {comment.profiles?.full_name || (comment.user_id ? `User ${comment.user_id.slice(0, 8)}` : "Unknown User")}
                        </p>
                        <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{comment.content}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-2">
                          <RelativeTime date={comment.created_at} />
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {currentUserId ? (
                  <>
                    <textarea
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      className="w-full min-h-[100px] rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Write a comment..."
                    />

                    {commentError && (
                      <p className="text-sm text-red-500 mt-2">{commentError}</p>
                    )}

                    <button
                      onClick={handleSubmitComment}
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">Please sign in to write a comment.</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
            {remaining.map((a, i) => (
              <ArticleCard key={i} article={a} index={i} onClick={() => setSelectedArticle(a)} />
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TrendingSidebar articles={articles} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
