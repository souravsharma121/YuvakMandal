// components/layout/SplashScreen.js
import { useState, useEffect } from 'react';
import splashbg from '../../assets/splashbg.jpg'; // Adjust the path as necessary
import splashLogo from '../../assets/splashlogo.jpg'; // Adjust the path as necessary
const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Show animation elements after component mounts
    setTimeout(() => setLoaded(true), 300);
    
    // Set timeout for the splash screen duration
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 3000); // Start fade out slightly before the full duration
    
    // Set timeout for the complete removal
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2200); // Additional time for the fade out animation to complete
    
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
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
      .animate-flash {
        animation: flash 0.5s ease-out forwards;
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background with image and overlay combined */}
      <div
        className="absolute inset-0 h-screen w-screen bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${splashbg})`,
        }}
      />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-blue-500 rounded-full opacity-20"
            style={{
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: 'translateY(0)',
              animation: `float ${Math.random() * 8 + 8}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Content container */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        {/* Circle logo placeholder */}
        <div className={`mx-auto mb-6 w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-2 border-white border-opacity-40 transform transition-all duration-700 ${loaded ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <img
            src={splashLogo}
            alt="Logo"
            className="w-full h-full object-cover rounded-full"
          />
        </div>

      
        {/* Main title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-wide relative overflow-hidden">
          <div className={`transform transition-all duration-1000 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Jai Dev Balatika Shegal
          </div>
          <div className={`transform transition-all duration-1000 delay-100 ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Yuvak Mandal Burahan
          </div>
        </h1>
        
        {/* Animated horizontal line */}
        <div className={`h-px bg-white mx-auto w-0 transition-all duration-1500 delay-300 ${loaded ? 'w-3/4 opacity-70' : 'opacity-0'}`}></div>
        
        {/* Tagline */}
        <p className={`text-lg text-white mt-6 opacity-0 transition-all duration-1000 delay-500 ${loaded ? 'opacity-70' : ''}`}>
          Unity • Service • Progress
        </p>
        
        {/* Loading indicator */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className={`w-2 h-2 bg-white rounded-full transition-all ${loaded ? 'animate-pulse' : 'opacity-0'}`}></div>
          <div className={`w-2 h-2 bg-white rounded-full transition-all ${loaded ? 'animate-pulse delay-100' : 'opacity-0'}`} style={{animationDelay: '0.2s'}}></div>
          <div className={`w-2 h-2 bg-white rounded-full transition-all ${loaded ? 'animate-pulse delay-200' : 'opacity-0'}`} style={{animationDelay: '0.4s'}}></div>
        </div>
  
        {/* Flash animation at the end */}
        <div className={`absolute inset-0 bg-white ${fadeOut ? 'animate-flash' : 'opacity-0'}`}></div>
      </div>
    </div>
  );
};

export default SplashScreen;