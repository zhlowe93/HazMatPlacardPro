/**
 * Official DOT Placard Renderer
 * SVG diamonds matching CFR 49 Part 172, Appendix B specifications.
 * Each placard uses the regulated colors, symbols, and text layout.
 */

interface DOTPlacardProps {
  hazardClass: string;
  size?: number;       // px, default 160
  unNumber?: string;   // For bulk containers (CFR 172.336)
  isPih?: boolean;     // Show INHALATION HAZARD for 6.1 PIH
}

// Official DOT placard background colors
const BG_COLORS: Record<string, string> = {
  "1.1": "#FF6600", "1.2": "#FF6600", "1.3": "#FF6600",
  "1.4": "#FF6600", "1.5": "#FF6600", "1.6": "#FF6600",
  "2.1": "#FF0000", "2.2": "#008000", "2.3": "#FFFFFF",
  "3": "#FF0000",
  "4.1": "#FF0000", "4.2": "#FF0000", "4.3": "#0000FF",
  "5.1": "#FFCC00", "5.2": "#FFCC00",
  "6.1": "#FFFFFF",
  "7": "#FFCC00",
  "8": "#FFFFFF",
  "9": "#FFFFFF",
};

// Official DOT text for each class
const CLASS_TEXT: Record<string, string> = {
  "1.1": "EXPLOSIVES", "1.2": "EXPLOSIVES", "1.3": "EXPLOSIVES",
  "1.4": "EXPLOSIVES", "1.5": "BLASTING\nAGENT", "1.6": "EXPLOSIVES",
  "2.1": "FLAMMABLE\nGAS", "2.2": "NON-FLAMMABLE\nGAS", "2.3": "POISON\nGAS",
  "3": "FLAMMABLE",
  "4.1": "FLAMMABLE\nSOLID", "4.2": "SPONTANEOUSLY\nCOMBUSTIBLE", "4.3": "DANGEROUS\nWHEN WET",
  "5.1": "OXIDIZER", "5.2": "ORGANIC\nPEROXIDE",
  "6.1": "POISON",
  "7": "RADIOACTIVE",
  "8": "CORROSIVE",
  "9": "",
};

// Whether text should be black (true) or white (false)
const DARK_TEXT: Record<string, boolean> = {
  "1.1": false, "1.2": false, "1.3": false, "1.4": false, "1.5": false, "1.6": false,
  "2.1": false, "2.2": false, "2.3": true,
  "3": false,
  "4.1": true, "4.2": true, "4.3": false,
  "5.1": true, "5.2": true,
  "6.1": true,
  "7": true,
  "8": true,
  "9": true,
};

// Exploding bomb symbol for Class 1
function ExplosiveBomb({ color }: { color: string }) {
  return (
    <g transform="translate(50, 28) scale(0.55)">
      {/* Bomb body */}
      <circle cx="0" cy="12" r="14" fill={color} />
      {/* Fuse stem */}
      <line x1="7" y1="-2" x2="14" y2="-10" stroke={color} strokeWidth="3" />
      {/* Explosion burst lines */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 14 * Math.cos(rad) + 10;
        const y1 = 14 * Math.sin(rad) - 10;
        const x2 = 22 * Math.cos(rad) + 10;
        const y2 = 22 * Math.sin(rad) - 10;
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2.5" strokeLinecap="round" />;
      })}
    </g>
  );
}

// Flame symbol for Classes 2.1, 3, 4.x
function FlameSymbol({ color, x = 50, y = 30, scale = 1 }: { color: string; x?: number; y?: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <path
        d="M0 0 C-4 -8, -12 -16, -8 -28 C-6 -22, -2 -20, 0 -24 C2 -20, 6 -22, 8 -28 C12 -16, 4 -8, 0 0Z"
        fill={color} stroke={color} strokeWidth="0.5"
      />
    </g>
  );
}

