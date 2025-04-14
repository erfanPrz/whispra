import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import MessageForm from './components/MessageForm';
import UserProfile from './components/UserProfile';
import HeroSection from './components/landing/HeroSection';
import Features from './components/landing/Features';
import HowItWorks from './components/landing/HowItWorks';
import Testimonials from './components/landing/Testimonials';

const MessagePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  return username ? <MessageForm username={username} /> : null;
};

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  return username ? <UserProfile username={username} /> : null;
};

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Features />
      <HowItWorks />
      <Testimonials />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:username" element={<MessagePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
};

export default App;
