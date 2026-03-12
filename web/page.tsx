"use client";

import { useRef, useEffect, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// The Gathering Place — Landing Page
// A private membership club for creative professionals. Founded by Drew Dudley.
// ─────────────────────────────────────────────────────────────────────────────

// ── Verified image sources ────────────────────────────────────────────────────
const DREW_PHOTO = "https://www.drewdudley.com/wp-content/uploads/2021/10/Drew_Home_Page_2.jpg";

// Unsplash CDN base URLs — all verified 200 OK
const U = {
  stage:       "photo-1676063258992-1562bbecb583", // speaker in dramatic spotlight on stage
  library:     "photo-1554906493-4812e307243d",     // grand library — rolling ladder, floor-to-ceiling shelves
  mic:         "photo-1485579149621-3123dd979885",  // professional condenser mic, pure black bg
  lake:        "photo-1629872874038-b1d600221640",  // wooden dock, Ontario-style lake, summer trees
  barbados:    "photo-1762254794468-1fb6fa893f73",  // tropical ocean-view villa / infinity pool
  capbreton:   "photo-1755026420799-7d476a5d5ae8",  // coastal cliffs, dramatic Atlantic ocean
  mansion:     "photo-1761767274100-b7bad43be8cf",  // grand manor house at dusk — Forest Hill feel
  loft:        "photo-1700402889708-6090a296ad42",  // moody exposed-brick loft — creative studio
  lounge:      "photo-1693520016313-e129d398a467",  // dimly lit cocktail bar — chandelier, intimate
  villa:       "photo-1758612853656-def5033bccb5",  // luxury villa illuminated at night
};

function unsplash(id: string, w = 1600, q = 85) {
  return `https://images.unsplash.com/${id}?w=${w}&q=${q}&fit=crop&auto=format`;
}

// ── Canvas fire simulation ────────────────────────────────────────────────────
// Classic demoscene fire algorithm: seeds bottom row, propagates heat upward
// with slight decay. Rendered at low resolution and scaled up for natural softness.
// Color palette matches the page's amber/ember tone.
function FireCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let running = true;

    function init() {
      const W = Math.floor(canvas!.offsetWidth / 3);   // low-res for natural softness
      const H = Math.floor(canvas!.offsetHeight / 3);
      if (W < 1 || H < 1) return;

      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;

      const ctx = canvas!.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;

      // Temperature buffer
      const buf = new Uint8Array(W * H);

      // Fire color palette: 0=transparent-black, rising through ember/amber/gold/white
      const pal = new Uint8ClampedArray(256 * 4);
      for (let i = 0; i < 256; i++) {
        let r = 0, g = 0, b = 0, a = 0;
        if (i < 20) {
          // Transparent — background shows through
          r = 0; g = 0; b = 0; a = 0;
        } else if (i < 80) {
          // Dark ember: deep brown-red
          const t = (i - 20) / 60;
          r = Math.floor(60 + t * 80);     // 60→140
          g = Math.floor(10 + t * 20);     // 10→30
          b = 0;
          a = Math.floor(t * 200);          // fade in
        } else if (i < 160) {
          // Ember to amber
          const t = (i - 80) / 80;
          r = Math.floor(140 + t * 115);   // 140→255
          g = Math.floor(30 + t * 90);     // 30→120
          b = 0;
          a = 220;
        } else if (i < 220) {
          // Amber to orange-gold
          const t = (i - 160) / 60;
          r = 255;
          g = Math.floor(120 + t * 100);   // 120→220
          b = Math.floor(t * 40);          // 0→40
          a = 240;
        } else {
          // Orange to pale yellow-white tip
          const t = (i - 220) / 35;
          r = 255;
          g = Math.floor(220 + t * 35);    // 220→255
          b = Math.floor(40 + t * 120);    // 40→160
          a = 255;
        }
        pal[i * 4]     = r;
        pal[i * 4 + 1] = g;
        pal[i * 4 + 2] = b;
        pal[i * 4 + 3] = a;
      }

      const offscreen = document.createElement("canvas");
      offscreen.width = W;
      offscreen.height = H;
      const octx = offscreen.getContext("2d")!;
      const imageData = octx.createImageData(W, H);

      function tick() {
        if (!running) return;

        // Seed bottom rows with varying heat
        for (let x = 0; x < W; x++) {
          const heat = Math.random() > 0.15
            ? Math.floor(180 + Math.random() * 75)
            : Math.floor(Math.random() * 100);
          buf[(H - 1) * W + x] = heat;
          // Second-to-bottom row too for more fuel
          if (Math.random() > 0.3) {
            buf[(H - 2) * W + x] = Math.floor(heat * 0.9);
          }
        }

        // Propagate fire upward
        for (let y = 1; y < H - 1; y++) {
          for (let x = 0; x < W; x++) {
            const below   = buf[(y + 1) * W + x];
            const belowL  = buf[(y + 1) * W + Math.max(0, x - 1)];
            const belowR  = buf[(y + 1) * W + Math.min(W - 1, x + 1)];
            const current = buf[y * W + x];
            const avg = (below + belowL + belowR + current) >> 2;
            buf[y * W + x] = Math.max(0, avg - Math.floor(Math.random() * 3));
          }
        }

        // Render to offscreen image data
        for (let i = 0; i < W * H; i++) {
          const v = buf[i];
          const pi = i * 4;
          imageData.data[pi]     = pal[v * 4];
          imageData.data[pi + 1] = pal[v * 4 + 1];
          imageData.data[pi + 2] = pal[v * 4 + 2];
          imageData.data[pi + 3] = pal[v * 4 + 3];
        }
        octx.putImageData(imageData, 0, 0);

        // Scale up to full canvas
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);
        ctx.drawImage(offscreen, 0, 0, canvas!.width, canvas!.height);

        animId = requestAnimationFrame(tick);
      }

      tick();
    }

    // Small delay to let the DOM settle before reading offsetWidth/Height
    const t = setTimeout(init, 50);
    return () => {
      running = false;
      clearTimeout(t);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}

