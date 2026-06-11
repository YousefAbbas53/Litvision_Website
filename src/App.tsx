import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import Register from "./pages/Register";
import Home from "./pages/Home";
import BookDetail from "./pages/BookDetail";
import Category from "./pages/Category";
import Library from "./pages/Library";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Summary from "@/pages/Summary";
import BookTTS from "./pages/BookTTS";
import ChooseInterests from "./pages/ChooseInterests";
import NewProject from "./pages/NewProject";
import ReadBook from "./pages/ReadBook";
import BookVideo from "./pages/BookVideo";

import CustomCursor from "@/components/animations/CustomCursor";
import ParticleBackground from "@/components/animations/ParticleBackground";
import { ThemeProvider } from "next-themes";
import { SoundProvider } from "@/components/audio/SoundManager";
import { VoiceCloningProvider } from "@/components/audio/VoiceCloningContext";


const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <SoundProvider>
      <VoiceCloningProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <CustomCursor />
              <ParticleBackground />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route path="/summary/:id" element={<Summary />} />
                  <Route path="/tts/:id" element={<BookTTS />} />
                  
                  <Route path="/profile" element={<Profile />} />
                    
                  <Route path="/book/:id" element={<BookDetail />} />

                  <Route path="/register" element={<Register />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/read/:id" element={<ReadBook />} />
                  <Route path="/video/:id" element={<BookVideo />} />
                  <Route path="/category" element={<Category />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/onboarding" element={<ChooseInterests />} />
                  <Route path="/new-project" element={<NewProject />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </VoiceCloningProvider>
    </SoundProvider>
  </ThemeProvider>
);

export default App;
