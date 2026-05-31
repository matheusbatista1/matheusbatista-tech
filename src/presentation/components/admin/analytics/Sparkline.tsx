interface SparklineProps {
  data: number[];
  height?: number;
  width?: number;
}

export function Sparkline({ data, height = 34, width = 220 }: SparklineProps) {
  const safe = !data || data.length === 0 || data.every((x) => !x) ? [0, 0, 0, 0, 0, 0, 1] : data;
  if (safe.length < 2) return null;

  const max = Math.max(...safe);
  const min = Math.min(...safe);
  const range = max - min || 1;
  const stepX = width / (safe.length - 1);
  const pad = 4;
  const pts = safe.map(
    (d, i) =>
      [i * stepX, height - ((d - min) / range) * (height - pad * 2) - pad] as [number, number],
  );
  const polyline = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1] as [number, number];

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      aria-hidden="true"
    >
      <polyline
        className="spark-line"
        points={polyline}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle className="spark-dot" cx={last[0]} cy={last[1]} r="1.8" />
    </svg>
  );
}