// Skull and crossbones for Classes 2.3, 6.1
function SkullSymbol({ color }: { color: string }) {
  return (
    <g transform="translate(50, 32) scale(0.6)">
      {/* Skull */}
      <ellipse cx="0" cy="-8" rx="12" ry="14" fill={color} />
      {/* Eye sockets */}
      <ellipse cx="-5" cy="-10" rx="3.5" ry="4" fill={color === "#000000" ? "#FFFFFF" : "#000000"} />
      <ellipse cx="5" cy="-10" rx="3.5" ry="4" fill={color === "#000000" ? "#FFFFFF" : "#000000"} />
      {/* Nose */}
      <path d="M-1.5 -4 L0 -2 L1.5 -4Z" fill={color === "#000000" ? "#FFFFFF" : "#000000"} />
      {/* Mouth */}
      <rect x="-6" y="0" width="12" height="2" rx="1" fill={color === "#000000" ? "#FFFFFF" : "#000000"} />
      {/* Crossbones */}
      <line x1="-16" y1="10" x2="16" y2="22" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <line x1="16" y1="10" x2="-16" y2="22" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

// Gas cylinder for Class 2.2
function GasCylinder({ color }: { color: string }) {
  return (
    <g transform="translate(50, 28) scale(0.5)">
      <rect x="-8" y="-14" width="16" height="30" rx="4" fill="none" stroke={color} strokeWidth="3" />
      <rect x="-3" y="-20" width="6" height="8" rx="2" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1="0" y1="-22" x2="0" y2="-26" stroke={color} strokeWidth="2" />
      <circle cx="0" cy="-27" r="2" fill="none" stroke={color} strokeWidth="1.5" />
    </g>
  );
}

// Oxidizer symbol — "O" with flame on top for Class 5.1/5.2
function OxidizerSymbol({ color }: { color: string }) {
  return (
    <g transform="translate(50, 36) scale(0.6)">
      <circle cx="0" cy="0" r="12" fill="none" stroke={color} strokeWidth="3.5" />
      <FlameSymbol color={color} x={0} y={-8} scale={0.6} />
    </g>
  );
}

// Trefoil (radiation) symbol for Class 7
function TrefoilSymbol({ color }: { color: string }) {
  return (
    <g transform="translate(50, 30) scale(0.45)">
      <circle cx="0" cy="0" r="5" fill={color} />
      {[0, 120, 240].map((angle) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x = 18 * Math.cos(rad);
        const y = 18 * Math.sin(rad);
        return (
          <path
            key={angle}
            d={`M${5 * Math.cos(((angle - 90 - 30) * Math.PI) / 180)} ${5 * Math.sin(((angle - 90 - 30) * Math.PI) / 180)} A5 5 0 0 1 ${5 * Math.cos(((angle - 90 + 30) * Math.PI) / 180)} ${5 * Math.sin(((angle - 90 + 30) * Math.PI) / 180)} L${22 * Math.cos(((angle - 90 + 30) * Math.PI) / 180)} ${22 * Math.sin(((angle - 90 + 30) * Math.PI) / 180)} A22 22 0 0 0 ${22 * Math.cos(((angle - 90 - 30) * Math.PI) / 180)} ${22 * Math.sin(((angle - 90 - 30) * Math.PI) / 180)} Z`}
            fill={color}
          />
        );
      })}
    </g>
  );
}

// Corrosive symbol — liquid dripping on hand and metal bar for Class 8
function CorrosiveSymbol() {
  return (
    <g transform="translate(50, 26) scale(0.5)">
      {/* Two test tubes pouring */}
      <rect x="-18" y="-16" width="8" height="14" rx="1" fill="none" stroke="#000" strokeWidth="2" transform="rotate(-20, -14, -9)" />
      <rect x="10" y="-16" width="8" height="14" rx="1" fill="none" stroke="#000" strokeWidth="2" transform="rotate(20, 14, -9)" />
      {/* Drops from left tube */}
      <circle cx="-10" cy="4" r="1.5" fill="#000" />
      <circle cx="-8" cy="8" r="1" fill="#000" />
      {/* Drops from right tube */}
      <circle cx="10" cy="4" r="1.5" fill="#000" />
      <circle cx="8" cy="8" r="1" fill="#000" />
      {/* Hand being corroded (left side) */}
      <ellipse cx="-10" cy="18" rx="8" ry="5" fill="none" stroke="#000" strokeWidth="2" />
      {/* Metal bar being corroded (right side) */}
      <rect x="4" y="14" width="14" height="8" rx="1" fill="none" stroke="#000" strokeWidth="2" />
      {/* Corrosion marks */}
      <path d="M-10 12 C-12 14, -8 14, -10 16" stroke="#000" strokeWidth="1" fill="none" />
      <path d="M10 12 C8 14, 12 14, 10 16" stroke="#000" strokeWidth="1" fill="none" />
    </g>
  );
}

// Class 9 stripes (upper portion only)
function Class9Stripes() {
  return (
    <g>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={30 + i * 4} y={14} width="2.5" height="30" fill="#000" />
      ))}
    </g>
  );
}

function getSymbol(hazardClass: string, textColor: string) {
  const c = parseFloat(hazardClass);
  if (c >= 1 && c < 2) return <ExplosiveBomb color={textColor} />;
  if (hazardClass === "2.1") return <FlameSymbol color={textColor} />;
  if (hazardClass === "2.2") return <GasCylinder color={textColor} />;
  if (hazardClass === "2.3") return <SkullSymbol color={textColor} />;
  if (hazardClass === "3") return <FlameSymbol color={textColor} />;
  if (hazardClass === "4.1") return <FlameSymbol color="#000000" />;
  if (hazardClass === "4.2") return <FlameSymbol color="#000000" />;
  if (hazardClass === "4.3") return <FlameSymbol color="#FFFFFF" />;
  if (hazardClass === "5.1" || hazardClass === "5.2") return <OxidizerSymbol color={textColor} />;
  if (hazardClass === "6.1") return <SkullSymbol color="#000000" />;
  if (hazardClass === "7") return <TrefoilSymbol color="#000000" />;
  if (hazardClass === "8") return <CorrosiveSymbol />;
  if (hazardClass === "9") return <Class9Stripes />;
  return null;
}

