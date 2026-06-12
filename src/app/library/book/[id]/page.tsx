"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { authFetch } from "@/lib/authFetch";
import HTMLFlipBook from "react-pageflip";

interface Page {
  page_number: number;
  image_url: string;
}

export default function BookReader() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // جلب صفحات الكتاب
  useEffect(() => {
    if (!user || !params.id) return;
    authFetch(`/api/library/books/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setPages(data.pages || []);
      })
      .finally(() => setLoading(false));
  }, [params.id, user]);

  // حماية المحتوى: منع النقر بزر الماوس الأيمن ومنع اختصارات لوحة المفاتيح
  const handleContextMenu = useCallback((e: MouseEvent) => e.preventDefault(), []);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && (e.key === "s" || e.key === "p" || e.key === "c" || e.key === "u")) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleContextMenu, handleKeyDown]);

  // التنقل بين الصفحات
  const nextPage = () => flipBookRef.current?.pageFlip()?.flipNext();
  const prevPage = () => flipBookRef.current?.pageFlip()?.flipPrev();

  // التكبير والتصغير
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  // ملء الشاشة
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-secondary-foreground">جاري تحميل الكتاب...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-hero">
        <p className="text-secondary-foreground text-lg">يجب تسجيل الدخول لقراءة الكتاب.</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-hero">
        <p className="text-muted-foreground text-lg">لا توجد صفحات للعرض حالياً.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4 select-none"
    >
      {/* شريط التحكم العلوي */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-4 bg-secondary/60 backdrop-blur-md rounded-xl p-2 shadow-lg z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevPage}
          className="text-secondary-foreground hover:text-primary hover:bg-accent/20"
          title="الصفحة السابقة"
        >
          <ChevronRight size={20} />
        </Button>
        <span className="text-sm text-secondary-foreground font-medium min-w-20 text-center">
          {currentPage + 1} / {pages.length}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextPage}
          className="text-secondary-foreground hover:text-primary hover:bg-accent/20"
          title="الصفحة التالية"
        >
          <ChevronLeft size={20} />
        </Button>
        <div className="w-px h-6 bg-border hidden sm:block" />
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="text-secondary-foreground hover:text-primary hover:bg-accent/20"
            title="تكبير"
          >
            <ZoomIn size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="text-secondary-foreground hover:text-primary hover:bg-accent/20"
            title="تصغير"
          >
            <ZoomOut size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-secondary-foreground hover:text-primary hover:bg-accent/20"
            title={fullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
          >
            <Maximize size={18} />
          </Button>
        </div>
      </div>

      {/* الكتاب */}
      <div
        className="flex justify-center items-center transition-transform duration-200 ease-out"
        style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
      >
        <HTMLFlipBook
          width={400}
          height={550}
          size="fixed"
          minWidth={300}
          maxWidth={600}
          minHeight={400}
          maxHeight={700}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={(e: any) => setCurrentPage(e.data)}
          ref={flipBookRef}
          className="shadow-2xl rounded-lg overflow-hidden"
          style={{ background: "transparent" }}
          startPage={0}
          drawShadow={true}
          flippingTime={800}
          usePortrait={false}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
        >
          {pages.map((page) => (
            <div
              key={page.page_number}
              className="relative bg-white select-none"
              style={{ width: 400, height: 550 }}
            >
              {/* صورة الصفحة */}
              <img
                src={page.image_url}
                alt={`صفحة ${page.page_number}`}
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
              {/* علامة مائية ديناميكية */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-20 mix-blend-difference z-10">
                <p className="text-center text-[10px] font-mono text-white rotate-45 whitespace-nowrap">
                  {user?.email || "مكتبة روح القدس"}
                </p>
              </div>
              {/* طبقة حماية تمنع السحب والتفاعل مع الصورة */}
              <div className="absolute inset-0 z-20" />
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* نصائح في الأسفل */}
      <div className="mt-4 text-xs text-secondary-foreground/40 text-center">
        📖 استخدم الأسهم للتنقل | ⌨️ اضغط Ctrl لأوامر التكبير
      </div>
    </div>
  );
}