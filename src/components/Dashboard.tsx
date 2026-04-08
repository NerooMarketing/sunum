import { useState } from 'react';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Image as ImageIcon, 
  Presentation as PresentationIcon, Save, X, Trash, 
  MoveUp, MoveDown, Video, Sparkles, Loader2
} from 'lucide-react';
import { Slide, SlideFact, SlideChip } from '../App';
import { generateSlides } from '../services/geminiService';

interface DashboardProps {
  slides: Slide[];
  setSlides: (slides: Slide[] | ((prev: Slide[]) => Slide[])) => void;
  onSwitchToPresentation: () => void;
}

export default function Dashboard({ slides, setSlides, onSwitchToPresentation }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'slides' | 'ads'>('slides');
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const emptySlide: Slide = {
    id: Date.now().toString(),
    title: '',
    subtitle: '',
    image: '',
    videoUrl: '',
    media: [{ type: 'image', url: '' }],
    audioUrl: '',
    bgImage: '',
    category: 'parks',
    isAd: false,
    chips: [{ icon: 'MapPin', text: '' }],
    facts: [{ icon: 'Home', title: '', desc: '', color: 'text-primary', borderColor: 'border-primary' }],
    notes: '',
    glossary: '',
    sources: ''
  };

  const handleSave = (slide: Slide) => {
    if (isAdding) {
      setSlides([...slides, slide]);
      setIsAdding(false);
    } else {
      setSlides(slides.map(s => s.id === slide.id ? slide : s));
      setEditingSlide(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu slaytı silmek istediğinize emin misiniz?')) {
      setSlides(slides.filter(s => s.id !== id));
    }
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < slides.length) {
      [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
      setSlides(newSlides);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const newSlides = await generateSlides(aiPrompt);
      setSlides(prev => [...prev, ...newSlides]);
      setIsAiModalOpen(false);
      setAiPrompt('');
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Slaytlar oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-surface-container-low overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-container-lowest shadow-md flex flex-row md:flex-col z-20 flex-shrink-0">
        <div className="p-4 md:p-6 border-b md:border-b-0 md:border-r border-surface-container-highest flex-1 md:flex-none flex items-center justify-between">
          <h2 className="font-headline text-xl md:text-2xl font-black text-primary">Yönetim Paneli</h2>
          <div className="flex md:hidden gap-2">
            <button 
              onClick={() => setActiveTab('slides')}
              className={`p-2 rounded-xl transition-all ${activeTab === 'slides' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              <PresentationIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTab('ads')}
              className={`p-2 rounded-xl transition-all ${activeTab === 'ads' ? 'bg-secondary/10 text-secondary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="hidden md:block flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('slides')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold transition-all ${activeTab === 'slides' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            <PresentationIcon className="w-5 h-5" />
            Sunum Yönetimi
          </button>
          <button 
            onClick={() => setActiveTab('ads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-headline font-bold transition-all ${activeTab === 'ads' ? 'bg-secondary text-on-secondary shadow-md' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
          >
            <Sparkles className="w-5 h-5" />
            Reklam / Sürpriz
          </button>
        </nav>
        <div className="p-2 md:p-4 border-l md:border-l-0 md:border-t border-surface-container-highest flex items-center">
          <button 
            onClick={onSwitchToPresentation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 md:py-3 bg-surface-container-highest text-primary rounded-xl font-headline font-bold hover:bg-surface-container-highest/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:inline">Sunuma Dön</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {(editingSlide || isAdding) ? (
            <SlideForm 
              slide={editingSlide || emptySlide} 
              onSave={handleSave} 
              onCancel={() => { setEditingSlide(null); setIsAdding(false); }} 
            />
          ) : activeTab === 'slides' ? (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-background">Sunum Yönetimi</h1>
                  <p className="font-body text-on-surface-variant mt-2">Sunum içeriğini buradan tam kontrolle yönetin.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsAiModalOpen(true)}
                    className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-headline font-bold flex items-center gap-2 hover:bg-secondary-dim transition-colors shadow-md"
                  >
                    <Sparkles className="w-5 h-5" />
                    AI ile Üret
                  </button>
                  <button 
                    onClick={() => setIsAdding(true)}
                    className="bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold flex items-center gap-2 hover:bg-primary-dim transition-colors shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    Yeni Slayt Ekle
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-surface-container-highest flex justify-between items-center bg-surface">
                  <h3 className="font-headline text-xl font-bold text-on-background">Mevcut Slaytlar ({slides.length})</h3>
                </div>
                <div className="divide-y divide-surface-container-highest">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between hover:bg-surface-container-low transition-colors gap-4">
                      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                        <div className="flex flex-col gap-1">
                          <button 
                            disabled={index === 0}
                            onClick={() => moveSlide(index, 'up')}
                            className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-30"
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button 
                            disabled={index === slides.length - 1}
                            onClick={() => moveSlide(index, 'down')}
                            className="p-1 text-on-surface-variant hover:text-primary disabled:opacity-30"
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="w-24 h-16 bg-surface-container-highest rounded-lg overflow-hidden flex items-center justify-center text-on-surface-variant">
                          {slide.image ? <img src={slide.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline text-lg font-bold text-on-background line-clamp-1">{slide.title}</h4>
                            {slide.isAd && (
                              <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-secondary/20">Sürpriz</span>
                            )}
                          </div>
                          <p className="font-body text-sm text-on-surface-variant line-clamp-1">{slide.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        {slide.videoUrl && <Video className="w-5 h-5 text-primary" title="Video İçeriyor" />}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingSlide(slide)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest rounded-lg transition-colors"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(slide.id)}
                            className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {slides.length === 0 && (
                    <div className="p-12 text-center text-on-surface-variant font-body">
                      Henüz slayt eklenmemiş.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <AdManagement 
              slides={slides} 
              onEdit={setEditingSlide} 
              onDelete={handleDelete}
              onAdd={() => setIsAdding(true)}
            />
          )}
        </div>
      </main>

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
            <button 
              onClick={() => !isGenerating && setIsAiModalOpen(false)} 
              className="absolute top-6 right-6 p-2 hover:bg-surface-container-low rounded-full transition-colors disabled:opacity-50"
              disabled={isGenerating}
            >
              <X className="w-6 h-6 text-on-surface-variant" />
            </button>
            <h3 className="font-headline text-3xl font-bold text-primary mb-2 flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              AI ile Slayt Üret
            </h3>
            <p className="text-on-surface-variant mb-6 font-body">
              İstediğiniz konuyu veya metni aşağıya yapıştırın. Yapay zeka sizin için görselleri, videoları ve tüm içerikleriyle birlikte slaytları otomatik oluştursun.
            </p>
            
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="Örn: Türkiye'nin en popüler milli parkları, tarihi anıtları ve doğal güzellikleri hakkında detaylı bir sunum hazırla..."
              className="w-full flex-1 min-h-[200px] bg-surface-container-low border-0 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-primary outline-none resize-none font-body text-on-surface mb-6 disabled:opacity-50"
            />

            <div className="flex justify-end gap-4 mt-auto">
              <button 
                onClick={() => setIsAiModalOpen(false)}
                disabled={isGenerating}
                className="px-6 py-3 rounded-xl font-headline font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-8 py-3 bg-primary text-on-primary rounded-xl font-headline font-bold flex items-center gap-2 hover:bg-primary-dim transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Üretiliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Slaytları Oluştur
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function AdManagement({ slides, onEdit, onDelete, onAdd }: { slides: Slide[], onEdit: (slide: Slide) => void, onDelete: (id: string) => void, onAdd: () => void }) {
  const ads = slides.filter(s => s.isAd);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-background">Reklam / Sürpriz Yönetimi</h1>
          <p className="font-body text-on-surface-variant mt-2">Sunum aralarına serpiştirilen sürpriz içerikleri yönetin.</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-headline font-bold flex items-center gap-2 hover:bg-secondary-dim transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Yeni Sürpriz Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container-highest overflow-hidden group hover:shadow-md transition-shadow">
            <div className="aspect-video relative overflow-hidden bg-surface-container-highest">
              {ad.image ? (
                <img src={ad.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                  <ImageIcon className="w-12 h-12 opacity-20" />
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">SÜRPRİZ</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <h4 className="font-headline text-xl font-bold text-on-background line-clamp-1">{ad.title}</h4>
                  <p className="font-body text-sm text-on-surface-variant line-clamp-1">{ad.subtitle}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => onEdit(ad)}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(ad.id)}
                    className="p-2 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant/60 uppercase tracking-tighter">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> {ad.media?.length || 1} Medya
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {ad.facts.length} Bilgi
                </span>
              </div>
            </div>
          </div>
        ))}
        {ads.length === 0 && (
          <div className="col-span-full bg-surface-container-low/50 border-2 border-dashed border-surface-container-highest rounded-3xl p-12 text-center">
            <Sparkles className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
            <p className="font-headline text-lg font-bold text-on-surface-variant">Henüz reklam veya sürpriz içerik eklenmemiş.</p>
            <button onClick={onAdd} className="mt-4 text-secondary font-bold hover:underline">İlk sürprizi hemen ekle</button>
          </div>
        )}
      </div>
    </div>
  );
}


function SlideForm({ slide, onSave, onCancel }: { slide: Slide, onSave: (slide: Slide) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState<Slide>(slide);

  const addChip = () => {
    setFormData({ ...formData, chips: [...formData.chips, { icon: 'MapPin', text: '' }] });
  };

  const removeChip = (index: number) => {
    setFormData({ ...formData, chips: formData.chips.filter((_, i) => i !== index) });
  };

  const addFact = () => {
    setFormData({ ...formData, facts: [...formData.facts, { icon: 'Home', title: '', desc: '', color: 'text-primary', borderColor: 'border-primary' }] });
  };

  const removeFact = (index: number) => {
    setFormData({ ...formData, facts: formData.facts.filter((_, i) => i !== index) });
  };

  const addMedia = () => {
    setFormData({ ...formData, media: [...(formData.media || []), { type: 'image', url: '' }] });
  };

  const removeMedia = (index: number) => {
    setFormData({ ...formData, media: formData.media.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-surface-container-lowest rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-6 border-b border-surface-container-highest flex justify-between items-center bg-surface sticky top-0 z-10">
        <h3 className="font-headline text-2xl font-bold text-primary">Slayt Düzenle</h3>
        <button onClick={onCancel} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
          <X className="w-6 h-6 text-on-surface-variant" />
        </button>
      </div>
      
      <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
        {/* Media Slider Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block font-headline font-bold text-on-surface">Medya Galeri (Görsel & Video)</label>
            <button onClick={addMedia} className="text-primary font-bold flex items-center gap-1 text-sm">
              <Plus className="w-4 h-4" /> Medya Ekle
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {(formData.media || []).map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 items-start bg-surface-container-low p-4 rounded-2xl relative">
                <button onClick={() => removeMedia(idx)} className="absolute top-4 right-4 text-red-500">
                  <Trash className="w-4 h-4" />
                </button>
                <div className="w-full md:w-32 space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">Tür</label>
                  <select 
                    value={item.type}
                    onChange={e => {
                      const newMedia = [...formData.media];
                      newMedia[idx].type = e.target.value as 'image' | 'video';
                      setFormData({ ...formData, media: newMedia });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-surface-container-highest outline-none text-sm"
                  >
                    <option value="image">Görsel</option>
                    <option value="video">Video (YT)</option>
                  </select>
                </div>
                <div className="flex-1 w-full space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant">URL</label>
                  <input 
                    type="text" 
                    value={item.url}
                    onChange={e => {
                      const newMedia = [...formData.media];
                      newMedia[idx].url = e.target.value;
                      // Update legacy fields for compatibility
                      if (idx === 0) {
                        if (item.type === 'image') setFormData({ ...formData, image: e.target.value, media: newMedia });
                        else setFormData({ ...formData, videoUrl: e.target.value, media: newMedia });
                      } else {
                        setFormData({ ...formData, media: newMedia });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-surface-container-highest outline-none text-sm"
                    placeholder={item.type === 'image' ? "https://.../resim.jpg" : "https://www.youtube.com/watch?v=..."}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-headline font-bold text-on-surface">Başlık</label>
            <input 
              type="text" 
              value={formData.title || ''}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-container-highest focus:ring-2 focus:ring-primary outline-none"
              placeholder="Örn: Göreme Milli Parkı"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-headline font-bold text-on-surface">Alt Başlık</label>
            <input 
              type="text" 
              value={formData.subtitle || ''}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-container-highest focus:ring-2 focus:ring-primary outline-none"
              placeholder="Örn: Kapadokya'nın Kalbi"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-headline font-bold text-on-surface">Ses URL (MP3/WAV - Opsiyonel)</label>
            <input 
              type="text" 
              value={formData.audioUrl || ''}
              onChange={e => setFormData({ ...formData, audioUrl: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-container-highest focus:ring-2 focus:ring-primary outline-none"
              placeholder="https://.../audio.mp3"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-headline font-bold text-on-surface">Arka Plan Görseli (Opsiyonel)</label>
            <input 
              type="text" 
              value={formData.bgImage || ''}
              onChange={e => setFormData({ ...formData, bgImage: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-container-highest focus:ring-2 focus:ring-primary outline-none"
              placeholder="https://... (Minecraft Steve vb.)"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-headline font-bold text-on-surface">Kategori</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-4 py-3 rounded-xl border border-surface-container-highest focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="parks">Parklar</option>
              <option value="history">Tarih</option>
              <option value="nature">Doğa</option>
              <option value="photos">Fotoğraflar</option>
              <option value="ad">Sürpriz</option>
            </select>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-container-highest">
            <input 
              type="checkbox" 
              id="isAd"
              checked={formData.isAd || false}
              onChange={e => setFormData({ ...formData, isAd: e.target.checked, category: e.target.checked ? 'ad' : formData.category })}
              className="w-5 h-5 rounded border-surface-container-highest text-secondary focus:ring-secondary"
            />
            <label htmlFor="isAd" className="font-headline font-bold text-on-surface cursor-pointer">
              Bu bir Sürpriz slaytıdır
            </label>
          </div>
        </div>

        {/* Chips */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block font-headline font-bold text-on-surface">Etiketler (Chips)</label>
            <button onClick={addChip} className="text-primary font-bold flex items-center gap-1 text-sm">
              <Plus className="w-4 h-4" /> Ekle
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.chips.map((chip, idx) => (
              <div key={idx} className="flex gap-2 items-center bg-surface-container-low p-3 rounded-xl">
                <select 
                  value={chip.icon}
                  onChange={e => {
                    const newChips = [...formData.chips];
                    newChips[idx].icon = e.target.value;
                    setFormData({ ...formData, chips: newChips });
                  }}
                  className="bg-transparent font-body text-sm outline-none"
                >
                  <option value="MapPin">Konum</option>
                  <option value="History">Tarih</option>
                  <option value="MountainSnow">Doğa</option>
                </select>
                <input 
                  type="text" 
                  value={chip.text || ''}
                  onChange={e => {
                    const newChips = [...formData.chips];
                    newChips[idx].text = e.target.value;
                    setFormData({ ...formData, chips: newChips });
                  }}
                  className="flex-1 bg-transparent outline-none border-b border-surface-container-highest focus:border-primary"
                  placeholder="Etiket metni"
                />
                <button onClick={() => removeChip(idx)} className="text-red-500">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Facts */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block font-headline font-bold text-on-surface">Eğlenceli Bilgiler</label>
            <button onClick={addFact} className="text-primary font-bold flex items-center gap-1 text-sm">
              <Plus className="w-4 h-4" /> Ekle
            </button>
          </div>
          <div className="space-y-4">
            {formData.facts.map((fact, idx) => (
              <div key={idx} className="bg-surface-container-low p-4 rounded-2xl space-y-4 relative">
                <button onClick={() => removeFact(idx)} className="absolute top-4 right-4 text-red-500">
                  <Trash className="w-5 h-5" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    value={fact.title || ''}
                    onChange={e => {
                      const newFacts = [...formData.facts];
                      newFacts[idx].title = e.target.value;
                      setFormData({ ...formData, facts: newFacts });
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Bilgi Başlığı"
                  />
                  <select 
                    value={fact.color || 'text-primary'}
                    onChange={e => {
                      const newFacts = [...formData.facts];
                      newFacts[idx].color = e.target.value;
                      newFacts[idx].borderColor = e.target.value.replace('text-', 'border-');
                      setFormData({ ...formData, facts: newFacts });
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-white outline-none"
                  >
                    <option value="text-primary">Mavi (Primary)</option>
                    <option value="text-secondary">Sarı (Secondary)</option>
                    <option value="text-tertiary">Yeşil (Tertiary)</option>
                  </select>
                </div>
                <textarea 
                  value={fact.desc || ''}
                  onChange={e => {
                    const newFacts = [...formData.facts];
                    newFacts[idx].desc = e.target.value;
                    setFormData({ ...formData, facts: newFacts });
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary h-20 resize-none"
                  placeholder="Bilgi açıklaması..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block font-headline font-bold text-on-surface">Sunum Notları</label>
            <textarea 
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-container-highest focus:ring-2 focus:ring-primary outline-none h-32 resize-none"
              placeholder="Öğrenciler için notlar..."
            />
          </div>
          <div className="space-y-2">
            <label className="block font-headline font-bold text-on-surface">Sözlük (Opsiyonel)</label>
            <textarea 
              value={formData.glossary || ''}
              onChange={e => setFormData({ ...formData, glossary: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-container-highest focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
              placeholder="Terim açıklamaları..."
            />
          </div>
          <div className="space-y-2">
            <label className="block font-headline font-bold text-on-surface">Kaynaklar (Opsiyonel)</label>
            <textarea 
              value={formData.sources || ''}
              onChange={e => setFormData({ ...formData, sources: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-surface-container-highest focus:ring-2 focus:ring-primary outline-none h-24 resize-none"
              placeholder="Bilgi kaynakları..."
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-surface-container-highest flex justify-end gap-4 bg-surface sticky bottom-0 z-10">
        <button 
          onClick={onCancel}
          className="px-6 py-3 rounded-xl font-headline font-bold text-on-surface-variant hover:bg-surface-container-highest transition-colors"
        >
          İptal
        </button>
        <button 
          onClick={() => onSave(formData)}
          className="px-8 py-3 bg-primary text-on-primary rounded-xl font-headline font-bold flex items-center gap-2 hover:bg-primary-dim transition-colors shadow-lg"
        >
          <Save className="w-5 h-5" />
          Slaytı Kaydet
        </button>
      </div>
    </div>
  );
}
