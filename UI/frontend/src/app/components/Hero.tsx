'use client'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden noise">
      {/* Background: SVG industrial oil field scene */}
      <div className="absolute inset-0 z-0">
        {/* Deep gradient sky */}
        <div className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0D0C0A 0%, #1A1208 30%, #2A1A08 55%, #3D2A10 75%, #1A1208 100%)'
          }} />

        {/* Stars */}
        {[...Array(60)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full bg-oil-light opacity-30 animate-pulse-slow"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 50 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 3 + 's',
            }} />
        ))}

        {/* Ground silhouette */}
        <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 500" preserveAspectRatio="none">
          {/* Far hills */}
          <path d="M0 300 Q200 220 400 260 Q600 300 800 240 Q1000 180 1200 220 Q1350 250 1440 230 L1440 500 L0 500Z"
            fill="#1A1208" />
          {/* Mid ground */}
          <path d="M0 380 Q150 340 300 360 Q500 380 700 350 Q900 320 1100 355 Q1300 380 1440 360 L1440 500 L0 500Z"
            fill="#120E06" />

          {/* Oil Derrick 1 - main large */}
          <g transform="translate(680, 90)">
            <polygon points="0,350 40,350 30,0 10,0" fill="#0D0A05" stroke="#D4882A" strokeWidth="0.5" strokeOpacity="0.3" />
            <polygon points="10,0 30,0 50,80 -10,80" fill="none" stroke="#D4882A" strokeWidth="0.5" strokeOpacity="0.3" />
            {[50, 100, 160, 220, 280].map((y, i) => (
              <line key={i} x1={10 - y * 0.2} y1={y} x2={30 + y * 0.2} y2={y} stroke="#D4882A" strokeWidth="0.4" strokeOpacity="0.4" />
            ))}
            <rect x="-5" y="340" width="50" height="10" fill="#1A1208" />
            {/* Pump jack */}
            <g transform="translate(60, 280)">
              <rect x="0" y="0" width="40" height="50" fill="#1A1208" stroke="#D4882A" strokeWidth="0.5" strokeOpacity="0.4" />
              <circle cx="20" cy="-10" r="8" fill="none" stroke="#D4882A" strokeWidth="1" strokeOpacity="0.6" />
              <line x1="20" y1="-18" x2="0" y2="-30" stroke="#D4882A" strokeWidth="1.5" strokeOpacity="0.6" />
              <rect x="-5" y="-32" width="18" height="5" rx="2" fill="#D4882A" opacity="0.6" />
            </g>
          </g>

          {/* Oil Derrick 2 - smaller left */}
          <g transform="translate(200, 180)">
            <polygon points="0,230 25,230 18,0 7,0" fill="#0D0A05" stroke="#D4882A" strokeWidth="0.4" strokeOpacity="0.25" />
            {[40, 80, 120, 170].map((y, i) => (
              <line key={i} x1={7 - y * 0.12} y1={y} x2={18 + y * 0.12} y2={y} stroke="#D4882A" strokeWidth="0.3" strokeOpacity="0.3" />
            ))}
          </g>

          {/* Oil Derrick 3 - right */}
          <g transform="translate(1100, 150)">
            <polygon points="0,260 28,260 20,0 8,0" fill="#0D0A05" stroke="#D4882A" strokeWidth="0.4" strokeOpacity="0.2" />
            {[50, 100, 150, 200].map((y, i) => (
              <line key={i} x1={8 - y * 0.12} y1={y} x2={20 + y * 0.12} y2={y} stroke="#D4882A" strokeWidth="0.3" strokeOpacity="0.25" />
            ))}
          </g>

          {/* Storage tanks */}
          <ellipse cx="350" cy="370" rx="35" ry="10" fill="#1A1208" stroke="#D4882A" strokeWidth="0.4" strokeOpacity="0.3" />
          <rect x="315" y="330" width="70" height="40" fill="#151209" stroke="#D4882A" strokeWidth="0.4" strokeOpacity="0.3" />
          <ellipse cx="350" cy="330" rx="35" ry="10" fill="#1E1510" stroke="#D4882A" strokeWidth="0.4" strokeOpacity="0.3" />

          <ellipse cx="1050" cy="375" rx="28" ry="8" fill="#1A1208" stroke="#D4882A" strokeWidth="0.4" strokeOpacity="0.25" />
          <rect x="1022" y="340" width="56" height="35" fill="#151209" stroke="#D4882A" strokeWidth="0.4" strokeOpacity="0.25" />
          <ellipse cx="1050" cy="340" rx="28" ry="8" fill="#1E1510" stroke="#D4882A" strokeWidth="0.4" strokeOpacity="0.25" />

          {/* Flare stack with glow */}
          <line x1="900" y1="320" x2="900" y2="200" stroke="#D4882A" strokeWidth="2" strokeOpacity="0.5" />
          <ellipse cx="900" cy="200" rx="12" ry="18" fill="#D4882A" opacity="0.15" />
          <ellipse cx="900" cy="200" rx="6" ry="10" fill="#E8A832" opacity="0.4" />
          <ellipse cx="900" cy="198" rx="3" ry="5" fill="#FFF0D0" opacity="0.7" />

          {/* Pipeline */}
          <path d="M315 385 Q500 395 680 390 Q800 388 900 385 Q1000 382 1022 380"
            fill="none" stroke="#D4882A" strokeWidth="2" strokeOpacity="0.2" />
        </svg>

        {/* Atmospheric glow from flare */}
        <div className="absolute"
          style={{
            bottom: '35%', left: '62%',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(212,136,42,0.15) 0%, transparent 70%)',
            transform: 'translateX(-50%)',
          }} />

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64"
          style={{ background: 'linear-gradient(to top, rgba(10,10,8,1) 0%, transparent 100%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-8 md:px-16 pb-0 max-w-7xl mx-auto w-full">
        <div className="mb-2">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-oil-amber border border-oil-amber/30 px-3 py-1 inline-block">
            AI-Powered Production Intelligence
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-oil-light leading-[0.95] mb-6 max-w-3xl"
          style={{ textShadow: '0 0 80px rgba(212,136,42,0.15)' }}>
          Optimize<br />
          <em className="text-oil-amber not-italic">Every</em> Well.<br />
          Maximize Output.
        </h1>

        {/* Search / Filter bar — mirroring Kyabin's booking bar */}
        <div className="bg-oil-deep/90 backdrop-blur-sm border border-oil-border flex flex-col md:flex-row items-stretch md:items-center mb-0">
          {[
            { label: 'Field Zone', placeholder: 'All Fields', icon: '◈' },
            { label: 'Production Type', placeholder: 'Onshore · Offshore · Shale', icon: '⬡' },
            { label: 'Well Count', placeholder: 'Select Range', icon: '◎' },
          ].map((item, i) => (
            <div key={i} className="flex-1 flex items-center gap-3 px-6 py-4 border-b md:border-b-0 md:border-r border-oil-border group cursor-pointer hover:bg-oil-surface/50 transition-colors">
              <span className="text-oil-amber text-lg">{item.icon}</span>
              <div>
                <p className="font-mono text-[10px] tracking-widest uppercase text-oil-smoke mb-0.5">{item.label}</p>
                <p className="font-body text-sm text-oil-mist group-hover:text-oil-light transition-colors">{item.placeholder}</p>
              </div>
            </div>
          ))}
          <a href="/dashboard" className="px-8 py-4 bg-oil-amber hover:bg-oil-gold text-oil-black font-mono text-xs tracking-widest uppercase transition-colors duration-300 flex items-center gap-2 whitespace-nowrap">
            <span>Analyze Wells</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
