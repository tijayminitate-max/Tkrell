import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Notes from "./pages/Notes";
import Upload from "./pages/Upload";
import Leaderboard from "./pages/Leaderboard";

import Messages from "./pages/Messages";
import Browse from "./pages/Browse";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/quiz"} component={Quiz} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/browse"} component={Browse} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/notes"} component={Notes} />
      <Route path={"/upload"} component={Upload} />
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
