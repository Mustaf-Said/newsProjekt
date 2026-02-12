"use client";

import { Clock } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";

function FeaturedStory({ article }: { article: any }) {
  if (!article) return null;
  return (
    <div className="relative rounded-2xl overflow-hidden mb-10 group">
      <div className="aspect-[21/9] md:aspect-[21/8]">
        <img
          src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200"}
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
          {article.date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{moment(article.date).fromNow()}</span>}
        </div>
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
          {article.date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{moment(article.date).fromNow()}</span>}
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
              {a.date && <p className="text-[10px] text-[var(--text-secondary)] mt-1">{moment(a.date).fromNow()}</p>}
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
  selectedArticle: any;
  onSelectArticle: (article: any) => void;
};

export default function NewsPageLayout({ title, tagColor, articles, selectedArticle, onSelectArticle }: NewsPageLayoutProps) {
  const featured = articles[0];
  const remaining = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-1.5 h-10 rounded-full ${tagColor || "bg-amber-500"}`} />
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">{title}</h1>
      </div>

      <FeaturedStory article={featured} />

      {selectedArticle ? (
        <div className="mb-10">
          <button onClick={() => onSelectArticle(null)} className="text-sm text-amber-600 hover:text-amber-500 mb-4 flex items-center gap-1">
            ← Back to articles
          </button>
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 md:p-10">
            {selectedArticle.image && (
              <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full rounded-xl mb-6 max-h-96 object-cover" />
            )}
            <h2 className="text-2xl md:text-3xl font-black mb-4">{selectedArticle.title}</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">{selectedArticle.description || selectedArticle.content}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
            {remaining.map((a, i) => (
              <ArticleCard key={i} article={a} index={i} onClick={() => onSelectArticle(a)} />
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
