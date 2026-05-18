import { Skeleton, SkeletonCard, SkeletonRow } from "@/src/components/ui/skeleton";

export default function PricingLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

      {/* Rank capsule */}
      <Skeleton width={160} height={32} radius={16} />

      {/* Period toggle */}
      <Skeleton width={180} height={36} radius="var(--radius-md)" />

      {/* Hero pricing card */}
      <SkeletonCard padding="36px 32px" style={{ width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Skeleton width={80} height={10} />
        <Skeleton width={120} height={36} />
        <Skeleton width={80} height={10} />
        <Skeleton width="100%" height={44} radius="var(--radius-md)" style={{ marginTop: 8 }} />
        <SkeletonRow gap={8} style={{ marginTop: 4 }}>
          <Skeleton width={90} height={8} />
          <Skeleton width={90} height={8} />
        </SkeletonRow>
      </SkeletonCard>

      {/* Features grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", maxWidth: 600 }}>
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} padding="16px">
            <Skeleton width={28} height={28} radius="var(--radius-sm)" style={{ marginBottom: 10 }} />
            <Skeleton width="70%" height={10} style={{ marginBottom: 6 }} />
            <Skeleton width="90%" height={7} />
          </SkeletonCard>
        ))}
      </div>

      {/* Rank ladder */}
      <SkeletonCard padding="20px" style={{ width: "100%", maxWidth: 440 }}>
        <Skeleton width={90} height={10} style={{ marginBottom: 14 }} />
        {[...Array(5)].map((_, i) => (
          <SkeletonRow key={i} style={{ marginBottom: 10 }}>
            <Skeleton width={36} height={18} radius={9} />
            <div style={{ flex: 1 }} />
            <Skeleton width={64} height={9} />
          </SkeletonRow>
        ))}
      </SkeletonCard>
    </div>
  );
}
