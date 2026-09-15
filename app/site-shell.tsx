import Link from "next/link";

export function Brand() {
  return <Link className="brand" href="/" aria-label="ScaleFrame home"><span className="brand-mark" aria-hidden="true"><i /><i /></span><span>SCALE<span>FRAME</span></span></Link>;
}

export function SiteShell({ children, active = "" }: { children: React.ReactNode; active?: string }) {
  return <div className="site-shell">
    <header className="topbar">
      <Brand />
      <nav className="main-nav" aria-label="Primary navigation">
        {[["Compare", "/#workspace"], ["Explore", "/explore"], ["Analysis", "/analysis/strategist-ceiling"], ["Studio", "/studio/demo"], ["Library", "/library"]].map(([label, href]) => <Link className={active === label.toLowerCase() ? "active" : ""} key={label} href={href}>{label}</Link>)}
      </nav>
      <div className="top-actions"><Link className="text-button" href="/auth/sign-in">Account</Link><Link className="button button-small button-light" href="/compare/new">Create <span>↗</span></Link></div>
    </header>
    {children}
    <footer className="footer section-pad"><div className="footer-top"><Brand /><p>Structured creative tools for fictional comparison culture.</p><div className="footer-links"><Link href="/library">Methodology</Link><Link href="/explore">Guidelines</Link><Link href="/settings">Privacy</Link><Link href="/moderation">Trust & safety</Link></div></div><div className="footer-bottom"><span>© 2026 SCALEFRAME / PUBLIC BETA</span><span>BUILT FOR BETTER RECEIPTS.</span></div></footer>
  </div>;
}
