import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Daftarkan plugin GSAP jika pakai ScrollTrigger dll
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export default function AnimationLayout({ children }) {
  const container = useRef();

  useGSAP(() => {
    // 1. Setup MatchMedia untuk bedakan HP & Desktop
    let mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 800px)",
      isMobile: "(max-width: 799px)",
    }, (context) => {
      let { isDesktop, isMobile } = context.conditions;

      // 2. Animasi Global (Cukup kasih class .reveal di elemen mana saja)
      gsap.from(".reveal", {
        y: isMobile ? 10 : 30, // Di HP geraknya dikit aja biar gak berat
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
      });

      // 3. Jika di Desktop mau animasi lebih "lebay" silakan di sini
      if (isDesktop) {
        // contoh: animasi parallax atau hover berat
      }
    });

    return () => mm.revert(); // Bersihkan memori saat pindah halaman
  }, { scope: container });

  return <div ref={container}>{children}</div>;
}