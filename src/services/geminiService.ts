import { GoogleGenAI, Type } from '@google/genai';
import { Slide } from '../App';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSlides(prompt: string): Promise<Slide[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Sen uzman bir eğitim materyali ve sunum hazırlayıcısısın.
    Kullanıcının verdiği metni DİKKATLE analiz et. Kullanıcı sana spesifik başlıklar, yerler veya konular vermişse, SADECE bu konuları baz alarak her biri için ayrı bir slayt oluştur.
    Kullanıcının direktiflerini, vurguladığı önemi ve detayları tam olarak algıla ve slaytlara yansıt.
    
    KURALLAR:
    1. Kullanıcının metnindeki her bir ana madde/başlık için 1 adet slayt oluştur.
    2. Görsel URL'si için konuyu en iyi anlatan İngilizce anahtar kelimelerle 'https://picsum.photos/seed/{ingilizce_anahtar_kelime}/1920/1080' formatını kullan. (Örn: https://picsum.photos/seed/mountain/1920/1080)
    3. Video URL'si için eğer konuyla ilgili bilinen, eğitici bir YouTube videosu biliyorsan tam URL'sini yaz (Örn: https://www.youtube.com/watch?v=dQw4w9WgXcQ). Bilmiyorsan boş bırak ("").
    4. Ses URL'si (audioUrl) için eğer elinde uygun bir telifsiz mp3 url'si varsa ekle, yoksa boş bırak ("").
    5. Kategori sadece şunlardan biri olabilir: 'parks', 'history', 'nature', 'photos'.
    6. Etiket (chip) ikonları sadece şunlar olabilir: 'MapPin', 'History', 'MountainSnow', 'Landmark', 'TreePine', 'Mountain', 'ImageIcon'.
    7. Eğlenceli bilgi (fact) ikonları sadece şunlar olabilir: 'Home', 'Wind', 'PawPrint', 'Landmark', 'History', 'MapPin'.
    8. Eğlenceli bilgi (fact) renkleri sadece şunlar olabilir: 'text-primary', 'text-secondary', 'text-tertiary'.
    9. Eğlenceli bilgi (fact) kenarlık renkleri sadece şunlar olabilir: 'border-primary', 'border-secondary', 'border-tertiary'.
    10. Her slayt için en az 2 etiket ve 2 eğlenceli bilgi oluştur.
    11. Tüm içerik Türkçe olmalıdır.
    12. Sunum notları kısmına, öğretmenin/sunucunun o slaytta anlatması gereken detayları, kullanıcının verdiği metindeki vurgulara göre yaz.
    
    KULLANICI İSTEMİ:
    ${prompt}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Benzersiz bir ID (örn: 'slide-1')" },
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            image: { type: Type.STRING },
            videoUrl: { type: Type.STRING },
            audioUrl: { type: Type.STRING },
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
  
  // Ensure unique IDs
  return slides.map(s => ({ ...s, id: Date.now().toString() + Math.random().toString(36).substring(7) }));
}
