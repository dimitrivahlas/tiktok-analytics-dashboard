import { WelcomeScreen } from "@/components/welcome-screen";
import { AuthModal } from "@/components/auth/auth-modal";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/contexts/auth-context";
import { Redirect } from "wouter";

export default function Home() {
  const { user, isLoading } = useAuth();

  // If user is authenticated, redirect to the dashboard
  if (user && !isLoading) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      <Navbar />
      <main className="flex-grow">
        <WelcomeScreen />
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
}
