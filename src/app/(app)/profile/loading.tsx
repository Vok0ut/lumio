import { Skeleton, SkeletonCard, SkeletonRow, SkeletonCircle } from "@/src/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 640, margin: "0 auto" }}>

      {/* Avatar + name block */}
      <SkeletonCard padding="28px 24px" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <SkeletonCircle size={96} />
          <Skeleton
            width={28} height={28} radius="50%"
            style={{ position: "absolute", bottom: 0, right: 0 }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Skeleton width={140} height={16} />
          <Skeleton width={180} height={9} />
        </div>
        {/* Badges */}
        <SkeletonRow gap={8}>
          <Skeleton width={64} height={20} radius={10} />
          <Skeleton width={56} height={20} radius={10} />
          <Skeleton width={80} height={20} radius={10} />
        </SkeletonRow>
        {/* XP progress */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
          <SkeletonRow>
            <Skeleton width={60} height={8} />
            <div style={{ flex: 1 }} />
            <Skeleton width={50} height={8} />
          </SkeletonRow>
          <Skeleton width="100%" height={6} radius={3} />
        </div>
      </SkeletonCard>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} padding="14px 12px" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Skeleton width={40} height={18} />
            <Skeleton width={52} height={8} />
          </SkeletonCard>
        ))}
      </div>

      {/* XP history */}
      <SkeletonCard padding="20px">
        <Skeleton width={90} height={11} style={{ marginBottom: 14 }} />
        {[...Array(6)].map((_, i) => (
          <SkeletonRow key={i} style={{ marginBottom: 12 }}>
            <Skeleton width={28} height={28} radius="var(--radius-sm)" />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
              <Skeleton width={`${40 + i * 9}%`} height={9} />
              <Skeleton width={70} height={7} />
            </div>
            <Skeleton width={36} height={16} radius="var(--radius-sm)" />
          </SkeletonRow>
        ))}
      </SkeletonCard>
    </div>
  );
}
