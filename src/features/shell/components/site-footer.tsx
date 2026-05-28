const footerSections = [
  {
    title: 'Shop',
    links: ['Arboreal', 'Tropical', 'Accessories'],
  },
  {
    title: 'Journal',
    links: ['Sustainability', 'Shipping Policy', 'Wholesale'],
  },
  {
    title: 'Contact',
    links: ['Instagram', 'Newsletter', 'Studio'],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface-container px-6 pb-8 pt-16 text-on-surface sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4">
        <div>
          <span className="mb-6 block font-headline text-xl text-primary">Bonzai</span>
          <p className="max-w-64 font-label text-xs uppercase leading-relaxed tracking-[0.2em] text-on-surface-variant">
            A plant marketplace for thoughtful buyers.
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title} className="flex flex-col gap-4">
            <h2 className="font-label text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {section.title}
            </h2>
            {section.links.map((link) => (
              <a
                key={link}
                href="#"
                className="font-label text-xs uppercase tracking-[0.18em] text-on-surface-variant transition hover:text-primary focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-16 max-w-7xl text-center">
        <p className="font-label text-[10px] uppercase tracking-[0.2em] text-outline">
          Copyright 2026 Bonzai. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
