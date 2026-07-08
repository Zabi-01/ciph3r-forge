export default function CrypticBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Animated grid - very subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-8">
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(160, 100%, 50%)" strokeWidth="0.5" />
          </pattern>
          <animate
            href="#grid"
            attributeName="x"
            from="0"
            to="50"
            dur="30s"
            repeatCount="indefinite"
          />
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating particles - very subtle */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <circle
            key={i}
            r={Math.random() * 2 + 1}
            fill={`hsl(${160 + Math.random() * 30}, ${80 + Math.random() * 20}%, ${50 + Math.random() * 20}%)`}
            opacity={Math.random() * 0.25 + 0.1}
          >
            <animate
              attributeName="cx"
              from={`${Math.random() * 100}%`}
              to={`${Math.random() * 100}%`}
              dur={`${15 + Math.random() * 25}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              from={`${Math.random() * 100}%`}
              to={`${Math.random() * 100}%`}
              dur={`${15 + Math.random() * 25}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* Large rotating cipher rings - center background */}
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-3">
        <circle cx="350" cy="350" r="280" fill="none" stroke="hsl(160, 100%, 50%)" strokeWidth="0.5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 350 350"
            to="360 350 350"
            dur="120s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="350" cy="350" r="220" fill="none" stroke="hsl(190, 100%, 50%)" strokeWidth="0.5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="360 350 350"
            to="0 350 350"
            dur="90s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="350" cy="350" r="160" fill="none" stroke="hsl(270, 80%, 60%)" strokeWidth="0.5">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 350 350"
            to="360 350 350"
            dur="60s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Quantum circuit gates - subtle horizontal lines */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <g key={`quantum-circuit-${i}`}>
            <line
              x1="0"
              y1={`${i * 18 + 15}%`}
              x2="100%"
              y2={`${i * 18 + 15}%`}
              stroke="hsl(160, 100%, 50%)"
              strokeWidth="0.5"
              opacity={Math.random() * 0.25 + 0.1}
            />
            <rect
              x={`${25 + Math.random() * 50}%`}
              y={`${i * 18 + 13}%`}
              width="4%"
              height="5%"
              fill="none"
              stroke="hsl(190, 100%, 50%)"
              strokeWidth="1"
              opacity={Math.random() * 0.35 + 0.15}
            >
              <animate
                attributeName="opacity"
                values="0.15;0.4;0.15"
                dur={`${5 + Math.random() * 4}s`}
                repeatCount="indefinite"
              />
            </rect>
            <text
              x={`${27 + Math.random() * 50}%`}
              y={`${i * 18 + 16.5}%`}
              fill="hsl(190, 100%, 50%)"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              opacity={Math.random() * 0.35 + 0.15}
            >
              H
            </text>
          </g>
        ))}
      </svg>

      {/* Bloch sphere representations - corners */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        {[
          { cx: 15, cy: 25 },
          { cx: 85, cy: 25 },
          { cx: 15, cy: 75 },
          { cx: 85, cy: 75 }
        ].map((pos, i) => (
          <g key={`bloch-${i}`}>
            <circle
              cx={`${pos.cx}%`}
              cy={`${pos.cy}%`}
              r="35"
              fill="none"
              stroke="hsl(270, 80%, 60%)"
              strokeWidth="0.5"
              opacity={Math.random() * 0.25 + 0.1}
            />
            <ellipse
              cx={`${pos.cx}%`}
              cy={`${pos.cy}%`}
              rx="35"
              ry="12"
              fill="none"
              stroke="hsl(160, 100%, 50%)"
              strokeWidth="0.5"
              opacity={Math.random() * 0.25 + 0.1}
            />
            <line
              x1={`${pos.cx}%`}
              y1={`${pos.cy}%`}
              x2={`${pos.cx + 25 * Math.cos(Math.random() * Math.PI * 2)}%`}
              y2={`${pos.cy + 25 * Math.sin(Math.random() * Math.PI * 2)}%`}
              stroke="hsl(190, 100%, 50%)"
              strokeWidth="1"
              opacity={Math.random() * 0.35 + 0.15}
            >
              <animate
                attributeName="x2"
                values={`${pos.cx + 25}%;${pos.cx}%;${pos.cx - 25}%;${pos.cx}%;${pos.cx + 25}%`}
                dur={`${10 + Math.random() * 5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y2"
                values={`${pos.cy}%;${pos.cy + 25}%;${pos.cy}%;${pos.cy - 25}%;${pos.cy}%`}
                dur={`${10 + Math.random() * 5}s`}
                repeatCount="indefinite"
              />
            </line>
          </g>
        ))}
      </svg>

      {/* Entanglement connections - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        {[...Array(4)].map((_, i) => {
          const x1 = Math.random() * 70 + 15;
          const y1 = Math.random() * 70 + 15;
          const x2 = x1 + (Math.random() * 25 - 12.5);
          const y2 = y1 + (Math.random() * 25 - 12.5);
          return (
            <g key={`entangle-${i}`}>
              <line
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="hsl(190, 100%, 50%)"
                strokeWidth="0.5"
                strokeDasharray="3,3"
                opacity={Math.random() * 0.25 + 0.1}
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.35;0.1"
                  dur={`${6 + Math.random() * 4}s`}
                  repeatCount="indefinite"
                />
              </line>
              <circle
                cx={`${x1}%`}
                cy={`${y1}%`}
                r="4"
                fill="hsl(160, 100%, 50%)"
                opacity={Math.random() * 0.35 + 0.15}
              />
              <circle
                cx={`${x2}%`}
                cy={`${y2}%`}
                r="4"
                fill="hsl(190, 100%, 50%)"
                opacity={Math.random() * 0.35 + 0.15}
              />
            </g>
          );
        })}
      </svg>

      {/* Wave function probability clouds */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <ellipse
            key={`wave-${i}`}
            cx={`${Math.random() * 70 + 15}%`}
            cy={`${Math.random() * 70 + 15}%`}
            rx={`${25 + Math.random() * 35}`}
            ry={`${12 + Math.random() * 22}`}
            fill={`hsla(${270 + Math.random() * 30}, 80%, 60%, ${Math.random() * 0.12 + 0.04})`}
            transform={`rotate(${Math.random() * 360} ${Math.random() * 70 + 15}% ${Math.random() * 70 + 15}%)`}
          >
            <animate
              attributeName="rx"
              values={`${25 + Math.random() * 10};${35 + Math.random() * 10};${25 + Math.random() * 10}`}
              dur={`${8 + Math.random() * 4}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values={`${12 + Math.random() * 5};${22 + Math.random() * 5};${12 + Math.random() * 5}`}
              dur={`${8 + Math.random() * 4}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        ))}
      </svg>

      {/* Quantum equations - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        <text
          x="10%"
          y="85%"
          fill="hsl(160, 100%, 50%)"
          fontSize="9"
          fontFamily="monospace"
          opacity={Math.random() * 0.25 + 0.1}
        >
          |ψ⟩ = α|0⟩ + β|1⟩
        </text>
        <text
          x="75%"
          y="88%"
          fill="hsl(190, 100%, 50%)"
          fontSize="9"
          fontFamily="monospace"
          opacity={Math.random() * 0.25 + 0.1}
        >
          Ĥ|0⟩ = (|0⟩+|1⟩)/√2
        </text>
        <text
          x="50%"
          y="92%"
          fill="hsl(270, 80%, 60%)"
          fontSize="8"
          fontFamily="monospace"
          textAnchor="middle"
          opacity={Math.random() * 0.25 + 0.1}
        >
          U(θ,φ,λ)|ψ⟩
        </text>
      </svg>

      {/* Atomic orbitals - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        {[...Array(5)].map((_, i) => {
          const cx = Math.random() * 80 + 10;
          const cy = Math.random() * 80 + 10;
          return (
            <g key={`orbital-${i}`}>
              <ellipse
                cx={`${cx}%`}
                cy={`${cy}%`}
                rx="20"
                ry="8"
                fill="none"
                stroke="hsl(160, 100%, 50%)"
                strokeWidth="0.5"
                opacity={Math.random() * 0.25 + 0.1}
                transform={`rotate(${Math.random() * 180} ${cx}% ${cy}%)`}
              />
              <ellipse
                cx={`${cx}%`}
                cy={`${cy}%`}
                rx="20"
                ry="8"
                fill="none"
                stroke="hsl(190, 100%, 50%)"
                strokeWidth="0.5"
                opacity={Math.random() * 0.25 + 0.1}
                transform={`rotate(${Math.random() * 180 + 90} ${cx}% ${cy}%)`}
              />
              <circle
                cx={`${cx}%`}
                cy={`${cy}%`}
                r="3"
                fill="hsl(270, 80%, 60%)"
                opacity={Math.random() * 0.35 + 0.15}
              />
            </g>
          );
        })}
      </svg>

      {/* Quantum tunneling visualization - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <g key={`tunnel-${i}`}>
            <path
              d={`M ${10 + i * 25}% ${40 + i * 10}% Q ${15 + i * 25}% ${20 + i * 10}% ${20 + i * 25}% ${40 + i * 10}%`}
              fill="none"
              stroke="hsl(160, 100%, 50%)"
              strokeWidth="0.5"
              opacity={Math.random() * 0.25 + 0.1}
            />
            <path
              d={`M ${20 + i * 25}% ${40 + i * 10}% L ${20 + i * 25}% ${60 + i * 10}%`}
              stroke="hsl(190, 100%, 50%)"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              opacity={Math.random() * 0.25 + 0.1}
            />
            <rect
              x={`${22 + i * 25}%`}
              y={`${45 + i * 10}%`}
              width="8%"
              height="20%"
              fill="none"
              stroke="hsl(270, 80%, 60%)"
              strokeWidth="0.5"
              opacity={Math.random() * 0.25 + 0.1}
            />
          </g>
        ))}
      </svg>

      {/* Matrix/grid data streams - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <g key={`matrix-${i}`}>
            {[...Array(8)].map((_, j) => (
              <text
                key={j}
                x={`${i * 25 + 5}%`}
                y={`${j * 11 + 5}%`}
                fill={`hsl(${160 + Math.random() * 60}, 100%, 50%)`}
                fontSize="7"
                fontFamily="monospace"
                opacity={Math.random() * 0.2 + 0.05}
              >
                {['0', '1', '0x', 'A', 'F'][Math.floor(Math.random() * 5)]}
              </text>
            ))}
          </g>
        ))}
      </svg>

      {/* Energy level diagrams - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        {[...Array(3)].map((_, i) => {
          const x = 20 + i * 30;
          return (
            <g key={`energy-${i}`}>
              <line
                x1={`${x}%`}
                y1="35%"
                x2={`${x + 10}%`}
                y2="35%"
                stroke="hsl(160, 100%, 50%)"
                strokeWidth="1"
                opacity={Math.random() * 0.3 + 0.1}
              />
              <line
                x1={`${x}%`}
                y1="50%"
                x2={`${x + 10}%`}
                y2="50%"
                stroke="hsl(190, 100%, 50%)"
                strokeWidth="1"
                opacity={Math.random() * 0.3 + 0.1}
              />
              <line
                x1={`${x}%`}
                y1="65%"
                x2={`${x + 10}%`}
                y2="65%"
                stroke="hsl(270, 80%, 60%)"
                strokeWidth="1"
                opacity={Math.random() * 0.3 + 0.1}
              />
              <line
                x1={`${x + 5}%`}
                y1="35%"
                x2={`${x + 5}%`}
                y2="50%"
                stroke="hsl(160, 100%, 50%)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
                opacity={Math.random() * 0.25 + 0.1}
              >
                <animate
                  attributeName="opacity"
                  values="0.1;0.3;0.1"
                  dur={`${4 + Math.random() * 3}s`}
                  repeatCount="indefinite"
                />
              </line>
            </g>
          );
        })}
      </svg>

      {/* Photon polarization - subtle */}
      <svg className="absolute inset-0 w-full h-full opacity-4 pointer-events-none">
        {[...Array(4)].map((_, i) => {
          const x = Math.random() * 80 + 10;
          const y = Math.random() * 80 + 10;
          const angle = Math.random() * 180;
          return (
            <g key={`photon-${i}`}>
              <line
                x1={`${x - 10}%`}
                y1={`${y}%`}
                x2={`${x + 10}%`}
                y2={`${y}%`}
                stroke="hsl(190, 100%, 50%)"
                strokeWidth="0.5"
                opacity={Math.random() * 0.25 + 0.1}
                transform={`rotate(${angle} ${x}% ${y}%)`}
              />
              <circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="2"
                fill="hsl(160, 100%, 50%)"
                opacity={Math.random() * 0.35 + 0.15}
              />
              <path
                d={`M ${x - 5}% ${y}% A 5 5 0 0 1 ${x + 5}% ${y}%`}
                fill="none"
                stroke="hsl(270, 80%, 60%)"
                strokeWidth="0.5"
                opacity={Math.random() * 0.25 + 0.1}
                transform={`rotate(${angle} ${x}% ${y}%)`}
              />
            </g>
          );
        })}
      </svg>

      {/* Glowing orbs - very subtle */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '5s' }} />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/60 to-background/85 pointer-events-none" />
    </div>
  );
}