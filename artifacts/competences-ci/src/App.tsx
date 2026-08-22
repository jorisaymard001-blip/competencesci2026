import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { InstallPrompt } from "@/components/InstallPrompt";

// Pages
import Home from "@/pages/Home";
import Schools from "@/pages/Schools";
import SchoolDetail from "@/pages/SchoolDetail";
import Competitions from "@/pages/Competitions";
import CompetitionDetail from "@/pages/CompetitionDetail";
import Favorites from "@/pages/Favorites";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Tips from "@/pages/Tips";
import Profile from "@/pages/Profile";
import About from "@/pages/About";
import DiplomaDetail from "@/pages/DiplomaDetail";
import Orientation from "@/pages/Orientation";
import Candidatures from "@/pages/Candidatures";
import Conseils from "@/pages/Conseils";
import Contact from "@/pages/Contact";
import CompareSchools from "@/pages/CompareSchools";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import Documents from "@/pages/Documents";
import Assistant from "@/pages/Assistant";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Redirect to="/" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/admin"><Admin /></Route>
      <Route path="/login"><PublicOnlyRoute component={Login} /></Route>
      <Route path="/register"><PublicOnlyRoute component={Register} /></Route>

      <Route path="/"><ProtectedRoute component={Home} /></Route>
      {/* Exploration publique : le compte est seulement requis pour les actions personnelles. */}
      <Route path="/schools"><Schools /></Route>
      <Route path="/schools/:id"><SchoolDetail /></Route>
      <Route path="/comparer"><ProtectedRoute component={CompareSchools} /></Route>
      <Route path="/competitions"><Competitions /></Route>
      <Route path="/competitions/:id"><CompetitionDetail /></Route>
      <Route path="/favorites"><ProtectedRoute component={Favorites} /></Route>
      <Route path="/messages"><ProtectedRoute component={Messages} /></Route>
      <Route path="/notifications"><ProtectedRoute component={Notifications} /></Route>
      <Route path="/tips"><ProtectedRoute component={Tips} /></Route>
      <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
      <Route path="/about"><ProtectedRoute component={About} /></Route>
      <Route path="/diplomas/:name"><ProtectedRoute component={DiplomaDetail} /></Route>
      <Route path="/orientation"><ProtectedRoute component={Orientation} /></Route>
      <Route path="/candidatures"><ProtectedRoute component={Candidatures} /></Route>
      <Route path="/documents"><ProtectedRoute component={Documents} /></Route>
      <Route path="/assistant"><Assistant /></Route>
      <Route path="/conseils"><Conseils /></Route>
      <Route path="/contact"><ProtectedRoute component={Contact} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <AuthProvider>
            <FavoritesProvider>
              <ComparisonProvider>
                <NotificationsProvider>
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                    <Router />
                    <InstallPrompt />
                  </WouterRouter>
                  <Toaster />
                </NotificationsProvider>
              </ComparisonProvider>
            </FavoritesProvider>
          </AuthProvider>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
