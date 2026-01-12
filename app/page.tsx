"use client";

import { useState, useCallback } from "react";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [provider, setProvider] = useState<"nanobanana" | "openai" | "stability" | "replicate">("nanobanana");
  const [designSettings, setDesignSettings] = useState({
    scale: 100,
    rotation: 0,
    opacity: 100,
    color: "#ffffff",
    merchandiseType: "t-shirt",
  });

  const handleFileUpload = useCallback((file: File) => {
    if (file && (file.type.startsWith("image/") || file.type === "image/svg+xml")) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const colorToHex = useCallback((color: string): string => {
    if (!color) return "#ffffff";
    const trimmedColor = color.trim();
    
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(trimmedColor)) {
      if (trimmedColor.length === 4) {
        return `#${trimmedColor[1]}${trimmedColor[1]}${trimmedColor[2]}${trimmedColor[2]}${trimmedColor[3]}${trimmedColor[3]}`;
      }
      return trimmedColor;
    }
    
    try {
      const ctx = document.createElement("canvas").getContext("2d");
      if (ctx) {
        ctx.fillStyle = trimmedColor;
        const computedColor = ctx.fillStyle;
        if (computedColor && computedColor !== trimmedColor && computedColor.startsWith("#")) {
          return computedColor;
        }
      }
    } catch (e) {
      // Fall through to color map
    }
    
    const colorMap: Record<string, string> = {
      "red": "#ff0000", "green": "#008000", "blue": "#0000ff", "yellow": "#ffff00",
      "orange": "#ffa500", "purple": "#800080", "pink": "#ffc0cb", "black": "#000000",
      "white": "#ffffff", "gray": "#808080", "grey": "#808080", "cyan": "#00ffff",
      "magenta": "#ff00ff", "lime": "#00ff00", "navy": "#000080", "maroon": "#800000",
      "olive": "#808000", "teal": "#008080", "silver": "#c0c0c0", "gold": "#ffd700",
      "indigo": "#4b0082", "violet": "#ee82ee", "coral": "#ff7f50", "turquoise": "#40e0d0",
    };
    
    return colorMap[trimmedColor.toLowerCase()] || "#ffffff";
  }, []);

  const handleEnhance = useCallback(async () => {
    if (!uploadedFile) {
      setError("Please upload an image first");
      return;
    }
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    setIsEnhancing(true);
    setError(null);
    setEnhancedUrl(null);

    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);
      formData.append("productType", designSettings.merchandiseType);
      formData.append("color", designSettings.color);
      formData.append("apiKey", apiKey);
      formData.append("provider", provider);

      const response = await fetch("/api/enhance", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enhance image");
      }

      setEnhancedUrl(data.image);
    } catch (err: any) {
      console.error("Enhancement error:", err);
      let errorMessage = "An error occurred while enhancing the image";
      
      if (err.message) {
        try {
          const jsonMatch = err.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const errorJson = JSON.parse(jsonMatch[0]);
            if (errorJson.error?.message) {
              errorMessage = errorJson.error.message;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.error) {
              errorMessage = String(errorJson.error);
            }
          } else {
            errorMessage = err.message.replace(/^[^:]+:\s*/, "").trim();
          }
        } catch (parseError) {
          errorMessage = err.message
            .replace(/^[^:]+:\s*/, "")
            .replace(/\{[\s\S]*\}/, "")
            .trim() || "An error occurred while enhancing the image";
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  }, [uploadedFile, apiKey, provider, designSettings.merchandiseType, designSettings.color]);

  const merchandiseTypes = [
    { id: "t-shirt", label: "T-Shirt", icon: "👕" },
    { id: "hoodie", label: "Hoodie", icon: "🧥" },
    { id: "mug", label: "Mug", icon: "☕" },
    { id: "poster", label: "Poster", icon: "🖼️" },
    { id: "sticker", label: "Sticker", icon: "🏷️" },
    { id: "tote-bag", label: "Tote Bag", icon: "👜" },
  ];

  const providers = [
    { value: "nanobanana", label: "Gemini", icon: "✨" },
    { value: "openai", label: "DALL-E", icon: "🎨" },
    { value: "stability", label: "Stability", icon: "🌟" },
    { value: "replicate", label: "Replicate", icon: "⚡" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-violet-200 to-blue-200 bg-clip-text text-transparent">
                  2D Merch Studio
                </h1>
                <p className="text-sm text-gray-400 mt-1">Transform designs into premium merchandise</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center gap-2 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto custom-scrollbar lg:self-start">
            <div className="space-y-8">
            {/* File Upload Card */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 hover:border-[#333333] transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold">Upload Design</h2>
              </div>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
                  isDragging
                    ? "border-violet-500 bg-violet-500/10 scale-[1.02]"
                    : "border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#0a0a0a]"
                }`}
              >
                <input
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-5 w-full">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <p className="text-white font-medium text-base">
                      {uploadedFile ? uploadedFile.name : "Drag & drop your file"}
                    </p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG, WEBP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Design Controls */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 hover:border-[#333333] transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold">Controls</h2>
              </div>

              <div className="space-y-6">
                {/* Scale */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-400 font-medium">Scale</label>
                    <span className="text-sm font-semibold text-white">{designSettings.scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={designSettings.scale}
                    onChange={(e) => setDesignSettings({ ...designSettings, scale: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-400 font-medium">Rotation</label>
                    <span className="text-sm font-semibold text-white">{designSettings.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={designSettings.rotation}
                    onChange={(e) => setDesignSettings({ ...designSettings, rotation: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-gray-400 font-medium">Opacity</label>
                    <span className="text-sm font-semibold text-white">{designSettings.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={designSettings.opacity}
                    onChange={(e) => setDesignSettings({ ...designSettings, opacity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                {/* Color */}
                <div className="space-y-3">
                  <label className="text-sm text-gray-400 font-medium block">Color Overlay</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={colorToHex(designSettings.color)}
                      onChange={(e) => setDesignSettings({ ...designSettings, color: e.target.value })}
                      className="w-14 h-14 rounded-xl border-2 border-[#2a2a2a] cursor-pointer bg-transparent flex-shrink-0"
                    />
                    <input
                      type="text"
                      value={designSettings.color}
                      onChange={(e) => setDesignSettings({ ...designSettings, color: e.target.value })}
                      onBlur={(e) => setDesignSettings({ ...designSettings, color: colorToHex(e.target.value) })}
                      className="flex-1 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                      placeholder="#ffffff or color name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Type */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 hover:border-[#333333] transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold">Product Type</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {merchandiseTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDesignSettings({ ...designSettings, merchandiseType: type.id })}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[80px] ${
                      designSettings.merchandiseType === type.id
                        ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20 scale-105"
                        : "border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#0a0a0a] hover:scale-102"
                    }`}
                  >
                    <span className="text-2xl mb-2 flex-shrink-0">{type.icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
            </div>
          </div>

          {/* Center Preview */}
          <div className="lg:col-span-1">
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 h-[calc(100vh-8rem)] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Preview</h2>
                {enhancedUrl && (
                  <button
                    onClick={() => setEnhancedUrl(null)}
                    className="px-4 py-2 text-sm rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white transition-colors border border-[#2a2a2a]"
                  >
                    Original
                  </button>
                )}
              </div>
              
              <div className="flex-1 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] rounded-xl border border-[#222222] flex items-center justify-center overflow-hidden relative min-h-0">
                {enhancedUrl ? (
                  <img src={enhancedUrl} alt="Enhanced" className="max-w-full max-h-full object-contain p-4" />
                ) : previewUrl ? (
                  <div
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                      transform: `scale(${designSettings.scale / 100}) rotate(${designSettings.rotation}deg)`,
                      opacity: designSettings.opacity / 100,
                    }}
                  >
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain p-4" />
                    <div
                      className="absolute inset-0 mix-blend-overlay pointer-events-none"
                      style={{ backgroundColor: colorToHex(designSettings.color), opacity: 0.2 }}
                    ></div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="w-24 h-24 rounded-2xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Upload a design to preview</p>
                  </div>
                )}
              </div>

              {previewUrl && (
                <div className="mt-6 p-5 bg-[#1a1a1a] rounded-xl border border-[#222222] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Product</p>
                      <p className="font-semibold text-white">{merchandiseTypes.find(t => t.id === designSettings.merchandiseType)?.label}</p>
                    </div>
                    <div className="w-px h-10 bg-[#2a2a2a]"></div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Status</p>
                      <p className="font-semibold text-white">{enhancedUrl ? <span className="text-green-400">Enhanced</span> : "Original"}</p>
                    </div>
                    {enhancedUrl && (
                      <>
                        <div className="w-px h-10 bg-[#2a2a2a]"></div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Provider</p>
                          <p className="font-semibold text-white capitalize">{provider}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = enhancedUrl || previewUrl || "";
                      link.download = enhancedUrl ? `enhanced-${uploadedFile?.name || "design"}.png` : (uploadedFile?.name || "design.png");
                      link.click();
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-violet-500/25 flex-shrink-0"
                  >
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - AI Enhancement */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-violet-500/10 via-blue-500/10 to-cyan-500/10 border-2 border-violet-500/20 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">AI Enhancement</h2>
                    <p className="text-xs text-violet-300/80">Premium transformation</p>
                  </div>
        </div>

                {/* Provider Selection */}
                <div className="mb-8">
                  <label className="text-sm font-semibold text-white/90 mb-4 block">AI Provider</label>
                  <div className="grid grid-cols-2 gap-3">
                    {providers.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setProvider(p.value as typeof provider)}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[80px] ${
                          provider === p.value
                            ? "border-violet-400 bg-violet-500/20 shadow-lg shadow-violet-500/30 scale-105"
                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="text-xl mb-2 flex-shrink-0">{p.icon}</span>
                        <span className="text-xs font-semibold text-center">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Key */}
                <div className="mb-8 bg-gradient-to-r from-violet-500/20 to-blue-500/20 border-2 border-violet-400/30 rounded-xl p-6 backdrop-blur-sm">
                  <label className="text-sm font-bold text-white block mb-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-violet-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span>API Key</span>
                      <span className="ml-auto text-xs bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full border border-red-500/30">
                        Required
                      </span>
                    </div>
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-4 py-3.5 rounded-xl bg-black/40 backdrop-blur-sm border-2 border-violet-400/40 text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40 transition-all font-medium"
                  />
                </div>

                {/* Enhance Button */}
                <div className="mb-6">
                  <button
                    onClick={handleEnhance}
                    disabled={!uploadedFile || !apiKey.trim() || isEnhancing}
                    className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 hover:from-violet-700 hover:via-blue-700 hover:to-cyan-700 disabled:from-gray-700 disabled:via-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  {isEnhancing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="relative z-10">Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="relative z-10">Enhance with AI</span>
                    </>
                  )}
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Info */}
                {!error && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Transforms your design into professional boutique-style merchandise mockups using advanced AI.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-[#222222]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-gray-400">
                Built with ❤️ by{" "}
                <a
                  href="https://www.linkedin.com/in/eddy-madu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors inline-flex items-center gap-1"
                >
                  Eddy Madu
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </p>
              <p className="text-xs text-gray-500">
                Have questions or feedback? Reach out on LinkedIn!
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

