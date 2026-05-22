export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel (desktop only) */}
      <div className="hidden lg:flex flex-col justify-between bg-zinc-900 px-12 py-10 overflow-hidden relative">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-500/5 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                <line x1="6" x2="18" y1="17" y2="17" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              MerchantHub
            </span>
          </div>
        </div>

        <div className="relative space-y-6">
          <p className="text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Your stores,<br />
            <span className="text-amber-400">your menu,</span><br />
            your rules.
          </p>
          <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
            MerchantHub gives you a single dashboard to manage every location,
            every product, and every update — all in one place.
          </p>
          <div className="flex items-center gap-6 pt-2">
            {[['Multi-store', 'Manage unlimited locations'],
              ['Real-time', 'Changes go live instantly'],
              ['Secure', 'Row-level data isolation']].map(([title, desc]) => (
              <div key={title} className="flex flex-col gap-0.5">
                <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
                <span className="text-zinc-500 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-zinc-600 text-xs">
          © {new Date().getFullYear()} MerchantHub. All rights reserved.
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center px-6 py-12 bg-[#fafaf9]">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                <line x1="6" x2="18" y1="17" y2="17" />
              </svg>
            </div>
            <span className="font-bold text-zinc-900">MerchantHub</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
