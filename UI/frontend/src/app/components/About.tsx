export default function About() {
  const stats = [
    { value: '+94%', label: 'Uptime Rate' },
    { value: '+3.2×', label: 'Output Gain' },
    { value: '−38%', label: 'Downtime' },
    { value: '+60', label: 'Wells Monitored' },
  ]

  return (
    <section className="bg-oil-black py-24 px-8 md:px-16 border-t border-oil-border">
      <div className="max-w-7xl mx-auto">

        {/* Top row: label */}
        <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-oil-amber mb-12">
          About the Platform
        </p>

        {/* Two-column like Kyabin */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-16">
          <div className="md:w-1/2">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-oil-light leading-tight">
              We Bring AI Intelligence<br />
              To Every Barrel Pumped.
            </h2>
          </div>
          <div className="md:w-1/2 flex flex-col justify-between gap-8">
            <p className="font-body text-base text-oil-smoke leading-relaxed">
              We deliver a suite of AI-driven tools calibrated to your field&apos;s unique conditions.
              Whether you manage a single well or a multi-basin portfolio, PetroAI provides the
              ideal analytical layer to maximize recovery, prevent failures, and cut operating costs.
            </p>
            <div className="flex items-center gap-4">
              <a href="#"
                className="font-mono text-xs tracking-widest uppercase px-6 py-3 border border-oil-amber text-oil-amber hover:bg-oil-amber hover:text-oil-black transition-all duration-300">
                Learn More
              </a>
              <a href="#" className="font-mono text-xs tracking-widest uppercase text-oil-smoke hover:text-oil-mist transition-colors flex items-center gap-2">
                Watch Demo <span className="text-oil-amber">→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Stats row — like Kyabin's +80 +100 +30 +50 */}
        <div className="border-t border-oil-border pt-12 grid grid-cols-2 md:grid-cols-4 gap-0">
          {stats.map((s, i) => (
            <div key={i}
              className="border-r border-oil-border last:border-r-0 px-8 first:pl-0 group cursor-default">
              <p className="font-display text-5xl md:text-6xl font-black text-oil-amber mb-2 group-hover:text-oil-gold transition-colors duration-300">
                {s.value}
              </p>
              <p className="font-mono text-xs tracking-widest uppercase text-oil-smoke">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
