// Flat-top regular hexagon matching HSBC's brand mark orientation.
// `size` is the width; height is derived from the regular hexagon ratio.
export default function Hexagon({ size = 32, color = '#DB0011', className = '' }) {
  const w = size;
  const h = +(size * (Math.sqrt(3) / 2)).toFixed(2);

  // Flat-top: points at left/right, flat edges at top/bottom
  const pts = [
    [w,       h / 2],   // right
    [w * 3/4, 0     ],  // upper-right
    [w * 1/4, 0     ],  // upper-left
    [0,       h / 2],   // left
    [w * 1/4, h     ],  // lower-left
    [w * 3/4, h     ],  // lower-right
  ]
    .map(([x, y]) => `${+x.toFixed(2)},${+y.toFixed(2)}`)
    .join(' ');

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <polygon points={pts} fill={color} />
    </svg>
  );
}
