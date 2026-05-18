"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@/src/components/ui/icons";
import { TiltCard } from "@/src/components/ui/tilt-card";

const ALLOWED_EMOJIS = ["👍", "🔥", "💡", "❤️", "🎯"] as const;
type Emoji = (typeof ALLOWED_EMOJIS)[number];

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Post {
  id: string;
  content: string;
  goalCategory: string;
  createdAt: string;
  author: Author;
  reactions: Record<Emoji, { count: number; reacted: boolean }>;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function Avatar({ user }: { user: Author }) {
  const initials = (user.name ?? "?")[0].toUpperCase();
  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={user.name ?? ""}
        style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-mid)" }}
      />
    );
  }
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: "var(--bg-raised)", border: "1px solid var(--border-mid)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--text-mid)",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function PostCard({
  post,
  onReact,
}: {
  post: Post;
  onReact: (postId: string, emoji: Emoji) => void;
}) {
  return (
    <TiltCard style={{ padding: "16px 20px" }} max={3} scale={1.005}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Avatar user={post.author} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
            color: "var(--text-hi)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {post.author.name ?? "Usuario"}
          </div>
          <div style={{ fontSize: 10, color: "var(--text-lo)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
            {post.goalCategory} · {timeAgo(post.createdAt)}
          </div>
        </div>
      </div>

      {/* Content */}
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-hi)",
        lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {post.content}
      </p>

      {/* Reactions */}
      <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
        {ALLOWED_EMOJIS.map((emoji) => {
          const r = post.reactions[emoji] ?? { count: 0, reacted: false };
          return (
            <button
              key={emoji}
              onClick={() => onReact(post.id, emoji)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: r.reacted ? "var(--xp-lo)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${r.reacted ? "var(--xp-mid)" : "var(--border)"}`,
                borderRadius: 999, padding: "3px 10px",
                cursor: "pointer", fontSize: 12,
                color: r.reacted ? "var(--xp)" : "var(--text-mid)",
                transition: "all 0.15s",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span style={{ fontSize: 14 }}>{emoji}</span>
              {r.count > 0 && <span style={{ fontSize: 11 }}>{r.count}</span>}
            </button>
          );
        })}
      </div>
    </TiltCard>
  );
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [myCategories, setMyCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // New post form
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftCategory, setDraftCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchPosts = useCallback(async (category: string | null, cursor?: string) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (cursor) params.set("cursor", cursor);
    const r = await fetch(`/api/community/posts?${params}`);
    const data = await r.json();
    return data as { posts: Post[]; nextCursor: string | null; myCategories: string[] };
  }, []);

  const loadInitial = useCallback(async (category: string | null) => {
    setLoading(true);
    try {
      const data = await fetchPosts(category);
      setPosts(data.posts ?? []);
      setNextCursor(data.nextCursor ?? null);
      setMyCategories(data.myCategories ?? []);
      if (!draftCategory && data.myCategories?.[0]) {
        setDraftCategory(data.myCategories[0]);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [fetchPosts, draftCategory]);

  useEffect(() => { loadInitial(selectedCategory); }, [loadInitial, selectedCategory]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchPosts(selectedCategory, nextCursor);
      setPosts((prev) => [...prev, ...(data.posts ?? [])]);
      setNextCursor(data.nextCursor ?? null);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleReact = async (postId: string, emoji: Emoji) => {
    // Optimistic
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p;
      const r = p.reactions[emoji] ?? { count: 0, reacted: false };
      return {
        ...p,
        reactions: {
          ...p.reactions,
          [emoji]: {
            count: r.reacted ? r.count - 1 : r.count + 1,
            reacted: !r.reacted,
          },
        },
      };
    }));

    await fetch(`/api/community/posts/${postId}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    }).catch(() => { loadInitial(selectedCategory); });
  };

  const handleSubmit = async () => {
    if (!draft.trim() || !draftCategory || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim(), goalCategory: draftCategory }),
      });
      if (res.ok) {
        setDraft("");
        setComposing(false);
        loadInitial(selectedCategory);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const allCategories = [...new Set([...myCategories])];

  return (
    <div className="section-inner">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 className="t-title" style={{ fontFamily: "var(--font-sans)", color: "var(--text-hi)" }}>
            Comunidad
          </h1>
          <p style={{ fontSize: 11, color: "var(--text-lo)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
            Comparte consejos con personas que tienen tus mismas metas
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setComposing((c) => !c); setTimeout(() => textareaRef.current?.focus(), 50); }}
        >
          <Icon name="plus" size={14} color="#090909" />
          Publicar
        </button>
      </div>

      {/* Compose box */}
      {composing && (
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-mid)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", gap: 10 }}>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setDraftCategory(cat)}
                style={{
                  padding: "4px 12px",
                  background: draftCategory === cat ? "var(--xp-lo)" : "transparent",
                  border: `1px solid ${draftCategory === cat ? "var(--xp-mid)" : "var(--border)"}`,
                  borderRadius: 999, cursor: "pointer",
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: draftCategory === cat ? "var(--xp)" : "var(--text-mid)",
                  transition: "all 0.15s",
                }}
              >
                {cat}
              </button>
            ))}
            {allCategories.length === 0 && (
              <span style={{ fontSize: 11, color: "var(--text-lo)", fontFamily: "var(--font-mono)" }}>
                Añade metas para publicar en su categoría
              </span>
            )}
          </div>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            placeholder="Comparte un consejo, estrategia o motivación..."
            rows={3}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-hi)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: "10px 14px",
              resize: "vertical",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-lo)", fontFamily: "var(--font-mono)" }}>
              {draft.length}/500
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setComposing(false)}>Cancelar</button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={submitting || !draft.trim() || !draftCategory}
                style={{ opacity: submitting || !draft.trim() || !draftCategory ? 0.5 : 1 }}
              >
                {submitting ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category filter */}
      {allCategories.length > 1 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: "4px 12px",
              background: selectedCategory === null ? "var(--xp-lo)" : "transparent",
              border: `1px solid ${selectedCategory === null ? "var(--xp-mid)" : "var(--border)"}`,
              borderRadius: 999, cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: selectedCategory === null ? "var(--xp)" : "var(--text-mid)",
              transition: "all 0.15s",
            }}
          >
            Todo
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "4px 12px",
                background: selectedCategory === cat ? "var(--xp-lo)" : "transparent",
                border: `1px solid ${selectedCategory === cat ? "var(--xp-mid)" : "var(--border)"}`,
                borderRadius: 999, cursor: "pointer",
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: selectedCategory === cat ? "var(--xp)" : "var(--text-mid)",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Post list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="card" style={{ padding: 20, height: 100, opacity: 0.5 }}>
              <div className="skeleton" style={{ width: "30%", height: 12, borderRadius: 6 }} />
              <div style={{ height: 8 }} />
              <div className="skeleton" style={{ width: "90%", height: 12, borderRadius: 6 }} />
              <div style={{ height: 6 }} />
              <div className="skeleton" style={{ width: "70%", height: 12, borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <Icon name="users" size={28} color="var(--text-lo)" />
          <p style={{ fontSize: 12, color: "var(--text-lo)", fontFamily: "var(--font-mono)", marginTop: 12 }}>
            {myCategories.length === 0
              ? "Añade metas para ver publicaciones de tu comunidad"
              : "Sé el primero en compartir un consejo en tu comunidad"}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onReact={handleReact} />
            ))}
          </div>

          {nextCursor && (
            <button
              className="btn btn-ghost"
              onClick={loadMore}
              disabled={loadingMore}
              style={{ width: "100%", marginTop: 4 }}
            >
              {loadingMore ? "Cargando..." : "Cargar más"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