// ── Hero background: video if available, canvas fire as fallback ──────────────
// The video at /gathering-place/hero-fire.mp4 is generated by:
//   tsx scripts/generate-gathering-place-fire.ts
// If the file doesn't exist yet (404), it silently falls back to the canvas.
function HeroBackground() {
  const [useVideo, setUseVideo] = useState(true);

  const overlays = (
    <>
      {/* Gradient overlay: dark at top and bottom, opens in middle */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(12,10,8,0.75) 0%, rgba(12,10,8,0.1) 40%, rgba(12,10,8,0.5) 80%, rgba(12,10,8,0.88) 100%)",
        }}
      />
      {/* Radial vignette on sides */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 100%, transparent 0%, rgba(12,10,8,0.6) 100%)",
        }}
      />
    </>
  );

  return (
    <div className="absolute inset-0" style={{ backgroundColor: "#0c0a08" }}>
      {useVideo ? (
        /* Video background — loops silently, Veo-generated fireplace */
        <video
          autoPlay
          muted
          loop
          playsInline
          onError={() => setUseVideo(false)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.65,
          }}
        >
          <source src="/gathering-place/hero-fire.mp4" type="video/mp4" />
        </video>
      ) : (
        /* Canvas fire animation fallback */
        <FireCanvas />
      )}
      {overlays}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function GatheringPlacePage() {
  return (
    <main
      style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#0c0a08" }}
      className="text-[#f0ebe2] antialiased"
    >
      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Fire background — video if available, canvas animation as fallback */}
        <HeroBackground />


        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <p
            className="mb-6 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: "#c4922a" }}
          >
            A Private Creative Club
          </p>

          <h1
            className="mb-6 font-bold leading-none tracking-tight"
            style={{
              fontSize: "clamp(3rem, 10vw, 7rem)",
              color: "#f0ebe2",
              letterSpacing: "-0.02em",
            }}
          >
            The Gathering
            <br />
            Place
          </h1>

          <p
            className="mb-10 text-lg leading-relaxed"
            style={{ color: "#d4cbbe", maxWidth: "480px", margin: "0 auto 2.5rem" }}
          >
            A place for creatives who are done performing.
          </p>

          <a
            href="#invitation"
            className="inline-block px-8 py-4 rounded-sm font-medium text-sm uppercase tracking-[0.15em] transition-all duration-200"
            style={{ backgroundColor: "#c4922a", color: "#0c0a08" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d4a85a")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#c4922a")}
          >
            Request an Invitation
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "#9a8f82" }}
        >
          <span style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.6 }}>
            <path
              d="M8 3v10M3 8l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ── 2. THE ORIGIN ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#0c0a08" }}>
        <div className="max-w-2xl mx-auto">
          <p
            className="mb-10 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: "#c4922a" }}
          >
            Why It Exists
          </p>

          <blockquote
            className="mb-12 font-normal italic leading-relaxed"
            style={{
              fontSize: "clamp(1.4rem, 3vw, 1.875rem)",
              color: "#f0ebe2",
              borderLeft: "2px solid #c4922a",
              paddingLeft: "1.75rem",
            }}
          >
            "What would it look like to spend a year sitting around a fire with
            people I find genuinely interesting — and just let it be that?"
          </blockquote>

          <div className="space-y-6 text-base leading-relaxed" style={{ color: "#9a8f82" }}>
            <p>
              After twenty years on the road, 1,000 speeches, and fifteen years
              with the same company, Drew Dudley noticed something. His brain
              had stopped saying{" "}
              <em style={{ color: "#c4a882" }}>oh, that's interesting</em>{" "}
              about being on stage.
            </p>
            <p>
              Not that speaking had stopped feeling good — it still did. But the
              excitement that used to exist{" "}
              <em style={{ color: "#c4a882" }}>before</em> he got on stage was
              gone. The craft had become routine. And he knew what that meant.
            </p>
            <p>
              So he started designing the thing he actually wanted. Not a
              program. Not a curriculum. Not a conference. Every time he
              imagined it, the same image kept coming back: gathered around a
              fire with people he found genuinely interesting. No agenda. No
              obligation to perform. Just depth — and the freedom to go quiet
              when you need to.
            </p>
            <p style={{ color: "#c4a882" }}>
              The Gathering Place is that image turned into a business.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6">
        <div style={{ height: "1px", backgroundColor: "#2e2822" }} />
      </div>

      {/* ── 3. DREW DUDLEY (FOUNDER) ──────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#0c0a08" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Drew's real photo */}
            <div className="order-2 lg:order-1">
              <div
                style={{
                  aspectRatio: "4/3",
                  overflow: "hidden",
                  borderRadius: "2px",
                  position: "relative",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={DREW_PHOTO}
                  alt="Drew Dudley — founder of The Gathering Place, professional speaker"
                  loading="lazy"
                  className="w-full h-full object-cover object-top"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(12,10,8,0.45) 0%, transparent 60%)",
                  }}
                />
              </div>
              <p
                className="mt-3 text-xs text-center"
                style={{ color: "#4a3e32", letterSpacing: "0.06em" }}
              >
                Drew Dudley — Founder, Day One Leadership
              </p>
            </div>

            {/* Right: Bio + credentials */}
            <div className="order-1 lg:order-2">
              <p
                className="mb-6 text-xs font-medium uppercase tracking-[0.3em]"
                style={{ color: "#c4922a" }}
              >
                The Founder
              </p>

              <h2
                className="mb-6 font-bold leading-tight"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  color: "#f0ebe2",
                  letterSpacing: "-0.02em",
                }}
              >
                Drew Dudley
              </h2>

              <p className="mb-6 text-base leading-relaxed" style={{ color: "#9a8f82" }}>
                Drew spent two decades as a professional speaker — 1,000
                keynotes, tens of thousands of rooms, fifteen years with the
                same organization. He's studied how people talk to each other,
                how they lead, and what happens in the rare moments when someone
                really says something.
              </p>

              <p className="mb-10 text-base leading-relaxed" style={{ color: "#9a8f82" }}>
                The Gathering Place is not his next program. It's the room he
                actually wants to live in — built for the people he wants to
                think alongside.
              </p>

              <div className="space-y-4">
                {[
                  { stat: "20+", label: "Years as a professional speaker" },
                  { stat: "1,000+", label: "Keynote speeches delivered" },
                  { stat: "Day One", label: "Leadership — his company, his methodology" },
                ].map((item) => (
                  <div
                    key={item.stat}
                    className="flex items-baseline gap-4"
                    style={{ borderBottom: "1px solid #1e1a16", paddingBottom: "1rem" }}
                  >
                    <span
                      className="font-bold shrink-0"
                      style={{ fontSize: "1.5rem", color: "#c4922a", letterSpacing: "-0.02em" }}
                    >
                      {item.stat}
                    </span>
                    <span className="text-sm" style={{ color: "#6a5e52" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div style={{ height: "1px", backgroundColor: "#2e2822" }} />
      </div>

      {/* ── 4. WHAT IT IS ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#0c0a08" }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: "#c4922a" }}
          >
            The Concept
          </p>

          <h2
            className="mb-16 font-bold leading-tight"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "#f0ebe2",
              letterSpacing: "-0.02em",
            }}
          >
            Not a conference. Not a co-working space.
            <br />
            Not an event.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "A Physical Space",
                body: "Rotating high-end properties — a mansion in Toronto, a cottage in the Kawarthas, a place in Barbados. Yours to use as an office, a studio, somewhere to host a client, or just somewhere to think.",
              },
              {
                title: "A Living Culture",
                body: "A small set of principles — not rules — designed for creatives who talk too much and listen too little. In the best way. A place where you don't have to explain yourself to be understood.",
              },
              {
                title: "A Founding Cohort",
                body: "Twelve seats. Hand-picked. The people in the first year set the tone for everything that follows. If four seats don't fill with the right people, they stay empty.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-8 rounded-sm"
                style={{ backgroundColor: "#161210", borderTop: "2px solid #c4922a" }}
              >
                <h3 className="mb-4 font-semibold text-lg" style={{ color: "#f0ebe2" }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#9a8f82" }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. THE CULTURE ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#111009" }}>
        <div className="max-w-3xl mx-auto">
          <p
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: "#c4922a" }}
          >
            How It Works
          </p>

          <h2
            className="mb-4 font-bold leading-tight"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "#f0ebe2",
              letterSpacing: "-0.02em",
            }}
          >
            A few principles.
            <br />
            Not rules.
          </h2>

          <p
            className="mb-16 text-base leading-relaxed"
            style={{ color: "#9a8f82", maxWidth: "520px" }}
          >
            Smart, excited people tend to talk over each other. We build. We
            riff. We finish each other's ideas before they're fully formed. These
            principles exist to slow that down — just enough.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              { num: "01", principle: "No performance required." },
              { num: "02", principle: "Pause before answering." },
              { num: "03", principle: "Ask more than you answer." },
              { num: "04", principle: "Don't speak for more than 90 seconds straight before 5pm." },
            ].map((item) => (
              <div
                key={item.num}
                className="p-6 rounded-sm flex gap-5 items-start"
                style={{ backgroundColor: "#161210", border: "1px solid #2e2822" }}
              >
                <span className="text-xs font-medium mt-1 shrink-0" style={{ color: "#c4922a" }}>
                  {item.num}
                </span>
                <p className="text-base font-medium leading-snug" style={{ color: "#f0ebe2" }}>
                  {item.principle}
                </p>
              </div>
            ))}
          </div>

          <p className="mb-12 text-sm italic text-center" style={{ color: "#6a5e52" }}>
            By the fire, none of the above applies.
          </p>

          <div
            className="p-8 rounded-sm"
            style={{
              backgroundColor: "#0c0a08",
              border: "1px solid #2e2822",
              borderLeft: "3px solid #c4922a",
            }}
          >
            <h3 className="mb-3 font-semibold text-base" style={{ color: "#c4922a" }}>
              The Am I Crazy Room
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#9a8f82" }}>
              Every space has a chair — or a room — that means one thing: if
              you're sitting in it, you want someone to walk in and listen to
              your idea. You want them to ask:{" "}
              <em style={{ color: "#c4a882" }}>am I crazy?</em> Nobody throws
              their ideas at people who aren't ready to receive them. The chair
              is the signal.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. WHAT'S INCLUDED ───────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#0c0a08" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p
                className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
                style={{ color: "#c4922a" }}
              >
                Membership Includes
              </p>

              <h2
                className="mb-10 font-bold leading-tight"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  color: "#f0ebe2",
                  letterSpacing: "-0.02em",
                }}
              >
                Everything you need
                <br />
                to do your best work.
              </h2>

              <ul className="space-y-5">
                {[
                  {
                    title: "Professional video studio, on-site",
                    desc: "Film your keynotes, your social content, your next idea — included in your membership through a partnered production studio.",
                  },
                  {
                    title: "Social media production",
                    desc: "The studio team is there. You consult, they build a plan, it gets made. No extra invoices.",
                  },
                  {
                    title: "Physical access to the space",
                    desc: "Stay there. Use it as an office. Host a client meeting. Book a room for the weekend. It's yours.",
                  },
                  {
                    title: "Run your own retreats",
                    desc: "Bring up to three guests. They pay you directly. The space is the backdrop. Most members recoup their membership this way.",
                  },
                  {
                    title: "Drew's presence",
                    desc: "Speaker coaching, fireside conversations, idea-bouncing at 11pm if that's when it hits. He's there. You have to come to him.",
                  },
                  {
                    title: "Five questions per visit",
                    desc: "Every time you arrive, you answer five questions in front of a camera. The Gathering Place uses the best one. It's part of the culture.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4 items-start">
                    <span className="mt-1.5 shrink-0" style={{ color: "#c4922a" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2 7h10M7 2l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-medium mb-0.5" style={{ color: "#f0ebe2" }}>
                        {item.title}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "#6a5e52" }}>
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <div style={{ aspectRatio: "4/3", overflow: "hidden", borderRadius: "2px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={unsplash(U.library, 1000, 85)}
                  alt="Grand library interior — floor-to-ceiling bookshelves"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div style={{ aspectRatio: "16/9", overflow: "hidden", borderRadius: "2px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={unsplash(U.mic, 1000, 85)}
                  alt="Professional condenser microphone — on-site video studio"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. THE LOCATIONS ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#111009" }}>
        <div className="max-w-5xl mx-auto">
          <p
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: "#c4922a" }}
          >
            Where We'll Be
          </p>

          <h2
            className="mb-4 font-bold leading-tight"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "#f0ebe2",
              letterSpacing: "-0.02em",
            }}
          >
            The Gathering Place
            <br />
            is not one place.
          </h2>

          <p
            className="mb-16 text-base leading-relaxed"
            style={{ color: "#9a8f82", maxWidth: "480px" }}
          >
            The first year is a beta. We move with the seasons, the energy, and
            what feels right. Members follow. Or drop in where it works for them.
          </p>

          <div className="relative">
            <div
              className="absolute left-[7px] top-3 bottom-3 w-px hidden md:block"
              style={{ backgroundColor: "#2e2822" }}
            />

            <div className="space-y-0">
              {[
                {
                  period: "February 2026",
                  location: "Forest Hill, Toronto",
                  note: "Pilot Week — Feb 15–20. The first gathering. Invite only.",
                  imgId: U.mansion,
                  imgAlt: "Grand manor estate — Forest Hill, Toronto",
                  isFuture: false,
                },
                {
                  period: "April – May 2026",
                  location: "Toronto (Permanent Home)",
                  note: "A permanent base in the city. The club finds its heartbeat.",
                  imgId: U.loft,
                  imgAlt: "Moody exposed-brick creative loft — Toronto studio",
                  isFuture: false,
                },
                {
                  period: "May – October 2026",
                  location: "The Kawarthas, Ontario",
                  note: "A family cottage, lost to bankruptcy twenty years ago, taken back. Summer in the trees.",
                  imgId: U.lake,
                  imgAlt: "Wooden dock on a still lake, Ontario cottage country",
                  isFuture: false,
                },
                {
                  period: "November 2026",
                  location: "The Icon, Toronto",
                  note: "Back to the city for late fall.",
                  imgId: U.lounge,
                  imgAlt: "Dimly lit cocktail lounge with chandelier — The Icon, Toronto",
                  isFuture: false,
                },
                {
                  period: "January – March 2027",
                  location: "Barbados",
                  note: "Warm. Quiet. Writers and speakers need this.",
                  imgId: U.barbados,
                  imgAlt: "Tropical ocean-view villa, Barbados",
                  isFuture: false,
                },
                {
                  period: "Future",
                  location: "Cape Breton, Nova Scotia",
                  note: "A cliff overlooking the ocean, outside Cheticamp. Reserved for founding members.",
                  imgId: U.capbreton,
                  imgAlt: "Dramatic Atlantic coastal cliffs, Cape Breton",
                  isFuture: true,
                },
              ].map((stop, i) => (
                <div
                  key={stop.location}
                  className="flex gap-8 items-start py-8"
                  style={{ borderBottom: i < 5 ? "1px solid #1e1a16" : undefined }}
                >
                  <div className="hidden md:flex shrink-0 mt-1.5 w-3.5 h-3.5 items-center justify-center">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{
                        backgroundColor: stop.isFuture ? "#2e2822" : "#c4922a",
                        border: stop.isFuture ? "1px solid #4a3e32" : "none",
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium uppercase tracking-[0.2em] mb-1"
                      style={{ color: stop.isFuture ? "#4a4038" : "#c4922a" }}
                    >
                      {stop.period}
                    </p>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: stop.isFuture ? "#6a5e52" : "#f0ebe2" }}
                    >
                      {stop.location}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6a5e52" }}>
                      {stop.note}
                    </p>
                  </div>

                  <div
                    className="hidden lg:block shrink-0"
                    style={{
                      width: "160px",
                      height: "100px",
                      overflow: "hidden",
                      borderRadius: "2px",
                      opacity: stop.isFuture ? 0.35 : 1,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={unsplash(stop.imgId, 400, 80)}
                      alt={stop.imgAlt}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. THE GREEN ROOM ────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#0c0a08" }}>
        <div className="max-w-3xl mx-auto">
          <div
            className="p-12 rounded-sm"
            style={{
              backgroundColor: "#0f0d0b",
              border: "1px solid #2e2822",
              borderTop: "2px solid #4a3822",
            }}
          >
            <p
              className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: "#7c6040" }}
            >
              The Green Room at The Gathering Place
            </p>

            <h2
              className="mb-6 font-bold leading-tight"
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                color: "#c4a882",
                letterSpacing: "-0.02em",
              }}
            >
              For speakers.
              <br />
              By invitation only.
            </h2>

            <div className="space-y-5 text-base leading-relaxed" style={{ color: "#6a5e52" }}>
              <p>
                Inside The Gathering Place is a sub-community called The Green
                Room. It's designed specifically for professional speakers — but
                not exclusively for them. The speakers need to be in rooms with
                writers and designers and coaches. The work gets better when the
                room isn't all one thing.
              </p>
              <p>
                The Green Room won't be advertised. It won't have a page. It will
                spread the way all good rooms spread — by word of mouth, from the
                people inside it.
              </p>
              <p className="text-base italic" style={{ color: "#7c6040" }}>
                Not a place you sign up for. A place you're asked into.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. THE FOUNDING COHORT ───────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#111009" }}>
        <div className="max-w-2xl mx-auto">
          <p
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: "#c4922a" }}
          >
            Year One
          </p>

          <h2
            className="mb-10 font-bold leading-tight"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "#f0ebe2",
              letterSpacing: "-0.02em",
            }}
          >
            Twelve seats.
            <br />
            That's it.
          </h2>

          <div className="space-y-6 text-base leading-relaxed mb-12" style={{ color: "#9a8f82" }}>
            <p>
              The founding cohort is being assembled by hand. Drew is reaching
              out to the people he's had 2.5-hour first calls with — the ones he
              never needed to explain himself to. There's no application. There's
              no open enrollment. There's a conversation, and then there's an
              invitation.
            </p>
            <p>
              If four of those twelve seats don't fill with the right people, they
              stay empty. The seat is worth more than the revenue.
            </p>
            <p>
              These are the people Drew is going to be living alongside for a
              year. The room he builds in year one is the room he wants to be in.
            </p>
          </div>

          <blockquote
            className="mb-12 text-lg italic leading-relaxed"
            style={{
              color: "#c4a882",
              borderLeft: "2px solid #c4922a",
              paddingLeft: "1.5rem",
            }}
          >
            "The cost is non-negotiable. The terms are completely flexible."
          </blockquote>

          <div
            className="p-8 rounded-sm"
            style={{ backgroundColor: "#161210", border: "1px solid #2e2822" }}
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span
                className="font-bold"
                style={{ fontSize: "3rem", color: "#f0ebe2", letterSpacing: "-0.03em" }}
              >
                $2,500
              </span>
              <span className="text-base" style={{ color: "#6a5e52" }}>
                / month
              </span>
            </div>
            <p className="text-sm" style={{ color: "#6a5e52" }}>
              ~$30,000 / year. Founding member terms available.
              <br />
              If you can make $20,000 in new business using this space in a year,
              it pays for itself.
            </p>
          </div>
        </div>
      </section>

      {/* ── 10. WHO THIS IS FOR ───────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#0c0a08" }}>
        <div className="max-w-2xl mx-auto">
          <p
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: "#c4922a" }}
          >
            Is This For You?
          </p>

          <h2
            className="mb-12 font-bold leading-tight"
            style={{
              fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
              color: "#f0ebe2",
              letterSpacing: "-0.02em",
            }}
          >
            You've had a 2.5-hour first call
            <br />
            with a stranger and loved every second.
          </h2>

          <ul className="space-y-5">
            {[
              "You're a speaker, coach, writer, or designer — a creative who's also running a business.",
              "You present a polished version of yourself to the world. You need somewhere to take it off.",
              "You're looking for depth, not networking. Fewer people, longer conversations.",
              "You're at a level where the room around you matters. The ceiling has to be higher than you.",
              "You want to be around people whose minds work differently than yours — and who don't need an explanation.",
            ].map((item) => (
              <li
                key={item}
                className="flex gap-4 items-start text-base leading-relaxed"
                style={{ color: "#9a8f82" }}
              >
                <span
                  className="shrink-0"
                  style={{
                    width: "20px",
                    height: "1px",
                    backgroundColor: "#c4922a",
                    display: "block",
                    marginTop: "12px",
                  }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 11. FAQ ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6" style={{ backgroundColor: "#111009" }}>
        <div className="max-w-2xl mx-auto">
          <p
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: "#c4922a" }}
          >
            Questions
          </p>

          <h2
            className="mb-16 font-bold leading-tight"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "#f0ebe2",
              letterSpacing: "-0.02em",
            }}
          >
            The things people
            <br />
            always ask.
          </h2>

          <div className="space-y-0">
            {[
              {
                q: "Do I have to attend every location?",
                a: "No. You choose where it works for you. Some members will follow the whole year. Others will drop in for two or three stops. The membership travels with you.",
              },
              {
                q: "Do I have to be a professional speaker to join?",
                a: "No. The Gathering Place is for creatives running businesses — speakers, coaches, writers, designers. The room works better when it's not all one thing. The Green Room, inside it, is specifically for speakers.",
              },
              {
                q: "How long is the commitment?",
                a: "Year one is a beta. The cost is month-to-month. Founding member terms are available for those who want to structure it differently. The cost is non-negotiable. The terms are completely flexible.",
              },
              {
                q: "What's the process to join?",
                a: "There is no application. Drew is reaching out directly to the people he wants in the room. If you found your way here, reach out. If it feels right, there'll be a conversation. If that conversation goes well, there'll be an invitation.",
              },
              {
                q: "Can I bring guests or host my own events there?",
                a: "Yes — members can bring up to three guests for private retreats. They pay you. The space is the backdrop. Many members cover their membership cost this way.",
              },
              {
                q: "What if it turns out not to be the right fit?",
                a: "That's why the selection conversation exists. Drew isn't looking to fill seats. He's looking to build a room he wants to live in. If it's not right, it's a short conversation before you join — not after.",
              },
              {
                q: "What does Drew actually do at The Gathering Place?",
                a: "He's there. Not as a coach you have to book, not as a speaker giving a talk. He's available for speaker coaching, idea conversations, and fireside sessions. But you have to come to him. The space is not a programme. It's a room with a person in it who finds you genuinely interesting.",
              },
            ].map((item, i, arr) => (
              <div
                key={item.q}
                className="py-8"
                style={{
                  borderTop: "1px solid #2e2822",
                  borderBottom: i === arr.length - 1 ? "1px solid #2e2822" : undefined,
                }}
              >
                <h3
                  className="mb-3 font-semibold text-base leading-snug"
                  style={{ color: "#f0ebe2" }}
                >
                  {item.q}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6a5e52" }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. EXPRESSION OF INTEREST ───────────────────────────────────────── */}
      <section
        id="invitation"
        className="py-24 px-6"
        style={{ backgroundColor: "#0c0a08" }}
      >
        <div className="max-w-xl mx-auto text-center">
          <p
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: "#c4922a" }}
          >
            Request an Invitation
          </p>

          <h2
            className="mb-6 font-bold leading-tight"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "#f0ebe2",
              letterSpacing: "-0.02em",
            }}
          >
            We're not taking applications.
            <br />
            We're having conversations.
          </h2>

          <p className="mb-12 text-base leading-relaxed" style={{ color: "#9a8f82" }}>
            If something here resonated, reach out. Tell Drew who you are and
            why you think you'd be a good fit for the room. That's it.
          </p>

          <div
            className="p-8 rounded-sm text-left"
            style={{ backgroundColor: "#161210", border: "1px solid #2e2822" }}
          >
            <div className="space-y-5">
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-[0.15em] mb-2"
                  style={{ color: "#6a5e52" }}
                >
                  Your Name
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="Full name"
                  className="w-full px-4 py-3 rounded-sm text-sm outline-none"
                  style={{
                    backgroundColor: "#0c0a08",
                    border: "1px solid #2e2822",
                    color: "#f0ebe2",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-[0.15em] mb-2"
                  style={{ color: "#6a5e52" }}
                >
                  Your Email
                </label>
                <input
                  type="email"
                  readOnly
                  placeholder="you@yourwork.com"
                  className="w-full px-4 py-3 rounded-sm text-sm outline-none"
                  style={{
                    backgroundColor: "#0c0a08",
                    border: "1px solid #2e2822",
                    color: "#f0ebe2",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-[0.15em] mb-2"
                  style={{ color: "#6a5e52" }}
                >
                  Why You'd Be a Good Fit
                </label>
                <textarea
                  readOnly
                  rows={4}
                  placeholder="Tell Drew about yourself and why The Gathering Place makes sense for you right now."
                  className="w-full px-4 py-3 rounded-sm text-sm outline-none resize-none"
                  style={{
                    backgroundColor: "#0c0a08",
                    border: "1px solid #2e2822",
                    color: "#f0ebe2",
                  }}
                />
              </div>

              <a
                href="mailto:drew@dayoneleadership.com?subject=The%20Gathering%20Place%20%E2%80%94%20Expression%20of%20Interest"
                className="block w-full py-4 text-center rounded-sm text-sm font-medium uppercase tracking-[0.15em] transition-all duration-200"
                style={{ backgroundColor: "#c4922a", color: "#0c0a08" }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#d4a85a")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#c4922a")}
              >
                Start the Conversation
              </a>

              <p className="text-xs text-center" style={{ color: "#4a4038" }}>
                This opens an email to Drew directly at drew@dayoneleadership.com
              </p>
            </div>
          </div>

          <p className="mt-8 text-xs" style={{ color: "#4a4038" }}>
            The Gathering Place is in beta. The founding cohort is forming now.
          </p>
        </div>
      </section>

      {/* ── 13. FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="py-12 px-6 text-center"
        style={{ backgroundColor: "#0c0a08", borderTop: "1px solid #1e1a16" }}
      >
        <p
          className="text-lg font-semibold tracking-tight mb-2"
          style={{ color: "#4a4038", letterSpacing: "-0.01em" }}
        >
          The Gathering Place
        </p>
        <p className="text-xs" style={{ color: "#2e2822" }}>
          A Drew Dudley project.
        </p>
      </footer>
    </main>
  );
}
