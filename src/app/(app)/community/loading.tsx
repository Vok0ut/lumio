export default function CommunityLoading() {
  return (
    <div className="section-inner">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="skeleton" style={{ width: 120, height: 20, borderRadius: 6 }} />
          <div style={{ height: 6 }} />
          <div className="skeleton" style={{ width: 220, height: 12, borderRadius: 4 }} />
        </div>
        <div className="skeleton" style={{ width: 90, height: 32, borderRadius: 8 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              <div>
                <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 4 }} />
                <div style={{ height: 4 }} />
                <div className="skeleton" style={{ width: 70, height: 10, borderRadius: 4 }} />
              </div>
            </div>
            <div className="skeleton" style={{ width: "90%", height: 12, borderRadius: 4 }} />
            <div style={{ height: 6 }} />
            <div className="skeleton" style={{ width: "70%", height: 12, borderRadius: 4 }} />
            <div style={{ height: 14 }} />
            <div style={{ display: "flex", gap: 6 }}>
              {[0, 1, 2].map((j) => (
                <div key={j} className="skeleton" style={{ width: 44, height: 26, borderRadius: 999 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
