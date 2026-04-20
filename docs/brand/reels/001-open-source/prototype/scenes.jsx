// scenes.jsx — Pulse HR Reel 001 (Open source)
// 6 frames, 15 seconds, vertical 1080×1920.

const INK = '#0b0b0d';
const CREAM = '#f2f2ee';
const LIME = '#b4ff39';
const LIME_HOVER = '#c6ff5a';
const VIOLET = '#c48fff';
const CORAL = '#ff8a7a';
const MUTED = 'rgba(242, 242, 238, 0.55)';
const BORDER = 'rgba(255,255,255,0.1)';

const FRAUNCES = "'Fraunces', 'Playfair Display', Georgia, serif";
const GEIST = "'Geist', 'Inter', system-ui, -apple-system, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

const EASE_BRAND = (t) => {
  // cubic-bezier(0.2, 0, 0, 1) approximation via easeOutQuart
  return 1 - Math.pow(1 - t, 4);
};

// ── Shared primitives ───────────────────────────────────────────────────────

function SafeAreaGuides() {
  return (
    <>
      {/* Top safe area (84px) */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 84,
        height: 1, background: 'rgba(180,255,57,0.0)', pointerEvents: 'none',
      }} />
      {/* Bottom safe area (220px) — just for dev reference, not visible */}
    </>
  );
}

function GridOverlay({ opacity = 0.08 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(242,242,238,${opacity}) 1px, transparent 1px),
        linear-gradient(90deg, rgba(242,242,238,${opacity}) 1px, transparent 1px)
      `,
      backgroundSize: '64px 64px',
      maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 85%)',
      WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 85%)',
      pointerEvents: 'none',
    }} />
  );
}

function PulseDot({ size = 14, color = LIME, style = {} }) {
  const t = useTime();
  const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 1.2);
  return (
    <div style={{
      position: 'relative',
      width: size, height: size,
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${12 + pulse * 12}px ${color}`,
      }} />
      <div style={{
        position: 'absolute', inset: -6,
        borderRadius: '50%',
        border: `1px solid ${color}`,
        opacity: 0.35 * (1 - pulse),
        transform: `scale(${1 + pulse * 0.6})`,
      }} />
    </div>
  );
}

function SparklesBug({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill={LIME} />
      <path d="M16 7 L18 14 L25 16 L18 18 L16 25 L14 18 L7 16 L14 14 Z" fill={INK} />
      <circle cx="24" cy="9" r="1.5" fill={INK} />
      <circle cx="8" cy="23" r="1.2" fill={INK} />
    </svg>
  );
}

// ── Frame 1: Terminal hook (0.0–2.0s) ───────────────────────────────────────

