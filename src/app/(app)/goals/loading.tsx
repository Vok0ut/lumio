import { Skeleton, SkeletonCard, SkeletonRow } from "@/src/components/ui/skeleton";

export default function GoalsLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <SkeletonRow style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width={100} height={18} />
          <Skeleton width={80} height={9} />
        </div>
        <div style={{ flex: 1 }} />
        <Skeleton width={110} height={32} radius="var(--radius-sm)" />
      </SkeletonRow>

      {/* Goal cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} padding="20px">
            {/* Category badge + deadline */}
            <SkeletonRow style={{ marginBottom: 12 }}>
              <Skeleton width={64} height={18} radius={9} />
              <div style={{ flex: 1 }} />
              <Skeleton width={80} height={9} />
            </SkeletonRow>

            {/* Title */}
            <Skeleton width={`${55 + i * 8}%`} height={14} style={{ marginBottom: 14 }} />

            {/* Progress bar */}
            <SkeletonRow style={{ marginBottom: 6 }}>
              <Skeleton width={40} height={8} />
              <div style={{ flex: 1 }} />
              <Skeleton width={32} height={8} />
            </SkeletonRow>
            <Skeleton width="100%" height={6} radius={3} style={{ marginBottom: 14 }} />

            {/* Milestones toggle */}
            <SkeletonRow>
              <Skeleton width={90} height={9} />
              <div style={{ flex: 1 }} />
              <Skeleton width={16} height={16} radius="var(--radius-sm)" />
            </SkeletonRow>
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
