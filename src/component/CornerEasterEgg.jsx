import React, { useState, useEffect } from 'react';
import { DraggableCardContainer, DraggableCardBody } from './ui/DraggableCard';
import { Instagram, Linkedin, Globe, Github, Mail, X } from 'lucide-react';

const CornerEasterEgg = ({ isOpen, onClose }) => {
  const [activeCorner, setActiveCorner] = useState(null);

  // Generate positions for each corner
  const generateCornerPosition = (corner) => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    // Card dimensions
    const cardWidth = 208; // w-52 = 208px
    const cardHeight = 320; // h-80 = 320px
    
    const margin = 20; // Safe margin from edges
    
    switch (corner) {
      case 'top-left':
        return { x: margin, y: margin };
      case 'top-right':
        return { x: viewportWidth - cardWidth - margin, y: margin };
      case 'bottom-left':
        return { x: margin, y: viewportHeight - cardHeight - margin };
      case 'bottom-right':
        return { x: viewportWidth - cardWidth - margin, y: viewportHeight - cardHeight - margin };
      default:
        return { x: margin, y: margin };
    }
  };

  const developers = [
    {
      name: "Julian Dwi Satrio",
      role: "Frontend Developer", 
      image: "/storage/julian.png",
      corner: 'top-left',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/juliandwii', icon: Instagram, color: 'text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20' },
        { type: 'linkedin', url: 'https://linkedin.com/in/juliandwi', icon: Linkedin, color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
        { type: 'github', url: 'https://github.com/jouleee', icon: Github, color: 'text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20' },
        { type: 'website', url: 'https://juliandwi.dev', icon: Globe, color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' }
      ],
      gradient: "from-blue-500/20 via-purple-500/20 to-blue-600/20",
      borderGradient: "from-blue-400/30 to-purple-400/30"
    },
    {
      name: "Abdurrahman Al Ghifari",
      role: "Quality Assurance Analyst",
      image: "/storage/Ghifari.png",
      corner: 'top-right',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/ghifaaaarr_', icon: Instagram, color: 'text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20' },
        { type: 'linkedin', url: 'https://linkedin.com/in/alghifarii', icon: Linkedin, color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
        { type: 'github', url: 'https://github.com/ghifaaaarr', icon: Github, color: 'text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20' },
        { type: 'email', url: 'mailto:ghifari@bersekolah.org', icon: Mail, color: 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20' }
      ],
      gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
      borderGradient: "from-green-400/30 to-emerald-400/30"
    },
    {
      name: "Ahmad Izzuddin Azzam", 
      role: "Backend Developer",
      image: "/storage/Azzam.png",
      corner: 'bottom-left',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/izzuddn.azzm', icon: Instagram, color: 'text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20' },
        { type: 'linkedin', url: 'https://linkedin.com/in/izzuddn-azzm', icon: Linkedin, color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
        { type: 'github', url: 'https://github.com/izzuddn-azzm', icon: Github, color: 'text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20' },
        { type: 'website', url: 'https://izzuddn.dev', icon: Globe, color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' }
      ],
      gradient: "from-purple-500/20 via-violet-500/20 to-pink-500/20",
      borderGradient: "from-purple-400/30 to-pink-400/30"
    },
    {
      name: "Arya Jagadditha",
      role: "Project Manager",
      image: "/storage/Rhea.png",
      corner: 'bottom-right',
      socials: [
        { type: 'instagram', url: 'https://instagram.com/jgdthaa', icon: Instagram, color: 'text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20' },
        { type: 'linkedin', url: 'https://www.linkedin.com/in/jagadditha', icon: Linkedin, color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20' },
        { type: 'github', url: 'https://github.com/jagadditha', icon: Github, color: 'text-gray-300 bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20' },
        { type: 'website', url: 'https://jagadditha.dev', icon: Globe, color: 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20' }
      ],
      gradient: "from-orange-500/20 via-red-500/20 to-pink-500/20",
      borderGradient: "from-orange-400/30 to-red-400/30"
    }
  ];

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isOpen]);

  // Handle corner click
  const handleCornerClick = (corner) => {
    setActiveCorner(activeCorner === corner ? null : corner);
  };

  if (!isOpen) return null;

  return (
    <DraggableCardContainer onClose={onClose}>
      {/* Corner Triggers */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Top Left Corner */}
        <div 
          className="absolute top-0 left-0 w-20 h-20 pointer-events-auto cursor-pointer group"
          onClick={() => handleCornerClick('top-left')}
        >
          <div className="absolute top-2 left-2 w-16 h-16 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full backdrop-blur-sm border border-white/30 opacity-30 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <span className="text-white/90 text-xs font-medium">👨‍💻</span>
          </div>
        </div>

        {/* Top Right Corner */}
        <div 
          className="absolute top-0 right-0 w-20 h-20 pointer-events-auto cursor-pointer group"
          onClick={() => handleCornerClick('top-right')}
        >
          <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full backdrop-blur-sm border border-white/30 opacity-30 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <span className="text-white/90 text-xs font-medium">🔍</span>
          </div>
        </div>

        {/* Bottom Left Corner */}
        <div 
          className="absolute bottom-0 left-0 w-20 h-20 pointer-events-auto cursor-pointer group"
          onClick={() => handleCornerClick('bottom-left')}
        >
          <div className="absolute bottom-2 left-2 w-16 h-16 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full backdrop-blur-sm border border-white/30 opacity-30 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <span className="text-white/90 text-xs font-medium">⚙️</span>
          </div>
        </div>

        {/* Bottom Right Corner */}
        <div 
          className="absolute bottom-0 right-0 w-20 h-20 pointer-events-auto cursor-pointer group"
          onClick={() => handleCornerClick('bottom-right')}
        >
          <div className="absolute bottom-2 right-2 w-16 h-16 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full backdrop-blur-sm border border-white/30 opacity-30 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <span className="text-white/90 text-xs font-medium">📋</span>
          </div>
        </div>
      </div>

      {/* Developer Cards */}
      {developers.map((dev) => (
        <DraggableCardBody
          key={dev.name}
          initialPosition={generateCornerPosition(dev.corner)}
          isVisible={activeCorner === dev.corner}
        >
            {/* Glassmorphism Card */}
            <div className="relative overflow-hidden w-52 h-80 rounded-2xl group">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-30 p-2 bg-black/30 hover:bg-black/50 rounded-full backdrop-blur-sm border border-white/30 transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <X className="w-4 h-4 text-white/90" />
              </button>

              {/* Glass Background with Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${dev.gradient} backdrop-blur-xl`} />
              
              {/* Glass Border */}
              <div className={`absolute inset-0 bg-gradient-to-br ${dev.borderGradient} rounded-2xl opacity-60`} 
                   style={{
                     background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
                     backdropFilter: 'blur(20px)',
                     border: '1px solid rgba(255,255,255,0.18)'
                   }} />
              
              {/* Inner Glass Layer */}
              <div className="absolute inset-0.5 bg-white/5 rounded-2xl backdrop-blur-sm" />
              
              <div className="relative z-10 flex flex-col items-center justify-between h-full p-4">
                {/* Profile Image with Glass Effect */}
                <div className="relative">
                  {/* Glow Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${dev.gradient} rounded-xl blur-xl opacity-40 group-hover:opacity-60 transition-all duration-500 scale-110`} />
                  
                  {/* Glass Ring */}
                  <div className="absolute inset-0 rounded-xl ring-2 ring-white/20 backdrop-blur-sm bg-white/10" />
                  
                  <div className="relative overflow-hidden border rounded-xl backdrop-blur-sm bg-white/10 border-white/20">
                    <img
                      src={dev.image}
                      alt={dev.name}
                      className="object-cover w-24 h-24 transition-transform duration-300 group-hover:scale-110"
                      draggable={false}
                      style={{ backfaceVisibility: 'hidden' }}
                    />
                  </div>
                </div>

                {/* Developer Info */}
                <div className="flex flex-col items-center mt-3 text-center">
                  <h3 className="text-lg font-bold text-white transition-colors duration-300 drop-shadow-lg group-hover:text-white/90">
                    {dev.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium transition-colors duration-300 text-white/80 drop-shadow">
                    {dev.role}
                  </p>
                  
                  {/* Glassmorphism Decorative Elements */}
                  <div className="flex justify-center mt-3 space-x-1">
                    {[0, 1, 2].map((i) => (
                      <div 
                        key={i}
                        className="w-2 h-2 border rounded-full backdrop-blur-sm bg-white/30 border-white/40"
                        style={{
                          animation: `pulse 2s ease-in-out infinite`,
                          animationDelay: `${i * 0.3}s`,
                          boxShadow: '0 0 10px rgba(255,255,255,0.3)'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Glassmorphism Social Links */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {dev.socials.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={social.type}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2.5 transition-all duration-300 rounded-xl backdrop-blur-sm ${social.color} border hover:scale-110 hover:-translate-y-0.5 active:scale-95 group/link pointer-events-auto`}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                        title={`${dev.name}'s ${social.type}`}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconComponent className="w-4 h-4 transition-transform duration-200 group-hover/link:scale-110 drop-shadow-sm" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Glass Shine Effect */}
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none rounded-2xl group-hover:opacity-100"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)'
                   }} />
            </div>
          </DraggableCardBody>
        ))}
    </DraggableCardContainer>
  );
};

export default CornerEasterEgg;
