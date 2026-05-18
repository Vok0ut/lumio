import { Skeleton, SkeletonCard, SkeletonRow } from "@/src/components/ui/skeleton";

export default function StatsLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <Skeleton width={160} height={18} style={{ marginBottom: 4 }} />

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} padding="18px">
            <Skeleton width={70} height={8} style={{ marginBottom: 10 }} />
            <Skeleton width={52} height={22} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={28} radius="var(--radius-sm)" />
          </SkeletonCard>
        ))}
      </div>

      {/* Weekly bar charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[...Array(2)].map((_, ci) => (
          <SkeletonCard key={ci} padding="20px">
            <Skeleton width={110} height={10} style={{ marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 100 }}>
              {[...Array(7)].map((_, i) => {
                const heights = [60, 80, 45, 90, 70, 55, 85];
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <Skeleton width="100%" height={heights[(i + ci * 3) % 7]} radius="var(--radius-sm)" />
                    <Skeleton width={16} height={7} />
                  </div>
                );
              })}
            </div>
          </SkeletonCard>
        ))}
      </div>

      {/* Activity heatmap */}
      <SkeletonCard padding="20px">
        <SkeletonRow style={{ marginBottom: 14 }}>
          <Skeleton width={120} height={11} />
          <div style={{ flex: 1 }} />
          <SkeletonRow gap={6}>
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} gap={4}>
                <Skeleton width={10} height={10} radius={2} style={{ opacity: 0.2 + i * 0.18 }} />
                <Skeleton width={20} height={7} />
              </SkeletonRow>
            ))}
          </SkeletonRow>
        </SkeletonRow>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(18, 1fr)", gap: 3 }}>
          {[...Array(18 * 12)].map((_, i) => (
            <Skeleton key={i} width="100%" height={14} radius={2} style={{ opacity: Math.random() * 0.7 + 0.1 }} />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
