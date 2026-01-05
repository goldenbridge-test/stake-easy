import React from 'react';
import { Linkedin, Twitter, Globe } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      name: "Alexandra Chen",
      role: "Chief Executive Officer",
      desc: "Former JP Morgan VP with 15+ years in traditional finance and 5+ years in crypto.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      name: "Marcus Williams",
      role: "Chief Investment Officer",
      desc: "Blockchain researcher and former hedge fund manager with a track record of high-performing DeFi strategies.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      name: "Sophia Rodriguez",
      role: "Head of Technology",
      desc: "Smart contract developer and Web3 architect with contributions to multiple leading DeFi protocols.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400",
    },
    {
      name: "David Kwon",
      role: "Risk Management Director",
      desc: "Specialized in quantitative risk analysis for digital assets and cross-chain investments.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=400",
    }
  ];

  const investors = ["Venture Firm", "Capital Partners", "Blockchain Fund", "Web3 Ventures"];

  return (
    <section id="team" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Titre */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl font-heading font-bold text-primary mb-4">Meet Our Expert Team</h2>
          <p className="text-gray-500 text-lg">
            Led by industry veterans with extensive experience in traditional finance, blockchain technology, and asset management.
          </p>
        </div>

        {/* Grille des membres */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 group">
              {/* Image avec effet de zoom au survol */}
              <div className="h-64 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              
              {/* Contenu de la carte */}
              <div className="p-6">
                <h3 className="text-xl font-heading font-bold text-primary">{member.name}</h3>
                <p className="text-gold font-bold text-sm mb-3 uppercase tracking-wide">{member.role}</p>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  {member.desc}
                </p>
                
                {/* Icônes Réseaux Sociaux */}
                <div className="flex space-x-3">
                  <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-primary hover:text-white transition">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-primary hover:text-white transition">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-primary hover:text-white transition">
                    <Globe className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Investisseurs (Partners) */}
        <div className="pt-10 border-t border-gray-200">
          <h3 className="text-center font-heading font-bold text-primary text-xl mb-8">Backed by leading investors</h3>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {investors.map((investor, i) => (
              <div key={i} className="bg-gray-200 px-8 py-4 rounded-lg font-bold text-gray-500 text-lg">
                {investor}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Team;