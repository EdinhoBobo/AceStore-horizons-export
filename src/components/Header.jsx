
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShoppingCart, LogOut, Settings, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCart } from '@/hooks/useCart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = ({ onCartClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { cartItems } = useCart();
  const isActive = (path) => location.pathname === path;

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItemClass = (path) => 
    `text-lg font-semibold transition-all duration-300 hover:text-[#0EB8E1] ${
      isActive(path) ? 'text-[#0EB8E1] border-b-2 border-[#0EB8E1]' : 'text-white'
    }`;
  
  const mobileNavItemClass = (path) => 
    `text-sm font-semibold transition-all duration-300 hover:text-[#0EB8E1] ${
      isActive(path) ? 'text-[#0EB8E1]' : 'text-white'
    }`;

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="header-gradient absolute top-0 left-0 right-0 z-40"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <Link to="/">
              <img 
                src="https://horizons-cdn.hostinger.com/234869e4-f518-4a32-bcd3-28c325d66b7c/78effcf7b73a28a3aa2dba92914f621f.png" 
                alt="Ace Store Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={navItemClass('/')}>Home</Link>
            <Link to="/shop" className={navItemClass('/shop')}>Shop</Link>
            <Link to="/checkout" className={navItemClass('/checkout')}>Checkout</Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:text-[#0EB8E1] hover:bg-white/10">
                    {profile?.username && <span className="hidden sm:inline">{profile.username}</span>}
                    <User className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900/80 backdrop-blur-sm border-white/20 text-white">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem onSelect={() => navigate('/account')} className="cursor-pointer focus:bg-white/10 focus:text-white">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                   {profile?.is_admin && (
                    <DropdownMenuItem onSelect={() => navigate('/admin')} className="cursor-pointer focus:bg-white/10 focus:text-white">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/20"/>
                  <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer focus:bg-red-500/20 focus:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/login')}
                  className="text-white hover:text-[#0EB8E1] hover:bg-white/10"
                >
                  <User className="h-6 w-6" />
                </Button>
              </motion.div>
            )}
            
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onCartClick}
                className="text-white hover:text-[#0EB8E1] hover:bg-white/10 relative"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#0EB8E1] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        <nav className="md:hidden mt-4 flex justify-center space-x-6">
          <Link to="/" className={mobileNavItemClass('/')}>Home</Link>
          <Link to="/shop" className={mobileNavItemClass('/shop')}>Shop</Link>
          <Link to="/checkout" className={mobileNavItemClass('/checkout')}>Checkout</Link>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
