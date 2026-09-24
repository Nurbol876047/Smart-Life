export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="panel" style={{ padding: 0 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div className="skeleton-row" key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="skeleton skeleton-text"
              style={{ flex: c === 0 ? '0 0 90px' : 1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 280 }) {
  return <div className="skeleton skeleton-chart" style={{ height }} />;
}

export function SkeletonBars({ rows = 5 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="bar-row" key={i}>
          <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 8 }} />
          <div className="skeleton skeleton-text" style={{ height: 10, width: '100%' }} />
        </div>
      ))}
    </div>
  );
}
