import Link from "next/link";

export function PlatformFooter() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} KCM Trades</p>
          <div className="flex items-center gap-4">
            <Link href="/app" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/app/browse" className="hover:text-foreground transition-colors">
              Browse
            </Link>
            <Link href="/" className="hover:text-foreground transition-colors">
              Marketing Site
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
