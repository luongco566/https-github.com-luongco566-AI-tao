import React, { useState, useRef, useEffect } from 'react';
import { summarizeText, generateMindMapData, generateInfographicData } from './services/geminiService';
import MindMapGraph from './components/MindMapGraph';
import InfographicView from './components/InfographicView';
import { GraphData, InfographicItem } from './types';
import { 
  ArrowPathIcon, 
  ChartBarIcon, 
  ShareIcon, 
  PencilSquareIcon, 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChevronLeftIcon,
  SunIcon,
  MoonIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

function App() {
  // Navigation State
  const [view, setView] = useState<'input' | 'visualizer'>('input');
  const [visualizerType, setVisualizerType] = useState<'mindmap' | 'infographic'>('mindmap');

  // Data State
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [infographicData, setInfographicData] = useState<InfographicItem[] | null>(null);

  // UI State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          setInputText(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
        setError("Vui lòng nhập nội dung để tóm tắt.");
        return;
    }
    setError(null);
    setIsSummarizing(true);
    try {
      const result = await summarizeText(inputText);
      setSummary(result);
    } catch (e) {
      setError("Có lỗi xảy ra khi tóm tắt. Vui lòng thử lại.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCreateMindMap = async () => {
    if (!summary) return;
    setIsGeneratingGraph(true);
    setError(null);
    try {
      if (!graphData) {
        const data = await generateMindMapData(summary);
        setGraphData(data);
      }
      setVisualizerType('mindmap');
      setView('visualizer');
    } catch (e) {
      setError("Có lỗi xảy ra khi tạo sơ đồ. Vui lòng thử lại.");
    } finally {
      setIsGeneratingGraph(false);
    }
  };

  const handleCreateInfographic = async () => {
    if (!summary) return;
    setIsGeneratingInfographic(true);
    setError(null);
    try {
        if (!infographicData) {
            const data = await generateInfographicData(summary);
            setInfographicData(data);
        }
        setVisualizerType('infographic');
        setView('visualizer');
    } catch (e) {
        setError("Có lỗi xảy ra khi tạo infographic. Vui lòng thử lại.");
    } finally {
        setIsGeneratingInfographic(false);
    }
  }

  // --- New Feature Handlers ---

  const handleDownload = () => {
    if (visualizerType === 'mindmap') {
      // SVG Download logic
      const svg = document.querySelector('svg');
      if (svg) {
        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svg);
        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sodo-tuduy-gemini.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else if (visualizerType === 'infographic' && infographicData) {
      // Text Download logic (since HTML to Image is complex without heavy libs)
      const content = infographicData.map(item => 
        `## ${item.title}\n(${item.icon})\n${item.description}\n`
      ).join('\n');
      
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'infographic-gemini.md';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Gemini Visualizer Result',
      text: summary,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      // Fallback: Copy summary to clipboard
      navigator.clipboard.writeText(summary);
      alert('Đã sao chép tóm tắt vào bộ nhớ tạm!');
    }
  };

  const handleEdit = () => {
    setView('input');
  };

  // --------------------------------------------------------------------------
  // STYLES
  // --------------------------------------------------------------------------
  const themeClasses = isDarkMode 
    ? "bg-slate-900" 
    : "bg-gradient-to-br from-blue-50 to-purple-50";

  const panelClasses = isDarkMode
    ? "bg-slate-800/60 border-white/10 text-gray-200"
    : "glass-panel text-gray-700";

  const cardClasses = isDarkMode
    ? "bg-slate-700/50 border-white/10 hover:bg-slate-700/80"
    : "glass-card hover:bg-white/80";

  const textPrimary = isDarkMode ? "text-white" : "text-gray-800";
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-600";
  const inputBg = isDarkMode ? "bg-slate-800/50 text-white placeholder-gray-500" : "glass-panel text-gray-700";

  // --------------------------------------------------------------------------
  // INPUT SCREEN
  // --------------------------------------------------------------------------
  if (view === 'input') {
    return (
      <div className={`min-h-screen p-4 md:p-8 flex flex-col transition-colors duration-500 ${themeClasses}`}>
        <div className="max-w-5xl mx-auto w-full">
            {/* Header */}
            <header className="flex justify-between items-center mb-10 px-4">
            <div className="flex items-center gap-2">
                <SparklesIcon className="w-6 h-6 text-indigo-500" />
                <h1 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500`}>
                Gemini Visualizer VN
                </h1>
            </div>
            <div className="flex items-center gap-4">
                 <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-white/50 text-slate-600'}`}
                 >
                    {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                 </button>
            </div>
            </header>

            <main className="flex-1 flex flex-col gap-6">
            {/* Input Area */}
            <section className="flex flex-col gap-3">
                <label className={`text-lg font-semibold pl-1 ${textPrimary}`}>
                Nhập nội dung của bạn ở đây
                </label>
                <div className="relative group">
                    <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Dán văn bản hoặc tải lên tệp..."
                    className={`w-full h-40 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 resize-none transition-all shadow-sm ${inputBg}`}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-white/50 text-gray-500 hover:bg-white/80'}`}
                        title="Tải lên tệp văn bản"
                    >
                        <DocumentTextIcon className="w-5 h-5" />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".txt,.md,.json" 
                        onChange={handleFileUpload} 
                    />
                </div>

                {error && <p className="text-red-500 text-sm pl-1">{error}</p>}

                <button
                onClick={handleSummarize}
                disabled={isSummarizing || !inputText}
                className={`w-full py-3 rounded-xl font-medium shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center gap-2 border border-white/20
                    ${isSummarizing 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : `bg-gradient-to-r from-indigo-500/80 to-purple-500/80 text-white hover:from-indigo-500 hover:to-purple-500`}`}
                >
                {isSummarizing ? (
                    <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" /> Đang xử lý...
                    </>
                ) : (
                    "Tóm tắt với Gemini"
                )}
                </button>
            </section>

            {/* Result Section */}
            {summary && (
                <div className="animate-fade-in-up">
                    <section className="flex flex-col gap-3 mt-4">
                    <label className={`text-lg font-semibold pl-1 ${textPrimary}`}>
                        Tóm tắt từ Gemini
                    </label>
                    <div className={`rounded-2xl p-6 leading-relaxed shadow-sm min-h-[120px] ${panelClasses}`}>
                        {summary}
                    </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {/* Create Infographic Button */}
                    <button 
                        onClick={handleCreateInfographic}
                        disabled={isGeneratingInfographic}
                        className={`group h-32 rounded-2xl flex items-center justify-center gap-4 hover:shadow-xl transition-all border border-white/10 relative overflow-hidden ${cardClasses}`}
                    >
                        
                        {isGeneratingInfographic ? (
                            <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
                        ) : (
                            <>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                                    <ChartBarIcon className="w-7 h-7" />
                                </div>
                                <span className={`text-xl font-bold ${textPrimary}`}>Tạo Infographic</span>
                            </>
                        )}
                    </button>

                    {/* Create Mind Map Button */}
                    <button
                        onClick={handleCreateMindMap}
                        disabled={isGeneratingGraph}
                        className={`group h-32 rounded-2xl flex items-center justify-center gap-4 hover:shadow-xl transition-all border border-white/10 relative overflow-hidden ${cardClasses}`}
                    >
                        {isGeneratingGraph ? (
                            <ArrowPathIcon className="w-8 h-8 text-purple-500 animate-spin" />
                        ) : (
                            <>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                    <ShareIcon className="w-7 h-7 transform -scale-y-100" />
                                </div>
                                <span className={`text-xl font-bold ${textPrimary}`}>Tạo Sơ đồ tư duy</span>
                            </>
                        )}
                    </button>
                    </div>
                </div>
            )}
            </main>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VISUALIZER SCREEN
  // --------------------------------------------------------------------------
  return (
    <div className={`min-h-screen p-4 flex flex-col relative overflow-hidden transition-colors duration-500 ${themeClasses}`}>
      {/* Background Blobs */}
      <div className={`absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-300/30'}`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-300/30'}`} />

      {/* Header */}
      <div className={`rounded-full px-6 py-3 flex items-center justify-between mb-6 mx-4 ${panelClasses} backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1.5 shadow-lg">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold ${textPrimary}`}>GeminiVisuals</span>
        </div>
        <h2 className={`text-lg font-bold hidden md:block ${textPrimary}`}>
            {visualizerType === 'mindmap' ? 'Sơ đồ Tư duy' : 'Infographic Tổng quan'}
        </h2>
        <div className="flex items-center gap-3">
             {/* Simple Theme Toggle in Header for Viz view */}
            <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-200 text-slate-600'}`}
            >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <div className="w-8 h-8 rounded-full border border-white/20 shadow-inner flex items-center justify-center overflow-hidden bg-indigo-500 text-white font-bold text-xs">
                VN
            </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 mx-4 mb-4 relative z-10">
        
        {/* Visualization Area */}
        <div className={`flex-1 rounded-3xl p-2 relative flex flex-col overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'glass-panel border-white/80'}`}>
          <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-b pointer-events-none z-0 ${isDarkMode ? 'from-slate-800/80 to-transparent' : 'from-white/40 to-transparent'}`} />
          
          <div className={`flex-1 rounded-2xl relative overflow-hidden ${isDarkMode ? 'bg-slate-900/50' : 'bg-white/20'}`} style={{ minHeight: '500px' }}>
            
            <div className="w-full h-full">
                {visualizerType === 'mindmap' && graphData && (
                    <>
                        <h3 className={`absolute top-6 left-0 right-0 text-center font-bold text-xl z-10 drop-shadow-sm pointer-events-none ${textPrimary}`}>
                            {graphData.nodes.find(n => n.group === 1)?.label || "Chủ đề chính"}
                        </h3>
                        <MindMapGraph 
                            data={graphData} 
                            isDarkMode={isDarkMode} 
                            showLabels={showAnnotations} 
                        />
                    </>
                )}
                {visualizerType === 'infographic' && infographicData && (
                    <InfographicView 
                        data={infographicData} 
                        isDarkMode={isDarkMode}
                        showDescription={showAnnotations}
                    />
                )}
            </div>

            {/* Overlay Text */}
            <div className="absolute bottom-8 left-10 right-10 text-center pointer-events-none hidden lg:block z-10">
                <p className={`text-sm font-medium max-w-2xl mx-auto backdrop-blur-md p-3 rounded-xl shadow-sm border border-white/10 ${isDarkMode ? 'bg-slate-800/60 text-gray-300' : 'bg-white/40 text-gray-600'}`}>
                    {visualizerType === 'mindmap' 
                        ? `Mô hình Gemini đã phân tích nội dung và tạo ra sơ đồ tư duy này.`
                        : `Thông tin được trích xuất và tổng hợp bởi Gemini.`
                    }
                </p>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="w-full md:w-80 flex flex-col gap-4">
            {/* Action Box */}
          <div className={`rounded-3xl p-5 flex flex-col gap-4 ${panelClasses}`}>
            <h4 className={`font-bold mb-1 ${textSecondary}`}>Tùy chọn Hành động</h4>
            
            <button 
                onClick={handleDownload}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors border shadow-sm text-left ${isDarkMode ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-white/40 border-white/50 hover:bg-white/60'}`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <ArrowDownTrayIcon className="w-5 h-5" />
              </div>
              <span className={`font-semibold ${textPrimary}`}>
                 {visualizerType === 'mindmap' ? 'Tải SVG' : 'Tải Text'}
              </span>
            </button>

            <button 
                onClick={handleShare}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors border shadow-sm text-left ${isDarkMode ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-white/40 border-white/50 hover:bg-white/60'}`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                <ShareIcon className="w-5 h-5" />
              </div>
              <span className={`font-semibold ${textPrimary}`}>Chia sẻ</span>
            </button>

            <button 
                onClick={handleEdit}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors border shadow-sm text-left ${isDarkMode ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-white/40 border-white/50 hover:bg-white/60'}`}
            >
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                <PencilSquareIcon className="w-5 h-5" />
              </div>
              <span className={`font-semibold ${textPrimary}`}>Chỉnh sửa</span>
            </button>
          </div>

          {/* Settings Box */}
          <div className={`rounded-3xl p-5 flex flex-col gap-4 mt-auto ${panelClasses}`}>
             <div className="flex items-center justify-between">
                <span className={`font-medium ${textPrimary}`}>Chế độ tối</span>
                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>
             <div className="flex items-center justify-between">
                <span className={`font-medium ${textPrimary}`}>Hiển thị chú thích</span>
                <button 
                    onClick={() => setShowAnnotations(!showAnnotations)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${showAnnotations ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all ${showAnnotations ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>
          </div>
        </div>
      </div>
      
      {/* Create New / Back Button */}
      <div className="fixed bottom-6 left-6 z-50">
          <button 
            onClick={() => setView('input')}
            className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all shadow-lg font-bold border-2 ${isDarkMode ? 'bg-slate-800 text-white border-slate-600 hover:bg-slate-700' : 'glass-panel text-indigo-900 border-white/50 hover:bg-white/60'}`}
          >
             <ChevronLeftIcon className="w-5 h-5" />
             <span>Tạo mới</span>
          </button>
      </div>
    </div>
  );
}

export default App;