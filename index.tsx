import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

// --- Configuration & Types ---

const ZONE_CONFIG = [
  {
    id: "forehead",
    name: "Heaven Zone (Forehead)",
    range: [0, 0.33],
    keywords: "Intelligence, Career, Early Life (Age 15-30), Parents",
    rgb: "167, 139, 250", // Purple
  },
  {
    id: "eyes",
    name: "Fate Zone (Eyes & Brows)",
    range: [0.33, 0.50],
    keywords: "Emotion, Wisdom, Fortune, Ages 30-40",
    rgb: "56, 189, 248", // Cyan
  },
  {
    id: "nose",
    name: "Wealth Zone (Nose & Cheeks)",
    range: [0.50, 0.70],
    keywords: "Wealth, Health, Power, Ego, Ages 40-50",
    rgb: "251, 191, 36", // Amber
  },
  {
    id: "chin",
    name: "Earth Zone (Mouth & Chin)",
    range: [0.70, 1.0],
    keywords: "Personality, Late Life, Subordinates, Stability, Age 60+",
    rgb: "244, 114, 182", // Pink
  },
];

type Reading = {
  zoneId: string;
  text: string;
};

// --- API Helper ---

const analyzeFaceZone = async (
  base64Image: string,
  zone: typeof ZONE_CONFIG[0]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const prompt = `
    You are an expert master of Physiognomy (Face Reading) with deep knowledge of both Western and Chinese traditions.
    
    The user has selected the **${zone.name}** of the face in this image.
    Zone Context: ${zone.keywords}.

    Please provide a formal reading for this specific feature:
    1. Briefly observe the physical characteristics of this area in the photo (shape, smoothness, prominence).
    2. Explain what these features traditionally represent regarding the person's character or destiny based on the Zone Context.
    
    Tone: Mystical, insightful, respectful, yet grounded in traditional face reading theory. Keep it under 150 words.
  `;

  try {
    // Determine MIME type from base64 string
    const mimeTypeMatch = base64Image.match(/^data:(.*);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const cleanBase64 = base64Image.replace(/^data:.*;base64,/, "");

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: cleanBase64 } },
          { text: prompt },
        ],
      },
    });

    return response.text || "Could not generate reading. Please try again.";
  } catch (error) {
    console.error("Error analyzing face:", error);
    return "The spirits are quiet (API Error). Please try again.";
  }
};

// --- Components ---

