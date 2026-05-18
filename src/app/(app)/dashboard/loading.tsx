import { Skeleton, SkeletonCard, SkeletonRow, SkeletonCircle } from "@/src/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Daily tip card */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        borderLeft: "3px solid rgba(255,255,255,0.08)",
        padding: "14px 16px",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}>
        <Skeleton width={28} height={28} radius="var(--radius-sm)" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width={80} height={8} />
          <Skeleton width="70%" height={11} />
        </div>
      </div>

      {/* Hero strip */}
      <SkeletonCard padding="20px 24px">
        <SkeletonRow>
          <SkeletonCircle size={52} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton width={120} height={12} />
            <Skeleton width="80%" height={8} />
          </div>
          <Skeleton width={48} height={24} radius="var(--radius-sm)" />
        </SkeletonRow>
      </SkeletonCard>

      {/* KPI grid — 4 cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} padding="16px">
            <Skeleton width={60} height={8} style={{ marginBottom: 10 }} />
            <Skeleton width={48} height={22} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={28} radius="var(--radius-sm)" />
          </SkeletonCard>
        ))}
      </div>

      {/* Two-col: habits + tasks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SkeletonCard padding="20px">
          <SkeletonRow style={{ marginBottom: 16 }}>
            <Skeleton width={90} height={11} />
            <div style={{ flex: 1 }} />
            <Skeleton width={40} height={8} />
          </SkeletonRow>
          {[...Array(4)].map((_, i) => (
            <SkeletonRow key={i} style={{ marginBottom: 12 }}>
              <Skeleton width={18} height={18} radius="50%" />
              <Skeleton width="70%" height={10} />
            </SkeletonRow>
          ))}
        </SkeletonCard>

        <SkeletonCard padding="20px">
          <SkeletonRow style={{ marginBottom: 16 }}>
            <Skeleton width={80} height={11} />
            <div style={{ flex: 1 }} />
            <Skeleton width={40} height={8} />
          </SkeletonRow>
          {[...Array(4)].map((_, i) => (
            <SkeletonRow key={i} style={{ marginBottom: 12 }}>
              <Skeleton width={8} height={8} radius="50%" />
              <Skeleton width="65%" height={10} />
              <div style={{ flex: 1 }} />
              <Skeleton width={32} height={16} radius="var(--radius-sm)" />
            </SkeletonRow>
          ))}
        </SkeletonCard>
      </div>

      {/* Two-col: focus timer + missions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SkeletonCard padding="24px" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <Skeleton width={90} height={10} />
          <SkeletonCircle size={120} />
          <SkeletonRow gap={8}>
            <Skeleton width={64} height={28} radius="var(--radius-sm)" />
            <Skeleton width={64} height={28} radius="var(--radius-sm)" />
          </SkeletonRow>
        </SkeletonCard>

        <SkeletonCard padding="20px">
          <Skeleton width={80} height={11} style={{ marginBottom: 16 }} />
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <SkeletonRow style={{ marginBottom: 6 }}>
                <Skeleton width="60%" height={10} />
                <div style={{ flex: 1 }} />
                <Skeleton width={28} height={8} />
              </SkeletonRow>
              <Skeleton width="100%" height={6} radius={3} />
            </div>
          ))}
        </SkeletonCard>
      </div>

      {/* Agenda + heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SkeletonCard padding="20px">
          <Skeleton width={70} height={11} style={{ marginBottom: 14 }} />
          {[...Array(3)].map((_, i) => (
            <SkeletonRow key={i} style={{ marginBottom: 10 }}>
              <Skeleton width={36} height={36} radius="var(--radius-sm)" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <Skeleton width="70%" height={9} />
                <Skeleton width="45%" height={7} />
              </div>
            </SkeletonRow>
          ))}
        </SkeletonCard>

        <SkeletonCard padding="20px">
          <Skeleton width={80} height={11} style={{ marginBottom: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3 }}>
            {[...Array(30)].map((_, i) => (
              <Skeleton key={i} width="100%" height={14} radius={3} style={{ opacity: Math.random() * 0.6 + 0.2 }} />
            ))}
          </div>
        </SkeletonCard>
      </div>
    </div>
  );
}
