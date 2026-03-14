import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "@/pages/Home";
import Schools from "@/pages/Schools";
import SchoolDetail from "@/pages/SchoolDetail";
import Competitions from "@/pages/Competitions";
import CompetitionDetail from "@/pages/CompetitionDetail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Schools Routes */}
      <Route path="/schools" component={Schools} />
      <Route path="/schools/:id" component={SchoolDetail} />
      
      {/* Competitions Routes */}
      <Route path="/competitions" component={Competitions} />
      <Route path="/competitions/:id" component={CompetitionDetail} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
