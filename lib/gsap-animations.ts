/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║              STELLARHUB — GSAP ANIMATION UTILITIES              ║
 * ║   Centralized animation system. Import this in any page/comp.   ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * USAGE:
 *   import { fadeUp, staggerReveal, pageEnter, scrollReveal, initSmoothScroll } from '@/lib/gsap-animations'
 *
 * INSTALL:
 *   npm install gsap
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { TextPlugin } from 'gsap/TextPlugin';
import { CustomEase } from 'gsap/CustomEase';

// ─── Register all plugins ────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, TextPlugin, CustomEase);

  // Custom eases used across the app
  CustomEase.create('stellarIn',   '0.16, 1, 0.3, 1');    // smooth power entrance
  CustomEase.create('stellarBack', '0.34, 1.56, 0.64, 1'); // bouncy back
  CustomEase.create('stellarOut',  '0.55, 0, 1, 0.45');   // sharp exit
}

// ─── Types ───────────────────────────────────────────────────────────────────
type Target = gsap.TweenTarget;
type Vars   = gsap.TweenVars;

// ─── DEFAULT CONFIG ──────────────────────────────────────────────────────────
const DURATION = {
  fast:   0.35,
  normal: 0.55,
  slow:   0.85,
  xslow:  1.2,
};

// ════════════════════════════════════════════════════════════════════════════
//  1. BASIC ATOMS — tiny reusable building blocks
// ════════════════════════════════════════════════════════════════════════════

/** Simple fade in */
export function fadeIn(target: Target, vars?: Vars) {
  return gsap.fromTo(target,
    { opacity: 0 },
    { opacity: 1, duration: DURATION.normal, ease: 'power2.out', ...vars }
  );
}

/** Fade + slide up (most common entrance) */
export function fadeUp(target: Target, vars?: Vars) {
  return gsap.fromTo(target,
    { opacity: 0, y: 32 },
    { opacity: 1, y: 0, duration: DURATION.slow, ease: 'stellarIn', ...vars }
  );
}

/** Fade + slide down */
export function fadeDown(target: Target, vars?: Vars) {
  return gsap.fromTo(target,
    { opacity: 0, y: -24 },
    { opacity: 1, y: 0, duration: DURATION.slow, ease: 'stellarIn', ...vars }
  );
}

/** Fade + slide from left */
export function fadeLeft(target: Target, vars?: Vars) {
  return gsap.fromTo(target,
    { opacity: 0, x: -40 },
    { opacity: 1, x: 0, duration: DURATION.slow, ease: 'stellarIn', ...vars }
  );
}

/** Fade + slide from right */
export function fadeRight(target: Target, vars?: Vars) {
  return gsap.fromTo(target,
    { opacity: 0, x: 40 },
    { opacity: 1, x: 0, duration: DURATION.slow, ease: 'stellarIn', ...vars }
  );
}

/** Scale + fade pop (for logos, icons, badges) */
export function popIn(target: Target, vars?: Vars) {
  return gsap.fromTo(target,
    { opacity: 0, scale: 0.6, rotation: -10 },
    { opacity: 1, scale: 1, rotation: 0, duration: DURATION.slow, ease: 'stellarBack', ...vars }
  );
}

/** Scale fade (for cards/modals) */
export function scaleIn(target: Target, vars?: Vars) {
  return gsap.fromTo(target,
    { opacity: 0, scale: 0.94 },
    { opacity: 1, scale: 1, duration: DURATION.slow, ease: 'stellarIn', ...vars }
  );
}

/** Exit: fade + move up */
export function exitUp(target: Target, vars?: Vars) {
  return gsap.to(target,
    { opacity: 0, y: -28, scale: 0.96, duration: DURATION.fast, ease: 'stellarOut', ...vars }
  );
}

