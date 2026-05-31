interface SparklineProps {
  data: number[];
  height?: number;
  width?: number;
  color?: string;
  className?: string;
}

export function Sparkline({ data, height = 32, width = 220, color, className }: SparklineProps) {
  if (!data || data.length < 2) {
    return null;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pad = 4;
  const pts = data.map(
    (d, i) =>
      [i * stepX, height - ((d - min) / range) * (height - pad * 2) - pad] as [number, number],
  );
  const polyline = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1] as [number, number];

  return (
    <svg
      className={["sparkline", className].filter(Boolean).join(" ")}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      aria-hidden="true"
      style={color ? { color } : undefined}
    >
      <polyline
        points={polyline}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="1.8" fill="currentColor" />
    </svg>
  );
}
