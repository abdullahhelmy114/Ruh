"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { T } from "@/components/TranslatedText";
import {
  Loader2, Search, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, BookOpen, ChevronRight, ChevronDown,
  Sun, Moon, Minimize2, Maximize2, Repeat, Repeat1, X,
  Sparkles,
} from "lucide-react";

interface Surah {
  number: number;
  englishName: string;
  name: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  numberInSurah: number;
  text: string;
}

interface AyahInfo {
  arabic: string;
  translation: string;
  tafsir: string;
}

const READERS = [
  { name: "Alafasy", identifier: "ar.alafasy" },
  { name: "Husary", identifier: "ar.husary" },
  { name: "Abdul Basit", identifier: "ar.abdulbasitmurattal" },
  { name: "Al-Minshawi", identifier: "ar.minshawi" },
  { name: "Al-Muaiqly", identifier: "ar.muaiqly" },
  { name: "Al-Ajmy", identifier: "ar.ajamy" },
];

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedReader, setSelectedReader] = useState(READERS[0]);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [repeatMode, setRepeatMode] = useState<"off" | "surah" | "ayah">("off");
  const [selectedAyahInfo, setSelectedAyahInfo] = useState<AyahInfo | null>(null);
  const [showAyahModal, setShowAyahModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // حالة الذكاء الاصطناعي
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [showWordPopup, setShowWordPopup] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [wordTranslation, setWordTranslation] = useState("");
  const [wordMeaning, setWordMeaning] = useState("");
  const [wordPronunciation, setWordPronunciation] = useState("");
  const [wordPopupPosition, setWordPopupPosition] = useState({ x: 0, y: 0 });

  // جلب قائمة السور
  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(r => r.json())
      .then(d => setSurahs(d.data))
      .catch(() => {});
  }, []);

  // جلب آيات السورة المحددة
  useEffect(() => {
    if (!selectedSurah) return;
    setLoading(true);
    setAyahs([]);
    fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}`)
      .then(r => r.json())
      .then(d => setAyahs(d.data.ayahs))
      .finally(() => setLoading(false));
  }, [selectedSurah]);

  // تتبع الوقت لتحديد الآية الحالية
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current || ayahs.length === 0) return;
    const { currentTime, duration } = audioRef.current;
    if (duration === 0 || isNaN(duration)) return;
    const progress = currentTime / duration;
    const ayahIndex = Math.floor(progress * ayahs.length);
    setCurrentAyah(ayahIndex);
  }, [ayahs]);

  // تشغيل/إيقاف التلاوة
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      if (selectedSurah) {
        setAudioLoading(true);
        audioRef.current.src = `https://cdn.islamic.network/quran/audio/128/${selectedReader.identifier}/${selectedSurah}.mp3`;
        audioRef.current.play().then(() => {
          setPlaying(true);
          setAudioLoading(false);
        }).catch(() => setAudioLoading(false));
      }
    }
  };

  // تغيير وضع التكرار
  const toggleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("surah");
    else if (repeatMode === "surah") setRepeatMode("ayah");
    else setRepeatMode("off");
  };

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = repeatMode === "surah";
  }, [repeatMode]);

  // عند النقر على آية – جلب التفسير والترجمة
  const handleAyahClick = async (ayahNumber: number) => {
    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/ayah/${selectedSurah}:${ayahNumber}/editions/quran-uthmani,en.pickthall,ar.muyassar`
      );
      const data = await res.json();
      const editions = data.data;
      const arabic = editions.find((e: any) => e.edition.type === "quran")?.text || "";
      const translation = editions.find((e: any) => e.edition.type === "translation")?.text || "";
      const tafsir = editions.find((e: any) => e.edition.type === "tafsir")?.text || "";
      setSelectedAyahInfo({ arabic, translation, tafsir });
      setAiResponse(""); // مسح الرد السابق
      setShowAyahModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  // طلب شرح AI لسبب النزول
  const handleAskAI = async () => {
    if (!selectedAyahInfo) return;
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `For this Quranic verse: "${selectedAyahInfo.arabic}", please provide: 1) The reason for its revelation (asbab al-nuzul). 2) A brief explanation of its meaning. Keep the answer concise.`,
        }),
      });
      const data = await res.json();
      setAiResponse(data.reply || "No response from AI.");
    } catch (e) {
      setAiResponse("AI service is currently unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  // تحديد الكلمة
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setShowWordPopup(false);
        return;
      }
      const word = selection.toString().trim();
      // التأكد من أن التحديد داخل منطقة الآيات
      const container = document.getElementById("quran-text");
      if (container && container.contains(selection.anchorNode)) {
        setSelectedWord(word);
        setWordTranslation("");
        setWordMeaning("");
        setWordPronunciation("");
        setWordPopupPosition({ x: e.clientX, y: e.clientY });
        setShowWordPopup(true);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // ترجمة الكلمة عبر AI
  const handleTranslateWord = async () => {
    if (!selectedWord) return;
    setWordTranslation("Loading...");
    setWordMeaning("");
    setWordPronunciation("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Translate the Arabic word "${selectedWord}" to English. Then provide its meaning and how to pronounce it in English phonetics. Format: Translation: [word] Meaning: [meaning] Pronunciation: [phonetics]`,
        }),
      });
      const data = await res.json();
      const reply = data.reply || "";
      // محاولة استخراج الترجمة والمعنى والنطق من الرد
      const transMatch = reply.match(/Translation:\s*(.+)/i);
      const meanMatch = reply.match(/Meaning:\s*(.+)/i);
      const pronMatch = reply.match(/Pronunciation:\s*(.+)/i);
      if (transMatch) setWordTranslation(transMatch[1].trim());
      if (meanMatch) setWordMeaning(meanMatch[1].trim());
      if (pronMatch) setWordPronunciation(pronMatch[1].trim());
      // إذا لم يتم استخراجها، نعرض الرد كاملاً كترجمة
      if (!transMatch && !meanMatch && !pronMatch) {
        setWordTranslation(reply);
      }
    } catch (e) {
      setWordTranslation("Could not translate at the moment.");
    }
  };

  const filteredSurahs = surahs.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.name.includes(search)
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* شريط جانبي للسور */}
      {showSidebar && (
        <aside className="w-80 border-r border-border bg-card overflow-y-auto hidden md:block">
          <div className="p-4 sticky top-0 bg-card z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search surah..."
                className="w-full rounded-full border bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-0.5 p-2">
            {filteredSurahs.map(s => (
              <button
                key={s.number}
                onClick={() => { setSelectedSurah(s.number); setSelectedAyahInfo(null); setShowAyahModal(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition ${
                  selectedSurah === s.number ? "bg-emerald-600 text-white" : "hover:bg-accent"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-background/20 text-xs font-bold">{s.number}</span>
                  <span>{s.englishName}</span>
                </span>
                <span className="text-xs opacity-70">{s.name}</span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* شريط التحكم */}
        <div className="flex items-center gap-3 p-3 border-b border-border bg-card">
          <div className="md:hidden flex-1">
            <select
              value={selectedSurah || ""}
              onChange={e => setSelectedSurah(Number(e.target.value))}
              className="w-full rounded-full border bg-background px-4 py-2 text-sm"
            >
              <option value="">Select Surah</option>
              {surahs.map(s => (
                <option key={s.number} value={s.number}>{s.number}. {s.englishName} ({s.name})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setFontSize(f => Math.max(16, f - 2))} className="p-2 rounded-full hover:bg-accent text-sm">A-</button>
            <button onClick={() => setFontSize(f => Math.min(48, f + 2))} className="p-2 rounded-full hover:bg-accent text-sm">A+</button>
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 rounded-full hover:bg-accent hidden md:block" title="Toggle sidebar">
              <BookOpen className="h-4 w-4" />
            </button>
          </div>

          <select
            value={selectedReader.identifier}
            onChange={e => { const r = READERS.find(r => r.identifier === e.target.value); if (r) setSelectedReader(r); }}
            className="rounded-full border bg-background px-3 py-1.5 text-xs"
          >
            {READERS.map(r => <option key={r.identifier} value={r.identifier}>{r.name}</option>)}
          </select>

          {/* زر التكرار */}
          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full ${repeatMode !== "off" ? "bg-amber-500 text-black" : "hover:bg-accent"}`}
            title={repeatMode === "off" ? "Repeat: Off" : repeatMode === "surah" ? "Repeat: Surah" : "Repeat: Ayah"}
          >
            {repeatMode === "off" ? <Repeat className="h-4 w-4" /> : repeatMode === "surah" ? <Repeat className="h-4 w-4" /> : <Repeat1 className="h-4 w-4" />}
          </button>

          <button
            onClick={togglePlay}
            disabled={!selectedSurah || audioLoading}
            className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {audioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
             playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>

        {/* منطقة عرض الآيات */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8" id="quran-text">
          {!selectedSurah ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <BookOpen className="mx-auto h-16 w-16 mb-4 text-amber-500/50" />
                <p className="text-lg font-serif"><T>Select a Surah to begin</T></p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10" /></div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-center font-arabic leading-loose mb-8" style={{ fontSize: `${fontSize + 4}px`, fontFamily: "Amiri, serif" }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              {ayahs.map((ayah, index) => (
                <div
                  key={ayah.numberInSurah}
                  onClick={() => handleAyahClick(ayah.numberInSurah)}
                  className={`group flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition cursor-pointer ${
                    index === currentAyah && playing ? "bg-amber-500/10 border border-amber-500/30" : ""
                  }`}
                >
                  <span className="shrink-0 grid h-8 w-8 place-items-center rounded-full bg-emerald-600/10 text-xs font-bold text-emerald-600">
                    {ayah.numberInSurah}
                  </span>
                  <p className="text-right flex-1 leading-[2.2]" dir="rtl" style={{ fontSize: `${fontSize}px`, fontFamily: "Amiri, serif" }}>
                    {ayah.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* عنصر الصوت */}
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={() => setPlaying(false)} onError={() => setPlaying(false)} />

      {/* نافذة التفسير والترجمة */}
      {showAyahModal && selectedAyahInfo && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAyahModal(false)}>
          <div className="bg-card rounded-3xl p-6 max-w-lg w-full shadow-elegant max-h-[80vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-xl"><T>Ayah Details</T></h3>
              <button onClick={() => setShowAyahModal(false)} className="p-2 rounded-full hover:bg-accent"><X size={18} /></button>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-600"><T>Arabic</T></h4>
              <p className="text-right font-arabic text-lg leading-loose mt-1" style={{ fontFamily: "Amiri, serif" }}>{selectedAyahInfo.arabic}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-600"><T>Translation</T></h4>
              <p className="text-muted-foreground text-sm mt-1">{selectedAyahInfo.translation}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-600"><T>Tafsir</T></h4>
              <p className="text-muted-foreground text-sm mt-1">{selectedAyahInfo.tafsir}</p>
            </div>

            {/* قسم AI */}
            <div className="border-t border-border pt-4">
              <button
                onClick={handleAskAI}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ask AI (Cause of Revelation & Explanation)"}
              </button>
              {aiResponse && (
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">{aiResponse}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نافذة الكلمة المحددة */}
      {showWordPopup && selectedWord && (
        <div
          className="fixed z-50 bg-card rounded-2xl border shadow-elegant p-4 max-w-xs"
          style={{ top: wordPopupPosition.y + 10, left: wordPopupPosition.x - 100 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-serif text-lg">{selectedWord}</h4>
            <button onClick={() => setShowWordPopup(false)} className="p-1 rounded-full hover:bg-accent"><X size={14} /></button>
          </div>
          <button
            onClick={handleTranslateWord}
            className="w-full rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 mb-2"
          >
            Translate & Explain
          </button>
          {wordTranslation && (
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Translation:</span> {wordTranslation}</p>
              {wordMeaning && <p><span className="font-semibold">Meaning:</span> {wordMeaning}</p>}
              {wordPronunciation && <p><span className="font-semibold">Pronunciation:</span> {wordPronunciation}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}