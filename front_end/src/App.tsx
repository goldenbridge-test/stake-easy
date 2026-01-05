import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Investments from './components/Investments';
import Performance from './components/Performance';
import Team from './components/Team';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer'; 

function App() {
  return (
    <div className="bg-white min-h-screen font-body text-dark flex flex-col">
      
      {/* Navigation */}
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <Investments />
        <Performance />
        <Team />
        
        <section id="about" className="py-20 bg-white">
            <div className="text-center max-w-2xl mx-auto px-6">
                 <h2 className="text-3xl font-bold text-primary mb-4">About GoldenBridge</h2>
                 <p className="text-gray-500">
                    We are dedicated to bridging the gap between traditional finance and the decentralized world, 
                    offering institutional-grade security and transparency.
                 </p>
            </div>
        </section>

        <CallToAction />
      </main>

      <Footer />
      
    </div>
  );
}

export default App;