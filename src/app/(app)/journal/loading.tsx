import { Skeleton, SkeletonCard, SkeletonRow } from "@/src/components/ui/skeleton";

export default function JournalLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <SkeletonRow style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width={130} height={18} />
          <Skeleton width={90} height={9} />
        </div>
        <div style={{ flex: 1 }} />
        <Skeleton width={120} height={32} radius="var(--radius-sm)" />
      </SkeletonRow>

      {/* Entry cards */}
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} padding="20px">
          {/* Date + mood */}
          <SkeletonRow style={{ marginBottom: 12 }}>
            <Skeleton width={90} height={9} />
            <div style={{ flex: 1 }} />
            {/* Mood dots */}
            {[...Array(5)].map((_, j) => (
              <Skeleton key={j} width={10} height={10} radius="50%" style={{ opacity: j < 3 ? 1 : 0.3 }} />
            ))}
          </SkeletonRow>

          {/* Title */}
          <Skeleton width={`${50 + i * 7}%`} height={14} style={{ marginBottom: 10 }} />

          {/* Body preview lines */}
          <Skeleton width="100%" height={9} style={{ marginBottom: 5 }} />
          <Skeleton width="85%" height={9} style={{ marginBottom: 5 }} />
          {i < 2 && <Skeleton width="60%" height={9} style={{ marginBottom: 12 }} />}

          {/* Tags */}
          <SkeletonRow gap={6}>
            <Skeleton width={52} height={18} radius={9} />
            <Skeleton width={40} height={18} radius={9} />
            {i === 0 && <Skeleton width={64} height={18} radius={9} />}
          </SkeletonRow>
        </SkeletonCard>
      ))}

      {/* Load more */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
        <Skeleton width={100} height={28} radius="var(--radius-sm)" />
      </div>
    </div>
  );
}
