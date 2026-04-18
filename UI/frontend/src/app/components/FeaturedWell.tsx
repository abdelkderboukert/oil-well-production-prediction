export default function FeaturedWell() {
  const metrics = [
    { key: 'Daily Output', val: '3,840 bbl/d' },
    { key: 'Water Cut', val: '12.4%' },
    { key: 'GOR', val: '820 scf/bbl' },
    { key: 'Pump Efficiency', val: '94.2%' },
  ]

  return (
    <section className="bg-oil-deep py-24 px-8 md:px-16 border-t border-oil-border">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-oil-amber mb-2">
              Available To Monitor
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-oil-light">
              Make The Most Of Your Field<br />
              With Our AI Analysis Engine
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button className="w-10 h-10 border border-oil-border flex items-center justify-center text-oil-smoke hover:border-oil-amber hover:text-oil-amber transition-colors">←</button>
            <button className="w-10 h-10 border border-oil-border flex items-center justify-center text-oil-smoke hover:border-oil-amber hover:text-oil-amber transition-colors">→</button>
          </div>
        </div>

        {/* Featured card */}
        <div className="flex flex-col md:flex-row gap-0 border border-oil-border overflow-hidden">
          {/* Image / visualization panel */}
          <div className="md:w-2/5 relative min-h-[300px] bg-oil-surface overflow-hidden">
            {/* SVG well visualization */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
              <defs>
                <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#D4882A" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#D4882A" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="wellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1A1208" />
                  <stop offset="100%" stopColor="#0D0A05" />
                </linearGradient>
              </defs>
              <rect width="400" height="500" fill="url(#wellGrad)" />

              {/* Grid lines */}
              {[50, 100, 150, 200, 250, 300, 350, 400, 450].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#D4882A" strokeWidth="0.3" strokeOpacity="0.1" />
              ))}
              {[50, 100, 150, 200, 250, 300, 350].map(x => (
                <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="#D4882A" strokeWidth="0.3" strokeOpacity="0.1" />
              ))}

              {/* Derrick */}
              <g transform="translate(160, 20)">
                <polygon points="40,0 60,0 90,220 10,220" fill="#0D0A05" stroke="#D4882A" strokeWidth="0.8" strokeOpacity="0.5" />
                {[30,60,90,120,150,180].map((y,i) => (
                  <line key={i} x1={40-y*0.136} y1={y} x2={60+y*0.136} y2={y} stroke="#D4882A" strokeWidth="0.6" strokeOpacity="0.4" />
                ))}
                <rect x="25" y="218" width="30" height="8" fill="#1A1208" stroke="#D4882A" strokeWidth="0.5" strokeOpacity="0.4" />
              </g>

              {/* Wellbore */}
              <rect x="190" y="240" width="20" height="180" fill="#1A1208" stroke="#D4882A" strokeWidth="0.8" strokeOpacity="0.4" />
              {/* Flow indicator */}
              <rect x="197" y="242" width="6" height="176" fill="#D4882A" opacity="0.15">
                <animate attributeName="height" values="176;0;176" dur="3s" repeatCount="indefinite" />
                <animate attributeName="y" values="242;418;242" dur="3s" repeatCount="indefinite" />
              </rect>

              {/* Glow */}
              <circle cx="200" cy="240" r="60" fill="url(#glowGrad)" />

              {/* Data readout */}
              <rect x="20" y="380" width="130" height="70" rx="2" fill="#1A1208" stroke="#D4882A" strokeWidth="0.5" strokeOpacity="0.4" />
              <text x="30" y="400" fill="#D4882A" fontSize="8" fontFamily="monospace" opacity="0.7">REAL-TIME FEED</text>
              <text x="30" y="418" fill="#E8E8E0" fontSize="11" fontFamily="monospace" fontWeight="bold">3,840 bbl/d</text>
              <text x="30" y="434" fill="#9A9A92" fontSize="8" fontFamily="monospace">↑ 4.2% from yesterday</text>
              <rect x="30" y="440" width="80" height="2" rx="1" fill="#D4882A" opacity="0.3" />
              <rect x="30" y="440" width="68" height="2" rx="1" fill="#D4882A" opacity="0.7" />

              {/* Status dot */}
              <circle cx="375" cy="30" r="5" fill="#4ADE80">
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
              </circle>
              <text x="355" y="34" fill="#4ADE80" fontSize="7" fontFamily="monospace" textAnchor="end">LIVE</text>
            </svg>

            {/* Overlay label */}
            <div className="absolute top-4 left-4">
              <span className="font-mono text-[9px] tracking-widest uppercase bg-oil-amber text-oil-black px-2 py-1">
                Featured Well
              </span>
            </div>
          </div>

          {/* Details panel */}
          <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-mono text-[10px] tracking-widest uppercase text-oil-smoke mb-1">
                    Hassi Messaoud Basin · Southern Sector
                  </p>
                  <h3 className="font-display text-3xl font-bold text-oil-light">
                    Well HM-447 Alpha
                  </h3>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-oil-smoke">Est. Recovery</p>
                  <p className="font-display text-2xl font-bold text-oil-amber">$2.4M/yr</p>
                </div>
              </div>

              <p className="font-body text-sm text-oil-smoke leading-relaxed mt-4 mb-6">
                A high-productivity sandstone reservoir with active AI-managed pressure maintenance.
                Our neural prediction engine tracks real-time anomalies and schedules preventive
                interventions before failures occur — surrounded by 12 satellite monitoring nodes.
              </p>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-px bg-oil-border mb-6">
                {metrics.map((m, i) => (
                  <div key={i} className="bg-oil-surface px-4 py-3">
                    <p className="font-mono text-[9px] tracking-widest uppercase text-oil-smoke mb-1">{m.key}</p>
                    <p className="font-mono text-sm font-medium text-oil-light">{m.val}</p>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {['ESP Pump', 'AI Optimized', 'Sour Gas Tolerant', 'Near Pipeline'].map(tag => (
                  <span key={tag} className="font-mono text-[10px] tracking-wider uppercase px-3 py-1 border border-oil-border text-oil-smoke">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="font-mono text-xs tracking-widest uppercase px-8 py-3 bg-oil-amber text-oil-black hover:bg-oil-gold transition-colors duration-300">
                Analyze Well
              </button>
              <button className="font-mono text-xs tracking-widest uppercase px-6 py-3 border border-oil-border text-oil-smoke hover:border-oil-amber hover:text-oil-amber transition-colors duration-300">
                View Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