function Frame1_Terminal() {
  const { localTime } = useSprite();

  const command = '$ git clone github.com/davide97g/workflows-people';
  // Type at ~24 chars/sec, starting 0.15s in
  const typeStart = 0.15;
  const charsPerSec = 30;
  const visibleChars = Math.max(0, Math.floor((localTime - typeStart) * charsPerSec));
  const typed = command.slice(0, visibleChars);

  // Cursor blink
  const caretOn = Math.floor(localTime * 2) % 2 === 0;

  // Window enter
  const winProgress = EASE_BRAND(Math.min(1, localTime / 0.35));
  const winOp = winProgress;
  const winScale = 0.96 + 0.04 * winProgress;

  // Completion line appears at end
  const showClone = localTime > 1.55;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: INK,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <GridOverlay opacity={0.05} />

      <div style={{
        width: 900,
        opacity: winOp,
        transform: `scale(${winScale})`,
        transformOrigin: 'center',
      }}>
        {/* Terminal window */}
        <div style={{
          background: '#0f0f12',
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
        }}>
          {/* Title bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '18px 22px',
            borderBottom: `1px solid ${BORDER}`,
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{
              flex: 1, textAlign: 'center',
              fontFamily: MONO, fontSize: 20, color: MUTED,
            }}>
              ~ / pulse-hr
            </div>
          </div>

          {/* Body */}
          <div style={{
            padding: '44px 36px',
            minHeight: 280,
            fontFamily: MONO,
            fontSize: 34,
            lineHeight: 1.4,
            color: CREAM,
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
              <span>{typed}</span>
              <span style={{
                display: 'inline-block',
                width: 14, height: 36,
                background: CREAM,
                marginLeft: 2,
                opacity: caretOn ? 1 : 0,
                verticalAlign: 'middle',
              }} />
            </div>

            {showClone && (
              <div style={{ marginTop: 24, color: MUTED, fontSize: 26 }}>
                <span style={{ color: LIME }}>✓</span> Cloning into 'workflows-people'…
              </div>
            )}
          </div>
        </div>

        {/* Caption beneath */}
        <div style={{
          marginTop: 40,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: LIME,
          opacity: localTime > 0.8 ? 1 : 0,
          transition: 'opacity 300ms',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: LIME }} />
            Open source · FSL-1.1-MIT
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Frame 2: The promise (2.0–4.5s) ─────────────────────────────────────────

function Frame2_Promise() {
  const { localTime, duration } = useSprite();

  // Background product screen fades in
  const bgOp = EASE_BRAND(Math.min(1, localTime / 0.5)) * 0.55;

  // Headline timing
  const line1Start = 0.3;
  const line2Start = 0.55; // italic "read"
  const line3Start = 0.9;

  const line1Op = Math.min(1, Math.max(0, (localTime - line1Start) / 0.4));
  const line1Ty = (1 - EASE_BRAND(line1Op)) * 12;

  // "read" types in char by char
  const readChars = 'read';
  const readTypeStart = line2Start + 0.15;
  const readCharsShown = Math.max(0, Math.floor((localTime - readTypeStart) * 18));
  const readTyped = readChars.slice(0, Math.min(readChars.length, readCharsShown));

  const line3Op = Math.min(1, Math.max(0, (localTime - line3Start) / 0.3));
  const line3Ty = (1 - EASE_BRAND(line3Op)) * 12;

  // Lime period pop
  const dotStart = line3Start + 0.3;
  const dotOp = Math.min(1, Math.max(0, (localTime - dotStart) / 0.15));
  const dotScale = dotOp < 1
    ? 0.4 + 0.6 * EASE_BRAND(dotOp)
    : 1 + 0.08 * Math.sin((localTime - dotStart - 0.15) * 6);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: INK,
    }}>
      {/* Faux product screen behind */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: bgOp,
        filter: 'blur(2px)',
      }}>
        <MockTimeTracker />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(11,11,13,0.55) 0%, rgba(11,11,13,0.85) 60%, rgba(11,11,13,0.98) 100%)',
      }} />
      <GridOverlay opacity={0.06} />

      {/* Headline — stacked, big */}
      <div style={{
        position: 'absolute',
        left: 72, right: 72,
        top: 560,
        fontFamily: FRAUNCES,
        color: CREAM,
        fontSize: 156,
        lineHeight: 0.98,
        letterSpacing: '-0.02em',
        fontWeight: 400,
      }}>
        <div style={{
          opacity: line1Op,
          transform: `translateY(${line1Ty}px)`,
        }}>
          HR you can
        </div>
        <div style={{
          marginTop: 8,
          opacity: Math.min(1, (localTime - line2Start) / 0.3),
        }}>
          <span style={{
            fontStyle: 'italic',
            color: LIME,
            fontWeight: 500,
          }}>
            {readTyped}
            <span style={{
              display: 'inline-block',
              width: 6, height: 110,
              verticalAlign: 'text-bottom',
              background: readTyped.length < readChars.length ? LIME : 'transparent',
              marginLeft: 6,
              marginBottom: -8,
            }} />
          </span>
        </div>
        <div style={{
          marginTop: 8,
          opacity: line3Op,
          transform: `translateY(${line3Ty}px)`,
          display: 'inline-flex',
          alignItems: 'flex-end',
        }}>
          <span>, fork,</span>
        </div>
        <div style={{
          marginTop: 8,
          opacity: line3Op,
          transform: `translateY(${line3Ty * 1.4}px)`,
          display: 'inline-flex',
          alignItems: 'flex-end',
        }}>
          <span>and run</span>
          <span style={{
            display: 'inline-block',
            width: 28, height: 28,
            borderRadius: 14,
            background: LIME,
            marginLeft: 6,
            marginBottom: 18,
            opacity: dotOp,
            transform: `scale(${dotScale})`,
            transformOrigin: 'center',
            boxShadow: `0 0 30px ${LIME}`,
          }} />
        </div>
      </div>

      {/* Eyebrow */}
      <div style={{
        position: 'absolute',
        left: 72, top: 440,
        fontFamily: MONO,
        fontSize: 22,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: LIME,
        opacity: line1Op,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ width: 8, height: 8, background: LIME, borderRadius: 4 }} />
        Open, modular HR
      </div>
    </div>
  );
}

