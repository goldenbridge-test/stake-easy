import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Investments from './components/Investments';
import Performance from './components/Performance';

function App() {
  return (
    <div className="bg-white min-h-screen font-body text-dark">
      
      {/* 1. Navbar */}
      <Navbar />
      
      <main>
        
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Investments Section (NOUVEAU) */}
        <Investments />
        
        {/* 4. Performance Section (NOUVEAU) */}
        <Performance />

        {/* 5. Team Section (À venir) */}
        <section id="team" className="min-h-[50vh] bg-gray-50 flex items-center justify-center py-20">
          <p className="text-gray-400 font-mono">Section Team (À venir...)</p>
        </section>

      </main>
    </div>
  );
}

export default App;