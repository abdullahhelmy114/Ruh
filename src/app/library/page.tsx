"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Box, useTexture } from "@react-three/drei";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authFetch } from "@/lib/authFetch";
import * as THREE from "three";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
}

// مكون الكتاب ثلاثي الأبعاد
function Book3D({ book, position, index }: { book: Book; position: [number, number, number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  // تحميل نسيج الغلاف إذا وجد
  useEffect(() => {
    if (book.cover_url) {
      new THREE.TextureLoader().load(
        book.cover_url,
        (tex) => setTexture(tex),
        undefined,
        () => console.log("فشل تحميل غلاف:", book.title)
      );
    }
  }, [book.cover_url, book.title]);

  // تأثير طفيف للطفو
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.05;
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.3, 0.9, 1.2]} />
        {texture ? (
          <meshStandardMaterial map={texture} roughness={0.3} metalness={0.1} />
        ) : (
          <meshStandardMaterial
            color={hovered ? "#8b6914" : "#6b4e0a"}
            roughness={0.4}
            metalness={0.2}
            emissive={hovered ? "#3a2a0a" : "#000000"}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        )}
      </mesh>
      {/* عنوان الكتاب */}
      <Text
        position={[0.16, -0.55, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.1}
        color="#f5f0e8"
        anchorX="center"
        anchorY="middle"
        maxWidth={1}
        textAlign="center"
      >
        {book.title.length > 20 ? book.title.slice(0, 20) + "…" : book.title}
      </Text>
    </group>
  );
}

// مكون الرف الخشبي
function Shelf({ position, books }: { position: [number, number, number]; books: Book[] }) {
  return (
    <group position={position}>
      {/* لوح خشبي أفقي */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[8, 0.15, 1.8]} />
        <meshStandardMaterial color="#3e2c20" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* دعامات جانبية */}
      <mesh position={[-3.9, -0.6, 0]}>
        <boxGeometry args={[0.2, 1.2, 1.6]} />
        <meshStandardMaterial color="#3e2c20" roughness={0.8} />
      </mesh>
      <mesh position={[3.9, -0.6, 0]}>
        <boxGeometry args={[0.2, 1.2, 1.6]} />
        <meshStandardMaterial color="#3e2c20" roughness={0.8} />
      </mesh>
      {/* الكتب على الرف */}
      {books.map((book, idx) => (
        <Book3D
          key={book.id}
          book={book}
          position={[idx * 0.6 - 2.8, 0.5, 0]}
          index={idx}
        />
      ))}
    </group>
  );
}

// مشهد المكتبة
function LibraryScene({ books }: { books: Book[] }) {
  // توزيع الكتب على الرفوف (كل رف 8 كتب)
  const shelves: Book[][] = [];
  for (let i = 0; i < books.length; i += 8) {
    shelves.push(books.slice(i, i + 8));
  }

  return (
    <>
      {/* إضاءة محيطية */}
      <ambientLight intensity={0.4} color="#f5f0e8" />
      {/* إضاءة رئيسية دافئة */}
      <spotLight
        position={[5, 8, 5]}
        angle={0.4}
        penumbra={0.5}
        intensity={0.8}
        color="#f5f0e8"
        castShadow
      />
      <pointLight position={[-3, 2, -2]} intensity={0.3} color="#8b6914" />
      {/* أرضية خشبية */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.9} />
      </mesh>
      {/* الرفوف */}
      {shelves.map((shelfBooks, idx) => (
        <Shelf key={idx} books={shelfBooks} position={[0, idx * 2.2 - 1, 0]} />
      ))}
      {/* تحكم في الكاميرا */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

// الصفحة الرئيسية
export default function LibraryPage() {
  const { user, isLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    if (!user) {
      setCheckingAccess(false);
      return;
    }

    authFetch("/api/library/access")
      .then((r) => r.json())
      .then((data) => {
        setHasAccess(data.hasAccess);
        if (data.hasAccess) {
          return fetch("/api/library/books").then((r) => r.json());
        }
        return { books: [] };
      })
      .then((data) => {
        if (data?.books) setBooks(data.books);
      })
      .finally(() => setCheckingAccess(false));
  }, [user]);

  // شاشة تحميل
  if (isLoading || checkingAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-secondary-foreground">جاري تحميل المكتبة...</p>
        </div>
      </div>
    );
  }

  // لم يسجل الدخول
  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-hero text-center gap-6 px-4">
        <h1 className="text-4xl font-bold text-secondary-foreground">📚 مكتبة روح القدس</h1>
        <p className="text-lg text-secondary-foreground/80">يجب تسجيل الدخول للوصول إلى المكتبة.</p>
        <Link href="/login">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg">
            تسجيل الدخول
          </Button>
        </Link>
      </div>
    );
  }

  // غير مشترك
  if (!hasAccess) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-hero text-center gap-6 px-4">
        <h1 className="text-4xl font-bold text-secondary-foreground">📚 مكتبة روح القدس</h1>
        <p className="text-lg text-secondary-foreground/80">
          هذه المكتبة حصرية للمشتركين في المنصة.
        </p>
        <Link href="/subscription">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 py-3 text-lg">
            اشترك الآن للوصول
          </Button>
        </Link>
      </div>
    );
  }

  // المكتبة (مشترك)
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-hero">
      {/* عنوان فوق المشهد */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 text-center pointer-events-none">
        <h1 className="text-4xl font-bold text-secondary-foreground drop-shadow-lg">
          📚 مكتبة روح القدس
        </h1>
        <p className="text-secondary-foreground/70 mt-2 text-lg">
          {books.length} كتب في المكتبة
        </p>
      </div>

      {/* مشهد Three.js */}
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 1, 8], fov: 50 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          <LibraryScene books={books} />
        </Canvas>
      </Suspense>

      {/* إرشادات في الأسفل */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-secondary-foreground/40 pointer-events-none">
        🖱️ اسحب للتدوير | 🔍 مرر للتكبير
      </div>
    </div>
  );
}