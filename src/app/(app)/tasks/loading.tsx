import { Skeleton, SkeletonCard, SkeletonRow } from "@/src/components/ui/skeleton";

function TaskCardSkeleton({ titleWidth = "70%" }: { titleWidth?: string }) {
  return (
    <SkeletonCard padding="14px 16px" style={{ marginBottom: 8 }}>
      <Skeleton width={titleWidth} height={10} style={{ marginBottom: 8 }} />
      <SkeletonRow gap={6}>
        <Skeleton width={44} height={16} radius={8} />
        <Skeleton width={36} height={16} radius={8} />
        <div style={{ flex: 1 }} />
        <Skeleton width={24} height={16} radius="var(--radius-sm)" />
      </SkeletonRow>
    </SkeletonCard>
  );
}

export default function TasksLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <SkeletonRow>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width={120} height={18} />
          <Skeleton width={80} height={9} />
        </div>
        <div style={{ flex: 1 }} />
        {/* View toggle */}
        <Skeleton width={72} height={28} radius="var(--radius-sm)" style={{ marginRight: 8 }} />
        <Skeleton width={100} height={32} radius="var(--radius-sm)" />
      </SkeletonRow>

      {/* Kanban: 3 columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {["Por hacer", "En progreso", "Completado"].map((col, ci) => (
          <div key={ci}>
            <SkeletonRow style={{ marginBottom: 12 }}>
              <Skeleton width={8} height={8} radius="50%" />
              <Skeleton width={80} height={10} />
              <div style={{ flex: 1 }} />
              <Skeleton width={20} height={16} radius="var(--radius-sm)" />
            </SkeletonRow>
            {[...Array(ci === 0 ? 4 : ci === 1 ? 2 : 3)].map((_, i) => (
              <TaskCardSkeleton
                key={i}
                titleWidth={`${45 + ((i + ci) % 4) * 10}%`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
