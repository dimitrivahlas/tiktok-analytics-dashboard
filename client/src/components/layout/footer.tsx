import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <svg className="h-8 w-auto text-secondary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            <Link href="/">
              <a className="ml-2 text-xl font-semibold text-text-primary">TikTok Analytics</a>
            </Link>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy">
              <a className="text-text-secondary hover:text-text-primary">
                Privacy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-text-secondary hover:text-text-primary">
                Terms
              </a>
            </Link>
            <Link href="/contact">
              <a className="text-text-secondary hover:text-text-primary">
                Contact
              </a>
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-text-secondary">
          <p>© {new Date().getFullYear()} TikTok Analytics. All rights reserved.</p>
          <p className="mt-2">Not affiliated with TikTok or ByteDance Ltd.</p>
        </div>
      </div>
    </footer>
  );
}
