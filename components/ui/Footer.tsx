export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-muted px-8 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
      <span className="font-mono text-xs text-ink/55">
        © {year} 0xdegend.
      </span>
      <span className="font-mono text-xs text-ink/45">
        All rights reserved.
      </span>
    </footer>
  );
}