export default function DOTPlacard({ hazardClass, size = 160, unNumber, isPih }: DOTPlacardProps) {
  const bgColor = BG_COLORS[hazardClass] || "#CCCCCC";
  const isDark = DARK_TEXT[hazardClass] ?? true;
  const textColor = isDark ? "#000000" : "#FFFFFF";
  const classText = isPih ? "INHALATION\nHAZARD" : (CLASS_TEXT[hazardClass] || "");
  const isClass42 = hazardClass === "4.2"; // Split color: white top, red bottom
  const isClass8 = hazardClass === "8";     // Split color: white top, black bottom
  const isClass7 = hazardClass === "7";     // Split color: yellow top, white bottom
  const isClass41 = hazardClass === "4.1";  // Red/white vertical stripes

  // Diamond dimensions inside 100x100 viewBox
  // Diamond points: top(50,2), right(98,50), bottom(50,98), left(2,50)
  const diamond = "50,2 98,50 50,98 2,50";
  const innerDiamond = "50,8 92,50 50,92 8,50";

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ display: "block" }}
      role="img"
      aria-label={`DOT placard Class ${hazardClass} ${classText.replace("\n", " ")}`}
    >
      {/* Background fill */}
      <polygon points={diamond} fill="#FFFFFF" stroke="none" />

      {/* Main background color */}
      {isClass42 ? (
        <>
          {/* 4.2: White top, Red bottom */}
          <clipPath id={`clip42-${hazardClass}`}>
            <polygon points={diamond} />
          </clipPath>
          <g clipPath={`url(#clip42-${hazardClass})`}>
            <rect x="0" y="0" width="100" height="50" fill="#FFFFFF" />
            <rect x="0" y="50" width="100" height="50" fill="#FF0000" />
          </g>
        </>
      ) : isClass8 ? (
        <>
          {/* 8: White top, Black bottom */}
          <clipPath id={`clip8-${hazardClass}`}>
            <polygon points={diamond} />
          </clipPath>
          <g clipPath={`url(#clip8-${hazardClass})`}>
            <rect x="0" y="0" width="100" height="50" fill="#FFFFFF" />
            <rect x="0" y="50" width="100" height="50" fill="#000000" />
          </g>
        </>
      ) : isClass7 ? (
        <>
          {/* 7: Yellow top, White bottom */}
          <clipPath id={`clip7-${hazardClass}`}>
            <polygon points={diamond} />
          </clipPath>
          <g clipPath={`url(#clip7-${hazardClass})`}>
            <rect x="0" y="0" width="100" height="50" fill="#FFCC00" />
            <rect x="0" y="50" width="100" height="50" fill="#FFFFFF" />
          </g>
        </>
      ) : isClass41 ? (
        <>
          {/* 4.1: Red with white vertical stripes */}
          <polygon points={diamond} fill="#FF0000" />
          <clipPath id={`clip41-${hazardClass}`}>
            <polygon points={diamond} />
          </clipPath>
          <g clipPath={`url(#clip41-${hazardClass})`}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <rect key={i} x={i * 8} y="0" width="4" height="100" fill="#FFFFFF" />
            ))}
          </g>
        </>
      ) : (
        <polygon points={diamond} fill={bgColor} />
      )}

      {/* Outer border */}
      <polygon points={diamond} fill="none" stroke="#000000" strokeWidth="2" />

      {/* Inner border */}
      <polygon points={innerDiamond} fill="none" stroke={isDark ? "#000000" : "#FFFFFF"} strokeWidth="1" />

      {/* UN Number for bulk (top area) */}
      {unNumber && (
        <text x="50" y="24" textAnchor="middle" fill={textColor}
          fontSize="10" fontWeight="900" fontFamily="Arial, sans-serif">
          {unNumber}
        </text>
      )}

      {/* Hazard symbol */}
      {getSymbol(hazardClass, textColor)}

      {/* Class text name */}
      {classText && (
        <text x="50" y={unNumber ? "58" : "56"} textAnchor="middle"
          fill={isClass8 ? "#FFFFFF" : textColor}
          fontSize={classText.length > 15 ? "4.5" : "5.5"}
          fontWeight="900" fontFamily="Arial, sans-serif">
          {classText.split("\n").map((line, i) => (
            <tspan key={i} x="50" dy={i === 0 ? 0 : "5.5"}>{line}</tspan>
          ))}
        </text>
      )}

      {/* Class number at bottom */}
      <text x="50" y={hazardClass === "9" ? "88" : "82"} textAnchor="middle"
        fill={isClass8 ? "#FFFFFF" : textColor}
        fontSize="16" fontWeight="900" fontFamily="Arial, sans-serif">
        {hazardClass}
      </text>
    </svg>
  );
}
