import { useState, useEffect } from 'react';
import splashbg from '../../assets/splashbg.jpg';
import splashLogo from '../../assets/splashlogo.jpg';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showPlanets, setShowPlanets] = useState(false);
  
  useEffect(() => {
    // Show animation elements after component mounts
    setTimeout(() => setLoaded(true), 300);
    
    // Set timeout for the splash screen duration
    setShowPlanets(true); // Show planets just before fade out
    const timer = setTimeout(() => {
      setTimeout(() => {
        setFadeOut(true);
      }, 500); // Short delay after planets appear before fade out
    }, 3000);
    
    // Set timeout for the complete removal
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000); // Extended time for planet animations to complete
    
    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);
  
  // Add the animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes flash {
        0% { opacity: 0; }
        30% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      .animate-flash {
        animation: flash 1.2s ease-out forwards;
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.5); }
        50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.8); }
      }
      
      @keyframes slide-in {
        0% { transform: translateY(30px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes expand {
        0% { width: 0; }
        100% { width: 100%; }
      }
      
      @keyframes orbit {
        0% { transform: rotate(0deg) translateX(0) scale(0); opacity: 0; }
        10% { opacity: 1; scale: 1; }
        100% { transform: rotate(360deg) translateX(var(--orbit-radius)) scale(var(--planet-scale)); opacity: 0; }
      }
      
      @keyframes planet-pulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.2); opacity: 1; }
      }
      
      .slide-in {
        animation: slide-in 0.8s ease-out forwards;
      }
      
      .pulse-glow {
        animation: pulse-glow 2s infinite ease-in-out;
      }
      
      .planet-orbit {
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform-origin: center center;
        transform: translate(-50%, -50%);
        animation: orbit 3s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
      }
      
      .planet {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        animation: planet-pulse 1.5s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Generate planets with different orbits and colors
  const renderPlanets = () => {
    if (!showPlanets) return null;
    
    const planets = [];
    const colors = [
      'rgba(135, 206, 250, 0.8)', // Light blue
      'rgba(123, 104, 238, 0.8)', // Medium slate blue
      'rgba(255, 165, 0, 0.8)',   // Orange
      'rgba(255, 105, 180, 0.8)', // Hot pink
      'rgba(50, 205, 50, 0.8)',   // Lime green
      'rgba(255, 215, 0, 0.8)',   // Gold
      'rgba(255, 69, 0, 0.8)',    // Red-orange
      'rgba(75, 0, 130, 0.8)',    // Indigo
      'rgba(240, 248, 255, 0.8)', // Alice blue
      'rgba(0, 255, 127, 0.8)',   // Spring green
    ];
    
    // Create 20 planets with different properties
    for (let i = 0; i < 20; i++) {
      const delay = i * 0.1;
      const radius = 100 + i * 30; // Different orbit paths
      const size = 10 + Math.random() * 15;
      const color = colors[i % colors.length];
      const duration = 2 + Math.random() * 2;
      const scale = 0.5 + Math.random() * 3;
      
      planets.push(
        <div 
          key={i}
          className="planet-orbit"
          style={{
            '--orbit-radius': `${radius}px`,
            '--planet-scale': scale,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          <div 
            className="planet"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        </div>
      );
    }
    
    return planets;
  };
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-700 ${fadeOut ? 'opacity-0 scale-110' : 'opacity-100'}`}>
      {/* Background with gradient and image */}
      <div
        className="absolute inset-0 h-screen w-screen bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(5,20,50,0.8)), url(${splashbg})`,
          filter: fadeOut ? 'blur(10px)' : 'blur(0px)'
        }}
      />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 25 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 15 + 3}px`,
              height: `${Math.random() * 15 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${Math.random() * 100 + 155}, ${Math.random() * 100 + 155}, 255, ${Math.random() * 0.3 + 0.1})`,
              transform: 'translateY(0)',
              animation: `float ${Math.random() * 6 + 6}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Planet system that appears during the flash */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {renderPlanets()}
      </div>
      
      {/* Content container */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        {/* Circle logo with glow effect */}
        <div className={`mx-auto mb-8 w-32 h-32 rounded-full bg-white bg-opacity-10 flex items-center justify-center border-2 border-white border-opacity-50 transform transition-all duration-1000 ${loaded ? 'scale-100 opacity-100 pulse-glow' : 'scale-50 opacity-0'}`}
          style={{
            backdropFilter: 'blur(10px)',
          }}
        >
          <img
            src={splashLogo}
            alt="Logo"
            className={`w-5/6 h-5/6 object-cover rounded-full transition-all duration-1000 ${fadeOut ? 'rotate-180 scale-75' : ''}`}
          />
          <div className={`absolute inset-0 rounded-full border-2 border-white border-opacity-30 transition-all duration-1500 ${loaded ? 'scale-125 opacity-50' : 'scale-100 opacity-0'}`}></div>
        </div>

        {/* Main title with staggered animation */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-wider relative overflow-hidden">
          <div className={`transform transition-all duration-1000 ${loaded ? 'translate-y-0 opacity-100 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white' : 'translate-y-10 opacity-0'}`}
            style={{ textShadow: '0 2px 10px rgba(150, 200, 255, 0.5)' }}
          >
            Jai Dev Balatika Shegal
          </div>
          <div className={`transform transition-all duration-1000 delay-300 ${loaded ? 'translate-y-0 opacity-100 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-300' : 'translate-y-10 opacity-0'}`}
            style={{ textShadow: '0 2px 10px rgba(150, 200, 255, 0.5)' }}
          >
            Yuvak Mandal Burahan
          </div>
        </h1>
        
        {/* Animated horizontal line with gradient */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-white to-transparent mx-auto overflow-hidden mb-6">
          <div className={`h-full transition-all duration-2000 delay-500 ${loaded ? 'w-full opacity-80' : 'w-0 opacity-0'}`}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
              height: '2px'
            }}
          ></div>
        </div>
        
        {/* Tagline with staggered reveal */}
        <p className={`text-xl text-white mt-6 font-light tracking-widest opacity-0 transition-all duration-1000 delay-700 ${loaded ? 'opacity-90' : ''}`}>
          <span className="inline-block mx-2 slide-in" style={{ animationDelay: '0.7s' }}>Unity</span>
          <span className="inline-block mx-2 text-blue-300">•</span>
          <span className="inline-block mx-2 slide-in" style={{ animationDelay: '0.9s' }}>Service</span>
          <span className="inline-block mx-2 text-blue-300">•</span>
          <span className="inline-block mx-2 slide-in" style={{ animationDelay: '1.1s' }}>Progress</span>
        </p>
        
        {/* Advanced loading indicator */}
        <div className="mt-12 flex justify-center space-x-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 bg-white rounded-full transition-all duration-1000 delay-${i*100}`}
              style={{
                opacity: loaded ? 1 : 0,
                animation: loaded ? 'pulse 1.5s infinite ease-in-out' : 'none',
                animationDelay: `${i * 0.2}s`,
                transform: `scale(${1 + i * 0.05})`,
                background: `rgba(255, 255, 255, ${0.7 - i * 0.1})`
              }}
            ></div>
          ))}
        </div>
  
        {/* Enhanced flash animation at the end */}
        <div 
          className={`absolute inset-0 bg-white transition-opacity ${fadeOut ? 'animate-flash' : 'opacity-0'}`}
          style={{ 
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(200,225,255,0.9) 50%, rgba(100,150,255,0) 100%)'
          }}
        ></div>
      </div>
    </div>
  );
};

export default SplashScreen;