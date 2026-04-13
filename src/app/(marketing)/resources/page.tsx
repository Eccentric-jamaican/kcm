import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Business Registration | KCM Trades",
  description:
    "Official business registration documents for KCM Trades.",
};

const documents = [
  {
    id: 1,
    title: "Certificate of Formation",
    subtitle: "Delaware Division of Corporations",
  },
  {
    id: 2,
    title: "EIN Confirmation",
    subtitle: "Internal Revenue Service (IRS)",
  },
  {
    id: 3,
    title: "Business License",
    subtitle: "State of Delaware",
  },
  {
    id: 4,
    title: "Certificate of Good Standing",
    subtitle: "Delaware Division of Corporations",
  },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-background py-20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Business Registration
          </h1>
          <p className="mt-4 text-muted-foreground">
            KCM Trades LLC is a registered business entity in Delaware, United States.
          </p>
        </div>

        {/* Documents */}
        <div className="grid gap-8 md:grid-cols-2">
          {documents.map((doc) => (
            <div key={doc.id} className="group">
              {/* Placeholder */}
              <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-border bg-muted">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground">Document preview</span>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                {doc.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {doc.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 border-t border-border pt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:legal@kcmtrades.com" className="text-foreground hover:text-kcm-red">
              legal@kcmtrades.com
            </a>
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