/** Exit: fade + scale down */
export function exitScale(target: Target, vars?: Vars) {
  return gsap.to(target,
    { opacity: 0, scale: 0.9, duration: DURATION.fast, ease: 'stellarOut', ...vars }
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  2. STAGGER GROUPS — animate lists/arrays with staggered delay
// ════════════════════════════════════════════════════════════════════════════

/**
 * Stagger reveal for a list of elements (navbar items, cards, etc.)
 * @param targets  Array of refs or CSS selector
 * @param stagger  Delay between each item (default 0.08s)
 */
export function staggerReveal(targets: Target, stagger = 0.08, vars?: Vars) {
  return gsap.fromTo(targets,
    { opacity: 0, y: 24 },
    {
      opacity: 1, y: 0,
      duration: DURATION.normal,
      ease: 'stellarIn',
      stagger,
      ...vars,
    }
  );
}

/** Stagger from left */
export function staggerLeft(targets: Target, stagger = 0.07, vars?: Vars) {
  return gsap.fromTo(targets,
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: DURATION.normal, ease: 'stellarIn', stagger, ...vars }
  );
}

/** Stagger scale pop (for grids of cards/avatars) */
export function staggerPop(targets: Target, stagger = 0.06, vars?: Vars) {
  return gsap.fromTo(targets,
    { opacity: 0, scale: 0.7 },
    { opacity: 1, scale: 1, duration: DURATION.normal, ease: 'stellarBack', stagger, ...vars }
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  3. PAGE-LEVEL SEQUENCES — full orchestrated timelines
// ════════════════════════════════════════════════════════════════════════════

export interface PageEnterConfig {
  badge?:    Target;
  logo?:     Target;
  heading?:  Target;
  sub?:      Target;
  card?:     Target;
  /** Extra elements to stagger after card appears */
  extras?:   Target[];
}

/**
 * Full page entrance sequence (badge → logo → heading → sub → card → extras)
 * Used on login, register, landing pages, etc.
 */
export function pageEnter(config: PageEnterConfig): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: 'stellarIn' } });

  if (config.badge)
    tl.fromTo(config.badge,
      { opacity: 0, y: -12 },
      { opacity: 1, y: 0, duration: 0.45 });

  if (config.logo)
    tl.fromTo(config.logo,
      { opacity: 0, scale: 0.55, rotation: -15 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.65, ease: 'stellarBack' },
      '-=0.25');

  if (config.heading)
    tl.fromTo(config.heading,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55 },
      '-=0.3');

  if (config.sub)
    tl.fromTo(config.sub,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.45 },
      '-=0.3');

  if (config.card)
    tl.fromTo(config.card,
      { opacity: 0, y: 32, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 },
      '-=0.2');

  if (config.extras?.length) {
    config.extras.forEach((el, i) => {
      tl.fromTo(el,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 },
        i === 0 ? '-=0.15' : '-=0.25');
    });
  }

  return tl;
}

/**
 * Session/auth card entrance (avatar → name → email → buttons → back)
 */
export function sessionCardEnter(els: {
  avatar?: Target;
  info?:   Target;
  btns?:   Target[];
  back?:   Target;
}): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: 'stellarIn' } });

  if (els.avatar)
    tl.fromTo(els.avatar,
      { opacity: 0, scale: 0.5, rotation: -20 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.55, ease: 'stellarBack' });

  if (els.info)
    tl.fromTo(els.info,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.4 },
      '-=0.2');

  if (els.btns?.length)
    tl.fromTo(els.btns,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1 },
      '-=0.15');

  if (els.back)
    tl.fromTo(els.back,
      { opacity: 0 },
      { opacity: 1, duration: 0.35 },
      '-=0.1');

  return tl;
}

// ════════════════════════════════════════════════════════════════════════════
//  4. SCROLL REVEAL — ScrollTrigger wrappers
// ════════════════════════════════════════════════════════════════════════════

export interface ScrollRevealConfig {
  /** CSS selector or element(s) to animate */
  target: string | Element | Element[];
  /** Animation type */
  type?: 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleIn' | 'popIn';
  /** Stagger between elements (default 0.1) */
  stagger?: number;
  /** ScrollTrigger start position (default "top 88%") */
  start?: string;
  /** Markers for debug (default false) */
  markers?: boolean;
  /** Extra GSAP vars */
  vars?: Vars;
}

const SCROLL_FROM: Record<string, Vars> = {
  fadeUp:   { opacity: 0, y: 48 },
  fadeLeft: { opacity: 0, x: -48 },
  fadeRight:{ opacity: 0, x: 48 },
  scaleIn:  { opacity: 0, scale: 0.9 },
  popIn:    { opacity: 0, scale: 0.65, rotation: -8 },
};

