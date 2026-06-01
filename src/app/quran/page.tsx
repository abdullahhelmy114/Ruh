"use client";

import { useEffect, useState, useRef } from "react";
import { T } from "@/components/TranslatedText";
import {
  Loader2, Search, Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, BookOpen, ChevronRight, ChevronDown,
  Sun, Moon, Minimize2, Maximize2,
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const [readers] = useState([
    { name: "Alafasy", identifier: "ar.alafasy" },
    { name: "Husary", identifier: "ar.husary" },
    { name: "Abdul Basit", identifier: "ar.abdulbasitmurattal" },
  ]);
  const [selectedReader, setSelectedReader] = useState(readers[0]);

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
                onClick={() => setSelectedSurah(s.number)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition ${
                  selectedSurah === s.number
                    ? "bg-emerald-600 text-white"
                    : "hover:bg-accent"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-background/20 text-xs font-bold">
                    {s.number}
                  </span>
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
          {/* اختيار السورة على الهاتف */}
          <div className="md:hidden flex-1">
            <select
              value={selectedSurah || ""}
              onChange={e => setSelectedSurah(Number(e.target.value))}
              className="w-full rounded-full border bg-background px-4 py-2 text-sm"
            >
              <option value="">Select Surah</option>
              {surahs.map(s => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.englishName} ({s.name})
                </option>
              ))}
            </select>
          </div>

          {/* أدوات القراءة */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFontSize(f => Math.max(16, f - 2))}
              className="p-2 rounded-full hover:bg-accent text-sm"
              title="Decrease font"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(f => Math.min(48, f + 2))}
              className="p-2 rounded-full hover:bg-accent text-sm"
              title="Increase font"
            >
              A+
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-full hover:bg-accent hidden md:block"
              title="Toggle sidebar"
            >
              <BookOpen className="h-4 w-4" />
            </button>
          </div>

          {/* اختيار القارئ */}
          <select
            value={selectedReader.identifier}
            onChange={e => {
              const r = readers.find(r => r.identifier === e.target.value);
              if (r) setSelectedReader(r);
            }}
            className="rounded-full border bg-background px-3 py-1.5 text-xs"
          >
            {readers.map(r => (
              <option key={r.identifier} value={r.identifier}>{r.name}</option>
            ))}
          </select>

          {/* أزرار التلاوة */}
          <button
            onClick={togglePlay}
            disabled={!selectedSurah || audioLoading}
            className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
            title={playing ? "Pause" : "Play"}
          >
            {audioLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
             playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>

        {/* منطقة عرض الآيات */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {!selectedSurah ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <BookOpen className="mx-auto h-16 w-16 mb-4 text-amber-500/50" />
                <p className="text-lg font-serif"><T>Select a Surah to begin</T></p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-10 w-10" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* البسملة */}
              <p
                className="text-center font-arabic leading-loose mb-8"
                style={{ fontSize: `${fontSize + 4}px`, fontFamily: "Amiri, serif" }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              {ayahs.map(ayah => (
                <div key={ayah.numberInSurah} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition">
                  <span className="shrink-0 grid h-8 w-8 place-items-center rounded-full bg-emerald-600/10 text-xs font-bold text-emerald-600">
                    {ayah.numberInSurah}
                  </span>
                  <p
                    className="text-right flex-1 leading-[2.2]"
                    dir="rtl"
                    style={{ fontSize: `${fontSize}px`, fontFamily: "Amiri, serif" }}
                  >
                    {ayah.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <audio ref={audioRef} onEnded={() => setPlaying(false)} onError={() => setPlaying(false)} />
    </div>
  );
}