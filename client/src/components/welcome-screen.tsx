import { useAuthModal } from "@/hooks/use-auth-modal";
import { Button } from "@/components/ui/button";

export function WelcomeScreen() {
  const { openModal } = useAuthModal();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Analyze Your TikTok Performance</h1>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
          Understand what content works best for your audience with our simple analytics dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="TikTok Analytics Dashboard" 
            className="rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-6">Discover Your Best Content</h2>
          <ul className="space-y-4">
            <li className="flex">
              <svg className="h-6 w-6 text-status-success mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M20 5.293l-7.293 7.293-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-text-secondary">See your top performing videos at a glance</span>
            </li>
            <li className="flex">
              <svg className="h-6 w-6 text-status-success mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M20 5.293l-7.293 7.293-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-text-secondary">Identify content that's underperforming</span>
            </li>
            <li className="flex">
              <svg className="h-6 w-6 text-status-success mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M20 5.293l-7.293 7.293-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-text-secondary">Track views, likes, comments and shares</span>
            </li>
            <li className="flex">
              <svg className="h-6 w-6 text-status-success mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M20 5.293l-7.293 7.293-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 00-1.414-1.414z" clipRule="evenodd" />
              </svg>
              <span className="text-text-secondary">Analyze trends over time to improve your strategy</span>
            </li>
          </ul>
          <div className="mt-8">
            <Button 
              className="bg-primary text-white py-3 px-6 rounded-md shadow-sm hover:bg-blue-700 transition-colors"
              onClick={() => openModal("register")}
            >
              Get Started - It's Free
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-text-primary mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-background-secondary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">Create an Account</h3>
            <p className="text-text-secondary">Sign up in seconds with just an email and password.</p>
          </div>
          <div className="text-center">
            <div className="bg-background-secondary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">Connect TikTok</h3>
            <p className="text-text-secondary">Add your TikTok profile link to analyze your videos.</p>
          </div>
          <div className="text-center">
            <div className="bg-background-secondary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">Get Insights</h3>
            <p className="text-text-secondary">View your analytics dashboard with top and bottom performers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
