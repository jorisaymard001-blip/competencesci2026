import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

// Pages
import Home from "@/pages/Home";
import Schools from "@/pages/Schools";
import SchoolDetail from "@/pages/SchoolDetail";
import Competitions from "@/pages/Competitions";
import CompetitionDetail from "@/pages/CompetitionDetail";
import Favorites from "@/pages/Favorites";
import Messages from "@/pages/Messages";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";

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
      {/* Public-only routes (redirect if logged in) */}
      <Route path="/login">
        <PublicOnlyRoute component={Login} />
      </Route>
      <Route path="/register">
        <PublicOnlyRoute component={Register} />
      </Route>

      {/* Protected routes */}
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/schools">
        <ProtectedRoute component={Schools} />
      </Route>
      <Route path="/schools/:id">
        <ProtectedRoute component={SchoolDetail} />
      </Route>
      <Route path="/competitions">
        <ProtectedRoute component={Competitions} />
      </Route>
      <Route path="/competitions/:id">
        <ProtectedRoute component={CompetitionDetail} />
      </Route>
      <Route path="/favorites">
        <ProtectedRoute component={Favorites} />
      </Route>
      <Route path="/messages">
        <ProtectedRoute component={Messages} />
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <FavoritesProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </FavoritesProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
