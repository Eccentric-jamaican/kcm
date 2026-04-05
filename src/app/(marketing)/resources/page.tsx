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
    <main className="min-h-screen bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Business Registration
          </h1>
          <p className="mt-4 text-gray-500">
            KCM Trades LLC is a registered business entity in Delaware, United States.
          </p>
        </div>

        {/* Documents */}
        <div className="grid gap-8 md:grid-cols-2">
          {documents.map((doc) => (
            <div key={doc.id} className="group">
              {/* Placeholder */}
              <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full border-2 border-dashed border-gray-300" />
                  <span className="text-xs text-gray-400">Document preview</span>
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-900">
                {doc.title}
              </p>
              <p className="text-xs text-gray-400">
                {doc.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 border-t border-gray-100 pt-10 text-center">
          <p className="text-sm text-gray-400">
            Questions? Contact us at{" "}
            <a href="mailto:legal@kcmtrades.com" className="text-gray-600 hover:text-black">
              legal@kcmtrades.com
            </a>
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-gray-400 hover:text-black"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
