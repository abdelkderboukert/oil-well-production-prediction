'use client'
import { useState } from 'react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
      style={{ background: 'linear-gradient(to bottom, rgba(10,10,8,0.95) 0%, transparent 100%)' }}>
      
      {/* Logo */}
      <a href="#" className="flex items-center gap-3 group">
        <div className="w-7 h-7 relative">
          <div className="absolute inset-0 border border-oil-amber rotate-45 group-hover:rotate-90 transition-transform duration-500" />
          <div className="absolute inset-[4px] bg-oil-amber rotate-45" />
        </div>
        <span className="font-display text-xl font-bold tracking-widest text-oil-light uppercase">
          Petro<span className="text-oil-amber">AI</span>
        </span>
      </a>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-10">
        {[
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Platform', href: '#' },
          { name: 'Wells', href: '#' },
          { name: 'Reports', href: '#' }
        ].map((item) => (
          <a key={item.name} href={item.href}
            className="font-body text-sm tracking-widest uppercase text-oil-mist hover:text-oil-amber transition-colors duration-300">
            {item.name}
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="hidden md:flex items-center gap-4">
        {/* <a href="#" className="font-mono text-xs tracking-wider text-oil-smoke hover:text-oil-light transition-colors">
          Sign In
        </a>
        <a href="#"
          className="font-mono text-xs tracking-widest uppercase px-5 py-2.5 bg-oil-amber text-oil-black hover:bg-oil-gold transition-colors duration-300">
          Request Access
        </a> */}
      </div>

      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-1.5">
        <span className={`w-6 h-px bg-oil-light transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`w-6 h-px bg-oil-light transition-all ${open ? 'opacity-0' : ''}`} />
        <span className={`w-6 h-px bg-oil-light transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-oil-deep border-t border-oil-border p-8 flex flex-col gap-6 md:hidden">
          {['Platform', 'Wells', 'Analytics', 'Reports'].map((item) => (
            <a key={item} href="#" className="font-body text-sm tracking-widest uppercase text-oil-mist">
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
