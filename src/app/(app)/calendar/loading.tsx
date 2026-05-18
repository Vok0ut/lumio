import { Skeleton, SkeletonCard, SkeletonRow } from "@/src/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div style={{ padding: "28px 28px 40px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Week navigator */}
      <SkeletonRow style={{ justifyContent: "center", gap: 16, marginBottom: 4 }}>
        <Skeleton width={28} height={28} radius="var(--radius-sm)" />
        <Skeleton width={160} height={14} />
        <Skeleton width={28} height={28} radius="var(--radius-sm)" />
      </SkeletonRow>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {["L", "M", "X", "J", "V", "S", "D"].map((d, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <Skeleton width={16} height={8} />
            <Skeleton width={32} height={32} radius="50%" />
          </div>
        ))}
      </div>

      {/* Day columns with events */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {[3, 1, 2, 0, 2, 1, 0].map((eventCount, di) => (
          <SkeletonCard key={di} padding="10px" style={{ minHeight: 180 }}>
            {[...Array(eventCount)].map((_, ei) => (
              <div key={ei} style={{ marginBottom: 8 }}>
                <Skeleton width="80%" height={9} style={{ marginBottom: 4 }} />
                <Skeleton width="55%" height={7} />
              </div>
            ))}
          </SkeletonCard>
        ))}
      </div>

      {/* Add event button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Skeleton width={130} height={32} radius="var(--radius-sm)" />
      </div>
    </div>
  );
}
