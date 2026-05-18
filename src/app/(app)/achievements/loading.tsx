import { Skeleton, SkeletonCard, SkeletonRow, SkeletonCircle } from "@/src/components/ui/skeleton";

export default function AchievementsLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Tab buttons */}
      <SkeletonRow gap={8}>
        <Skeleton width={100} height={30} radius="var(--radius-sm)" />
        <Skeleton width={80} height={30} radius="var(--radius-sm)" />
        <Skeleton width={88} height={30} radius="var(--radius-sm)" />
      </SkeletonRow>

      {/* Skill tree area */}
      <SkeletonCard padding="24px" style={{ minHeight: 320 }}>
        <Skeleton width={120} height={11} style={{ marginBottom: 20 }} />
        {/* Simulated skill tree nodes */}
        <div style={{ position: "relative", height: 260 }}>
          {/* Row 1 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 60, marginBottom: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <SkeletonCircle size={52} />
              <Skeleton width={48} height={8} />
            </div>
          </div>
          {/* Row 2 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 60, marginBottom: 40 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <SkeletonCircle size={44} />
                <Skeleton width={44} height={7} />
              </div>
            ))}
          </div>
          {/* Row 3 */}
          <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                <SkeletonCircle size={36} style={{ opacity: 0.6 }} />
                <Skeleton width={36} height={6} />
              </div>
            ))}
          </div>
        </div>
      </SkeletonCard>

      {/* Badges grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} padding="16px" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <SkeletonCircle size={44} style={{ opacity: i < 3 ? 1 : 0.4 }} />
            <Skeleton width={70} height={9} />
            <Skeleton width={90} height={7} />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
