"use client";

import Link from "next/link";
import { createPageUrl } from "@/utils";
import { Clock, ArrowRight, X } from "lucide-react";
import { motion } from "framer-motion";
import moment from "moment";
import { useState } from "react";

function NewsCard({ article, index, onClick }: { article: any; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="group bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--border)] cursor-pointer"
    >
      <div className="relative overflow-hidden aspect-[16/10]">
        <img
          src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=600"}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white rounded-full ${article.tagColor || "bg-slate-700"}`}>
            {article.tag}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-[var(--text-primary)] line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
          {article.title}
        </h3>
        {article.description && (
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">{article.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.date ? moment(article.date).fromNow() : "Recently"}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ArticleModal({ article, onClose }: { article: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--bg-card)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border)]"
      >
        <div className="sticky top-0 bg-[var(--bg-card)] flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex-1">Article</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {article.image && (
            <img src={article.image} alt={article.title} className="w-full rounded-xl mb-6 max-h-80 object-cover" />
          )}
          <h1 className="text-2xl md:text-3xl font-black mb-4 text-[var(--text-primary)]">{article.title}</h1>
          <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{article.description}</p>
          <div className="flex items-center gap-4 mt-6 text-sm text-[var(--text-secondary)]">
            <span className={`px-2 py-1 rounded-full text-white text-xs font-bold ${article.tagColor || "bg-slate-700"}`}>
              {article.tag}
            </span>
            {article.date && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {moment(article.date).fromNow()}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

type NewsGridProps = {
  title: string;
  articles: any[];
  viewAllPage?: string;
  tagColor?: string;
};

export default function NewsGrid({ title, articles, viewAllPage, tagColor }: NewsGridProps) {
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-8 rounded-full ${tagColor || "bg-amber-500"}`} />
          <h2 className="text-2xl font-black text-[var(--text-primary)]">{title}</h2>
        </div>
        {viewAllPage && (
          <Link
            href={createPageUrl(viewAllPage)}
            className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-500 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.slice(0, 6).map((article, i) => (
          <NewsCard 
            key={i} 
            article={article} 
            index={i}
            onClick={() => setSelectedArticle(article)}
          />
        ))}
      </div>
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </section>
  );
}
