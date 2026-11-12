const links = [
  { href: '/about.html', label: 'About Us' },
  { href: '/services.html', label: 'Services' },
  { href: '/blog/', label: 'Blog' },
  { href: '/contact.html', label: 'Contact Us' },
];

export default function SiteLinks() {
  return (
    <nav aria-label="Site pages" className="relative">
      {/* Desktop: inline links */}
      <ul className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="hover:text-slate-900">
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile: dropdown menu */}
      <details className="md:hidden">
        <summary className="cursor-pointer list-none rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
          Pages
        </summary>
        <ul className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
}