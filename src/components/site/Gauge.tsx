// Semicircular speedometer gauge: green → red arc with a needle.
// `value` is 0..1 (0 = far-left/green/low, 1 = far-right/red/high).

const SEGMENTS = ["#2FA45A", "#8FBE3D", "#F3B72B", "#E8732A", "#E23B2E"];

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
}

function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 0 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

export function Gauge({ value, className }: { value: number; className?: string }) {
  const cx = 100;
  const cy = 96;
  const r = 74;
  const sw = 22;
  const v = Math.max(0, Math.min(1, value));
  const needleAngle = 180 - v * 180; // 180° (left) .. 0° (right)
  const tip = polar(cx, cy, r - 6, needleAngle);

  return (
    <svg viewBox="0 0 200 118" className={className} role="img" aria-hidden="true">
      {SEGMENTS.map((color, i) => {
        const start = 180 - i * 36 - 1.4; // small gap between segments
        const end = 180 - (i + 1) * 36 + 1.4;
        return (
          <path key={i} d={arc(cx, cy, r, start, end)} stroke={color} strokeWidth={sw} fill="none" />
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={tip.x.toFixed(2)}
        y2={tip.y.toFixed(2)}
        stroke="#1f2937"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={7} fill="#1f2937" />
    </svg>
  );
}
