import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Marketplace from './pages/Marketplace';
import BusinessProfile from './pages/BusinessProfile';
import UserProfile from './pages/UserProfile';
import Wallet from './pages/Wallet';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/business/:id" element={<BusinessProfile />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/wallet" element={<Wallet />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
