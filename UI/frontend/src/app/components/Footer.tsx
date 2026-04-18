export default function Footer() {
  return (
    <footer className="bg-oil-black border-t border-oil-border">
      {/* Links row */}
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-oil-amber mb-5">Platform</p>
          {['Dashboard', 'Well Monitoring', 'AI Predictions', 'Alerts & Reports'].map(l => (
            <a key={l} href="#" className="block font-body text-sm text-oil-smoke hover:text-oil-light transition-colors mb-2">{l}</a>
          ))}
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-oil-amber mb-5">Solutions</p>
          {['Onshore Fields', 'Offshore Platforms', 'Shale Plays', 'Enhanced Recovery'].map(l => (
            <a key={l} href="#" className="block font-body text-sm text-oil-smoke hover:text-oil-light transition-colors mb-2">{l}</a>
          ))}
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-oil-amber mb-5">Company</p>
          {['About Us', 'Case Studies', 'Blog', 'Careers'].map(l => (
            <a key={l} href="#" className="block font-body text-sm text-oil-smoke hover:text-oil-light transition-colors mb-2">{l}</a>
          ))}
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-oil-amber mb-5">Contact</p>
          {['Request Demo', 'Support', 'Partners', 'Security'].map(l => (
            <a key={l} href="#" className="block font-body text-sm text-oil-smoke hover:text-oil-light transition-colors mb-2">{l}</a>
          ))}
        </div>
      </div>

      {/* Large brand name — mirrors "KYABIN" in footer */}
      <div className="border-t border-oil-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-16 pt-6 pb-2">
          <div className="flex items-end justify-between">
            <p className="font-mono text-[10px] tracking-widest uppercase text-oil-smoke">
              © 2026 PetroAI Technologies. All rights reserved.
            </p>
            <p className="font-mono text-[10px] tracking-widest uppercase text-oil-smoke">
              Built with AI · For the Field
            </p>
          </div>
        </div>
        <p className="font-display font-black text-oil-surface leading-none select-none overflow-hidden"
          style={{ fontSize: 'clamp(60px, 18vw, 280px)', lineHeight: 0.85, paddingLeft: '2vw' }}>
          PETROAI
        </p>
      </div>
    </footer>
  )
}