const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // Only numbers
    if (value.length > 6) return; // Max 6

    setPin(value);
    setError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 6) return;

    const sum = pin.split("").reduce((acc, digit) => acc + parseInt(digit, 10), 0);

    if (sum === 21) {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin(""); // Clear on failure
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-200 selection:bg-amber-500/30">
      <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm text-center relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
            backgroundImage: `linear-gradient(to right, #fbbf24 1px, transparent 1px), linear-gradient(to bottom, #fbbf24 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}></div>

        <div className="relative z-10">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto mb-6 flex items-center justify-center border border-slate-700 shadow-lg shadow-black/50">
             <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          
          <h2 className="text-2xl font-serif text-amber-100 mb-2 tracking-wide">Security Gate</h2>
          <p className="text-slate-400 text-sm mb-8">
            Enter the 6-digit seal.<br/>
            <span className="text-slate-500 text-xs mt-1 block">The digits must sum to exactly 21.</span>
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
              <div className={`relative ${shake ? "animate-shake" : ""}`}>
                  <input 
                      type="text" 
                      inputMode="numeric" 
                      pattern="[0-9]*" 
                      autoComplete="off"
                      autoFocus
                      maxLength={6}
                      value={pin}
                      onChange={handleChange}
                      className="bg-slate-950 text-center text-3xl tracking-[0.5em] text-amber-400 border-b-2 border-slate-700 focus:border-amber-500 outline-none py-3 px-4 w-56 transition-all duration-300 font-mono shadow-inner rounded-t-lg"
                      placeholder="••••••"
                  />
                  <div className="absolute bottom-0 left-0 h-[2px] bg-amber-500 transition-all duration-300" style={{ width: `${(pin.length / 6) * 100}%` }}></div>
              </div>

              {error && (
                  <p className="text-red-400 text-xs font-medium animate-pulse flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Verification Failed. Sum is not 21.</span>
                  </p>
              )}

              <button 
                  type="submit"
                  disabled={pin.length !== 6}
                  className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-amber-100/90 font-medium px-8 py-3 rounded-lg border border-slate-700 hover:border-amber-500/50 transition-all duration-300 shadow-lg active:scale-[0.98]"
              >
                  Unlock Interface
              </button>
          </form>
        </div>
      </div>
      <style>{`
          @keyframes shake {
              0%, 100% { transform: translateX(0); }
              20% { transform: translateX(-8px); }
              40% { transform: translateX(8px); }
              60% { transform: translateX(-4px); }
              80% { transform: translateX(4px); }
          }
          .animate-shake {
              animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          }
      `}</style>
    </div>
  );
};

const App = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [readings, setReadings] = useState<Record<string, string>>({});
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Zoom & Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drag & Drop State
  const [isDragOver, setIsDragOver] = useState(false);
  
  // UI Hint State
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Reset zoom/pan when image changes
    setZoom(1);
    setPan({ x: 0, y: 0 });
    
    if (image) {
      // Show hint briefly when image loads
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [image]);

  const processFile = (file: File) => {
    // Basic validation
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setImage(e.target.result);
        setReadings({});
        setActiveZone(null);
      }
    };
    reader.onerror = () => {
      alert("Failed to load image.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
      // Reset input value to allow re-uploading the same file
      event.target.value = "";
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleZoneClick = async (e: React.MouseEvent<Element, MouseEvent>) => {
    if (!imgRef.current || loading) return;

    const rect = imgRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    const relativeY = y / height;

    const zone = ZONE_CONFIG.find(
      (z) => relativeY >= z.range[0] && relativeY < z.range[1]
    );

    if (zone) {
      setActiveZone(zone.id);
      
      // If we already have a reading, just show it
      if (readings[zone.id]) {
        return;
      }

      setLoading(true);
      if (image) {
        const result = await analyzeFaceZone(image, zone);
        setReadings((prev) => ({ ...prev, [zone.id]: result }));
      }
      setLoading(false);
    }
  };

  const resetApp = () => {
    setImage(null);
    setReadings({});
    setActiveZone(null);
  };

  const getActiveZoneColor = () => {
    const zone = ZONE_CONFIG.find(z => z.id === activeZone);
    return zone ? `rgb(${zone.rgb})` : '#fbbf24'; // Default to amber if undefined
  };

  // Zoom/Pan Handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (!image) return;
    // Simple zoom logic
    const scaleAmount = -e.deltaY * 0.001;
    setZoom(z => {
      const newZoom = Math.min(Math.max(1, z + scaleAmount), 4);
      if (newZoom === 1) setPan({ x: 0, y: 0 });
      return newZoom;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    e.preventDefault();
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    setIsDragging(false);
    dragStart.current = null;

    // Treat as click if movement is small
    if (dist < 5) {
      handleZoneClick(e);
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.5, 4));
  const handleZoomOut = () => setZoom(z => {
    const newZ = Math.max(z - 0.5, 1);
    if (newZ === 1) setPan({x:0, y:0});
    return newZ;
  });
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center p-4 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center py-6 border-b border-slate-800 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-amber-100 tracking-wide">
            Digital Face Reading Grid
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Unlock the secrets of Physiognomy
          </p>
        </div>
        {image && (
          <button
            onClick={resetApp}
            className="text-sm text-slate-400 hover:text-amber-300 transition-colors border border-slate-700 px-3 py-1.5 rounded hover:border-amber-300/50"
          >
            New Reading
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
        
        {/* Left: Image Area */}
        {!image ? (
          <div 
            className={`w-full max-w-md h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer ${
              isDragOver 
                ? "border-amber-400 bg-slate-800 scale-[1.02] shadow-xl shadow-amber-500/10" 
                : "border-slate-700 bg-slate-900/50 hover:bg-slate-900"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <div className={`w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 transition-transform duration-300 ${isDragOver ? "scale-110" : "group-hover:scale-110"}`}>
              <svg className={`w-8 h-8 transition-colors duration-300 ${isDragOver ? "text-amber-400" : "text-amber-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className={`font-medium transition-colors ${isDragOver ? "text-amber-100" : "text-slate-300"}`}>
              {isDragOver ? "Drop Image Here" : "Drag & Drop or Click to Upload"}
            </p>
            <p className="text-slate-500 text-xs mt-2">Supports JPG, PNG, WEBP</p>
          </div>
        ) : (
          <div 
            className={`relative group select-none shadow-2xl shadow-black rounded-lg overflow-hidden max-w-md min-h-[300px] bg-slate-800 ${
              zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
            onWheel={handleWheel}
          >
            {/* Inner Content Wrapper for Transformation */}
            <div 
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              className="w-full h-full"
            >
              {/* The Image */}
              <img
                ref={imgRef}
                src={image}
                alt="Subject"
                className="w-full h-auto block pointer-events-none" 
                draggable={false}
                onError={() => alert("Could not render the image file.")}
              />

              {/* Interactive Grid Overlay */}
              <div className="absolute inset-0">
                {ZONE_CONFIG.map((zone) => {
                  const isActive = activeZone === zone.id;
                  return (
                    <div
                      key={zone.id}
                      className={`absolute w-full flex items-center justify-center transition-all duration-300 box-border ${
                        isActive 
                          ? "z-10 animate-pop" 
                          : "z-0 hover:bg-[rgba(var(--zone-rgb),0.15)] hover:backdrop-blur-[1px]"
                      }`}
                      style={{
                        top: `${zone.range[0] * 100}%`,
                        height: `${(zone.range[1] - zone.range[0]) * 100}%`,
                        "--zone-rgb": zone.rgb,
                      } as React.CSSProperties}
                      title={zone.name}
                    >
                      {/* Inactive State: Grid lines and subtle hover */}
                      <div 
                        className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                          isActive ? "opacity-0" : "opacity-100 group-hover:bg-white/5"
                        }`}
                      >
                        {/* Horizontal Divider */}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10"></div>
                        {/* Subtle Grid Pattern */}
                        <div className="absolute inset-0" style={{ 
                          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                          backgroundSize: '20px 20px'
                        }}></div>
                      </div>

                      {/* Active State: Pulsating Layer (Cross-fades in) */}
                      <div 
                        className={`absolute inset-0 active-zone-layer transition-opacity duration-500 ease-in-out ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      ></div>

                      {/* Zone Label */}
                      <span 
                        className={`relative z-20 text-xs uppercase tracking-widest px-2 py-1 rounded bg-black/50 backdrop-blur-md transition-all duration-500 ${
                          isActive 
                            ? "opacity-100 scale-105" 
                            : "opacity-0 group-hover:opacity-50 text-white scale-100"
                        }`}
                        style={isActive ? {
                          color: `rgb(${zone.rgb})`,
                          textShadow: `0 0 10px rgba(${zone.rgb}, 0.5)`
                        } : undefined}
                      >
                        {zone.name.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scanning Effect (Overlay on Viewport) */}
            {loading && (
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent animate-scan pointer-events-none" style={{ backgroundSize: '100% 20%' }}></div>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30">
               <button 
                 onClick={handleZoomIn} 
                 className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur border border-white/10 transition-colors"
                 title="Zoom In"
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <circle cx="11" cy="11" r="8"></circle>
                   <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                   <line x1="11" y1="8" x2="11" y2="14"></line>
                   <line x1="8" y1="11" x2="14" y2="11"></line>
                 </svg>
               </button>
               <button 
                 onClick={handleZoomOut}
                 className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur border border-white/10 transition-colors"
                 title="Zoom Out"
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <circle cx="11" cy="11" r="8"></circle>
                   <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                   <line x1="8" y1="11" x2="14" y2="11"></line>
                 </svg>
               </button>
               <button 
                 onClick={handleResetZoom}
                 className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur border border-white/10 transition-colors text-xs font-bold uppercase tracking-wider h-[38px] w-[38px] flex items-center justify-center"
                 title="Reset View"
               >
                 1x
               </button>
            </div>
            
            {/* Interaction Hint */}
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-700 ${showHint ? 'opacity-100' : 'opacity-0'}`}>
                <div className="bg-black/60 backdrop-blur-md text-white/90 text-xs font-medium px-4 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-2 whitespace-nowrap">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                    <span>Scroll to Zoom • Drag to Pan</span>
                </div>
            </div>

          </div>
        )}

        {/* Right: Info Panel */}
        <div className="flex-1 w-full min-h-[400px] flex flex-col">
          {!image ? (
            <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 text-center h-full flex flex-col justify-center">
              <h3 className="text-xl font-serif text-slate-300 mb-4">How it works</h3>
              <ul className="text-left space-y-4 text-slate-400 text-sm max-w-xs mx-auto list-disc pl-5">
                <li>Upload a clear photo of a face.</li>
                <li>The Digital Grid will map the 4 key zones.</li>
                <li>Click a zone (Forehead, Eyes, Nose, Chin) to analyze.</li>
                <li>Receive a traditional reading fueled by AI.</li>
              </ul>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-6">
                <h2 
                  className="text-xl font-serif mb-2 transition-colors duration-500"
                  style={{ color: activeZone ? getActiveZoneColor() : '#f1f5f9' }}
                >
                  {activeZone 
                    ? ZONE_CONFIG.find(z => z.id === activeZone)?.name 
                    : "Select a Zone"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {activeZone 
                    ? ZONE_CONFIG.find(z => z.id === activeZone)?.keywords 
                    : "Click on the face grid to reveal the hidden meanings."}
                </p>
              </div>

              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-transparent border-t-current rounded-full animate-spin" style={{ color: getActiveZoneColor() }}></div>
                      <span className="text-xs uppercase tracking-widest animate-pulse" style={{ color: getActiveZoneColor() }}>Reading Face...</span>
                    </div>
                  </div>
                ) : activeZone && readings[activeZone] ? (
                  <div className="prose prose-invert max-w-none animate-in fade-in duration-700">
                     <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
                       {readings[activeZone]}
                     </p>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-600 italic">
                    Waiting for selection...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes zone-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }

        .animate-pop {
          animation: zone-pop 0.4s ease-out forwards;
        }

        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }

        @keyframes zone-pulse {
          0% {
            background-color: rgba(var(--zone-rgb), 0.1);
            border-color: rgba(var(--zone-rgb), 0.3);
            box-shadow: 0 0 5px rgba(var(--zone-rgb), 0.1), inset 0 0 0 rgba(var(--zone-rgb), 0);
          }
          50% {
            background-color: rgba(var(--zone-rgb), 0.2);
            border-color: rgba(var(--zone-rgb), 0.9);
            box-shadow: 0 0 20px rgba(var(--zone-rgb), 0.4), inset 0 0 10px rgba(var(--zone-rgb), 0.2);
          }
          100% {
            background-color: rgba(var(--zone-rgb), 0.1);
            border-color: rgba(var(--zone-rgb), 0.3);
            box-shadow: 0 0 5px rgba(var(--zone-rgb), 0.1), inset 0 0 0 rgba(var(--zone-rgb), 0);
          }
        }

        .active-zone-layer {
          animation: zone-pulse 3s infinite ease-in-out;
          border: 1px solid rgba(var(--zone-rgb), 0.6);
          backdrop-filter: blur(1px);
        }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);