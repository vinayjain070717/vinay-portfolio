"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { Float } from "@react-three/drei";
import { siteConfig } from "@/lib/site.config";
import { cn } from "@/lib/utils";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);

function FloatingShapes() {
  return (
    <>
      <mesh position={[-3, 1, -2]}>
        <icosahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.25}
          wireframe
        />
      </mesh>
      <mesh position={[3, -1, -2]}>
        <torusKnotGeometry args={[0.6, 0.2, 64, 16]} />
        <meshStandardMaterial
          color="#06b6d4"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
      <mesh position={[0, 2, -3]}>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color="#a78bfa"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
      <mesh position={[-2, -2, -1]}>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color="#22d3ee"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      <mesh position={[2.5, 0.5, -2]}>
        <torusKnotGeometry args={[0.4, 0.15, 32, 8]} />
        <meshStandardMaterial
          color="#6366f1"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
    </>
    );
}

function Scene() {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <FloatingShapes />
    </Float>
  );
}

function Hero3DBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
        <pointLight position={[-10, -10, 5]} intensity={0.8} color="#06b6d4" />
        <Scene />
      </Canvas>
    </div>
  );
}

const typewriterText = `Hi, I'm ${siteConfig.profile.fullName}`;

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen w-full overflow-hidden bg-[var(--color-surface)] flex flex-col items-center justify-center"
      id="hero"
    >
      <Suspense fallback={null}>
        <Hero3DBackground />
      </Suspense>

      {/* Gradient overlay for better text readability */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-b from-[var(--color-surface)]/80 via-[var(--color-surface)]/60 to-[var(--color-surface)]"
        aria-hidden
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        {/* Typewriter heading */}
        <motion.div
          className="mb-4 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.03,
                delayChildren: 0.2,
              },
            },
            hidden: {},
          }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            {typewriterText.split("").map((char, i) => (
              <motion.span
                key={i}
                className="inline-block text-[var(--color-text-primary)]"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.2 }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </h1>
        </motion.div>

        {/* Subtitle with scramble/fade-in */}
        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-[var(--color-text-secondary)] mb-10 max-w-2xl"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          {siteConfig.heroSubtitle}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
        >
          {siteConfig.heroCTAs.map((cta, i) => (
            <motion.div key={cta.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={cta.href}
                className={cn(
                  "inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold",
                  i === 0
                    ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-lg hover:shadow-[var(--color-glow)]"
                    : "glass border border-[var(--color-glass-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/50",
                  "transition-shadow duration-300"
                )}
              >
                {cta.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      {siteConfig.showScrollIndicator && (
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.a
          href="#about"
          className="flex flex-col items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          aria-label="Scroll to about section"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-8 h-8" strokeWidth={2} />
          <span className="text-xs font-medium">Scroll</span>
        </motion.a>
      </motion.div>
      )}
    </section>
  );
}
