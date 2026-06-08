"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Menu, Download, BookOpen, Play, Volume2, Languages,
  BookText, ListTree, PenLine, Printer, ChevronLeft, ChevronRight,
  ChevronDown, Sparkles,
} from "lucide-react";
import { getWordMorphology, getTranslationFromAlquranCloud, getTafsir } from "@/lib/quran-ai";

import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";
import trMessages from "@/messages/tr.json";

const messages = { ar: arMessages, en: enMessages, tr: trMessages } as const;
type Locale = keyof typeof messages;

// ============== أنواع البيانات ==============
interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
}

interface Ayah {
  numberInSurah: number;
  text: string;
  editionKey: number; // الرقم العالمي للآية
}

interface WordAnalysis {
  word: string;
  translation: { en: string; tr: string };
  lexical: string;
  morphology: string;
  color: string;
}

interface AyahAnalysis {
  grammar: string;
  irab: string;
  rhetoric: string;
  tafsir: string;
  words: WordAnalysis[];
  ayahTranslationEn: string;
  ayahTranslationTr: string;
}

// ============== دوال مساعدة ==============
function tokenizeArabic(text: string): string[] {
  return text.replace(/[،؛؟\.\!]/g, "").split(/\s+/).filter((w) => w.length > 0);
}

function getWordColor(word: string): string {
  const palette = [
    "#8B0000", "#00008B", "#006400", "#D2691E", "#800080", "#B22222",
    "#2E8B57", "#A0522D", "#4B0082", "#FF4500", "#1E90FF", "#228B22",
    "#8B4513", "#9400D3", "#FF1493", "#00CED1",
  ];
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return palette[Math.abs(hash) % palette.length];
}

function useDictionary() {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("preferred-locale") as Locale | null;
      if (stored && messages[stored]) setLocale(stored);
    } catch {}
  }, []);
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split(".");
      let result: any = messages[locale];
      for (const k of keys) {
        if (result && typeof result === "object") result = result[k];
        else return fallback || key;
      }
      return typeof result === "string" ? result : fallback || key;
    },
    [locale]
  );
  return { t, locale };
}

