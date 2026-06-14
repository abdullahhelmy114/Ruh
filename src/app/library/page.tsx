"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, useCursor } from "@react-three/drei";
import { useAuth } from "@/lib/firebase/AuthProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";
import { T } from "@/components/TranslatedText";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import * as THREE from "three";

// ---------- Types ----------
interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
}

// ---------- Book 3D Component ----------
function Book3D({
  book,
  position,
  index,
  onClick,
}: {
  book: Book;
  position: [number, number, number];
  index: number;
  onClick: (book: Book) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useCursor(hovered);

  useEffect(() => {
    if (book.cover_url) {
      new THREE.TextureLoader().load(
        book.cover_url,
        (tex) => setTexture(tex),
        undefined,
        () => console.log("Failed to load cover:", book.title)
      );
    }
  }, [book.cover_url, book.title]);

  useFrame((state: any) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + index) * 0.05;
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
        onClick={(e) => {
          e.stopPropagation();
          onClick(book);
        }}
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
            color={hovered ? "#c19a6b" : "#8b7355"}
            roughness={0.4}
            metalness={0.2}
            emissive={hovered ? "#4a3828" : "#000000"}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        )}
      </mesh>
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

// ---------- Shelf Component ----------
function Shelf({
  position,
  books,
  onBookClick,
}: {
  position: [number, number, number];
  books: Book[];
  onBookClick: (book: Book) => void;
}) {
  return (
    <group position={position}>
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <boxGeometry args={[8, 0.15, 1.8]} />
        <meshStandardMaterial color="#3e2c20" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[-3.9, -0.6, 0]}>
        <boxGeometry args={[0.2, 1.2, 1.6]} />
        <meshStandardMaterial color="#3e2c20" roughness={0.8} />
      </mesh>
      <mesh position={[3.9, -0.6, 0]}>
        <boxGeometry args={[0.2, 1.2, 1.6]} />
        <meshStandardMaterial color="#3e2c20" roughness={0.8} />
      </mesh>
      {books.map((book, idx) => (
        <Book3D
          key={book.id}
          book={book}
          position={[idx * 0.6 - 2.8, 0.5, 0]}
          index={idx}
          onClick={onBookClick}
        />
      ))}
    </group>
  );
}

// ---------- Library Scene ----------
function LibraryScene({
  books,
  onBookClick,
}: {
  books: Book[];
  onBookClick: (book: Book) => void;
}) {
  const shelves: Book[][] = [];
  for (let i = 0; i < books.length; i += 8) {
    shelves.push(books.slice(i, i + 8));
  }

  return (
    <>
      <ambientLight intensity={0.4} color="#f5f0e8" />
      <spotLight
        position={[5, 8, 5]}
        angle={0.4}
        penumbra={0.5}
        intensity={0.8}
        color="#f5f0e8"
        castShadow
      />
      <pointLight position={[-3, 2, -2]} intensity={0.3} color="#c19a6b" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2a1f14" roughness={0.9} />
      </mesh>
      {shelves.map((shelfBooks, idx) => (
        <Shelf
          key={idx}
          books={shelfBooks}
          position={[0, idx * 2.2 - 1, 0]}
          onBookClick={onBookClick}
        />
      ))}
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

// ---------- Main Page ----------
export default function LibraryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!user) {
      setCheckingAccess(false);
      return;
    }

    authFetch("/api/library/access")
      .then((r) => r.json())
      .then((data) => {
        setHasAccess(data.hasAccess);
        setIsAdmin(data.isAdmin || false);
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

  const handleBookClick = useCallback(
    (book: Book) => {
      if (isAdmin || hasAccess) {
        router.push(`/library/book/${book.id}`);
      } else {
        setSelectedBook(book);
        setShowSubscribeDialog(true);
      }
    },
    [isAdmin, hasAccess, router]
  );

  const handleMockPurchase = async (plan: "monthly" | "lifetime") => {
    setSubscribing(true);
    try {
      const res = await authFetch("/api/library/mock-purchase", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.success) {
        setHasAccess(true);
        setShowSubscribeDialog(false);
        if (selectedBook) {
          router.push(`/library/book/${selectedBook.id}`);
        }
      } else {
        alert(data.error || "Purchase failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setSubscribing(false);
    }
  };

  if (isLoading || checkingAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-secondary-foreground">
            <T>library.loading</T>
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-hero text-center gap-6 px-4">
        <h1 className="text-4xl font-bold text-secondary-foreground">
          <T>library.title</T>
        </h1>
        <p className="text-lg text-secondary-foreground/80">
          <T>library.loginRequired</T>
        </p>
        <Link href="/login">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg">
            <T>library.login</T>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-hero">
      <div className="absolute top-0 left-0 right-0 z-10 p-6 text-center pointer-events-none">
        <h1 className="text-4xl font-bold text-secondary-foreground drop-shadow-lg">
          <T>library.title</T>
        </h1>
        <p className="text-secondary-foreground/70 mt-2 text-lg">
          <T>library.booksCount</T> {books.length}
        </p>
      </div>

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
          <LibraryScene books={books} onBookClick={handleBookClick} />
        </Canvas>
      </Suspense>

      <div className="absolute bottom-4 right-4 z-10 text-xs text-secondary-foreground/40 pointer-events-none">
        <T>library.instructions</T>
      </div>

      {/* Subscribe Dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl">
              <T>library.subscribeTitle</T>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              <T>library.subscribeDescription</T>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 border-primary/30 hover:bg-primary/10"
                onClick={() => handleMockPurchase("monthly")}
                disabled={subscribing}
              >
                <span className="text-lg font-bold">$9.99</span>
                <span className="text-xs text-muted-foreground">
                  <T>library.monthly</T>
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex-col gap-2 border-accent/30 hover:bg-accent/10"
                onClick={() => handleMockPurchase("lifetime")}
                disabled={subscribing}
              >
                <span className="text-lg font-bold">$49.99</span>
                <span className="text-xs text-muted-foreground">
                  <T>library.lifetime</T>
                </span>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSubscribeDialog(false)}>
              <T>library.cancel</T>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}