// Mock product screen — stylized time tracker, not a real copy
function MockTimeTracker() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: INK,
      padding: 48,
      fontFamily: GEIST,
      color: CREAM,
    }}>
      {/* Fake top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        paddingBottom: 28,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: LIME,
        }} />
        <div style={{
          flex: 1, height: 44, borderRadius: 22,
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${BORDER}`,
        }} />
        <div style={{
          width: 120, height: 36, borderRadius: 18,
          background: LIME,
        }} />
      </div>

      {/* Stat cards row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 18, marginTop: 32,
      }}>
        {['94h', '58%', '11'].map((v, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: '28px 28px',
            minHeight: 140,
          }}>
            <div style={{ fontFamily: MONO, fontSize: 14, color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {['LOGGED', 'FILL %', 'LEAVE'][i]}
            </div>
            <div style={{ fontFamily: FRAUNCES, fontSize: 84, marginTop: 12, letterSpacing: '-0.02em' }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 10, marginTop: 40,
      }}>
        {Array.from({ length: 28 }).map((_, i) => {
          const dot = i % 5 === 0 ? LIME : i % 7 === 3 ? CORAL : i % 11 === 0 ? VIOLET : null;
          const filled = i % 3 === 0;
          return (
            <div key={i} style={{
              aspectRatio: '1',
              background: filled ? 'rgba(180,255,57,0.04)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              position: 'relative',
              padding: 10,
              fontFamily: MONO,
              fontSize: 20,
              color: filled ? CREAM : MUTED,
            }}>
              {i + 1}
              {dot && (
                <div style={{
                  position: 'absolute', right: 10, top: 10,
                  width: 8, height: 8, borderRadius: 4,
                  background: dot,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Frame 3: Modular proof (4.5–7.0s) ───────────────────────────────────────

function Frame3_Modular() {
  const { localTime, duration } = useSprite();

  // Cards enter stacked (touching), then snap apart at t=0.9s
  const snapAt = 0.9;
  const snapT = Math.min(1, Math.max(0, (localTime - snapAt) / 0.35));
  const snapEase = EASE_BRAND(snapT);

  const cards = [
    { name: 'Money',  color: VIOLET, accent: 'var(--violet)',
      lines: ['Payroll runs', '$124.5k', 'Apr 30 · 12 employees'] },
    { name: 'People', color: CORAL,
      lines: ['Headcount', '12', 'Onboarding: 2 this month'] },
    { name: 'Work',   color: LIME,
      lines: ['Logged this week', '94h / 96h', '58% commessa fill'] },
  ];

  // Card entry stagger
  const cardEntryOp = (i) => {
    const start = 0.08 + i * 0.1;
    return Math.min(1, Math.max(0, (localTime - start) / 0.35));
  };

  // Headline timing
  const headStart = 1.2;
  const headOp = Math.min(1, Math.max(0, (localTime - headStart) / 0.3));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: INK,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
    }}>
      <GridOverlay opacity={0.05} />

      {/* Eyebrow */}
      <div style={{
        marginTop: 200,
        fontFamily: MONO,
        fontSize: 22, letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: LIME,
        opacity: cardEntryOp(0),
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ width: 8, height: 8, background: LIME, borderRadius: 4 }} />
        Three modules · adopt any
      </div>

      {/* Cards stack */}
      <div style={{
        marginTop: 56,
        width: 760,
        display: 'flex', flexDirection: 'column',
        gap: 24 * snapEase,
        position: 'relative',
      }}>
        {cards.map((c, i) => {
          const op = cardEntryOp(i);
          const offsetBase = (i - 1) * -4 * (1 - snapEase); // slight compression when touching
          return (
            <div key={c.name} style={{
              opacity: op,
              transform: `translateY(${(1 - EASE_BRAND(op)) * 20 + offsetBase}px)`,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${BORDER}`,
              borderRadius: 20,
              padding: '32px 36px',
              display: 'flex', alignItems: 'center', gap: 24,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Accent rail */}
              <div style={{
                position: 'absolute',
                left: 0, top: 0, bottom: 0, width: 6,
                background: c.color,
              }} />
              <div style={{
                width: 72, height: 72,
                borderRadius: 16,
                background: `color-mix(in oklab, ${c.color} 20%, transparent)`,
                border: `1px solid color-mix(in oklab, ${c.color} 40%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ModuleIcon name={c.name} color={c.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: GEIST, fontSize: 22, fontWeight: 600,
                  color: c.color, letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  fontSize: 16,
                }}>
                  {c.name}
                </div>
                <div style={{
                  fontFamily: GEIST, fontSize: 24, color: CREAM,
                  marginTop: 6,
                }}>
                  {c.lines[0]}
                </div>
                <div style={{
                  fontFamily: FRAUNCES, fontSize: 56, color: CREAM,
                  marginTop: 4, letterSpacing: '-0.02em',
                }}>
                  {c.lines[1]}
                </div>
                <div style={{
                  fontFamily: MONO, fontSize: 18, color: MUTED,
                  marginTop: 8,
                }}>
                  {c.lines[2]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Headline */}
      <div style={{
        marginTop: 80,
        textAlign: 'center',
        opacity: headOp,
        transform: `translateY(${(1 - EASE_BRAND(headOp)) * 12}px)`,
      }}>
        <div style={{
          fontFamily: FRAUNCES,
          fontSize: 132,
          color: CREAM,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          Modular<span style={{ color: LIME }}>.</span>
        </div>
        <div style={{
          fontFamily: GEIST,
          fontSize: 42,
          color: MUTED,
          marginTop: 16,
          fontWeight: 400,
        }}>
          Pick any. Skip the rest.
        </div>
      </div>
    </div>
  );
}

function ModuleIcon({ name, color }) {
  if (name === 'Money') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="24" height="16" rx="3" stroke={color} strokeWidth="2" />
        <circle cx="16" cy="16" r="4" stroke={color} strokeWidth="2" />
      </svg>
    );
  }
  if (name === 'People') {
    return (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="12" r="5" stroke={color} strokeWidth="2" />
        <path d="M5 28c1-6 6-9 11-9s10 3 11 9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M4 14 L16 6 L28 14 L28 26 L4 26 Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 26 L12 18 L20 18 L20 26" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ── Frame 4: Keyboard-first (7.0–10.0s) ─────────────────────────────────────

function Frame4_Keyboard() {
  const { localTime } = useSprite();

  const query = 'log 4h on ACME-22';
  const typeStart = 0.3;
  const charsPerSec = 14;
  const visibleChars = Math.max(0, Math.floor((localTime - typeStart) * charsPerSec));
  const typed = query.slice(0, visibleChars);
  const caretOn = Math.floor(localTime * 2) % 2 === 0;

  const pillStart = 1.8;
  const pillOp = Math.min(1, Math.max(0, (localTime - pillStart) / 0.3));

  const headStart = 0.0;
  const headOp = Math.min(1, Math.max(0, (localTime - headStart) / 0.35));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: INK,
    }}>
      {/* Blurred app bg */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: 0.25,
        filter: 'blur(14px)',
      }}>
        <MockTimeTracker />
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(11,11,13,0.7)',
      }} />
      <GridOverlay opacity={0.04} />

      {/* Headline */}
      <div style={{
        position: 'absolute',
        left: 72, right: 72, top: 260,
        opacity: headOp,
        transform: `translateY(${(1 - EASE_BRAND(headOp)) * 12}px)`,
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 22, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: LIME,
          marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ width: 8, height: 8, background: LIME, borderRadius: 4 }} />
          Command bar · ⌘J
        </div>
        <div style={{
          fontFamily: FRAUNCES,
          fontSize: 128,
          color: CREAM,
          letterSpacing: '-0.02em',
          lineHeight: 0.98,
        }}>
          Keyboard-<span style={{ fontStyle: 'italic', color: LIME }}>first</span>.
        </div>
        <div style={{
          fontFamily: GEIST,
          fontSize: 36,
          color: MUTED,
          marginTop: 18,
        }}>
          <span style={{ fontFamily: MONO, color: CREAM }}>No LLM call.</span> Local intent, offline.
        </div>
      </div>

      {/* Command palette */}
      <div style={{
        position: 'absolute',
        left: 72, right: 72, top: 900,
        background: '#141419',
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        opacity: Math.min(1, localTime / 0.25),
        transform: `scale(${0.97 + 0.03 * Math.min(1, localTime / 0.25)})`,
      }}>
        {/* Input row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '32px 32px',
          gap: 20,
          borderBottom: `1px solid ${BORDER}`,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke={MUTED} strokeWidth="2" />
            <path d="M20 20L16 16" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div style={{
            flex: 1,
            fontFamily: MONO,
            fontSize: 42,
            color: CREAM,
            letterSpacing: '-0.01em',
          }}>
            {typed}
            <span style={{
              display: 'inline-block',
              width: 4, height: 40,
              background: CREAM,
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              opacity: caretOn ? 1 : 0,
            }} />
          </div>
          <div style={{
            padding: '8px 14px',
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.04)',
            fontFamily: MONO,
            fontSize: 22,
            color: CREAM,
          }}>
            ⌘J
          </div>
        </div>

        {/* Resolution row */}
        <div style={{
          padding: '28px 32px',
          display: 'flex', alignItems: 'center', gap: 18,
          opacity: pillOp,
          transform: `translateX(${(1 - EASE_BRAND(pillOp)) * -12}px)`,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `color-mix(in oklab, ${LIME} 15%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l4 4 8-8" stroke={LIME} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{
            padding: '10px 18px',
            background: `color-mix(in oklab, ${LIME} 15%, transparent)`,
            border: `1px solid ${LIME}`,
            borderRadius: 10,
            fontFamily: MONO,
            fontSize: 28,
            color: LIME,
          }}>
            intent=log-hours · 0.94
          </div>
          <div style={{
            marginLeft: 'auto',
            fontFamily: MONO, fontSize: 22, color: MUTED,
          }}>
            ↵
          </div>
        </div>

        {/* Secondary suggestions */}
        {['intent=view-commessa · ACM-2025-01', 'intent=submit-timesheet · week 17'].map((t, i) => (
          <div key={i} style={{
            padding: '18px 32px',
            display: 'flex', alignItems: 'center', gap: 18,
            borderTop: `1px solid ${BORDER}`,
            opacity: pillOp * 0.5,
            fontFamily: MONO, fontSize: 22, color: MUTED,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: MUTED, opacity: 0.3 }} />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Frame 5: The contrast (10.0–12.5s) ──────────────────────────────────────

function Frame5_Contrast() {
  const { localTime, duration } = useSprite();

  const headOp = Math.min(1, Math.max(0, localTime / 0.35));

  const competitors = ['Enterprise Suite A', 'Cloud HR B', 'Legacy HR C'];
  const strikeStart = 0.35;
  const strikeOp = Math.min(1, Math.max(0, (localTime - strikeStart) / 0.5));

  const urlStart = 1.1;
  const urlOp = Math.min(1, Math.max(0, (localTime - urlStart) / 0.3));

  const swipeStart = 1.5;
  const swipeT = Math.min(1, Math.max(0, (localTime - swipeStart) / 0.45));
  const swipeEase = EASE_BRAND(swipeT);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: INK,
      display: 'flex', flexDirection: 'column',
    }}>
      <GridOverlay opacity={0.04} />

      {/* Headline */}
      <div style={{
        position: 'absolute', left: 72, right: 72, top: 220,
        opacity: headOp,
        transform: `translateY(${(1 - EASE_BRAND(headOp)) * 12}px)`,
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 22, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: LIME,
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 24,
        }}>
          <span style={{ width: 8, height: 8, background: LIME, borderRadius: 4 }} />
          The difference
        </div>
        <div style={{
          fontFamily: FRAUNCES,
          fontSize: 104,
          color: CREAM,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}>
          Every other <span style={{ fontStyle: 'italic', color: CORAL }}>HR</span><br/>
          platform is closed.
        </div>
      </div>

      {/* Top half: competitor wordmarks */}
      <div style={{
        position: 'absolute', left: 72, right: 72, top: 680,
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        {competitors.map((name, i) => (
          <div key={name} style={{
            position: 'relative',
            padding: '24px 32px',
            border: `1px solid ${BORDER}`,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.02)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            opacity: Math.min(1, Math.max(0, (localTime - 0.15 - i * 0.1) / 0.3)),
          }}>
            <div style={{
              fontFamily: FRAUNCES,
              fontSize: 44,
              color: MUTED,
              fontWeight: 500,
            }}>
              {name}
            </div>
            <div style={{
              fontFamily: MONO, fontSize: 18, color: MUTED,
              padding: '6px 12px',
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              letterSpacing: '0.08em',
            }}>
              SOURCE: CLOSED
            </div>
            {/* Strikethrough */}
            <div style={{
              position: 'absolute',
              left: 24, right: 24, top: '50%',
              height: 3,
              background: CORAL,
              transformOrigin: 'left center',
              transform: `scaleX(${strikeOp})`,
              transition: 'transform 200ms',
              opacity: 0.85,
            }} />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        position: 'absolute', left: 72, right: 72, top: 1040,
        height: 1, background: BORDER,
        opacity: urlOp,
      }} />

      {/* Bottom half: our URL */}
      <div style={{
        position: 'absolute', left: 72, right: 72, top: 1090,
        opacity: urlOp,
        transform: `translateY(${(1 - EASE_BRAND(urlOp)) * 16}px)`,
      }}>
        <div style={{
          fontFamily: MONO,
          fontSize: 22, letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: MUTED,
          marginBottom: 20,
        }}>
          We are not.
        </div>

        <div style={{
          position: 'relative',
          padding: '40px 32px',
          border: `1px solid ${LIME}`,
          borderRadius: 18,
          background: `color-mix(in oklab, ${LIME} 8%, transparent)`,
          overflow: 'hidden',
        }}>
          {/* Swipe highlight */}
          <div style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: `${swipeEase * 100}%`,
            background: `linear-gradient(90deg, transparent, ${LIME}33 80%, ${LIME}55)`,
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'relative',
            fontFamily: MONO,
            fontSize: 44,
            color: LIME,
            letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill={LIME}>
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.2c-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.26 1.9-.38 2.88-.39.98.01 1.96.13 2.88.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.04.78 2.1v3.11c0 .31.21.67.8.56C20.71 21.39 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5z"/>
            </svg>
            <span style={{ wordBreak: 'break-all' }}>
              github.com/davide97g/<br/>workflows-people
            </span>
          </div>
        </div>

        <div style={{
          fontFamily: GEIST,
          fontSize: 32,
          color: CREAM,
          marginTop: 28,
          textAlign: 'center',
        }}>
          Source-available. <span style={{ fontFamily: MONO, color: LIME }}>FSL-1.1-MIT</span>.
        </div>
      </div>
    </div>
  );
}

// ── Frame 6: End card (12.5–15.0s) ──────────────────────────────────────────

function Frame6_EndCard() {
  const { localTime } = useSprite();

  const logoOp = Math.min(1, localTime / 0.3);

  const h1Start = 0.15;
  const h1Op = Math.min(1, Math.max(0, (localTime - h1Start) / 0.4));
  const h1Ty = (1 - EASE_BRAND(h1Op)) * 16;

  const h2Start = 0.45;
  const h2Op = Math.min(1, Math.max(0, (localTime - h2Start) / 0.4));
  const h2Ty = (1 - EASE_BRAND(h2Op)) * 16;

  const dotStart = 0.85;
  const dotOp = Math.min(1, Math.max(0, (localTime - dotStart) / 0.2));

  const ctaStart = 1.1;
  const ctaOp = Math.min(1, Math.max(0, (localTime - ctaStart) / 0.35));
  const ctaTy = (1 - EASE_BRAND(ctaOp)) * 20;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: INK,
    }}>
      <GridOverlay opacity={0.05} />

      {/* Top-left wordmark */}
      <div style={{
        position: 'absolute', left: 72, top: 120,
        display: 'flex', alignItems: 'center', gap: 16,
        opacity: logoOp,
      }}>
        <SparklesBug size={48} />
        <div style={{
          fontFamily: FRAUNCES,
          fontSize: 40,
          color: CREAM,
          fontWeight: 500,
        }}>
          Pulse H<span style={{ fontStyle: 'italic', color: LIME }}>R</span>
        </div>
      </div>

      {/* Centered stacked headline */}
      <div style={{
        position: 'absolute',
        left: 72, right: 72, top: 480,
        fontFamily: FRAUNCES,
        fontSize: 148,
        color: CREAM,
        lineHeight: 1.0,
        letterSpacing: '-0.02em',
        fontWeight: 400,
      }}>
        <div style={{
          opacity: h1Op,
          transform: `translateY(${h1Ty}px)`,
        }}>
          HR you can <span style={{ fontStyle: 'italic', color: LIME }}>read</span>,
        </div>
        <div style={{
          marginTop: 12,
          opacity: h2Op,
          transform: `translateY(${h2Ty}px)`,
          display: 'flex', alignItems: 'flex-end',
        }}>
          <span>fork, and run</span>
          <span style={{
            display: 'inline-block',
            width: 28, height: 28,
            borderRadius: 14,
            background: LIME,
            marginLeft: 8,
            marginBottom: 16,
            opacity: dotOp,
            transform: `scale(${dotOp})`,
            boxShadow: `0 0 30px ${LIME}`,
          }} />
        </div>
      </div>

      {/* Value tagline row */}
      <div style={{
        position: 'absolute',
        left: 72, right: 72, top: 960,
        display: 'flex', gap: 16,
        opacity: h2Op,
        flexWrap: 'wrap',
      }}>
        {['Money', 'People', 'Work'].map((m, i) => {
          const c = [VIOLET, CORAL, LIME][i];
          return (
            <div key={m} style={{
              padding: '12px 20px',
              border: `1px solid ${BORDER}`,
              borderRadius: 999,
              fontFamily: MONO, fontSize: 22,
              color: CREAM,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: c }} />
              {m}
            </div>
          );
        })}
        <div style={{
          padding: '12px 20px',
          border: `1px solid ${BORDER}`,
          borderRadius: 999,
          fontFamily: MONO, fontSize: 22,
          color: MUTED,
        }}>
          Free first 5 employees
        </div>
      </div>

      {/* CTA pill */}
      <div style={{
        position: 'absolute',
        left: 72, right: 72, bottom: 300,
        opacity: ctaOp,
        transform: `translateY(${ctaTy}px)`,
      }}>
        <div style={{
          background: LIME,
          color: INK,
          padding: '28px 40px',
          borderRadius: 999,
          fontFamily: GEIST,
          fontSize: 44,
          fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          boxShadow: `0 20px 60px ${LIME}44`,
          letterSpacing: '-0.01em',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill={INK}>
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.2c-3.2.69-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.26 1.9-.38 2.88-.39.98.01 1.96.13 2.88.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.04.78 2.1v3.11c0 .31.21.67.8.56C20.71 21.39 24 17.08 24 12c0-6.35-5.15-11.5-11.5-11.5z"/>
          </svg>
          Star on GitHub ★
        </div>
        <div style={{
          fontFamily: MONO,
          fontSize: 24,
          color: MUTED,
          textAlign: 'center',
          marginTop: 24,
        }}>
          github.com/davide97g/workflows-people
        </div>
      </div>

      {/* Bottom meta row */}
      <div style={{
        position: 'absolute',
        left: 72, right: 72, bottom: 120,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: MONO,
        fontSize: 18, letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: MUTED,
      }}>
        <span>FSL-1.1-MIT</span>
        <span>Self-host on Docker / K8s</span>
      </div>
    </div>
  );
}

// ── Composition: all frames wrapped in sprites ──────────────────────────────

function ReelScene() {
  return (
    <>
      <Sprite start={0.0} end={2.0}>
        <Frame1_Terminal />
      </Sprite>
      <Sprite start={2.0} end={4.5}>
        <Frame2_Promise />
      </Sprite>
      <Sprite start={4.5} end={7.0}>
        <Frame3_Modular />
      </Sprite>
      <Sprite start={7.0} end={10.0}>
        <Frame4_Keyboard />
      </Sprite>
      <Sprite start={10.0} end={12.5}>
        <Frame5_Contrast />
      </Sprite>
      <Sprite start={12.5} end={15.0}>
        <Frame6_EndCard />
      </Sprite>

      {/* Instagram safe-area hints (tweakable) */}
      <IGSafeArea />

      {/* Progress bar at very top (thin lime) */}
      <TopProgress />
    </>
  );
}

function TopProgress() {
  const { time, duration } = useTimeline();
  const pct = (time / duration) * 100;
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 3,
      background: 'rgba(255,255,255,0.06)',
      zIndex: 20,
    }}>
      <div style={{
        width: `${pct}%`, height: '100%',
        background: LIME,
        transition: 'width 50ms linear',
      }} />
    </div>
  );
}

function IGSafeArea() {
  const show = window.__SHOW_SAFE_AREA ?? false;
  if (!show) return null;
  return (
    <>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 84,
        borderBottom: `1px dashed ${LIME}`,
        background: 'rgba(180,255,57,0.04)',
        zIndex: 30,
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', bottom: 6, right: 10,
          fontFamily: MONO, fontSize: 12, color: LIME,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          IG safe area · top 84px
        </div>
      </div>
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0, height: 220,
        borderTop: `1px dashed ${LIME}`,
        background: 'rgba(180,255,57,0.04)',
        zIndex: 30,
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: 6, right: 10,
          fontFamily: MONO, fontSize: 12, color: LIME,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          IG safe area · bottom 220px
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ReelScene });
