import { Skeleton, SkeletonCard, SkeletonRow, SkeletonCircle } from "@/src/components/ui/skeleton";

export default function NutritionLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Water counter */}
      <SkeletonCard padding="16px 20px">
        <SkeletonRow style={{ marginBottom: 10 }}>
          <Skeleton width={20} height={20} radius="50%" />
          <Skeleton width={100} height={10} />
          <div style={{ flex: 1 }} />
          <Skeleton width={60} height={10} />
        </SkeletonRow>
        <Skeleton width="100%" height={6} radius={3} style={{ marginBottom: 10 }} />
        <SkeletonRow gap={8}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width={64} height={28} radius="var(--radius-sm)" style={{ flex: 1 }} />
          ))}
        </SkeletonRow>
      </SkeletonCard>

      {/* Donut + macros row */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
        {/* Donut */}
        <SkeletonCard padding="24px" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", width: 140, height: 140 }}>
            <SkeletonCircle size={140} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
            }}>
              <Skeleton width={48} height={20} />
              <Skeleton width={36} height={8} />
            </div>
          </div>
          <Skeleton width={80} height={8} />
        </SkeletonCard>

        {/* Macro rings */}
        <SkeletonCard padding="20px">
          <Skeleton width={90} height={10} style={{ marginBottom: 16 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <SkeletonCircle size={64} />
                <Skeleton width={50} height={8} />
                <Skeleton width={36} height={7} />
              </div>
            ))}
          </div>
        </SkeletonCard>
      </div>

      {/* Mini calendar + weekly adherence */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SkeletonCard padding="16px">
          <SkeletonRow style={{ marginBottom: 12 }}>
            <Skeleton width={20} height={20} radius="var(--radius-sm)" />
            <Skeleton width={100} height={10} />
            <div style={{ flex: 1 }} />
            <Skeleton width={20} height={20} radius="var(--radius-sm)" />
          </SkeletonRow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {[...Array(35)].map((_, i) => (
              <Skeleton key={i} width="100%" height={28} radius="var(--radius-sm)" />
            ))}
          </div>
        </SkeletonCard>

        <SkeletonCard padding="16px">
          <Skeleton width={120} height={10} style={{ marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
            {[...Array(7)].map((_, i) => {
              const h = 30 + Math.floor(Math.random() * 50);
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <Skeleton width="100%" height={h} radius="var(--radius-sm)" />
                  <Skeleton width={16} height={7} />
                </div>
              );
            })}
          </div>
        </SkeletonCard>
      </div>

      {/* Meal sections */}
      {["Desayuno", "Almuerzo", "Cena", "Snacks"].map((meal, i) => (
        <SkeletonCard key={i} padding="16px 20px">
          <SkeletonRow style={{ marginBottom: 12 }}>
            <Skeleton width={70} height={11} />
            <div style={{ flex: 1 }} />
            <Skeleton width={24} height={24} radius="var(--radius-sm)" />
          </SkeletonRow>
          {i < 2 && (
            <>
              {[...Array(2)].map((_, j) => (
                <SkeletonRow key={j} style={{ marginBottom: 8 }}>
                  <Skeleton width="40%" height={9} />
                  <div style={{ flex: 1 }} />
                  <Skeleton width={50} height={9} />
                  <Skeleton width={16} height={16} radius="50%" />
                </SkeletonRow>
              ))}
            </>
          )}
        </SkeletonCard>
      ))}
    </div>
  );
}
