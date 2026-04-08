import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, Map, HelpCircle, TreePine, Landmark, Mountain, 
  Image as ImageIcon, History, MountainSnow, MapPin, 
  Home, Wind, PawPrint, ArrowDown, Settings, Type, 
  Volume2, Maximize, Minimize, ChevronLeft, ChevronRight, X, Sparkles
} from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Slide } from '../App';

const iconMap: Record<string, any> = {
  History, MountainSnow, MapPin, Home, Wind, PawPrint, TreePine, Landmark, Mountain, ImageIcon
};

interface PresentationProps {
  slides: Slide[];
  onSwitchToDashboard: () => void;
}

type Category = 'parks' | 'history' | 'nature' | 'photos' | 'all';

export default function Presentation({ slides, onSwitchToDashboard }: PresentationProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [modalContent, setModalContent] = useState<{ title: string, content: string } | null>(null);
  const [bgVolume, setBgVolume] = useState(0.1);
  const [isBgPlaying, setIsBgPlaying] = useState(false);
  const [ytVolume, setYtVolume] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filteredSlides = activeCategory === 'all' 
    ? slides 
    : slides.filter(s => s.category === activeCategory);

  const slide = filteredSlides[currentSlideIndex];

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}?enablejsapi=1`
      : url;
  };

  const nextSlide = useCallback(() => {
    if (filteredSlides.length === 0) return;
    setCurrentSlideIndex((prev) => (prev + 1) % filteredSlides.length);
    setCurrentMediaIndex(0);
  }, [filteredSlides.length]);

  const prevSlide = useCallback(() => {
    if (filteredSlides.length === 0) return;
    setCurrentSlideIndex((prev) => (prev - 1 + filteredSlides.length) % filteredSlides.length);
    setCurrentMediaIndex(0);
  }, [filteredSlides.length]);

  const nextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!slide?.media) return;
    setCurrentMediaIndex((prev) => (prev + 1) % slide.media.length);
  };

  const prevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!slide?.media) return;
    setCurrentMediaIndex((prev) => (prev - 1 + slide.media.length) % slide.media.length);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleFontSize = () => {
    setFontSize((prev) => (prev >= 1.4 ? 1 : prev + 0.2));
  };

  const speakNotes = () => {
    if ('speechSynthesis' in window && slide) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(slide.notes);
      utterance.lang = 'tr-TR';
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [activeCategory]);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'setVolume',
        args: [ytVolume * 100]
      }), '*');
    }
  }, [ytVolume]);

  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = bgVolume;
    }
  }, [bgVolume]);

  const toggleBgMusic = () => {
    if (bgAudioRef.current) {
      if (isBgPlaying) {
        bgAudioRef.current.pause();
      } else {
        bgAudioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
    }
  };

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background p-8 text-center">
        <h1 className="text-4xl font-headline font-bold text-primary mb-4">Henüz Slayt Yok</h1>
        <p className="text-on-surface-variant mb-8">Lütfen yönetim panelinden yeni slaytlar ekleyin.</p>
        <button onClick={onSwitchToDashboard} className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-headline font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Yönetim Paneline Git
        </button>
      </div>
    );
  }

  const getCategoryLabel = (cat: string) => {
    switch(cat) {
      case 'parks': return 'Milli Park';
      case 'history': return 'Tarihi Anıt';
      case 'nature': return 'Doğa';
      case 'photos': return 'Fotoğraf';
      case 'ad': return 'Sürpriz / Reklam';
      default: return 'Genel';
    }
  };

  const nextStopColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500',
    'bg-indigo-500', 'bg-rose-500'
  ];
  const nextStopTextColors = [
    'text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 
    'text-purple-500', 'text-pink-500', 'text-orange-500', 'text-teal-500',
    'text-indigo-500', 'text-rose-500'
  ];
  const currentNextStopColor = nextStopColors[currentSlideIndex % nextStopColors.length];
  const currentNextStopTextColor = nextStopTextColors[currentSlideIndex % nextStopTextColors.length];

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col h-[100dvh] bg-black/30 relative overflow-hidden select-none"
      style={{
        backgroundImage: slide?.bgImage ? `url(${slide.bgImage})` : "none",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl flex justify-between items-center w-full px-2 md:px-12 py-1.5 md:py-4 sticky top-0 z-50 shadow-lg transition-all duration-500 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1 md:gap-4 shrink-0">
          <h1 className="font-headline text-base md:text-3xl font-black text-white tracking-tighter drop-shadow-md whitespace-nowrap">
            {slide?.isAd ? "SÜRPRİZ" : "TÜRKİYE"}
          </h1>
          <div className="bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/30 flex items-center gap-1">
            <span className="text-white font-bold text-[9px] md:text-sm">{currentSlideIndex + 1}/{filteredSlides.length}</span>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center overflow-x-auto no-scrollbar px-1">
          <div className="flex gap-1 md:gap-4 items-center whitespace-nowrap">
            {[
              { id: 'parks', label: 'Parklar' },
              { id: 'history', label: 'Tarih' },
              { id: 'nature', label: 'Doğa' },
              { id: 'photos', label: 'Foto' }
            ].map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as Category)}
                className={`font-headline font-extrabold transition-all px-1.5 md:px-4 py-1 md:py-2 rounded-lg text-[10px] md:text-base ${activeCategory === cat.id ? 'text-white bg-white/20' : 'text-white/70 hover:text-white'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={toggleFullscreen} className="p-1.5 text-white/80 hover:bg-white/10 rounded-full transition-colors" title="Tam Ekran">
            {isFullscreen ? <Minimize className="w-4 h-4 md:w-6 md:h-6" /> : <Maximize className="w-4 h-4 md:w-6 md:h-6" />}
          </button>
          <button onClick={onSwitchToDashboard} className="bg-white/20 p-1.5 rounded-full text-white hover:bg-white/30 transition-colors" title="Ayarlar">
            <Settings className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden md:block">
        <div className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-r-3xl shadow-2xl border border-white/20 p-3 flex flex-col gap-4">
          {[
            { id: 'parks', icon: TreePine, label: 'Parklar' },
            { id: 'history', icon: Landmark, label: 'Tarih' },
            { id: 'nature', icon: Mountain, label: 'Doğa' },
            { id: 'photos', icon: ImageIcon, label: 'Foto' },
            { id: 'ad', icon: Sparkles, label: 'Sürpriz' }
          ].map((item) => (
            <div 
              key={item.id}
              onClick={() => setActiveCategory(item.id as Category)}
              className={`flex flex-col items-center gap-1 rounded-2xl p-2 cursor-pointer transition-all hover:bg-surface-container-low ${activeCategory === item.id || slide?.category === item.id ? 'bg-primary/10 text-primary scale-105' : 'text-on-surface-variant'}`}
            >
              <item.icon className={`w-6 h-6 ${activeCategory === item.id || slide?.category === item.id ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 md:ml-20 lg:ml-28 px-2 md:px-8 py-2 md:py-4 flex flex-col lg:flex-row gap-4 md:gap-8 relative overflow-y-auto lg:overflow-hidden custom-scrollbar">
        {slide ? (
          <AnimatePresence mode="wait">
            <motion.div 
              key={slide.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col lg:flex-row w-full gap-4 md:gap-8 min-h-full pb-32 lg:pb-0"
            >
              {/* Left Section: Visual Feature */}
              <section className="flex-[3] relative flex flex-col gap-3 md:gap-4 h-auto lg:h-full min-h-[250px] md:min-h-[400px] lg:min-h-0 shrink-0">
                <div className="relative w-full flex-1 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group bg-surface-container-highest border-2 md:border-4 border-white/30 aspect-video lg:aspect-auto">
                  {/* Category Badge */}
                  <div className={`absolute top-2 left-2 md:top-4 md:left-4 z-20 ${currentNextStopColor} text-white px-3 py-1 md:px-4 md:py-2 rounded-full font-headline font-bold text-[10px] md:text-sm backdrop-blur-md border border-white/20 shadow-lg`}>
                    {getCategoryLabel(slide.category)}
                  </div>

                  {/* Slide Number (Mobile) */}
                  <div className="absolute top-2 right-2 z-20 sm:hidden bg-black/50 text-white px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md">
                    {currentSlideIndex + 1} / {filteredSlides.length}
                  </div>

                  {/* Media Slider Controls */}
                  {slide.media && slide.media.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-0 flex items-center justify-between px-4 z-30 pointer-events-none">
                      <button 
                        onClick={prevMedia} 
                        className="p-2 md:p-3 bg-black/40 text-white rounded-full backdrop-blur-md pointer-events-auto active:scale-90 hover:bg-black/60 transition-all border border-white/20 shadow-xl"
                      >
                        <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
                      </button>
                      <button 
                        onClick={nextMedia} 
                        className="p-2 md:p-3 bg-black/40 text-white rounded-full backdrop-blur-md pointer-events-auto active:scale-90 hover:bg-black/60 transition-all border border-white/20 shadow-xl"
                      >
                        <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
                      </button>
                    </div>
                  )}

                  {/* Media Counter */}
                  {slide.media && slide.media.length > 1 && (
                    <div className="absolute top-4 right-4 z-30 bg-black/50 text-white px-3 py-1 rounded-full text-[10px] md:text-xs font-bold backdrop-blur-md border border-white/20">
                      {currentMediaIndex + 1} / {slide.media.length}
                    </div>
                  )}

                  {/* Media Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${slide.id}-${currentMediaIndex}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full"
                    >
                      {slide.media && slide.media[currentMediaIndex]?.type === 'video' ? (
                        <>
                          <iframe 
                            ref={iframeRef}
                            src={getYouTubeEmbedUrl(slide.media[currentMediaIndex].url)}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-full border border-white/20">
                            <Volume2 className="w-4 h-4 text-white" />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={ytVolume}
                              onChange={(e) => setYtVolume(parseFloat(e.target.value))}
                              className="w-20 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full relative">
                          <img 
                            src={slide.media ? slide.media[currentMediaIndex]?.url : slide.image} 
                            alt={slide.title} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 md:p-10 pointer-events-none">
                            <div className="text-white">
                              <h1 className="font-headline text-xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-1 md:mb-2 drop-shadow-lg">{slide.title}</h1>
                              <p className="font-label text-xs md:text-xl lg:text-2xl opacity-90 drop-shadow-md">{slide.subtitle}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                    <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="p-2 bg-black/30 text-white rounded-full backdrop-blur-md pointer-events-auto active:scale-90 hover:bg-black/50 transition-colors">
                      <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="p-2 bg-black/30 text-white rounded-full backdrop-blur-md pointer-events-auto active:scale-90 hover:bg-black/50 transition-colors">
                      <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                  </div>
                </div>

                {/* Quick Explorer Chips */}
                <div className="flex gap-1.5 md:gap-4 flex-wrap">
                  {slide.chips.map((chip, idx) => {
                    const Icon = iconMap[chip.icon] || MapPin;
                    return (
                      <div key={idx} className={`${idx === 0 ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-highest text-on-surface-variant'} px-3 md:px-6 py-1.5 md:py-3 rounded-full font-label font-bold flex items-center gap-1.5 shadow-sm text-[10px] md:text-sm lg:text-base`}>
                        <Icon className="w-3.5 h-3.5 md:w-5 h-5" />
                        {chip.text}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Right Section: Fun Facts */}
              <section className="flex-[1.5] flex flex-col gap-4 h-auto lg:h-full min-h-[200px] lg:min-h-0 shrink-0">
                <div className="bg-surface-container-low/95 backdrop-blur-md rounded-2xl md:rounded-3xl p-4 md:p-6 h-full flex flex-col gap-4 lg:overflow-y-auto custom-scrollbar border border-white/20">
                  <h2 className={`font-headline text-lg md:text-3xl font-black ${currentNextStopTextColor} border-b-4 border-current pb-2 w-fit sticky top-0 bg-transparent z-10 flex items-center gap-2`}>
                    <Sparkles className="w-4 h-4 md:w-6 h-6" />
                    {slide.title}
                  </h2>
                  <div className="space-y-4 md:space-y-6">
                    {slide.facts.map((fact, idx) => {
                      const Icon = iconMap[fact.icon] || Home;
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + idx * 0.1 }}
                          key={idx} 
                          className={`bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border-l-8 ${fact.borderColor} flex flex-col gap-2 md:gap-3`}
                        >
                          <div className={`flex items-center gap-3 ${fact.color}`}>
                            <Icon className="w-5 h-5 md:w-6 h-6" />
                            <span className="font-bold font-headline text-base md:text-lg">{fact.title}</span>
                          </div>
                          <p className="text-on-surface-variant leading-relaxed font-body text-sm md:text-base">{fact.desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-headline font-bold text-on-surface-variant">Bu kategoride henüz slayt yok.</h2>
            <button onClick={() => setActiveCategory('all')} className="mt-4 text-primary font-bold underline">Hepsini Göster</button>
          </div>
        )}

        {/* Far Right: Next Action */}
        <section className="hidden lg:flex flex-none flex-col justify-center z-10">
          <button 
            onClick={nextSlide}
            className={`h-[80%] min-h-[400px] w-24 lg:w-32 ${currentNextStopColor} rounded-3xl flex flex-col items-center justify-center gap-6 text-on-primary shadow-2xl hover:opacity-90 active:scale-95 transition-all group overflow-hidden relative`}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="[writing-mode:vertical-lr] font-headline text-2xl font-black uppercase tracking-widest group-hover:-translate-y-4 transition-transform z-10">Sıradaki Durak</span>
            <ArrowDown className="w-10 h-10 group-hover:translate-y-4 transition-transform z-10" />
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest/90 backdrop-blur-xl sticky bottom-0 w-full min-h-16 md:min-h-20 py-2 md:py-3 flex flex-col md:flex-row items-center justify-between px-4 md:px-12 z-50 border-t border-white/20 gap-2 md:gap-4 shrink-0">
        <div className="flex items-center gap-4 flex-1 overflow-hidden w-full">
          <div className="hidden sm:block bg-primary-container text-on-primary-container px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-black uppercase whitespace-nowrap">Sunum Notları</div>
          <p 
            className="font-label text-[10px] md:text-sm font-medium tracking-wide text-on-surface-variant italic truncate"
            style={{ fontSize: `${fontSize * 0.75}rem` }}
          >
            {slide?.notes || "Not bulunamadı."}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-8 items-center w-full md:w-auto justify-between md:justify-end">
          {slide?.audioUrl && (
            <div className="flex items-center bg-surface-container-lowest rounded-full px-2 py-1 shadow-sm border border-surface-container-highest">
              <audio src={slide.audioUrl} controls className="h-7 w-28 md:h-8 md:w-48" />
            </div>
          )}
          <div className="hidden md:flex gap-6 items-center">
            <button 
              onClick={() => setModalContent({ title: 'Notlar', content: slide?.notes || 'Bu slayt için özel not bulunmuyor.' })}
              className="font-label text-sm font-bold text-primary underline cursor-pointer"
            >
              Notlar
            </button>
            <button 
              onClick={() => setModalContent({ title: 'Sözlük', content: slide?.glossary || 'Bu slayt için sözlük verisi bulunmuyor.' })}
              className="font-label text-sm font-medium text-on-surface-variant hover:text-primary cursor-pointer"
            >
              Sözlük
            </button>
            <button 
              onClick={() => setModalContent({ title: 'Kaynaklar', content: slide?.sources || 'Bu slayt için kaynak belirtilmemiş.' })}
              className="font-label text-sm font-medium text-on-surface-variant hover:text-primary cursor-pointer"
            >
              Kaynaklar
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={toggleFontSize}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm text-primary hover:bg-surface-container-low transition-colors"
              title="Yazı Boyutu"
            >
              <Type className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button 
              onClick={speakNotes}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm text-primary hover:bg-surface-container-low transition-colors"
              title="Sesli Oku"
            >
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {modalContent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalContent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-surface-container-lowest rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setModalContent(null)} className="absolute top-6 right-6 p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <X className="w-6 h-6 text-on-surface-variant" />
              </button>
              <h3 className="font-headline text-3xl font-bold text-primary mb-6">{modalContent.title}</h3>
              <div className="font-body text-lg text-on-surface-variant leading-relaxed">
                {modalContent.content}
              </div>
              <button 
                onClick={() => setModalContent(null)}
                className="mt-8 w-full bg-primary text-on-primary py-4 rounded-2xl font-headline font-bold hover:bg-primary-dim transition-colors"
              >
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-surface-container-highest);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary-container);
        }
      `}</style>
    </div>
  );
}
