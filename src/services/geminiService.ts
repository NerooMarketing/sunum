import { GoogleGenAI, Type } from '@google/genai';
import { Slide } from '../App';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSlides(prompt: string): Promise<Slide[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sen uzman bir eğitim materyali ve sunum hazırlayıcısısın.
    Kullanıcının verdiği metni DİKKATLE analiz et. Kullanıcı sana spesifik başlıklar, yerler veya konular vermişse, SADECE bu konuları baz alarak her biri için ayrı bir slayt oluştur.
    Kullanıcının direktiflerini, vurguladığı önemi ve detayları tam olarak algıla ve slaytlara yansıt.
    
    KURALLAR:
    1. Kullanıcının metnindeki her bir ana madde/başlık için 1 adet slayt oluştur.
    2. Görsel URL'si için konuyu en iyi anlatan İngilizce anahtar kelimelerle 'https://picsum.photos/seed/{ingilizce_anahtar_kelime}/1920/1080' formatını kullan.
    3. Video URL'si için eğer konuyla ilgili bilinen, eğitici bir YouTube videosu biliyorsan tam URL'sini yaz. Bilmiyorsan boş bırak ("").
    4. Kategori sadece şunlardan biri olabilir: 'parks', 'history', 'nature', 'photos'.
    5. Etiket (chip) ikonları sadece şunlar olabilir: 'MapPin', 'History', 'MountainSnow', 'Landmark', 'TreePine', 'Mountain', 'ImageIcon'.
    6. Eğlenceli bilgi (fact) ikonları sadece şunlar olabilir: 'Home', 'Wind', 'PawPrint', 'Landmark', 'History', 'MapPin'.
    7. Her slayt için en az 2 etiket ve 2 eğlenceli bilgi oluştur.
    8. Tüm içerik Türkçe olmalıdır.
    
    KULLANICI İSTEMİ:
    ${prompt}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            image: { type: Type.STRING },
            videoUrl: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['parks', 'history', 'nature', 'photos'] },
            chips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  icon: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ['icon', 'text']
              }
            },
            facts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  icon: { type: Type.STRING },
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING },
                  color: { type: Type.STRING },
                  borderColor: { type: Type.STRING }
                },
                required: ['icon', 'title', 'desc', 'color', 'borderColor']
              }
            },
            notes: { type: Type.STRING },
            glossary: { type: Type.STRING },
            sources: { type: Type.STRING }
          },
          required: ['id', 'title', 'subtitle', 'image', 'category', 'chips', 'facts', 'notes']
        }
      }
    }
  });

  if (!response.text) {
    throw new Error('AI yanıt vermedi.');
  }

  const slides: Slide[] = JSON.parse(response.text);
  
  // Ensure unique IDs and media array
  return slides.map(s => ({ 
    ...s, 
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    media: s.media || [{ type: 'image', url: s.image }]
  }));
}

