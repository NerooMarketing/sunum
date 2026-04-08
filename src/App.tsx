import { useState, useEffect } from 'react';
import Presentation from './components/Presentation';
import Dashboard from './components/Dashboard';

export interface SlideFact {
  icon: string;
  title: string;
  desc: string;
  color: string;
  borderColor: string;
}

export interface SlideChip {
  icon: string;
  text: string;
}

export interface SlideMedia {
  type: 'image' | 'video';
  url: string;
}

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  image: string; // Keep for backward compatibility/thumbnail
  videoUrl?: string; // Keep for backward compatibility
  media: SlideMedia[];
  audioUrl?: string;
  bgImage?: string;
  category: 'parks' | 'history' | 'nature' | 'photos' | 'ad';
  isAd?: boolean;
  chips: SlideChip[];
  facts: SlideFact[];
  notes: string;
  glossary?: string;
  sources?: string;
}

const initialSlides: Slide[] = [
  {
    id: '1',
    title: "Göreme Milli Parkı",
    subtitle: "Kapadokya'nın Kalbi, Nevşehir",
    image: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?q=80&w=2070&auto=format&fit=crop",
    media: [
      { type: 'image', url: "https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?q=80&w=2070&auto=format&fit=crop" },
      { type: 'video', url: "https://www.youtube.com/watch?v=m_v_v_v_v_v" } // Placeholder
    ],
    category: 'parks',
    chips: [
      { icon: 'History', text: "UNESCO Mirası" },
      { icon: 'MountainSnow', text: "Peribacaları" },
      { icon: 'MapPin', text: "Nevşehir" }
    ],
    facts: [
      { icon: 'Home', title: "Mağara Evler", desc: "Binlerce yıl önce insanlar bu yumuşak kayaları oyarak devasa yeraltı şehirleri inşa ettiler!", color: "text-primary", borderColor: "border-primary" },
      { icon: 'Wind', title: "Sabah Sürprizi", desc: "Her sabah güneş doğarken gökyüzü rengarenk yüzlerce balonla dolar.", color: "text-secondary", borderColor: "border-secondary" },
      { icon: 'PawPrint', title: "Doğa Dostları", desc: "Parkta birçok kartal, doğan ve tilki gibi yabani dostumuz yaşar.", color: "text-tertiary", borderColor: "border-tertiary" }
    ],
    notes: "Öğrencilere Kapadokya'nın tüf kayalarının nasıl oluştuğunu anlat (Yanardağ külleri). Peribacalarının doğal aşınma ile nasıl şekil aldığını vurgula.",
    glossary: "Tüf: Yanardağların püskürttüğü kül, kum ve lav parçacıklarının üst üste yığılarak oluşturduğu yumuşak kayaç.",
    sources: "T.C. Kültür ve Turizm Bakanlığı, UNESCO World Heritage Centre"
  },
  {
    id: '2',
    title: "Efes Antik Kenti",
    subtitle: "Antik Dünyanın Başkenti, İzmir",
    image: "https://images.unsplash.com/photo-1621259182978-f09e5e2ca09a?q=80&w=2070&auto=format&fit=crop",
    media: [
      { type: 'image', url: "https://images.unsplash.com/photo-1621259182978-f09e5e2ca09a?q=80&w=2070&auto=format&fit=crop" }
    ],
    category: 'history',
    chips: [
      { icon: 'Landmark', text: "Antik Kent" },
      { icon: 'History', text: "Roma Dönemi" },
      { icon: 'MapPin', text: "Selçuk, İzmir" }
    ],
    facts: [
      { icon: 'Landmark', title: "Celsus Kütüphanesi", desc: "Zamanının en büyük üçüncü kütüphanesiydi ve içinde binlerce rulo kitap vardı!", color: "text-primary", borderColor: "border-primary" },
      { icon: 'Wind', title: "Büyük Tiyatro", desc: "Tam 25.000 kişilik kapasitesiyle antik dünyanın en büyük açık hava tiyatrolarından biridir.", color: "text-secondary", borderColor: "border-secondary" },
      { icon: 'Home', title: "Yamaç Evler", desc: "Zengin Efeslilerin yaşadığı bu evlerde yerden ısıtma sistemi bile vardı!", color: "text-tertiary", borderColor: "border-tertiary" }
    ],
    notes: "Efes'in bir liman kenti olarak önemini anlat. Celsus Kütüphanesi'nin mimari detaylarına ve o dönemdeki eğitim önemine değin.",
    glossary: "Antik: Çok eski zamanlardan kalma, eski çağlara ait olan.",
    sources: "Efes Müzesi Müdürlüğü, Arkeoloji Haberleri"
  },
  {
    id: '3',
    title: "Ölüdeniz",
    subtitle: "Mavi ve Yeşilin Buluşması, Muğla",
    image: "https://images.unsplash.com/photo-1545562083-a600704fa487?q=80&w=2070&auto=format&fit=crop",
    media: [
      { type: 'image', url: "https://images.unsplash.com/photo-1545562083-a600704fa487?q=80&w=2070&auto=format&fit=crop" }
    ],
    category: 'nature',
    chips: [
      { icon: 'Mountain', text: "Lagün" },
      { icon: 'Wind', text: "Yamaç Paraşütü" },
      { icon: 'MapPin', text: "Fethiye, Muğla" }
    ],
    facts: [
      { icon: 'Wind', title: "Babadağ", desc: "Dünyanın en iyi yamaç paraşütü merkezlerinden biridir. Kuşlar gibi uçabilirsiniz!", color: "text-primary", borderColor: "border-primary" },
      { icon: 'Mountain', title: "Durgun Su", desc: "En fırtınalı günlerde bile Ölüdeniz'in suyu bir havuz gibi dümdüz ve sakin kalır.", color: "text-secondary", borderColor: "border-secondary" },
      { icon: 'PawPrint', title: "Caretta Carettalar", desc: "Buralar deniz kaplumbağalarının en sevdiği yuva alanlarından biridir.", color: "text-tertiary", borderColor: "border-tertiary" }
    ],
    notes: "Lagün oluşumunu ve Ölüdeniz'in neden bu kadar sakin olduğunu anlat. Yamaç paraşütü sporunun bölge turizmine katkısını belirt.",
    glossary: "Lagün: Denizle bağlantısı olan ancak bir kıyı kordonu ile ayrılmış sığ göl.",
    sources: "Muğla İl Kültür ve Turizm Müdürlüğü"
  }
];

export default function App() {
  const [view, setView] = useState<'presentation' | 'dashboard'>('presentation');
  const [slides, setSlides] = useState<Slide[]>(() => {
    const saved = localStorage.getItem('presentation_slides');
    return saved ? JSON.parse(saved) : initialSlides;
  });

  useEffect(() => {
    localStorage.setItem('presentation_slides', JSON.stringify(slides));
  }, [slides]);

  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col bg-background">
      {view === 'presentation' ? (
        <Presentation 
          slides={slides} 
          onSwitchToDashboard={() => setView('dashboard')} 
        />
      ) : (
        <Dashboard 
          slides={slides} 
          setSlides={setSlides} 
          onSwitchToPresentation={() => setView('presentation')} 
        />
      )}
    </div>
  );
}
