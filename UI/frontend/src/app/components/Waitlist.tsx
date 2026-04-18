export default function Waitlist() {
  return (
    <section className="bg-oil-deep border-t border-oil-border py-24 px-8 md:px-16 relative overflow-hidden">
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="font-display text-[20vw] font-black text-oil-surface/40 whitespace-nowrap leading-none">
          PETROAI
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-oil-amber mb-4">
            Early Access
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-black text-oil-light mb-6 leading-tight">
            Join Our Waiting List
          </h2>
          <p className="font-body text-base text-oil-smoke leading-relaxed mb-10 max-w-md">
            Get early access to the most advanced AI production intelligence platform
            built for oil & gas operators. Be first to optimize your field.
          </p>

          <div className="flex flex-col sm:flex-row gap-0">
            <input
              type="email"
              placeholder="your@company.com"
              className="flex-1 bg-oil-surface border border-oil-border px-5 py-4 font-mono text-sm text-oil-light placeholder-oil-smoke focus:outline-none focus:border-oil-amber transition-colors"
            />
            <button className="px-8 py-4 bg-oil-amber hover:bg-oil-gold text-oil-black font-mono text-xs tracking-widest uppercase transition-colors duration-300 whitespace-nowrap">
              Join Waitlist
            </button>
          </div>

          <p className="font-mono text-[10px] text-oil-smoke mt-4 tracking-wide">
            No spam. No commitment. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
