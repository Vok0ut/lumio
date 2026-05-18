"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Icon } from "@/src/components/ui/icons";
import { useIsMobile } from "@/src/hooks/use-mobile";

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
  if (d < 7)  return `${d}d`;
  return `${Math.floor(d / 7)}sem`;
}

function Avatar({ user, size = 36 }: { user: Author; size?: number }) {
  const initials = (user.name ?? "?")[0].toUpperCase();
  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt={user.name ?? ""}
        style={{
          width: size, height: size, borderRadius: "50%", objectFit: "cover",
          border: "2px solid var(--border-mid)", flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, rgba(196,145,58,0.15), rgba(255,255,255,0.05))",
      border: "2px solid var(--border-mid)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)", fontSize: size * 0.38, fontWeight: 700, color: "var(--text-mid)",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* ── Post Card ─── */

function PostCard({
  post,
  onReact,
}: {
  post: Post;
  onReact: (postId: string, emoji: Emoji) => void;
}) {
  const totalReactions = ALLOWED_EMOJIS.reduce((sum, e) =>
    sum + (post.reactions[e]?.count ?? 0), 0);

  return (
    <div style={{
      background: "var(--bg-surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* Post header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 18px 0",
      }}>
        <Avatar user={post.author} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600,
              color: "var(--text-hi)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {post.author.name ?? "Usuario"}
            </span>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-lo)",
            }}>
              · {timeAgo(post.createdAt)}
            </span>
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            marginTop: 2,
            padding: "2px 8px",
            background: "var(--xp-lo)",
            border: "1px solid var(--xp-mid)",
            borderRadius: 999,
            fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--xp)",
            fontWeight: 500,
          }}>
            <Icon name="target" size={9} color="var(--xp)" />
            {post.goalCategory}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 18px 16px" }}>
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--text-hi)",
          lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {post.content}
        </p>
      </div>

      {/* Reactions bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 18px",
        borderTop: "1px solid var(--border)",
        background: "rgba(255,255,255,0.01)",
      }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {ALLOWED_EMOJIS.map((emoji) => {
            const r = post.reactions[emoji] ?? { count: 0, reacted: false };
            return (
              <button
                key={emoji}
                onClick={() => onReact(post.id, emoji)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  background: r.reacted ? "var(--xp-lo)" : "transparent",
                  border: `1px solid ${r.reacted ? "var(--xp-mid)" : "transparent"}`,
                  borderRadius: 999, padding: "4px 10px",
                  cursor: "pointer", fontSize: 14,
                  color: r.reacted ? "var(--xp)" : "var(--text-mid)",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!r.reacted) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (!r.reacted) e.currentTarget.style.background = "transparent";
                }}
              >
                {emoji}
                {r.count > 0 && (
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                    {r.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {totalReactions > 0 && (
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-lo)" }}>
            {totalReactions} {totalReactions === 1 ? "reaccion" : "reacciones"}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ─── */

export default function CommunityPage() {
  const isMobile = useIsMobile();
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

  const [postError, setPostError] = useState("");

  const handleSubmit = async () => {
    if (!draft.trim() || !draftCategory || submitting) return;
    setSubmitting(true);
    setPostError("");
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim(), goalCategory: draftCategory }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al publicar");
      }
      setDraft("");
      setComposing(false);
      setPostError("");
      loadInitial(selectedCategory);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  const allCategories = [...new Set([...myCategories])];

  return (
    <div className="section-inner">
      {/* Hero header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(196,145,58,0.06), rgba(255,255,255,0.02))",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: isMobile ? "20px 16px" : "24px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "var(--radius-sm)",
              background: "var(--xp-lo)", border: "1px solid var(--xp-mid)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="users" size={16} color="var(--xp)" />
            </div>
            <h1 style={{
              fontFamily: "var(--font-sans)", fontSize: isMobile ? 20 : 24, fontWeight: 700,
              color: "var(--text-hi)", letterSpacing: "-0.02em", margin: 0,
            }}>
              Comunidad
            </h1>
          </div>
          <p style={{
            fontSize: 12, color: "var(--text-lo)", fontFamily: "var(--font-mono)",
            margin: 0, lineHeight: 1.5,
          }}>
            Comparte consejos y estrategias con personas que comparten tus metas
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setComposing((c) => !c); setTimeout(() => textareaRef.current?.focus(), 50); }}
          style={{ flexShrink: 0 }}
        >
          <Icon name="plus" size={14} color="#090909" />
          Publicar
        </button>
      </div>

      {/* Compose box */}
      {composing && (
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--xp-mid)",
          borderRadius: "var(--radius-lg)",
          padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 12,
          boxShadow: "0 0 24px rgba(196,145,58,0.06)",
        }}>
          {postError && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "var(--radius-sm)", padding: "10px 14px",
              fontFamily: "var(--font-mono)", fontSize: 12, color: "#ef4444", textAlign: "center",
            }}>
              {postError}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--text-hi)" }}>
              Nueva publicacion
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                Crea metas para publicar en su categoria
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
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-hi)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: "12px 16px",
              resize: "vertical",
              outline: "none",
              lineHeight: 1.6,
            }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: draft.length > 450 ? "var(--streak)" : "var(--text-lo)", fontFamily: "var(--font-mono)" }}>
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

      {/* Category filter pills */}
      {allCategories.length > 0 && (
        <div style={{
          display: "flex", gap: 6, flexWrap: "wrap",
          padding: "2px 0",
        }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: "6px 14px",
              background: selectedCategory === null ? "var(--xp-lo)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${selectedCategory === null ? "var(--xp-mid)" : "var(--border)"}`,
              borderRadius: 999, cursor: "pointer",
              fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
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
                padding: "6px 14px",
                background: selectedCategory === cat ? "var(--xp-lo)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${selectedCategory === cat ? "var(--xp-mid)" : "var(--border)"}`,
                borderRadius: 999, cursor: "pointer",
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
                color: selectedCategory === cat ? "var(--xp)" : "var(--text-mid)",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)", padding: 20,
            }}>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div className="skeleton" style={{ width: 38, height: 38, borderRadius: "50%" }} />
                <div>
                  <div className="skeleton" style={{ width: 110, height: 12, borderRadius: 4 }} />
                  <div style={{ height: 6 }} />
                  <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 999 }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: "95%", height: 12, borderRadius: 4 }} />
              <div style={{ height: 6 }} />
              <div className="skeleton" style={{ width: "75%", height: 12, borderRadius: 4 }} />
              <div style={{ height: 6 }} />
              <div className="skeleton" style={{ width: "60%", height: 12, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "48px 20px", textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Icon name="users" size={24} color="var(--text-lo)" />
          </div>
          <p style={{ fontSize: 14, color: "var(--text-mid)", fontFamily: "var(--font-sans)", fontWeight: 500 }}>
            {myCategories.length === 0
              ? "Crea metas para unirte a tu comunidad"
              : "Se el primero en compartir un consejo"}
          </p>
          <p style={{ fontSize: 11, color: "var(--text-lo)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
            {myCategories.length === 0
              ? "Las publicaciones se filtran por categorias de tus metas"
              : "Tu comunidad vera publicaciones sobre las metas que compartis"}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
              {loadingMore ? "Cargando..." : "Cargar mas publicaciones"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
