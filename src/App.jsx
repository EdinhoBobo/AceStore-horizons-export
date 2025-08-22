
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ScrollToTopButton from '@/components/ScrollToTopButton.jsx';
import Home from '@/pages/Home.jsx';
import Shop from '@/pages/Shop.jsx';
import Checkout from '@/pages/Checkout.jsx';
import Login from '@/pages/Login.jsx';
import Register from '@/pages/Register.jsx';
import Bots from '@/pages/Bots.jsx';
import Account from '@/pages/Account.jsx';
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/SupabaseAuthContext';
import { CartProvider } from '@/hooks/useCart';
import ShoppingCart from '@/components/ShoppingCart';
import SuggestionWidget from '@/components/SuggestionWidget';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-16 w-16 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (adminOnly && !profile?.is_admin) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-transparent">
            <Helmet>
              <title>Ace Store - Premium Game Items</title>
              <meta name="description" content="The best online store for premium game items - weapons, armors, robots, bikes, and hair styles." />
              <meta property="og:title" content="Ace Store - Premium Game Items" />
              <meta property="og:description" content="The best online store for premium game items." />
            </Helmet>
            
            <Header onCartClick={() => setIsCartOpen(true)} />
            <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
            
            <main className="flex-grow pt-32">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/bots" element={<Bots />} />
                <Route path="/account" element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            
            <Footer />
            <ScrollToTopButton />
            <SuggestionWidget />
            <Toaster />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
