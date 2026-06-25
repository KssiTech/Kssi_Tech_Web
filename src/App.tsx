import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import ContactSupport from "./pages/ContactSupport";
import Blog from "./pages/Blog";
import BlogPostDetail from "./pages/BlogPostDetail";
import News from "./pages/News";
import Resources from "./pages/Resources";
import ProtectedRoute from "./components/ProtectedRoute";
import RequestDemo from "./pages/RequestDemo";
import RegisterInterest from "./pages/RegisterInterest";
import Account from "./pages/Account";
// News pages
import PressReleases from "./pages/news/PressReleases";
import MediaCoverage from "./pages/news/MediaCoverage";
import Awards from "./pages/news/Awards";
import IndustryInsights from "./pages/news/IndustryInsights";
import Newsletter from "./pages/news/Newsletter";
// Download pages
import InstallationGuide from "./pages/downloads/InstallationGuide";
import InstallationGuidePage from "./pages/InstallationGuide";
import UserManual from "./pages/downloads/UserManual";
import DeveloperGuide from "./pages/downloads/DeveloperGuide";
import Tutorials from "./pages/downloads/Tutorials";
import GitHubRepository from "./pages/downloads/GitHubRepository";
// Company pages
import About from "./pages/company/About";
import CompanyNews from "./pages/company/News";
import PartnerProgram from "./pages/company/PartnerProgram";
import ProductPage from "./pages/products/ProductPage";
import Login from "./pages/Login";
import Inbox from "./pages/Inbox";
import SectorPage from "./pages/secteurs/SectorPage";
import SecteursList from "./pages/secteurs/SecteursList";

const queryClient = new QueryClient();

const App = () => {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider>
            <AuthProvider>
              <TooltipProvider>
                <div className="min-h-screen bg-background">
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/contact-support" element={<ContactSupport />} />
                      <Route path="/request-demo" element={<RequestDemo />} />
                      <Route path="/news" element={<News />} />
                      {/* News section routes */}
                      <Route path="/press-releases" element={<PressReleases />} />
                      <Route path="/media-coverage" element={<MediaCoverage />} />
                      <Route path="/awards" element={<Awards />} />
                      <Route path="/news/industry-insights" element={<IndustryInsights />} />
                      <Route path="/news/newsletter" element={<Newsletter />} />
                      {/* Resources routes */}
                      <Route path="/resources" element={<Resources />} />
                      <Route path="/resources/installation-guide" element={<InstallationGuidePage />} />
                      {/* Product routes */}
                      <Route path="/products/:slug" element={<ProductPage />} />
                      {/* Sector routes */}
                      <Route path="/secteurs" element={<SecteursList />} />
                      <Route path="/secteurs/:slug" element={<SectorPage />} />
                      {/* About Us */}
                      <Route path="/about-us" element={<About />} />
                      {/* Blog routes */}
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPostDetail />} />
                      <Route path="/register-interest" element={<RegisterInterest />} />
                      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                      {/* Download routes */}
                      <Route path="/downloads/installation-guide" element={<InstallationGuide />} />
                      <Route path="/downloads/user-manual" element={<UserManual />} />
                      <Route path="/downloads/developer-guide" element={<DeveloperGuide />} />
                      <Route path="/downloads/tutorials" element={<Tutorials />} />
                      <Route path="/downloads/github-repository" element={<GitHubRepository />} />
                      {/* Company routes */}
                      <Route path="/company/news" element={<CompanyNews />} />
                      <Route path="/company/partner-program" element={<PartnerProgram />} />
                    </Routes>
                  </BrowserRouter>
                </div>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('App rendering error:', error);
    return (
      <div style={{ padding: '20px', backgroundColor: '#f0f0f0', color: '#333' }}>
        <h1>KSSI TECH — Loading Error</h1>
        <p>There was an error loading the application. Please check the console for details.</p>
        <pre>{String(error)}</pre>
      </div>
    );
  }
};

export default App;