const SCROLL_TO: Record<string, Vars> = {
  fadeUp:   { opacity: 1, y: 0 },
  fadeLeft: { opacity: 1, x: 0 },
  fadeRight:{ opacity: 1, x: 0 },
  scaleIn:  { opacity: 1, scale: 1 },
  popIn:    { opacity: 1, scale: 1, rotation: 0 },
};

/**
 * Attach a scroll-triggered reveal to any element(s).
 * Returns an array of ScrollTrigger instances (for cleanup).
 *
 * @example
 * scrollReveal({ target: '.card', type: 'fadeUp', stagger: 0.12 })
 */
export function scrollReveal(config: ScrollRevealConfig): ScrollTrigger[] {
  const {
    target,
    type = 'fadeUp',
    stagger = 0.1,
    start = 'top 88%',
    markers = false,
    vars = {},
  } = config;

  const triggers: ScrollTrigger[] = [];

  const from = SCROLL_FROM[type];
  const to   = SCROLL_TO[type];

  // Handle both single element and NodeList/Array
  const elements = typeof target === 'string'
    ? Array.from(document.querySelectorAll(target))
    : Array.isArray(target) ? target : [target];

  if (elements.length === 0) return triggers;

  // Single ScrollTrigger for the whole group (stagger)
  const st = ScrollTrigger.create({
    trigger: elements[0] as Element,
    start,
    markers,
    onEnter: () => {
      gsap.fromTo(elements, from, {
        ...to,
        duration: DURATION.slow,
        ease: type === 'popIn' ? 'stellarBack' : 'stellarIn',
        stagger,
        ...vars,
      });
    },
    once: true,
  });

  triggers.push(st);
  return triggers;
}

/**
 * Auto-attach scroll reveal to ALL elements with [data-reveal] attribute.
 * Reads data-reveal="fadeUp|fadeLeft|…" and optional data-stagger="0.1"
 *
 * @example  <div data-reveal="fadeUp" data-stagger="0.12">...</div>
 */
export function initScrollReveal(): ScrollTrigger[] {
  if (typeof window === 'undefined') return [];

  const all = Array.from(document.querySelectorAll('[data-reveal]'));
  const triggers: ScrollTrigger[] = [];

  all.forEach(el => {
    const type    = (el.getAttribute('data-reveal') as ScrollRevealConfig['type']) || 'fadeUp';
    const stagger = parseFloat(el.getAttribute('data-stagger') || '0');
    triggers.push(...scrollReveal({ target: el, type, stagger }));
  });

  return triggers;
}

// ════════════════════════════════════════════════════════════════════════════
//  5. SMOOTH SCROLL — ScrollSmoother wrapper
// ════════════════════════════════════════════════════════════════════════════

let _smoother: InstanceType<typeof ScrollSmoother> | null = null;

/**
 * Initialize GSAP ScrollSmoother on the whole page.
 * Requires this HTML structure:
 *
 *   <div id="smooth-wrapper">
 *     <div id="smooth-content">
 *       {children}
 *     </div>
 *   </div>
 *
 * @param speed   Scroll speed multiplier (default 1)
 * @param smooth  Smoothing lag in seconds (default 1.2)
 * @param effects Enable data-speed / data-lag parallax (default true)
 */
export function initSmoothScroll(speed = 1, smooth = 1.2, effects = true) {
  if (typeof window === 'undefined') return null;

  // Destroy existing smoother before re-init
  _smoother?.kill();

  _smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth,
    speed,
    effects,
    normalizeScroll: true,
  });

  return _smoother;
}

/** Get the active ScrollSmoother instance */
export function getSmoother() { return _smoother; }

