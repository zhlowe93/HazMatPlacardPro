/**
 * Official DANGEROUS placard per CFR 172.521
 * White background with red top and bottom triangles, "DANGEROUS" text
 */

interface DangerousPlacardProps {
  size?: number;
}

export default function DangerousPlacard({ size = 160 }: DangerousPlacardProps) {
  const diamond = "50,2 98,50 50,98 2,50";
  const innerDiamond = "50,8 92,50 50,92 8,50";

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: "block" }}
      role="img"
      aria-label="DANGEROUS placard"
    >
      {/* White base */}
      <polygon points={diamond} fill="#FFFFFF" />

      {/* Red top triangle */}
      <clipPath id="danger-clip">
        <polygon points={diamond} />
      </clipPath>
      <g clipPath="url(#danger-clip)">
        {/* Top red triangle: from top point to midline */}
        <polygon points="50,2 98,50 2,50" fill="#FF0000" />
        {/* Bottom red triangle */}
        <polygon points="2,50 98,50 50,98" fill="#FF0000" />
        {/* White horizontal band in center */}
        <rect x="10" y="40" width="80" height="20" fill="#FFFFFF" />
      </g>

      {/* Outer border */}
      <polygon points={diamond} fill="none" stroke="#000000" strokeWidth="2" />

      {/* Inner border */}
      <polygon points={innerDiamond} fill="none" stroke="#000000" strokeWidth="1" />

      {/* DANGEROUS text */}
      <text x="50" y="54" textAnchor="middle" fill="#000000"
        fontSize="8" fontWeight="900" fontFamily="Arial, sans-serif"
        letterSpacing="0.5">
        DANGEROUS
      </text>
    </svg>
  );
}
