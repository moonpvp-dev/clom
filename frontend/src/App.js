import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import NoiseOverlay from "@/components/site/NoiseOverlay";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Quiz from "@/pages/Quiz";
import About from "@/pages/About";
import Ingredients from "@/pages/Ingredients";
import Testing from "@/pages/Testing";
import Athletes from "@/pages/Athletes";
import PermCare from "@/pages/PermCare";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Shipping from "@/pages/Shipping";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Admin from "@/pages/Admin";

import "@/App.css";

function App() {
  return (
    <BrowserRouter>
      <NoiseOverlay />
      <Header />
      <main className="relative z-10 min-h-screen pt-24 lg:pt-28">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:slug" element={<ProductDetail />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/about" element={<About />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/athletes" element={<Athletes />} />
          <Route path="/perm-care" element={<PermCare />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
      <Toaster theme="dark" position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
