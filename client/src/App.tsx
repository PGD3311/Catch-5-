import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SoundProvider } from "@/hooks/useSoundEffects";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Stats from "@/pages/Stats";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/stats" component={Stats} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SoundProvider>
          <Toaster />
          <Router />
        </SoundProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
