const wells = [
  {
    id: 'HM-112',
    name: 'Hassi Messaoud Lake',
    basin: 'Hassi Messaoud · Zone A',
    output: '2,140 bbl/d',
    status: 'Optimal',
    statusColor: '#4ADE80',
    ai: 'Predictive',
    efficiency: 91,
    gradient: 'from-[#1A1208] to-[#0D0A05]',
    accent: '#D4882A',
  },
  {
    id: 'BK-089',
    name: 'Berkine Complex',
    basin: 'Berkine · East Block',
    output: '4,870 bbl/d',
    status: 'High Output',
    statusColor: '#D4882A',
    ai: 'Optimizing',
    efficiency: 96,
    gradient: 'from-[#0D1A0D] to-[#050D05]',
    accent: '#4ADE80',
  },
  {
    id: 'TN-203',
    name: 'Tin Fouyé Tabankort',
    basin: 'Illizi · Southern',
    output: '1,620 bbl/d',
    status: 'Monitoring',
    statusColor: '#60A5FA',
    ai: 'Watching',
    efficiency: 78,
    gradient: 'from-[#0D1018] to-[#05080D]',
    accent: '#60A5FA',
  },
  {
    id: 'RN-441',
    name: 'Rhourde Nouss',
    basin: 'Ouargla · West Flank',
    output: '3,210 bbl/d',
    status: 'Optimal',
    statusColor: '#4ADE80',
    ai: 'Predictive',
    efficiency: 88,
    gradient: 'from-[#1A0D08] to-[#0D0705]',
    accent: '#E8A832',
  },
  {
    id: 'GD-077',
    name: 'Guerrara Deep',
    basin: 'Ghardaïa · Deep Play',
    output: '980 bbl/d',
    status: 'Intervention',
    statusColor: '#F87171',
    ai: 'Alert Active',
    efficiency: 55,
    gradient: 'from-[#180D0D] to-[#0D0505]',
    accent: '#F87171',
  },
  {
    id: 'OZ-330',
    name: 'Oued Zine',
    basin: 'Tébessa · Northern',
    output: '1,450 bbl/d',
    status: 'Monitoring',
    statusColor: '#60A5FA',
    ai: 'Watching',
    efficiency: 82,
    gradient: 'from-[#0A0D18] to-[#050810]',
    accent: '#60A5FA',
  },
]

export default function WellsGrid() {
  return (
    <section className="bg-oil-black py-24 px-8 md:px-16 border-t border-oil-border">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-oil-amber mb-2">
              Our Wells
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-oil-light">
              Immerse Yourself In The<br />
              Intelligence Of AI-Driven Production
            </h2>
          </div>
          <a href="#" className="hidden md:flex font-mono text-xs tracking-widest uppercase text-oil-smoke hover:text-oil-amber transition-colors items-center gap-2">
            View All Wells <span>→</span>
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-oil-border">
          {wells.map((well) => (
            <div key={well.id}
              className="bg-oil-deep group cursor-pointer hover:bg-oil-surface transition-colors duration-300 overflow-hidden">

              {/* Visual card header */}
              <div className={`relative h-44 bg-gradient-to-br ${well.gradient} overflow-hidden`}>
                {/* Mini SVG scene */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
                  {/* Grid */}
                  {[40,80,120,160].map(y => (
                    <line key={y} x1="0" y1={y} x2="300" y2={y} stroke={well.accent} strokeWidth="0.3" strokeOpacity="0.08" />
                  ))}
                  {[60,120,180,240].map(x => (
                    <line key={x} x1={x} y1="0" x2={x} y2="200" stroke={well.accent} strokeWidth="0.3" strokeOpacity="0.08" />
                  ))}

                  {/* Mini derrick */}
                  <g transform="translate(110, 10)">
                    <polygon points="25,0 35,0 55,130 5,130" fill="#0D0A05" stroke={well.accent} strokeWidth="0.6" strokeOpacity="0.4" />
                    {[20,40,60,80,100].map((y,i) => (
                      <line key={i} x1={30-y*0.14} y1={y} x2={30+y*0.14} y2={y} stroke={well.accent} strokeWidth="0.4" strokeOpacity="0.3" />
                    ))}
                  </g>

                  {/* Glow under derrick */}
                  <ellipse cx="150" cy="145" rx="50" ry="15" fill={well.accent} opacity="0.07" />

                  {/* Production line chart */}
                  <polyline
                    points="20,170 50,155 80,162 110,148 140,152 170,138 200,143 230,130 260,135 280,125"
                    fill="none" stroke={well.accent} strokeWidth="1.5" strokeOpacity="0.5" />
                  <polyline
                    points="20,170 50,155 80,162 110,148 140,152 170,138 200,143 230,130 260,135 280,125 280,200 20,200"
                    fill={well.accent} fillOpacity="0.05" />
                </svg>

                {/* Status badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: well.statusColor }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: well.statusColor, opacity: 0.5 }} />
                  </div>
                  <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: well.statusColor }}>
                    {well.status}
                  </span>
                </div>

                {/* Efficiency bar */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-oil-border">
                  <div className="h-full transition-all duration-500" style={{ width: `${well.efficiency}%`, backgroundColor: well.accent }} />
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="font-mono text-[9px] tracking-widest uppercase text-oil-smoke mb-1">{well.basin}</p>
                    <h3 className="font-display text-lg font-bold text-oil-light group-hover:text-oil-amber transition-colors">
                      {well.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[9px] text-oil-smoke">Output</p>
                    <p className="font-mono text-sm font-medium text-oil-light">{well.output}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-oil-border">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] tracking-widest uppercase text-oil-smoke">AI:</span>
                    <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: well.accent }}>{well.ai}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-[9px] text-oil-smoke">Eff.</span>
                    <span className="font-mono text-[9px] font-medium text-oil-light">{well.efficiency}%</span>
                  </div>
                  <button className="font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 border border-oil-border text-oil-smoke hover:border-oil-amber hover:text-oil-amber transition-colors">
                    Analyze
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
