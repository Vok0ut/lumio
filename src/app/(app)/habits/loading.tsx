import { Skeleton, SkeletonCard, SkeletonRow } from "@/src/components/ui/skeleton";

export default function HabitsLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <SkeletonRow style={{ marginBottom: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width={140} height={18} />
          <Skeleton width={90} height={9} />
        </div>
        <div style={{ flex: 1 }} />
        <Skeleton width={110} height={32} radius="var(--radius-sm)" />
      </SkeletonRow>

      {/* Habit cards */}
      {[...Array(5)].map((_, i) => (
        <SkeletonCard key={i} padding="18px 20px">
          <SkeletonRow style={{ marginBottom: 14 }}>
            {/* Checkbox */}
            <Skeleton width={22} height={22} radius="var(--radius-sm)" />
            {/* Name + category */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <Skeleton width={`${50 + i * 8}%`} height={11} />
              <SkeletonRow gap={6}>
                <Skeleton width={60} height={16} radius={8} />
                <Skeleton width={80} height={8} />
              </SkeletonRow>
            </div>
            {/* Streak */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
              <Skeleton width={36} height={14} radius="var(--radius-sm)" />
              <Skeleton width={28} height={8} />
            </div>
          </SkeletonRow>

          {/* 28-day mini bar chart */}
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 24 }}>
            {[...Array(28)].map((_, j) => {
              const h = 4 + Math.random() * 16;
              return <Skeleton key={j} width={6} height={h} radius={2} />;
            })}
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
