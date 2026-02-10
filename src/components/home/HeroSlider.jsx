import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSlider({ localNews, worldNews, footballNews }) {
  const [current, setCurrent] = useState(0);

  const slides = [
    ...(localNews || []).slice(0, 2).map(n => ({
      ...n, tag: "Local News", tagColor: "bg-amber-500",
      link: createPageUrl("LocalNews"), image: n.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200"
    })),
    ...(worldNews || []).slice(0, 2).map(n => ({
      headline: n.title, summary: n.description, tag: "World News", tagColor: "bg-blue-600",
      link: createPageUrl("WorldNews"), image: n.urlToImage || "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200"
    })),
    ...(footballNews || []).slice(0, 2).map(n => ({
      headline: n.title, summary: n.description, tag: "Football", tagColor: "bg-green-600",
      link: createPageUrl("FootballNews"), image: n.urlToImage || "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200"
    })),
  ];

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => setCurrent(p => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative h-[500px] bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
        <p className="text-white/60 text-lg">Loading latest news...</p>
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div className="relative h-[520px] md:h-[580px] overflow-hidden bg-slate-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-full ${slide.tagColor} mb-4`}>
              {slide.tag}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
              {slide.headline}
            </h1>
            {slide.summary && (
              <p className="text-white/70 text-base md:text-lg line-clamp-2 mb-4">
                {slide.summary}
              </p>
            )}
            <Link
              to={slide.link}
              className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm hover:text-amber-300 transition-colors"
            >
              Read More <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-amber-400 w-8" : "bg-white/30 hover:bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCurrent(p => (p - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrent(p => (p + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}