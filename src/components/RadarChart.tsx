"use client";

interface Dimension {
  label: string;
  value: number; // 0–5
  color: string;
}

interface Props {
  dimensions: Dimension[];
  size?: number;
}

export default function RadarChart({ dimensions, size = 280 }: Props) {
  const n = dimensions.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const levels = 5;

  // Calculate point coordinates
  function point(angle: number, r: number): [number, number] {
    const rad = (angle * Math.PI) / 180;
    return [cx + r * Math.cos(rad - Math.PI / 2), cy + r * Math.sin(rad - Math.PI / 2)];
  }

  // Build polygon path
  function polygon(values: number[]): string {
    return values
      .map((v, i) => {
        const angle = (360 / n) * i;
        const r = (v / 5) * radius;
        const [x, y] = point(angle, r);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ") + " Z";
  }

  // Grid rings
  const gridRings = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * radius;
    const pts = Array.from({ length: n }, (_, j) => {
      const angle = (360 / n) * j;
      const [x, y] = point(angle, r);
      return `${x},${y}`;
    }).join(" ");
    return (
      <polygon
        key={`ring-${i}`}
        points={pts}
        fill="none"
        stroke="#30363d"
        strokeWidth="0.5"
      />
    );
  });

  // Axes lines
  const axes = Array.from({ length: n }, (_, i) => {
    const angle = (360 / n) * i;
    const [x, y] = point(angle, radius);
    return (
      <line
        key={`axis-${i}`}
        x1={cx}
        y1={cy}
        x2={x}
        y2={y}
        stroke="#21262d"
        strokeWidth="1"
      />
    );
  });

  // Data polygon
  const dataPoints = dimensions.map((d) => d.value);
  const dataPath = polygon(dataPoints);

  // Data points (dots)
  const dots = dimensions.map((d, i) => {
    const angle = (360 / n) * i;
    const r = (d.value / 5) * radius;
    const [x, y] = point(angle, r);
    return (
      <circle
        key={`dot-${i}`}
        cx={x}
        cy={y}
        r="5"
        fill={d.color}
        stroke="#0d1117"
        strokeWidth="2"
      />
    );
  });

  // Labels
  const labels = dimensions.map((d, i) => {
    const angle = (360 / n) * i;
    const r = radius + 24;
    const [x, y] = point(angle, r);

    // Adjust text-anchor based on position
    let anchor: "start" | "middle" | "end" = "middle";
    if (angle > 0 && angle < 80) anchor = "start";
    else if (angle > 100 && angle < 260) anchor = "end";
    else if (angle > 280 && angle < 360) anchor = "start";

    // Adjust for vertical labels
    let dy = "0.3em";
    if (angle > 70 && angle < 110) dy = "0.3em";
    else if (angle > 250 && angle < 290) dy = "1.8em";

    return (
      <text
        key={`label-${i}`}
        x={x}
        y={y}
        textAnchor={anchor}
        dominantBaseline="middle"
        fill="#8b949e"
        fontSize="11"
        fontFamily="system-ui, sans-serif"
      >
        {d.label}
      </text>
    );
  });

  // Score labels next to dots
  const scores = dimensions.map((d, i) => {
    const angle = (360 / n) * i;
    const r = (d.value / 5) * radius + 12;
    const [x, y] = point(angle, r);
    return (
      <text
        key={`score-${i}`}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={d.color}
        fontSize="10"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        {d.value.toFixed(1)}
      </text>
    );
  });

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="mx-auto"
    >
      {/* Grid */}
      {gridRings}
      {/* Axes */}
      {axes}
      {/* Data polygon */}
      <polygon
        points={dimensions
          .map((d, i) => {
            const angle = (360 / n) * i;
            const r = (d.value / 5) * radius;
            const [x, y] = point(angle, r);
            return `${x},${y}`;
          })
          .join(" ")}
        fill="rgba(88,166,255,0.12)"
        stroke="#58a6ff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Dots */}
      {dots}
      {/* Scores */}
      {scores}
      {/* Labels */}
      {labels}
    </svg>
  );
}
