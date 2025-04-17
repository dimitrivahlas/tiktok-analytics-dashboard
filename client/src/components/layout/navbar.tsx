import { useAuth } from "@/contexts/auth-context";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Navbar() {
  const { user, logout } = useAuth();
  const { openModal } = useAuthModal();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-auto text-secondary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <Link href="/">
                <a className="ml-2 text-xl font-semibold text-text-primary">TikTok Analytics</a>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-text-secondary">{user.email}</span>
                <Button 
                  variant="ghost" 
                  className="text-sm text-text-secondary hover:text-text-primary"
                  onClick={() => logout()}
                >
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  className="text-sm font-medium text-primary hover:text-blue-700"
                  onClick={() => openModal("login")}
                >
                  Log in
                </Button>
                <Button 
                  className="text-sm font-medium bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => openModal("register")}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
