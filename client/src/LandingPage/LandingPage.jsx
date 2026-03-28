import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Radar canvas animation ─────────────────────────────────────────
function RadarCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let angle = 0;
    let raf;
    const dots = Array.from({ length: 7 }, () => ({
      r: Math.random() * 0.38 + 0.08,
      a: Math.random() * Math.PI * 2,
      opacity: 0,
      hit: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) / 2 - 4;

      ctx.clearRect(0, 0, W, H);

      // Rings
      [0.25, 0.5, 0.75, 1].forEach((f) => {
        ctx.beginPath();
        ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(250,204,21,0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Cross hairs
      ctx.strokeStyle = "rgba(250,204,21,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();

      // Sweep gradient
      const sweep =
        ctx.createConicalGradient ? null : (
          (() => {
            const g = ctx.createConicalGradient;
            return null;
          })()
        );

      // Manual sweep fill
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const sweepGrad = ctx.createLinearGradient(0, 0, R, 0);
      sweepGrad.addColorStop(0, "rgba(250,204,21,0.0)");
      sweepGrad.addColorStop(1, "rgba(250,204,21,0.18)");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, -Math.PI * 0.35, 0);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();
      ctx.restore();

      // Sweep line
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(R, 0);
      ctx.strokeStyle = "rgba(250,204,21,0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Dots
      dots.forEach((d) => {
        const diff =
          (((angle - d.hit) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (diff < 0.15) d.opacity = 1;
        else d.opacity = Math.max(0, d.opacity - 0.012);

        if (d.opacity > 0) {
          const x = cx + Math.cos(d.a) * d.r * R;
          const y = cy + Math.sin(d.a) * d.r * R;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(250,204,21,${d.opacity})`;
          ctx.fill();
          if (d.opacity > 0.5) {
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(250,204,21,${d.opacity * 0.4})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(250,204,21,0.9)";
      ctx.fill();

      angle += 0.018;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={220}
      style={{ display: "block" }}
    />
  );
}

// ── Live ticker ───────────────────────────────────────────────────
const TICKER_ITEMS = [
  "ZONE A — 34 DETECTED",
  "ALERT: PERIMETER BREACH AT 02:14",
  "ZONE B — 12 DETECTED",
  "SYSTEM NOMINAL — ALL CAMS ONLINE",
  "PEAK LOAD: 89 PERSONS AT 18:42",
  "ZONE C — 7 DETECTED",
  "AI MODEL v2.4 — ACCURACY 98.7%",
  "SHIFT HANDOVER IN 00:43:11",
];

function Ticker() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % TICKER_ITEMS.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="overflow-hidden flex items-center gap-3">
      <span
        className="shrink-0 text-xs font-bold tracking-widest text-black bg-yellow-400 px-2 py-0.5 rounded"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "10px",
        }}
      >
        LIVE
      </span>
      <span
        className="text-yellow-400 font-mono text-xs tracking-wider transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {TICKER_ITEMS[idx]}
      </span>
    </div>
  );
}

// ── Stat block ────────────────────────────────────────────────────
function HeroStat({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 first:pl-0 last:pr-0 border-r border-zinc-800 last:border-r-0">
      <span
        className="font-black text-yellow-400 leading-none"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          letterSpacing: "-1px",
        }}
      >
        {value}
      </span>
      <span
        className="text-zinc-500 text-xs tracking-widest uppercase"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "10px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────
function FeatureCard({ icon, title, body, tag }) {
  return (
    <div className="group relative border border-zinc-800 hover:border-yellow-400/40 bg-zinc-950 rounded-2xl p-6 transition-all duration-300 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(250,204,21,0.06), transparent 70%)",
        }}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-yellow-400/30 flex items-center justify-center transition-colors duration-300">
          {icon}
        </div>
        {tag && (
          <span
            className="text-yellow-400 border border-yellow-400/30 bg-yellow-400/5 rounded px-2 py-0.5"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "10px",
              letterSpacing: "1.5px",
            }}
          >
            {tag}
          </span>
        )}
      </div>
      <h3
        className="text-white font-bold mb-2"
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{body}</p>
    </div>
  );
}

// ── Scanline overlay ──────────────────────────────────────────────
function Scanlines() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 2px,#fff 3px)",
      }}
    />
  );
}

// ── Main landing page ─────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="min-h-screen bg-black text-white overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Scanlines />

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes gridScroll {
          from { transform: translateY(0); }
          to   { transform: translateY(48px); }
        }
        @keyframes scanMove {
          from { transform: translateY(-100%); }
          to   { transform: translateY(100vh); }
        }

        .anim-1 { animation: fadeUp 0.7s ease both; }
        .anim-2 { animation: fadeUp 0.7s 0.12s ease both; }
        .anim-3 { animation: fadeUp 0.7s 0.24s ease both; }
        .anim-4 { animation: fadeUp 0.7s 0.36s ease both; }
        .anim-5 { animation: fadeUp 0.7s 0.48s ease both; }
        .cursor-blink { animation: blink 1s step-end infinite; }

        .grid-scroll {
          animation: gridScroll 3s linear infinite;
        }

        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(250,204,21,0.15), transparent);
          animation: scanMove 4s linear infinite;
          pointer-events: none;
        }

        .hero-glow {
          position: absolute;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(250,204,21,0.07) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -60%);
          pointer-events: none;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          borderBottom:
            scrolled ? "1px solid #27272a" : "1px solid transparent",
          background: scrolled ? "rgba(0,0,0,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                <path
                  d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"
                  fill="#000"
                />
              </svg>
            </div>
            <span
              className="text-yellow-400 font-black tracking-tight"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "22px",
                letterSpacing: "0.5px",
              }}
            >
              SENTINELEYE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Security"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-zinc-400 hover:text-yellow-400 transition-colors duration-200 text-sm font-medium"
              >
                {item}
              </a>
            ))}
          </div>

          <button
            onClick={() => navigate("/login")}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold rounded-lg px-4 py-2 transition-colors duration-200 text-sm"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "14px",
              letterSpacing: "0.5px",
            }}
          >
            GUARD LOGIN
          </button>
        </div>
      </nav>

      {/* ── Live ticker bar ── */}
      <div className="fixed top-16 left-0 right-0 z-30 border-b border-zinc-900 bg-black/90 backdrop-blur-sm px-5 py-2">
        <div className="max-w-6xl mx-auto">
          <Ticker />
        </div>
      </div>

      {/* ── Hero section ── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-36 pb-24 px-5 sm:px-8 overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="grid-scroll absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(250,204,21,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.04) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              width: "100%",
              height: "calc(100% + 48px)",
            }}
          />
          <div className="scan-line" />
          <div className="hero-glow" />
          {/* Corner brackets */}
          <div className="absolute top-28 left-5 w-8 h-8 border-t-2 border-l-2 border-yellow-400/20" />
          <div className="absolute top-28 right-5 w-8 h-8 border-t-2 border-r-2 border-yellow-400/20" />
          <div className="absolute bottom-8 left-5 w-8 h-8 border-b-2 border-l-2 border-yellow-400/20" />
          <div className="absolute bottom-8 right-5 w-8 h-8 border-b-2 border-r-2 border-yellow-400/20" />
        </div>

        <div className="relative max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — copy */}
            <div>
              {/* Badge */}
              <div className="anim-1 inline-flex items-center gap-2 border border-yellow-400/30 bg-yellow-400/5 rounded-full px-3 py-1.5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
                </span>
                <span
                  className="text-yellow-400"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "11px",
                    letterSpacing: "1px",
                  }}
                >
                  AI-POWERED SURVEILLANCE
                </span>
              </div>

              {/* Headline */}
              <h1
                className="anim-2 leading-none text-white mb-6"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(3rem, 9vw, 6.5rem)",
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  lineHeight: 0.95,
                }}
              >
                EVERY
                <br />
                <span className="text-yellow-400">PERSON.</span>
                <br />
                EVERY
                <br />
                <span
                  className="text-transparent"
                  style={{ WebkitTextStroke: "2px rgba(250,204,21,0.4)" }}
                >
                  SECOND.
                </span>
              </h1>

              {/* Body */}
              <p
                className="anim-3 text-zinc-400 mb-8 leading-relaxed max-w-md"
                style={{ fontSize: "clamp(0.9rem, 2vw, 1rem)" }}
              >
                Real-time crowd density detection powered by YOLOv8. Stream from
                any camera, monitor any zone, alert on any threshold — all from
                one guard interface.
              </p>

              {/* CTAs */}
              <div className="anim-4 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="group relative bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl px-6 py-3.5 transition-all duration-200 overflow-hidden"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "16px",
                    letterSpacing: "1px",
                  }}
                >
                  <span className="relative z-10">ENTER PORTAL</span>
                </button>

                <a
                  href="#how-it-works"
                  className="border border-zinc-700 hover:border-yellow-400/40 text-zinc-300 hover:text-yellow-400 font-medium rounded-xl px-6 py-3.5 transition-all duration-200 text-sm"
                >
                  See how it works
                </a>
              </div>

              {/* Trust line */}
              <p
                className="anim-5 text-zinc-700 mt-8"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "1.5px",
                }}
              >
                ENCRYPTED · AWS EC2 · RTMP + WebRTC · YOLOv8
              </p>
            </div>

            {/* Right — radar + HUD */}
            <div className="anim-3 flex justify-center lg:justify-end">
              <div className="relative">
                {/* HUD frame */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                  {/* Outer border with corner cuts */}
                  <div
                    className="absolute inset-0 rounded-2xl border border-yellow-400/20"
                    style={{
                      boxShadow: "0 0 40px rgba(250,204,21,0.05) inset",
                    }}
                  />
                  {/* Corner accents */}
                  {[
                    "top-0 left-0",
                    "top-0 right-0",
                    "bottom-0 left-0",
                    "bottom-0 right-0",
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className={`absolute ${pos} w-5 h-5`}
                      style={{
                        borderTop:
                          i < 2 ? "2px solid rgba(250,204,21,0.6)" : "none",
                        borderBottom:
                          i >= 2 ? "2px solid rgba(250,204,21,0.6)" : "none",
                        borderLeft:
                          i % 2 === 0 ?
                            "2px solid rgba(250,204,21,0.6)"
                          : "none",
                        borderRight:
                          i % 2 === 1 ?
                            "2px solid rgba(250,204,21,0.6)"
                          : "none",
                      }}
                    />
                  ))}

                  {/* Radar inside */}
                  <div className="absolute inset-6 flex items-center justify-center">
                    <RadarCanvas />
                  </div>

                  {/* HUD overlays */}
                  <div
                    className="absolute top-3 left-4"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9px",
                      color: "rgba(250,204,21,0.5)",
                      letterSpacing: "1.5px",
                    }}
                  >
                    ZONE-A / CAM-01
                  </div>
                  <div
                    className="absolute top-3 right-4"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9px",
                      color: "rgba(250,204,21,0.5)",
                      letterSpacing: "1.5px",
                    }}
                  >
                    <span className="cursor-blink">▮</span> REC
                  </div>
                  <div
                    className="absolute bottom-3 left-4"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9px",
                      color: "rgba(250,204,21,0.4)",
                      letterSpacing: "1px",
                    }}
                  >
                    HEAD COUNT: 34
                  </div>
                  <div
                    className="absolute bottom-3 right-4"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9px",
                      color: "rgba(250,204,21,0.4)",
                      letterSpacing: "1px",
                    }}
                  >
                    98.7% CONF
                  </div>
                </div>

                {/* Floating badge — top right */}
                <div
                  className="absolute -top-3 -right-3 bg-red-500 text-white rounded-lg px-2.5 py-1.5 border border-red-400"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  ! ALERT
                </div>

                {/* Floating badge — bottom left */}
                <div
                  className="absolute -bottom-3 -left-3 bg-zinc-900 text-yellow-400 border border-yellow-400/30 rounded-lg px-3 py-1.5 flex items-center gap-2"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "10px",
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
                  </span>
                  LIVE STREAM
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 flex flex-wrap justify-start gap-0 anim-5">
            <HeroStat value="&lt;2s" label="Feed latency" />
            <HeroStat value="98.7%" label="Detection accuracy" />
            <HeroStat value="24/7" label="Uptime SLA" />
            <HeroStat value="∞" label="Camera zones" />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="py-24 px-5 sm:px-8 border-t border-zinc-900"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p
              className="text-yellow-400 mb-3"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                letterSpacing: "2px",
              }}
            >
              SYSTEM ARCHITECTURE
            </p>
            <h2
              className="text-white"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              TWO PATHS.
              <br />
              <span className="text-zinc-600">ONE SOURCE.</span>
            </h2>
          </div>

          {/* Step flow */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                num: "01",
                title: "Camera phone streams",
                body: "Larix Broadcaster sends RTMP to your EC2 over port 1935 — raw, uncompressed, continuous.",
                color: "text-yellow-400",
              },
              {
                num: "02",
                title: "Model processes frames",
                body: "YOLOv8 on EC2-Model ingests the RTMP feed, counts heads, and emits metrics over WebSocket.",
                color: "text-yellow-400",
              },
              {
                num: "03",
                title: "Feed relayed to guard",
                body: "EC2-App's NGINX repacks RTMP→HLS. Guard receives raw video directly — model never touches this path.",
                color: "text-yellow-400",
              },
              {
                num: "04",
                title: "Guard sees everything",
                body: "Live video + real-time head count overlay arrive simultaneously on the guard's device.",
                color: "text-yellow-400",
              },
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="border border-zinc-800 hover:border-yellow-400/30 bg-zinc-950 rounded-2xl p-6 h-full transition-colors duration-300">
                  <div
                    className={`font-black mb-4 ${step.color} opacity-40 group-hover:opacity-70 transition-opacity duration-300`}
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "48px",
                      lineHeight: 1,
                    }}
                  >
                    {step.num}
                  </div>
                  <h3
                    className="text-white font-bold mb-2"
                    style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: "18px",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {step.body}
                  </p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 z-10 text-zinc-700">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section
        id="features"
        className="py-24 px-5 sm:px-8 border-t border-zinc-900"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p
              className="text-yellow-400 mb-3"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                letterSpacing: "2px",
              }}
            >
              CAPABILITIES
            </p>
            <h2
              className="text-white"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              BUILT FOR
              <br />
              <span className="text-yellow-400">THE FIELD.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              tag="CORE"
              title="Real-time head counting"
              body="YOLOv8 processes every frame from your RTMP stream, counting people with 98.7% accuracy in real time."
              icon={
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <FeatureCard
              tag="STREAMING"
              title="Sub-2s feed delivery"
              body="RTMP→HLS repack on EC2-App delivers the camera feed directly to the guard's browser with minimal latency."
              icon={
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <polygon
                    points="23 7 16 12 23 17 23 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="1"
                    y="5"
                    width="15"
                    height="14"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              }
            />
            <FeatureCard
              tag="ALERTS"
              title="Threshold alerting"
              body="Set crowd density thresholds per zone. Guards are instantly notified when limits are crossed."
              icon={
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <FeatureCard
              tag="INFRA"
              title="Dual EC2 architecture"
              body="Model and App run on separate instances — compute-heavy AI processing never slows the guard's interface."
              icon={
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="2"
                    y="3"
                    width="20"
                    height="14"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 21h8M12 17v4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
            <FeatureCard
              tag="SECURITY"
              title="JWT-gated access"
              body="Every guard authenticates with credentials. Sessions are token-protected and scoped per shift."
              icon={
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
            <FeatureCard
              tag="MOBILE"
              title="Elastic, device-agnostic"
              body="The guard portal auto-scales from a 320px phone to a 4K monitor. No app install — pure browser."
              icon={
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="5"
                    y="2"
                    width="14"
                    height="20"
                    rx="2"
                    ry="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 18h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section
        id="security"
        className="py-24 px-5 sm:px-8 border-t border-zinc-900"
      >
        <div className="max-w-6xl mx-auto">
          <div
            className="relative rounded-3xl border border-yellow-400/20 overflow-hidden p-10 sm:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, #0a0a00 0%, #000 60%)",
            }}
          >
            {/* Corner brackets */}
            {[
              "top-4 left-4",
              "top-4 right-4",
              "bottom-4 left-4",
              "bottom-4 right-4",
            ].map((pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-6 h-6`}
                style={{
                  borderTop:
                    i < 2 ? "1.5px solid rgba(250,204,21,0.4)" : "none",
                  borderBottom:
                    i >= 2 ? "1.5px solid rgba(250,204,21,0.4)" : "none",
                  borderLeft:
                    i % 2 === 0 ? "1.5px solid rgba(250,204,21,0.4)" : "none",
                  borderRight:
                    i % 2 === 1 ? "1.5px solid rgba(250,204,21,0.4)" : "none",
                }}
              />
            ))}

            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(#FFD700 1px,transparent 1px),linear-gradient(90deg,#FFD700 1px,transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative">
              <p
                className="text-yellow-400 mb-4"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "3px",
                }}
              >
                AUTHORIZED ACCESS ONLY
              </p>
              <h2
                className="text-white mb-6"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(2.5rem, 7vw, 5rem)",
                  fontWeight: 900,
                  letterSpacing: "-1px",
                  lineHeight: 0.95,
                }}
              >
                YOUR SHIFT.
                <br />
                <span className="text-yellow-400">YOUR COMMAND.</span>
              </h2>
              <p className="text-zinc-500 max-w-md mx-auto mb-10 text-sm leading-relaxed">
                Log in with your assigned credentials to access live camera
                feeds, real-time density metrics, and shift alerts.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-xl px-8 py-4 transition-colors duration-200"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "18px",
                  letterSpacing: "1.5px",
                }}
              >
                ENTER GUARD PORTAL
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-900 py-8 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
                <path
                  d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z"
                  fill="#000"
                />
              </svg>
            </div>
            <span
              className="text-zinc-600 font-black"
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "16px",
              }}
            >
              SENTINELEYE
            </span>
          </div>
          <p
            className="text-zinc-700 text-center"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              letterSpacing: "1px",
            }}
          >
            © {new Date().getFullYear()} — ENCRYPTED · AWS EC2 · ALL RIGHTS
            RESERVED
          </p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
            </span>
            <span
              className="text-zinc-600"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px",
                letterSpacing: "1px",
              }}
            >
              SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