/** Scroll smoothly to a target element or position */
export function scrollTo(target: string | number | Element, offsetY = 0) {
  if (_smoother) {
    _smoother.scrollTo(target, true, `top ${offsetY}px`);
  } else {
    gsap.to(window, { scrollTo: { y: target, offsetY }, duration: 1, ease: 'stellarIn' });
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  6. CONTINUOUS / LOOPING ANIMATIONS
// ════════════════════════════════════════════════════════════════════════════

/** Infinite slow rotation (for orbit rings, loader dots) */
export function infiniteRotate(target: Target, duration = 10, clockwise = true) {
  return gsap.to(target, {
    rotation: clockwise ? 360 : -360,
    duration,
    ease: 'none',
    repeat: -1,
  });
}

/** Infinite float up/down (for hero elements) */
export function infiniteFloat(target: Target, yAmount = 12, duration = 4) {
  return gsap.to(target, {
    y: `+=${yAmount}`,
    duration,
    ease: 'power1.inOut',
    yoyo: true,
    repeat: -1,
  });
}

/** Infinite glow pulse */
export function infinitePulse(target: Target, opacityMin = 0.4, opacityMax = 1, duration = 2.5) {
  return gsap.fromTo(target,
    { opacity: opacityMin },
    { opacity: opacityMax, duration, ease: 'power1.inOut', yoyo: true, repeat: -1 }
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  7. HOVER MICRO-INTERACTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Attach hover lift effect to element(s).
 * @example  hoverLift('.card')
 */
export function hoverLift(target: string | Element, yAmount = -6, scale = 1.02) {
  const els: Element[] = typeof target === 'string'
    ? Array.from(document.querySelectorAll(target))
    : [target];

  els.forEach(el => {
    el.addEventListener('mouseenter', () =>
      gsap.to(el, { y: yAmount, scale, duration: 0.3, ease: 'power2.out' }));
    el.addEventListener('mouseleave', () =>
      gsap.to(el, { y: 0, scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.6)' }));
  });
}

/** Magnetic button effect */
export function magneticButton(target: string | HTMLElement, strength = 0.3) {
  const el = typeof target === 'string'
    ? document.querySelector<HTMLElement>(target)
    : target;
  if (!el) return;

  el.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    gsap.to(el, {
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
      duration: 0.4, ease: 'power2.out',
    });
  });

  el.addEventListener('mouseleave', () =>
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' }));
}

// ════════════════════════════════════════════════════════════════════════════
//  8. TEXT ANIMATIONS
// ════════════════════════════════════════════════════════════════════════════

/** Typewriter effect using TextPlugin */
export function typewriter(target: Target, text: string, duration = 2, delay = 0) {
  return gsap.to(target, { text, duration, delay, ease: 'none' });
}

/**
 * Split text into spans and animate each character/word.
 * Requires manually splitting text in JSX or using SplitText plugin.
 * This helper animates pre-split [data-char] children.
 */
export function animateChars(parent: string | Element, stagger = 0.03, delay = 0) {
  const el = typeof parent === 'string' ? document.querySelector(parent) : parent;
  if (!el) return;
  const chars = Array.from(el.querySelectorAll('[data-char]'));
  return gsap.fromTo(chars,
    { opacity: 0, y: 24, rotationX: -90 },
    { opacity: 1, y: 0, rotationX: 0, stagger, delay, duration: 0.5, ease: 'stellarBack' }
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  9. PAGE TRANSITIONS
// ════════════════════════════════════════════════════════════════════════════

/** Curtain/overlay page exit animation */
export function pageExit(
  overlayEl: Target,
  onComplete?: () => void
): gsap.core.Timeline {
  const tl = gsap.timeline({ onComplete });
  tl.fromTo(overlayEl,
    { scaleY: 0, transformOrigin: 'bottom center' },
    { scaleY: 1, duration: 0.5, ease: 'power3.inOut' })
    .to(overlayEl,
    { scaleY: 0, transformOrigin: 'top center', duration: 0.5, ease: 'power3.inOut' },
    '+=0.1');
  return tl;
}

/** Fade page enter (run after navigation) */
export function pageEnterFade(wrapper: Target) {
  return gsap.fromTo(wrapper,
    { opacity: 0 },
    { opacity: 1, duration: 0.6, ease: 'power2.out' });
}

// ════════════════════════════════════════════════════════════════════════════
//  10. CLEANUP UTILITY
// ════════════════════════════════════════════════════════════════════════════

/**
 * Kill all ScrollTriggers created on a component.
 * Call this in useEffect cleanup to avoid memory leaks.
 */
export function cleanupScrollTriggers(triggers: ScrollTrigger[]) {
  triggers.forEach(t => t.kill());
}

/** Kill all GSAP tweens on specific targets */
export function killTweens(...targets: Target[]) {
  targets.forEach(t => gsap.killTweensOf(t));
}

// ─── Re-export gsap + ScrollTrigger for direct use ───────────────────────────
export { gsap, ScrollTrigger, ScrollSmoother };