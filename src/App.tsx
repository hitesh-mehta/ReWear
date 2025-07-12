
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import AccessibilityWidget from "./components/AccessibilityWidget";
import AccessibilityReader from "./components/AccessibilityReader";
import UniversalThemeToggle from "./components/UniversalThemeToggle";
import { initializeSampleData } from "./lib/localStorage";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AddItem from "./pages/AddItem";
import ItemDetail from "./pages/ItemDetail";
import Browse from "./pages/Browse";
import Similarity from "./pages/Similarity";
import VirtualTryOn from "./pages/VirtualTryOn";
import Followers from "./pages/Followers";
import AdminPanel from "./pages/AdminPanel";
import Donate from "./pages/Donate";
import AccessibilitySettings from "./pages/AccessibilitySettings";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Initialize sample data when app loads
initializeSampleData();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <TooltipProvider>
            <AccessibilityReader>
              <div className="min-h-screen transition-all duration-500 ease-in-out">
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <UniversalThemeToggle />
                  <div className="animate-fade-in">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                      <Route path="/profile/:userId?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/add-item" element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
                      <Route path="/item/:itemId" element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
                      <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
                      <Route path="/similarity/:itemId" element={<ProtectedRoute><Similarity /></ProtectedRoute>} />
                      <Route path="/virtual-try-on/:itemId" element={<ProtectedRoute><VirtualTryOn /></ProtectedRoute>} />
                      <Route path="/followers" element={<ProtectedRoute><Followers /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
                      <Route path="/donate" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
                      <Route path="/accessibility" element={<AccessibilitySettings />} />
                      <Route path="/chat/:userId?" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                  <AccessibilityWidget />
                </BrowserRouter>
              </div>
            </AccessibilityReader>
          </TooltipProvider>
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
