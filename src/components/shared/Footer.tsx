export function Footer() {
  return (
    <footer className="mt-24 border-t bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="font-serif text-xl">Ruhulqudus Academy</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            An elite digital institution for the Arabic language, founded by Dr. Gehan Ali Ahmed.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Learn</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Courses</li><li>Bundles</li><li>Live Classes</li><li>Assessments</li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Teach</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Certification</li><li>Curriculum Tools</li><li>Affiliate Program</li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Academy</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>About Dr. Gehan</li><li>Community</li><li>Contact</li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ruhulqudus Academy. All rights reserved.
      </div>
    </footer>
  );
}