export default function QuranStudyPage() {
  const { t } = useDictionary();
  const [surahs, setSurahs] = useState<SurahInfo[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [viewMode, setViewMode] = useState<"study" | "writing">("study");
  const [translationLang, setTranslationLang] = useState<"en" | "tr">("en");

  const [analyses, setAnalyses] = useState<Record<number, AyahAnalysis>>({});
  const [writingPage, setWritingPage] = useState(0);
  const wordsPerChunk = 8;

  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "word" | "print">("pdf");
  const [pageRangeFrom, setPageRangeFrom] = useState(1);
  const [pageRangeTo, setPageRangeTo] = useState(1);

  const [tafsirOpen, setTafsirOpen] = useState<Record<number, boolean>>({});

  // تحميل السور
  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setSurahs(data.data);
        else setError("quran-study.errorLoadingSurahs");
      })
      .catch(() => setError("quran-study.errorLoadingSurahs"))
      .finally(() => setLoadingSurahs(false));
  }, []);

  // جلب الآيات مع بيانات quran.ai + ترجمة موثوقة
  const fetchAyahs = useCallback(async (number: number) => {
    setError(null);
    setLoadingAyahs(true);
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
      const data = await res.json();
      if (!data.data) {
        setError("quran-study.errorLoadingAyahs");
        setAyahs([]);
        return;
      }

      const ayahsData: Ayah[] = data.data.ayahs.map((a: any) => ({
        numberInSurah: a.numberInSurah,
        text: a.text,
        editionKey: a.number, // الرقم العالمي للآية
      }));
      setAyahs(ayahsData);

      const analysesMap: Record<number, AyahAnalysis> = {};
      const promises = ayahsData.map(async (ayah) => {
        const words = tokenizeArabic(ayah.text);
        const colors = words.map((w) => getWordColor(w));

        // جلب ترجمة موثوقة من api.alquran.cloud
        const [translationEn, translationTr] = await Promise.all([
          getTranslationFromAlquranCloud(ayah.editionKey, "en.asad").catch(() => ""),
          getTranslationFromAlquranCloud(ayah.editionKey, "tr.diyanet").catch(() => ""),
        ]);

        // جلب التحليل الصرفي والترجمة من quran.ai (إن أمكن)
        let morphologyList: any[] = [];
        try {
          morphologyList = await getWordMorphology(number, ayah.numberInSurah);
        } catch {}

        const wordAnalyses: WordAnalysis[] = words.map((word, idx) => {
          const morph = Array.isArray(morphologyList)
            ? morphologyList.find((m: any) => m.word === word) || {}
            : {};
          return {
            word,
            translation: { en: "", tr: "" },
            lexical: "",
            morphology: morph.features || morph.pos || "",
            color: colors[idx],
          };
        });

        // توزيع ترجمة الجملة على الكلمات (تقريبي)
        if (translationEn) {
          const enWords = translationEn.split(/\s+/);
          wordAnalyses.forEach((wa, i) => { wa.translation.en = enWords[i] || ""; });
        }
        if (translationTr) {
          const trWords = translationTr.split(/\s+/);
          wordAnalyses.forEach((wa, i) => { wa.translation.tr = trWords[i] || ""; });
        }

        analysesMap[ayah.numberInSurah] = {
          grammar: "",
          irab: "",
          rhetoric: "",
          tafsir: "",
          words: wordAnalyses,
          ayahTranslationEn: translationEn,
          ayahTranslationTr: translationTr,
        };
      });

      await Promise.all(promises);
      setAnalyses(analysesMap);

      // AI للتحليل النحوي والبلاغي (اختياري)
      // fetchAIAnalysis(number, ayahsData, analysesMap);
    } catch {
      setError("quran-study.errorLoadingAyahs");
      setAyahs([]);
    } finally {
      setLoadingAyahs(false);
    }
  }, []);

  // الصوتيات: استخدام everyayah.com (قارئ الحذيفي)
  const playAyahAudio = useCallback((ayahNumber: number) => {
    if (!selectedSurah) return;
    // everyayah.com يتطلب الرقم العالمي للآية (editionKey)
    const ayah = ayahs.find(a => a.numberInSurah === ayahNumber);
    if (!ayah) return;
    const url = `https://everyayah.com/data/Hudhaifi_64kbps/${String(ayah.editionKey).padStart(3, '0')}.mp3`;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current.play().catch(() => alert(t("quran-study.audioNotAvailable")));
    }
  }, [selectedSurah, ayahs, t]);

  // صوت الكلمة (محاولة من quranwbw.com)
  const playWordAudio = useCallback((word: string, ayahNumber: number, wordIndex: number) => {
    if (!selectedSurah) return;
    const url = `https://audio.quranwbw.com/audio/${selectedSurah}_${ayahNumber}_${wordIndex + 1}.mp3`;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
      audioRef.current.play().catch(() => alert(t("quran-study.wordAudioComingSoon")));
    }
  }, [selectedSurah, t]);

  const handleSurahSelect = useCallback((number: number) => {
    if (selectedSurah === number) return;
    setSelectedSurah(number);
    setMobileOpen(false);
    setWritingPage(0);
    setTafsirOpen({});
    fetchAyahs(number);
  }, [selectedSurah, fetchAyahs]);

  const writingChunks = useMemo(() => {
    if (!selectedSurah || ayahs.length === 0) return [];
    const allChunks: {
      ayahNumber: number;
      words: WordAnalysis[];
      ayahText: string;
      ayahTranslation: string;
    }[] = [];
    ayahs.forEach((ayah) => {
      const analysis = analyses[ayah.numberInSurah];
      if (!analysis) return;
      const words = analysis.words;
      for (let i = 0; i < words.length; i += wordsPerChunk) {
        const chunkWords = words.slice(i, i + wordsPerChunk);
        const chunkText = chunkWords.map(w => w.word).join(" ");
        const chunkTranslation = translationLang === "en"
          ? analysis.ayahTranslationEn
          : analysis.ayahTranslationTr;
        allChunks.push({
          ayahNumber: ayah.numberInSurah,
          words: chunkWords,
          ayahText: chunkText,
          ayahTranslation: chunkTranslation,
        });
      }
    });
    return allChunks;
  }, [selectedSurah, ayahs, analyses, translationLang]);

  const totalWritingPages = Math.ceil(writingChunks.length / 2);
  const currentPageChunks = writingChunks.slice(writingPage * 2, writingPage * 2 + 2);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!printRef.current) return;
    if (downloadFormat === "print") {
      window.print();
    } else if (downloadFormat === "pdf") {
      import("html2pdf.js").then((html2pdf: any) => {
        const opt = {
          margin: 0.3,
          filename: `quran-writing-${selectedSurah}.pdf`,
          image: { type: "jpeg", quality: 1 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };
        html2pdf().set(opt).from(printRef.current).save();
      });
    } else if (downloadFormat === "word") {
      const content = printRef.current.outerHTML;
      const fullHTML = `<html><head><meta charset="utf-8"><style>
        @page { size: A4; margin: 1cm; }
        body { font-family: 'Amiri', serif; direction: rtl; background: white; color: black; }
        table { border-collapse: collapse; width: 100%; } td { border: 1px solid #999; padding: 6px; text-align: center; }
        .no-print { display: none; }
      </style></head><body>${content}</body></html>`;
      const blob = new Blob([fullHTML], { type: "application/msword" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `quran-writing-${selectedSurah}.doc`;
      link.click();
    }
    setDownloadDialogOpen(false);
  };

  // مكون الكلمة بقائمة منسدلة (تصميم محسن)
  const WordItem = ({ wordAnalysis, ayahNum, wordIndex, onPlayWord }: {
    wordAnalysis: WordAnalysis;
    ayahNum: number;
    wordIndex: number;
    onPlayWord: (word: string, ayah: number, idx: number) => void;
  }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const trans = translationLang === "en" ? wordAnalysis.translation.en : wordAnalysis.translation.tr;
    return (
      <TooltipProvider delayDuration={200}>
        <DropdownMenu>
          <Tooltip open={showTooltip && !!trans}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <span
                  className="cursor-pointer inline-block transition-all duration-200 hover:scale-110 hover:opacity-90"
                  style={{ color: wordAnalysis.color, textShadow: "0 0 5px rgba(0,0,0,0.1)" }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {wordAnalysis.word}
                </span>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-amber-900 text-white border-amber-700">
              {trans}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent className="w-56 border-amber-200">
            <DropdownMenuItem onClick={() => onPlayWord(wordAnalysis.word, ayahNum, wordIndex)}>
              <Volume2 className="w-4 h-4 ml-2" /> {t("quran-study.playWord")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BookOpen className="w-4 h-4 ml-2" /> {t("quran-study.lexicalStudy")}: {wordAnalysis.lexical || t("quran-study.notAvailable")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Languages className="w-4 h-4 ml-2" /> {t("quran-study.translation")} ({translationLang}): {trans || t("quran-study.notAvailable")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ListTree className="w-4 h-4 ml-2" /> {t("quran-study.morphologyAnalysis")}: {wordAnalysis.morphology || t("quran-study.notAvailable")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    );
  };

  const SurahList = () => (
    <ScrollArea className="h-full pr-2">
      <div className="space-y-1">
        {surahs.map((surah) => (
          <Button
            key={surah.number}
            variant={selectedSurah === surah.number ? "secondary" : "ghost"}
            className="w-full justify-start text-left h-auto py-3 px-4 font-normal hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
            onClick={() => handleSurahSelect(surah.number)}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-sm font-bold">
                {surah.number}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate">{surah.englishName}</div>
                <div className="text-xs text-muted-foreground font-arabic truncate">{surah.name}</div>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );

  const StudyView = () => (
    <div className="space-y-6">
      {ayahs.map((ayah) => {
        const analysis = analyses[ayah.numberInSurah];
        if (!analysis) return null;
        const isTafsirOpen = tafsirOpen[ayah.numberInSurah] || false;
        return (
          <div key={ayah.numberInSurah} className="group bg-white/80 dark:bg-card/40 rounded-xl p-4 border border-amber-200/40 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 flex items-center justify-center text-sm font-bold cursor-pointer hover:from-amber-200 hover:to-amber-300 transition">
                    {ayah.numberInSurah}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => playAyahAudio(ayah.numberInSurah)}>
                    <Play className="w-4 h-4 ml-2" /> {t("quran-study.playAyah")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTafsirOpen(prev => ({ ...prev, [ayah.numberInSurah]: !isTafsirOpen }))}>
                    <BookOpen className="w-4 h-4 ml-2" /> {t("quran-study.tafsir")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex-1">
                <div className="flex flex-wrap justify-end gap-x-3 gap-y-2 text-3xl md:text-4xl font-arabic leading-relaxed">
                  {analysis.words.map((word, idx) => (
                    <WordItem key={`${ayah.numberInSurah}-${idx}`} wordAnalysis={word} ayahNum={ayah.numberInSurah} wordIndex={idx} onPlayWord={playWordAudio} />
                  ))}
                </div>
                {analysis.tafsir && (
                  <Collapsible open={isTafsirOpen} onOpenChange={(open) => setTafsirOpen(prev => ({ ...prev, [ayah.numberInSurah]: open }))} className="mt-3">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-xs gap-1 text-amber-800">
                        <ChevronDown className={`w-3 h-3 transition-transform ${isTafsirOpen ? "rotate-180" : ""}`} />
                        {t("quran-study.tafsir")}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 p-3 bg-amber-50/50 rounded-lg text-sm leading-relaxed font-arabic text-right" dir="rtl">
                      {analysis.tafsir}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const WritingView = () => (
    <div ref={printRef} className="space-y-8 print:space-y-2">
      {currentPageChunks.map((chunk, chunkIdx) => (
        <div key={`${chunk.ayahNumber}-${chunkIdx}`} className="bg-white dark:bg-card/60 rounded-xl border border-amber-200/50 p-6 print:border-2 print:border-black print:bg-white print:shadow-none">
          <div className="mb-3 text-right font-arabic text-2xl md:text-3xl leading-relaxed text-amber-950 dark:text-amber-100" dir="rtl">
            {chunk.ayahText}
          </div>
          <div className="mb-5 text-lg text-amber-800 dark:text-amber-200 print:text-black font-medium">
            {chunk.ayahTranslation || t("quran-study.noTranslation")}
          </div>
          <table className="w-full border-collapse bg-white dark:bg-transparent rounded-lg overflow-hidden">
            <tbody>
              <tr>
                {chunk.words.map((word, wIdx) => (
                  <td key={`w-${wIdx}`} className="border border-amber-200 p-3 text-center font-arabic text-2xl font-bold" style={{ color: word.color }}>
                    {word.word}
                  </td>
                ))}
              </tr>
              <tr>
                {chunk.words.map((word, wIdx) => (
                  <td key={`t-${wIdx}`} className="border border-amber-200 p-3 text-center text-base" style={{ color: word.color }}>
                    {translationLang === "en" ? word.translation.en : word.translation.tr}
                  </td>
                ))}
              </tr>
              {[1, 2, 3].map((line) => (
                <tr key={`line-${line}`}>
                  {chunk.words.map((word, wIdx) => (
                    <td key={`l${line}-${wIdx}`} className="border border-amber-200 p-3 text-center font-arabic text-2xl text-amber-300/40 dark:text-amber-100/20 select-none">
                      {word.word}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <div className="flex justify-between items-center mt-6 no-print">
        <Button variant="outline" className="border-amber-300" disabled={writingPage === 0} onClick={() => setWritingPage(p => p - 1)}>
          <ChevronLeft className="w-4 h-4 ml-2" /> {t("quran-study.previousPage")}
        </Button>
        <span className="text-sm font-medium">{t("quran-study.page")} {writingPage + 1} / {totalWritingPages}</span>
        <Button variant="outline" className="border-amber-300" disabled={writingPage >= totalWritingPages - 1} onClick={() => setWritingPage(p => p + 1)}>
          {t("quran-study.nextPage")} <ChevronRight className="w-4 h-4 mr-2" />
        </Button>
      </div>
    </div>
  );

  const SettingsBar = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 no-print">
      <div className="flex items-center gap-2">
        <Languages className="w-4 h-4 text-amber-800" />
        <Select value={translationLang} onValueChange={(v) => setTranslationLang(v as "en" | "tr")}>
          <SelectTrigger className="w-28 h-9 border-amber-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="tr">Türkçe</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {viewMode === "writing" && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-amber-300" onClick={() => setDownloadDialogOpen(true)}>
            <Download className="w-4 h-4 mr-1" /> {t("quran-study.download")}
          </Button>
          <Button variant="outline" size="sm" className="border-amber-300" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1" /> {t("quran-study.print")}
          </Button>
        </div>
      )}
    </div>
  );

  const DownloadDialog = () => (/* كما هو سابقاً مع تحسين الألوان */
    <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{t("quran-study.downloadOptions")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("quran-study.format")}</Label>
            <RadioGroup value={downloadFormat} onValueChange={(v) => setDownloadFormat(v as any)}>
              <div className="flex items-center space-x-2"><RadioGroupItem value="pdf" id="pdf" /><Label htmlFor="pdf">PDF</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="word" id="word" /><Label htmlFor="word">Word</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="print" id="print" /><Label htmlFor="print">{t("quran-study.print")}</Label></div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>{t("quran-study.fromPage")}</Label><Input type="number" min={1} max={totalWritingPages} value={pageRangeFrom} onChange={(e) => setPageRangeFrom(Number(e.target.value))} /></div>
            <div><Label>{t("quran-study.toPage")}</Label><Input type="number" min={1} max={totalWritingPages} value={pageRangeTo} onChange={(e) => setPageRangeTo(Number(e.target.value))} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDownloadDialogOpen(false)}>{t("quran-study.cancel")}</Button>
          <Button onClick={handleDownload} className="bg-amber-700 hover:bg-amber-800">{t("quran-study.download")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 to-white dark:from-amber-950/20 dark:to-background">
      <audio ref={audioRef} className="hidden" />
      <DownloadDialog />

      <div className="flex h-[calc(100vh-4rem)]">
        <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col border-r border-amber-200/40 bg-amber-50/20 dark:bg-amber-900/10 no-print">
          <div className="p-4 border-b border-amber-200/40">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <BookOpen className="w-5 h-5 text-amber-700" /> {t("quran-study.selectSurah")}
            </h2>
          </div>
          {loadingSurahs ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (<Skeleton key={i} className="h-12 w-full" />))}
            </div>
          ) : error && surahs.length === 0 ? (
            <Alert variant="destructive"><AlertDescription>{t(error)}</AlertDescription></Alert>
          ) : (<SurahList />)}
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <div className="lg:hidden flex items-center p-4 border-b border-amber-200/40 bg-amber-50/20 dark:bg-amber-900/10 no-print">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="mr-3 border-amber-300"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b"><SheetTitle>{t("quran-study.selectSurah")}</SheetTitle></SheetHeader>
                {!loadingSurahs && surahs.length > 0 && <SurahList />}
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">{t("quran-study.title")}</h1>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            {selectedSurah ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {surahs.find((s) => s.number === selectedSurah)?.englishName}
                    <span className="mx-2 text-amber-400">|</span>
                    <span className="font-arabic text-4xl">{surahs.find((s) => s.number === selectedSurah)?.name}</span>
                  </h2>
                </div>

                <SettingsBar />

                {loadingAyahs ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-20 w-full" />))}
                  </div>
                ) : (
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
                    <TabsList className="mx-auto mb-6 w-fit bg-amber-100/50 dark:bg-amber-900/30 p-1 rounded-full no-print">
                      <TabsTrigger value="study" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm">
                        <Sparkles className="w-4 h-4 mr-1" /> {t("quran-study.studyMode")}
                      </TabsTrigger>
                      <TabsTrigger value="writing" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm">
                        <PenLine className="w-4 h-4 mr-1" /> {t("quran-study.writingMode")}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="study"><StudyView /></TabsContent>
                    <TabsContent value="writing"><WritingView /></TabsContent>
                  </Tabs>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <BookOpen className="w-20 h-20 text-amber-300 mb-6" />
                <h2 className="text-2xl font-bold mb-2 text-amber-900 dark:text-amber-100">{t("quran-study.title")}</h2>
                <p className="text-muted-foreground max-w-md">{t("quran-study.selectPrompt")}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}