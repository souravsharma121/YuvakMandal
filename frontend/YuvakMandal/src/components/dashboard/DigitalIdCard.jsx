import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image'; // Import toPng from html-to-image
import splashLogo from '../../assets/splashlogo.png';
import { Download, RotateCw, MapPin, Phone, Mail, Globe, Hash } from 'lucide-react';
import QRCode from "react-qr-code";

const DigitalIdCard = ({ user }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const frontRef = useRef(null);
    const backRef = useRef(null);

    // Data to encode in QR code
    const qrData = JSON.stringify({
        id: user._id,
        name: user.name,
        role: user.role,
        village: user.villageName,
        mobile: user.mobileNumber,
        email: user.email
    });

    const handleDownload = async () => {
        // Determine which side to capture based on current state
        const elementToCapture = isFlipped ? backRef.current : frontRef.current;

        if (elementToCapture) {
            try {
                // Temporarily remove the transform from back side to prevent mirroring
                const originalTransform = elementToCapture.style.transform;
                if (isFlipped && elementToCapture.style.transform) {
                    elementToCapture.style.transform = 'none';
                }

                const dataUrl = await toPng(elementToCapture, {
                    cacheBust: true,
                    pixelRatio: 2, // Higher resolution
                    backgroundColor: isFlipped ? '#111827' : '#ffffff', // Ensure background color is set correctly
                });

                // Restore the original transform
                if (isFlipped) {
                    elementToCapture.style.transform = originalTransform;
                }

                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = `Mandal-ID-${user.name}-${isFlipped ? 'Back' : 'Front'}.png`;
                link.click();
            } catch (err) {
                console.error("Error generating ID card image:", err);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="mb-4 flex gap-4">
                <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <RotateCw size={18} />
                    Flip Card
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    <Download size={18} />
                    Download
                </button>
            </div>

            <div className="relative w-[350px] h-[550px] perspective-1000">
                <div
                    className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                >
                    {/* Front Side */}
                    <div
                        ref={frontRef}
                        className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
                        style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
                            <div className="absolute top-1/2 -left-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
                        </div>

                        {/* Header / Design Top */}
                        <div className="h-44 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 relative z-10 overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                            {/* Adjusted alignment to justify-start and added padding-top to position content higher */}
                            <div className="absolute inset-0 flex flex-col items-center justify-start pt-6">
                                <div className="w-10 h-10 bg-white/20 rounded-full p-1.5 backdrop-blur-md mb-1.5 border border-white/30 shadow-lg">
                                    <img src={splashLogo} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wider drop-shadow-sm text-center px-4 leading-tight">Yuvak Mandal Burahan</h2>
                                <p className="text-[10px] text-indigo-100 font-medium tracking-widest mt-0.5 opacity-90">ESTD. 2025 • Reg. No. HPCD-20378</p>
                            </div>

                            {/* Curve */}
                            <div className="absolute bottom-0 left-0 w-full translate-y-1">
                                <svg viewBox="0 0 1440 320" className="w-full h-16 block text-white fill-current">
                                    <path fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                                </svg>
                            </div>
                        </div>

                        <div className="relative z-20 -mt-16 flex flex-col items-center">
                            <div className="p-1.5 bg-white rounded-full shadow-lg">
                                <div className="w-28 h-28 rounded-full border-4 border-indigo-50 shadow-inner overflow-hidden relative bg-gray-100">
                                    {user.image && user.image.includes('http') ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-indigo-300 text-3xl font-bold bg-indigo-50">
                                            {user.name ? user.name.charAt(0) : 'U'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center mt-3">
                                <h3 className="text-2xl font-bold text-gray-900 leading-tight">{user.name}</h3>
                                <span className="inline-block mt-1 px-4 py-1 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full text-xs font-semibold shadow-sm uppercase tracking-wide">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="mt-6 px-6 relative z-10 w-full max-w-[320px] mx-auto">
                            <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm border border-indigo-50 flex-shrink-0">
                                        <Hash size={16} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mandal ID</p>
                                        <p className="text-sm font-bold text-gray-800 break-all">{user._id ? user._id.slice(-6).toUpperCase() : 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gray-200/60"></div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm border border-red-50 flex-shrink-0">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Village</p>
                                        <p className="text-sm font-bold text-gray-800">{user.villageName || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gray-200/60"></div>

                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm border border-green-50 flex-shrink-0">
                                        <Phone size={16} />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Contact</p>
                                        <p className="text-sm font-bold text-gray-800">{user.mobileNumber || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-3 w-full text-center">
                            <div className="flex items-center justify-center gap-2 opacity-60">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Active Member Card</p>
                            </div>
                        </div>
                    </div>

                    {/* Back Side */}
                    <div
                        ref={backRef}
                        className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 rotate-y-180"
                        style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="h-full relative p-8 flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                            {/* Header Section */}
                            <div className="flex flex-col items-center mb-8 relative z-10">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
                                    <img src={splashLogo} alt="Logo" className="w-10 h-10 object-contain" />
                                </div>
                                <h2 className="text-lg font-bold text-center leading-tight tracking-wide">JAI DEV BALATKA SHEGAL</h2>
                                <h3 className="text-sm font-light text-indigo-300 tracking-wider mt-1">YUVAK MANDAL BURAHAN</h3>
                            </div>

                            {/* Info Section */}
                            <div className="space-y-6 relative z-10 flex-grow">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-indigo-500/20 rounded text-indigo-300">
                                            <MapPin size={14} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Mandal Address</h4>
                                            <p className="text-sm leading-snug text-gray-200">
                                                Panchayat - Tharjun<br />
                                                Tehsil - Chachyot<br />
                                                District - Mandi (HP)<br />
                                                Pin - 175029
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-indigo-500/20 rounded text-indigo-300">
                                            <Phone size={14} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Emergency Contact</h4>
                                            <p className="text-sm text-gray-200 font-medium tracking-wide">+91 82197-69590</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-indigo-500/20 rounded text-indigo-300">
                                            <Mail size={14} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Email Support</h4>
                                            <p className="text-xs text-gray-200 break-all">devbalatikayuvakmandalburahan@gmail.com</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-indigo-500/20 rounded text-indigo-300">
                                            <Globe size={14} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Website</h4>
                                            <p className="text-xs text-gray-200 break-all">https://yuvakmandalapp.vercel.app/</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer / QR Section */}
                            <div className="mt-auto pt-4 border-t border-gray-700/50 flex items-end justify-between gap-2 relative z-10 px-2">
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="bg-white p-1.5 rounded shadow-lg">
                                        <QRCode
                                            size={56}
                                            style={{ height: "56px", maxWidth: "100%", width: "56px" }}
                                            value={qrData}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Profile</p>
                                </div>

                                <div className="text-center flex-grow px-2">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Scan QRs</p>
                                </div>

                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="bg-white p-1.5 rounded shadow-lg">
                                        <QRCode
                                            size={56}
                                            style={{ height: "56px", maxWidth: "100%", width: "56px" }}
                                            value="https://yuvakmandalapp.vercel.app/"
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Website</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </div>
    );
};

export default DigitalIdCard;
