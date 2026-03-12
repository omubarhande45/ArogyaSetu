import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import * as Papa from 'papaparse';
const LangCtx = createContext("MR");
const useLang = () => useContext(LangCtx);

/* ═══════════════════════════════════════════════════════════════
   BHARAT DIGITAL SEVA — आरोग्य सेतु
   Indian Cultural Design System
   Palette: Saffron · Turmeric · Peacock · Mehndi · Lotus · Sindoor
═══════════════════════════════════════════════════════════════ */

const C = {
  // Backgrounds — warm ivory/cream
  cream:     "#FFFDF7",
  ivory:     "#FEF8EE",
  ivoryDark: "#FDF0D5",
  parchment: "#F5E6C8",
  // Saffron family
  saffron:   "#E85D04",
  saffronHi: "#F48C06",
  saffronSoft:"#FFF3E0",
  // Turmeric / gold
  turmeric:  "#CA8A04",
  gold:      "#EAB308",
  goldSoft:  "#FEFCE8",
  // Peacock (India's national bird)
  peacock:   "#0E7490",
  peacockHi: "#06B6D4",
  peacockSoft:"#ECFEFF",
  // Mehndi green (henna)
  mehndi:    "#166534",
  mehndiHi:  "#16A34A",
  mehndiSoft:"#F0FDF4",
  // Lotus pink
  lotus:     "#BE185D",
  lotusHi:   "#EC4899",
  lotusSoft: "#FDF2F8",
  // Sindoor red (deep red)
  sindoor:   "#B91C1C",
  sindoorHi: "#DC2626",
  sindoorSoft:"#FFF1F2",
  // Ashoka blue (navy)
  ashoka:    "#1E3A8A",
  ashokaHi:  "#2563EB",
  ashokaSoft:"#EFF6FF",
  // Text
  ink:       "#1C1005",
  inkMid:    "#4A3728",
  inkDim:    "#9C7B5A",
  border:    "#E8D5B0",
  borderHi:  "#D4B896",
};

/* ── Mock Data ── */
const QUEUE = [
  { id:"P01", name:"रमेश पाटील",    nameE:"Ramesh Patil",   token:"अ-001", dept:"हृदयरोग",     wait:0,  avatar:"रप", status:"consulting", city:"Pune"    },
  { id:"P02", name:"सुनीता शर्मा",  nameE:"Sunita Sharma",  token:"अ-002", dept:"हृदयरोग",     wait:9,  avatar:"सश", status:"next",       city:"Mumbai"  },
  { id:"P03", name:"विक्रम देसाई",  nameE:"Vikram Desai",   token:"अ-003", dept:"हृदयरोग",     wait:19, avatar:"वद", status:"waiting",    city:"Nagpur"  },
  { id:"P04", name:"प्रिया नायर",   nameE:"Priya Nair",     token:"अ-004", dept:"हृदयरोग",     wait:29, avatar:"पन", status:"waiting",    city:"Nashik"  },
  { id:"P05", name:"आनंद कुमार",    nameE:"Anand Kumar",    token:"अ-005", dept:"हृदयरोग",     wait:39, avatar:"आक", status:"waiting",    city:"Aurangabad"},
  { id:"P06", name:"मीरा जोशी",     nameE:"Meera Joshi",    token:"अ-006", dept:"हृदयरोग",     wait:49, avatar:"मज", status:"waiting",    city:"Solapur" },
];

const DOCTORS = [
  { id:"D1", name:"डॉ. अरुण कृष्णमूर्ती", nameE:"Dr. A. Krishnamurthy", dept:"हृदयरोग",   seen:24, cap:35, status:"active", rating:4.9, avatar:"अकृ", color:C.saffron  },
  { id:"D2", name:"डॉ. प्रिया वाडेकर",     nameE:"Dr. P. Wadekar",       dept:"अस्थिरोग", seen:18, cap:30, status:"active", rating:4.7, avatar:"पवा", color:C.mehndi   },
  { id:"D3", name:"डॉ. समीर मेहता",        nameE:"Dr. S. Mehta",         dept:"मज्जारोग", seen:31, cap:40, status:"paused", rating:4.8, avatar:"समे", color:C.sindoor  },
  { id:"D4", name:"डॉ. रवी पिल्लई",        nameE:"Dr. R. Pillai",        dept:"बालरोग",   seen:12, cap:25, status:"active", rating:4.6, avatar:"रपि", color:C.peacock  },
];

const DEPTS = [
  { hi:"हृदयरोग विभाग",    en:"Cardiology",      icon:"🫀", wait:"~23m" },
  { hi:"अस्थिरोग विभाग",   en:"Orthopedics",     icon:"🦴", wait:"~18m" },
  { hi:"मज्जारोग विभाग",   en:"Neurology",       icon:"🧠", wait:"~31m" },
  { hi:"बालरोग विभाग",     en:"Pediatrics",      icon:"👶", wait:"~12m" },
  { hi:"सामान्य ओपीडी",    en:"General OPD",     icon:"🩺", wait:"~9m"  },
  { hi:"त्वचारोग विभाग",   en:"Dermatology",     icon:"✋", wait:"~15m" },
];

const TRAFFIC = [8,42,71,94,58,34,77,89,47];
const LANGS   = [{ c:"EN", l:"English" }, { c:"HI", l:"हिंदी" }, { c:"MR", l:"मराठी" }];
const FEATURES = [
  { icon:"🤖", hi:"AI रांग अनुमानक",    en:"AI Queue Predictor",    desc:"94% अचूक प्रतीक्षा वेळ अंदाज",           color:C.saffron,  soft:C.saffronSoft },
  { icon:"📲", hi:"स्मार्ट सूचना",       en:"Smart Notifications",   desc:"WhatsApp वर क्रमांक आल्यावर तुम्हाला कळेल", color:C.mehndi,   soft:C.mehndiSoft  },
  { icon:"🎥", hi:"दूरस्थ सल्लामसलत",   en:"Tele-Consultation",     desc:"घरी बसून डॉक्टरांशी व्हिडिओ कॉल",         color:C.peacock,  soft:C.peacockSoft },
  { icon:"🔐", hi:"डिजिटल आरोग्य लॉकर", en:"Digital Health Locker", desc:"आधार eSigned प्रिस्क्रिप्शन व रिपोर्ट्स",  color:C.ashoka,   soft:C.ashokaSoft  },
  { icon:"🌐", hi:"बहुभाषिक समर्थन",    en:"Multilingual Support",  desc:"हिंदी · मराठी · English — एका क्लिकमध्ये", color:C.turmeric, soft:C.goldSoft    },
  { icon:"🖥️", hi:"कियोस्क मोड",         en:"Kiosk Walk-in Mode",    desc:"प्रतीक्षा कक्षातील टचस्क्रीन सुविधा",     color:C.lotus,    soft:C.lotusSoft   },
];

/* ── Rangoli & Indian SVG Motifs ── */
const RangoliDot = ({ cx, cy, r=3, fill=C.saffron, opacity=.25 }) => (
  <circle cx={cx} cy={cy} r={r} fill={fill} opacity={opacity} />
);

function RangoliPattern({ size=320, color=C.saffron }) {
  const pts = [];
  const rings = [
    { r:20,  n:6  },
    { r:42,  n:12 },
    { r:66,  n:18 },
    { r:90,  n:24 },
    { r:116, n:30 },
    { r:140, n:36 },
  ];
  rings.forEach(({ r, n }) => {
    for (let i=0; i<n; i++) {
      const a = (i/n) * Math.PI * 2;
      pts.push({ x: size/2 + r*Math.cos(a), y: size/2 + r*Math.sin(a), r: 2.5 });
    }
  });
  const petals = 8;
  const petalPaths = Array.from({length:petals}, (_,i) => {
    const a  = (i/petals)*Math.PI*2;
    const a2 = ((i+.5)/petals)*Math.PI*2;
    const r1 = 60, r2 = 28;
    const x1 = size/2 + r1*Math.cos(a);
    const y1 = size/2 + r1*Math.sin(a);
    const xc = size/2 + r2*Math.cos(a2);
    const yc = size/2 + r2*Math.sin(a2);
    return `M${size/2},${size/2} Q${xc},${yc} ${x1},${y1}`;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ pointerEvents:"none" }}>
      {/* Center lotus */}
      <circle cx={size/2} cy={size/2} r={10} fill={color} opacity={.35} />
      {/* Petals */}
      {petalPaths.map((d,i) => (
        <path key={i} d={d} stroke={color} strokeWidth={1.5} fill="none" opacity={.2} />
      ))}
      {/* Dots */}
      {pts.map((p,i) => <RangoliDot key={i} cx={p.x} cy={p.y} r={p.r} fill={color} opacity={.18} />)}
      {/* Outer ring */}
      <circle cx={size/2} cy={size/2} r={size/2-8} stroke={color} strokeWidth={1} fill="none"
        strokeDasharray="4 8" opacity={.15} />
      <circle cx={size/2} cy={size/2} r={size/2-20} stroke={color} strokeWidth={.8} fill="none"
        strokeDasharray="2 12" opacity={.12} />
    </svg>
  );
}

function MandalaRing({ size=80, progress=65, color=C.saffron, bg="#F5E6C8", children }) {
  const r = size/2 - 6;
  const circ = 2*Math.PI*r;
  const dash = (progress/100)*circ;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ position:"absolute", inset:0, transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition:"stroke-dasharray 1.2s ease" }} />
        {/* Decorative tick marks */}
        {Array.from({length:24}).map((_,i) => {
          const a = (i/24)*Math.PI*2 - Math.PI/2;
          const r1=size/2-2, r2=size/2-(i%6===0?8:5);
          return (
            <line key={i}
              x1={size/2+r2*Math.cos(a)} y1={size/2+r2*Math.sin(a)}
              x2={size/2+r1*Math.cos(a)} y2={size/2+r1*Math.sin(a)}
              stroke={color} strokeWidth={i%6===0?1.5:.6} opacity={.35}
              style={{ transform:"none" }}
            />
          );
        })}
      </svg>
      <div style={{
        position:"absolute", inset:0, display:"flex",
        alignItems:"center", justifyContent:"center",
      }}>{children}</div>
    </div>
  );
}

function AshokaChakra({ size=24, spinning=false, color=C.ashoka }) {
  const spokes = 24;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      style={{ animation: spinning ? "spin 3s linear infinite" : "none" }}>
      <circle cx={12} cy={12} r={10} fill="none" stroke={color} strokeWidth={1.2} opacity={.7} />
      <circle cx={12} cy={12} r={2}  fill={color} opacity={.7} />
      {Array.from({length:spokes}).map((_,i) => {
        const a = (i/spokes)*Math.PI*2;
        return (
          <line key={i}
            x1={12+2*Math.cos(a)} y1={12+2*Math.sin(a)}
            x2={12+9.5*Math.cos(a)} y2={12+9.5*Math.sin(a)}
            stroke={color} strokeWidth={.8} opacity={.5}
          />
        );
      })}
    </svg>
  );
}

function PaisleyBorder({ color=C.saffron, opacity=.15 }) {
  return (
    <svg width="100%" height="8" preserveAspectRatio="none" viewBox="0 0 400 8">
      {Array.from({length:20}).map((_,i) => (
        <path key={i}
          d={`M${i*20},4 Q${i*20+5},0 ${i*20+10},4 Q${i*20+15},8 ${i*20+20},4`}
          fill="none" stroke={color} strokeWidth={1.2} opacity={opacity}
        />
      ))}
    </svg>
  );
}

function TricolorStrip() {
  return (
    <div style={{ display:"flex", height:4, borderRadius:2, overflow:"hidden" }}>
      <div style={{ flex:1, background:C.saffron }} />
      <div style={{ flex:1, background:"#FFFFFF", border:"1px solid #E8D5B0" }} />
      <div style={{ flex:1, background:C.mehndi  }} />
    </div>
  );
}

/* ── Indian National Flag — Accurate SVG ── */
let _flagUid = 0;
function IndianFlag({ width=72, shadow=true, wave=false, pole=false }) {
  const uid = useRef(++_flagUid).current;
  const h = width * (2/3);
  const stripeH = h / 3;
  const cx = width / 2, cy = h / 2;
  const chakraR = stripeH * 0.42;

  // 24 spokes of the Ashoka Chakra
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const inner = chakraR * 0.28;
    const outer = chakraR * 0.86;
    return {
      x1: cx + inner * Math.cos(a), y1: cy + inner * Math.sin(a),
      x2: cx + outer * Math.cos(a), y2: cy + outer * Math.sin(a),
    };
  });

  // 8 teardrop petals around the chakra rim
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const mid = (i / 8 + 1/16) * Math.PI * 2;
    const ro = chakraR * 0.86, rm = chakraR * 0.72, ri = chakraR * 0.28;
    return {
      d: `M${cx + ri*Math.cos(a)},${cy + ri*Math.sin(a)}
          Q${cx + rm*Math.cos(mid)},${cy + rm*Math.sin(mid)}
           ${cx + ro*Math.cos(a+Math.PI/8)},${cy + ro*Math.sin(a+Math.PI/8)}`,
    };
  });

  return (
    <div style={{
      display: "inline-flex", alignItems: "flex-start", gap: pole ? 0 : 0,
      filter: shadow ? "drop-shadow(0 4px 12px rgba(0,0,0,.18))" : "none",
      flexShrink: 0,
    }}>
      {/* Flagpole */}
      {pole && (
        <div style={{
          width: 3, height: h * 1.35, borderRadius: 3,
          background: "linear-gradient(180deg,#B8860B,#8B6914,#6B4F10)",
          marginRight: 1, marginTop: h * -0.2,
          boxShadow: "1px 0 3px rgba(0,0,0,.25)",
        }} />
      )}

      {/* Flag body */}
      <svg
        width={width} height={h}
        viewBox={`0 0 ${width} ${h}`}
        style={{
          display: "block", borderRadius: 3,
          animation: wave ? "flagWave 2.5s ease-in-out infinite" : "none",
          transformOrigin: "left center",
        }}
      >
        <defs>
          <clipPath id={`fc${uid}`}>
            <rect width={width} height={h} rx={2} />
          </clipPath>
          <linearGradient id={`sf${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FF9933" />
            <stop offset="100%" stopColor="#FF6600" />
          </linearGradient>
          <linearGradient id={`gr${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#138808" />
            <stop offset="100%" stopColor="#006600" />
          </linearGradient>
          <linearGradient id={`sh${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="50%"  stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.10" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#fc${uid})`}>
          {/* Saffron stripe */}
          <rect x={0} y={0}          width={width} height={stripeH}     fill={`url(#sf${uid})`} />
          {/* White stripe */}
          <rect x={0} y={stripeH}    width={width} height={stripeH}     fill="#FFFFFF" />
          {/* Green stripe */}
          <rect x={0} y={stripeH*2}  width={width} height={stripeH}     fill={`url(#gr${uid})`} />

          {/* Subtle sheen overlay */}
          <rect x={0} y={0} width={width} height={h}
            fill={`url(#sh${uid})`} opacity={.08} />

          {/* ── Ashoka Chakra ── */}
          {/* Outer rim */}
          <circle cx={cx} cy={cy} r={chakraR}       fill="none" stroke="#000080" strokeWidth={chakraR*0.10} />
          {/* Inner rim */}
          <circle cx={cx} cy={cy} r={chakraR*0.28}  fill="none" stroke="#000080" strokeWidth={chakraR*0.07} />
          {/* Center dot */}
          <circle cx={cx} cy={cy} r={chakraR*0.10}  fill="#000080" />

          {/* 24 spokes */}
          {spokes.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
              stroke="#000080" strokeWidth={chakraR*0.055} strokeLinecap="round" />
          ))}

          {/* 8 teardrop petal accents between every 3rd spoke */}
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2 + Math.PI/24;
            const r1 = chakraR * 0.48, r2 = chakraR * 0.82;
            return (
              <ellipse key={i}
                cx={cx + ((r1+r2)/2) * Math.cos(a)}
                cy={cy + ((r1+r2)/2) * Math.sin(a)}
                rx={chakraR*0.055} ry={(r2-r1)*0.46}
                transform={`rotate(${(a * 180/Math.PI) + 90}, ${cx + ((r1+r2)/2)*Math.cos(a)}, ${cy + ((r1+r2)/2)*Math.sin(a)})`}
                fill="#000080" opacity={.55}
              />
            );
          })}
        </g>

        {/* Border */}
        <rect x={0} y={0} width={width} height={h} rx={2}
          fill="none" stroke="rgba(0,0,0,.12)" strokeWidth={1} />
      </svg>
    </div>
  );
}

/* ── Flag Banner — decorative hero element ── */
function FlagBanner({ width=110 }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:0 }}>
      {/* Pole */}
      <div style={{
        width:4, height:width*0.95,
        background:"linear-gradient(180deg,#D4AF37,#B8860B,#8B6914)",
        borderRadius:"2px 2px 3px 3px",
        boxShadow:"1px 0 4px rgba(0,0,0,.2)",
        flexShrink:0,
      }}>
        {/* Pole top finial */}
        <div style={{
          width:10, height:10, borderRadius:"50%",
          background:"linear-gradient(135deg,#FFD700,#B8860B)",
          marginLeft:-3, marginTop:-5,
          boxShadow:"0 2px 6px rgba(0,0,0,.3)",
        }} />
      </div>
      <div style={{ animation:"flagWave 2.8s ease-in-out infinite", transformOrigin:"left center" }}>
        <IndianFlag width={width} shadow={false} />
      </div>
    </div>
  );
}

/* ── Global CSS ── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&family=Mukta:wght@300;400;500;600;700;800&family=Yatra+One&family=JetBrains+Mono:wght@400;600&display=swap');

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
html { scroll-behavior:smooth; }
body {
  background: #FFFDF7;
  color: #1C1005;
  font-family: 'Mukta', 'Noto Sans Devanagari', sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.devanagari { font-family: 'Tiro Devanagari Hindi', serif; }
.display    { font-family: 'Yatra One', 'Tiro Devanagari Hindi', serif; }
.mono       { font-family: 'JetBrains Mono', monospace; }

::-webkit-scrollbar { width:5px; }
::-webkit-scrollbar-track { background:#FEF8EE; }
::-webkit-scrollbar-thumb { background:#D4B896; border-radius:4px; }

/* Keyframes */
@keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes scaleIn  { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
@keyframes spin     { to{transform:rotate(360deg)} }
@keyframes shimmer  { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
@keyframes floatUp  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
@keyframes petal    { 0%,100%{transform:scale(1) rotate(0deg);opacity:.7} 50%{transform:scale(1.08) rotate(3deg);opacity:1} }
@keyframes glow     { 0%,100%{box-shadow:0 0 14px 2px rgba(232,93,4,.3)} 50%{box-shadow:0 0 28px 6px rgba(232,93,4,.55)} }
@keyframes diyaDance{ 0%,100%{transform:scaleY(1) rotate(-2deg)} 50%{transform:scaleY(1.2) rotate(2deg)} }
@keyframes wave1    { 0%,100%{height:5px}  50%{height:18px} }
@keyframes wave2    { 0%,100%{height:12px} 50%{height:5px}  }
@keyframes wave3    { 0%,100%{height:8px}  50%{height:20px} }
@keyframes wave4    { 0%,100%{height:4px}  50%{height:14px} }
@keyframes wave5    { 0%,100%{height:16px} 50%{height:6px}  }
@keyframes dotBounce{
  0%,80%,100%{transform:scale(0);opacity:0}
  40%{transform:scale(1);opacity:1}
}
@keyframes ringOut  { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.4);opacity:0} }
@keyframes tokenPop { 0%{transform:scale(.55)rotate(-6deg);opacity:0}
                      65%{transform:scale(1.1)rotate(1deg)}
                      100%{transform:scale(1)rotate(0);opacity:1} }
@keyframes checkDraw{ from{stroke-dashoffset:80} to{stroke-dashoffset:0} }
@keyframes progressStripe { from{background-position:28px 0} to{background-position:0 0} }
@keyframes kolam    { 0%,100%{opacity:.12} 50%{opacity:.22} }
@keyframes expandBot{ from{transform:scale(.05)translate(160px,160px);opacity:0;border-radius:50%}
                      to{transform:scale(1)translate(0,0);opacity:1;border-radius:20px} }
@keyframes pageFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes barRise  { from{height:0;opacity:0} to{opacity:1} }
@keyframes navSlide { 0%{opacity:0;transform:scale(.94)} to{opacity:1;transform:none} }
@keyframes orbFloat1{ 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(30px,-18px)scale(1.05)} }
@keyframes orbFloat2{ 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(-20px,25px)scale(.96)} }
@keyframes flagWave {
  0%,100% { transform: skewY(0deg) scaleX(1); }
  20%     { transform: skewY(.9deg) scaleX(1.01); }
  40%     { transform: skewY(-.7deg) scaleX(.99); }
  60%     { transform: skewY(1.1deg) scaleX(1.01); }
  80%     { transform: skewY(-.5deg) scaleX(1); }
}
@keyframes flagEntrance {
  from { opacity:0; transform:translateX(-18px) rotate(-3deg); }
  to   { opacity:1; transform:translateX(0) rotate(0deg); }
}
@keyframes poleSway {
  0%,100% { transform: rotate(0deg); }
  50%     { transform: rotate(.5deg); }
}

.fu0 { animation:fadeUp .6s cubic-bezier(.22,1,.36,1) both }
.fu1 { animation:fadeUp .6s cubic-bezier(.22,1,.36,1) .09s both }
.fu2 { animation:fadeUp .6s cubic-bezier(.22,1,.36,1) .18s both }
.fu3 { animation:fadeUp .6s cubic-bezier(.22,1,.36,1) .27s both }
.fu4 { animation:fadeUp .6s cubic-bezier(.22,1,.36,1) .36s both }
.fu5 { animation:fadeUp .6s cubic-bezier(.22,1,.36,1) .45s both }
.page { animation:pageFade .4s cubic-bezier(.22,1,.36,1) both }

.shimmer {
  background: linear-gradient(90deg,#FEF0D5 25%,#F5E6C8 50%,#FEF0D5 75%);
  background-size:600px 100%;
  animation:shimmer 1.5s ease infinite;
}

/* Card with Indian border */
.card-india {
  background: #FFFFFF;
  border: 1px solid #E8D5B0;
  border-radius: 16px;
  transition: box-shadow .22s, transform .22s, border-color .22s;
  position: relative;
  overflow: hidden;
}
.card-india::before {
  content:'';
  position:absolute; top:0; left:0; right:0; height:3px;
  background: linear-gradient(90deg,${C.saffron},${C.turmeric},${C.mehndi},${C.peacock},${C.lotus});
  opacity:0; transition:opacity .25s;
}
.card-india:hover::before { opacity:1; }
.card-india:hover {
  box-shadow: 0 10px 36px rgba(232,93,4,.14), 0 4px 12px rgba(0,0,0,.06);
  border-color: #D4B896;
  transform: translateY(-3px);
}

/* Button styles */
.btn { display:inline-flex;align-items:center;justify-content:center;gap:8px;
  font-family:'Mukta',sans-serif;font-weight:700;border:none;cursor:pointer;
  transition:all .18s cubic-bezier(.22,1,.36,1);position:relative;overflow:hidden; }
.btn:active { transform:scale(.96) !important; }

.btn-saffron {
  background: linear-gradient(135deg,#E85D04 0%,#F48C06 100%);
  color:#FFFFFF;
  box-shadow: 0 4px 16px rgba(232,93,4,.38);
}
.btn-saffron:hover { background:linear-gradient(135deg,#C84B00 0%,#E07000 100%);
  box-shadow:0 8px 24px rgba(232,93,4,.5); transform:translateY(-2px); }

.btn-outline-india {
  background:transparent; color:${C.saffron};
  border:2px solid ${C.saffron}44;
}
.btn-outline-india:hover { background:${C.saffronSoft}; border-color:${C.saffron}; }

.btn-ghost-india { background:transparent; color:${C.inkMid};
  border:1.5px solid ${C.border}; }
.btn-ghost-india:hover { background:${C.ivoryDark}; }

.tag-india {
  font-family:'Mukta',sans-serif; font-size:11px;
  letter-spacing:.06em; font-weight:600;
}

/* Dot pattern bg */
.kolam-bg {
  background-image: radial-gradient(${C.saffron}22 1.5px, transparent 1.5px),
                    radial-gradient(${C.turmeric}18 1.5px, transparent 1.5px);
  background-size: 24px 24px, 48px 48px;
  background-position: 0 0, 12px 12px;
  animation: kolam 4s ease-in-out infinite;
}

/* Dot loader */
.dot-loader span { display:inline-block;width:6px;height:6px;border-radius:50%;background:${C.saffron}; margin:0 2px; }
.dot-loader span:nth-child(1){ animation:dotBounce 1.2s ease-in-out infinite; }
.dot-loader span:nth-child(2){ animation:dotBounce 1.2s ease-in-out .2s infinite; }
.dot-loader span:nth-child(3){ animation:dotBounce 1.2s ease-in-out .4s infinite; }
`;

/* ── Helpers ── */
/* ── Language Translations ── */
const T = {
  EN: {
    /* Navbar */ navHome:"Home", navQueue:"Queue", navBook:"Book", navAdmin:"Admin", bookCta:"+ Book Now",
    /* Hero */ headline:"No More Waiting", sub:"", gradient:"in line. History now.",
    tagline:"Skip the queue. Not the care.", sloganHi:"No wait, better care.",
    body:"Book appointments at govt. hospitals via Aadhaar or mobile. AI predicts wait times accurately and notifies you on WhatsApp.",
    bookBtn:"Book Appointment", trackBtn:"Track Queue",
    live:"LIVE", govBadge:"Govt. of Maharashtra",
    todayPat:"Today", avgWait:"Avg Wait", satisfied:"Satisfied", doctors:"Doctors",
    /* Features */ featBadge:"PLATFORM FEATURES", featTitle:"Complete Healthcare on One Platform",
    featSub:"Complete healthcare — on one platform", learnMore:"Learn more →",
    /* How */ howTitle:"How does it work?", howSub:"Simple as 1-2-3-4 · Very easy",
    /* Queue */ qDeptBadge:"Cardiology OPD", qLive:"LIVE",
    qPageTitle:"Queue Command Centre", qPageSub:"Queue Command Centre · Dr. A. Krishnamurthy · Room 204",
    qReportBtn:"📊 Export Report", qAddBtn:"+ Add Patient",
    qConsulting:"NOW CONSULTING", qRoom:"Room 204",
    qNextUp:"NEXT UP", qAlert:"⚡ Please proceed to waiting area — Room 204",
    qAlertBtn:"🔔 Alert Me",
    qAiLabel:"🤖 AI Prediction", qAiMaxWait:"Max wait for new patient",
    qWaiting:"Waiting", qAvgConsult:"Avg Consult", qDelayBuf:"Delay Buffer",
    qMyPos:"📍 YOUR POSITION", qProgress:"Queue Progress", qComplete:"% done",
    qEstWait:"Est. Wait", qAhead:"Patients Ahead",
    qTimelineTitle:"Full Queue · Today", qPatients:" patients",
    qColName:"Name", qColToken:"Token", qColDept:"Dept", qColTime:"Wait", qColStatus:"Status",
    qStatusIn:"Inside", qStatusNext:"Next", qStatusWait:"Waiting", qStatusYou:"You",
    qPosNum:"No.", qPleaseGo:"⚡ Please proceed to waiting area",
    /* Book */ bkBadge:"Online Booking", bkTitle:"Register Appointment",
    bkSteps:["Identity","Department","Time","Confirm"],
    bkS1Title:"Aadhaar / Mobile Number", bkS1Sub:"Aadhaar or phone verification",
    bkS1Info:"Aadhaar data is SHA-256 encrypted. Compatible with ABHA Health ID.",
    bkS1Btn:"Send WhatsApp OTP →",
    bkS2Title:"OTP Verification", bkS2Sub:"6-digit code sent to +91 ",
    bkS2Btn:"Verify →",
    bkS3Title:"Select Department & Time", bkS3Slots:"Available Time Slots",
    bkS3Full:"Full", bkS3Btn:"Continue →",
    bkS4Title:"Confirm Appointment",
    bkS4Row:["🏥","Department","👨‍⚕️","Doctor","🕐","Time","🎫","Token","⏱","Wait"],
    bkS4RowV:["Dr. A. Krishnamurthy","A-048","~32 min"],
    bkConfirmBtn:"✓ Confirm Appointment",
    /* Success */ bkSuccessTitle:"Appointment Confirmed!", bkSuccessSub:"Appointment confirmed · WhatsApp confirmation sent",
    bkToken:"YOUR TOKEN", bkWhatsApp:"📲 You'll get a WhatsApp when 2 patients remain before you",
    bkWarn:"⚠️ Arrive 15 mins early · Bring original Aadhaar card",
    bkPdf:"📥 Download PDF", bkTrack:"View Queue →",
    /* Admin */ adGovBadge:"Govt. of India", adGovSub:"GOVT. OF INDIA",
    adAdminBadge:"Administration", adTitle:"Hospital Control Centre",
    adSub:"Hospital Control Panel · Govt. District Hospital, Pune",
    adEmergOn:"Emergency Active", adEmergOff:"Emergency Override",
    adAlertMsg:"All patients redirected to Dr. Ravi Pillai.",
    adAlertDeact:"Deactivate", adAddDoc:"+ Add Doctor",
    adActive:"active", adRoster:"Doctor Roster",
    adResume:"▶ Resume", adPause:"⏸ Pause",
    adTrafficTitle:"Patient Traffic", adTrafficSub:"Today's hourly OPD data",
    adPeak:"Peak (11AM)", adPeakLabel:"🔝 Peak",
    adKpi:[{label:"Today's Patients",icon:"👥"},{label:"Avg Wait",icon:"⏱"},{label:"Completed",icon:"✅"},{label:"Active Doctors",icon:"🩺"}],
    adPeriods:[{label:"Morning",sub:"8–11AM"},{label:"Afternoon",sub:"12–2PM"},{label:"Evening",sub:"3–5PM"}],
  },
  HI: {
    /* Navbar */ navHome:"होम", navQueue:"कतार", navBook:"बुकिंग", navAdmin:"प्रबंधन", bookCta:"+ बुकिंग करें",
    /* Hero */ headline:"अब और नहीं", sub:"लाइन में खड़े रहना", gradient:"इतिहास बन गया।",
    tagline:"कतार छोड़ें, देखभाल नहीं।", sloganHi:"बिना इंतज़ार, बेहतर उपचार।",
    body:"आधार या मोबाइल नंबर से सरकारी अस्पताल में अपॉइंटमेंट बुक करें। AI प्रतीक्षा समय का सटीक अनुमान देता है और WhatsApp पर सूचना भेजता है।",
    bookBtn:"अपॉइंटमेंट बुक करें", trackBtn:"कतार देखें",
    live:"लाइव", govBadge:"महाराष्ट्र सरकार",
    todayPat:"आज के मरीज़", avgWait:"औसत प्रतीक्षा", satisfied:"संतुष्ट", doctors:"डॉक्टर",
    /* Features */ featBadge:"प्लेटफ़ॉर्म सुविधाएँ", featTitle:"एक प्लेटफ़ॉर्म पर संपूर्ण स्वास्थ्य सेवा",
    featSub:"Complete healthcare — एक प्लेटफ़ॉर्म पर", learnMore:"और जानें →",
    /* How */ howTitle:"यह कैसे काम करता है?", howSub:"बिल्कुल आसान है · 1-2-3-4",
    /* Queue */ qDeptBadge:"हृदयरोग ओपीडी", qLive:"लाइव",
    qPageTitle:"कतार नियंत्रण केंद्र", qPageSub:"Queue Centre · डॉ. ए. कृष्णमूर्ति · कक्ष २०४",
    qReportBtn:"📊 रिपोर्ट निकालें", qAddBtn:"+ मरीज़ जोड़ें",
    qConsulting:"परामर्श जारी", qRoom:"कक्ष २०४",
    qNextUp:"अगला मरीज़", qAlert:"⚡ कृपया कक्ष २०४ के प्रतीक्षा क्षेत्र में जाएं",
    qAlertBtn:"🔔 अलर्ट करें",
    qAiLabel:"🤖 AI अनुमान", qAiMaxWait:"नए मरीज़ के लिए अधिकतम प्रतीक्षा",
    qWaiting:"प्रतीक्षारत", qAvgConsult:"औसत परामर्श", qDelayBuf:"देरी बफर",
    qMyPos:"📍 आपकी स्थिति", qProgress:"कतार प्रगति", qComplete:"% पूर्ण",
    qEstWait:"प्रतीक्षा समय", qAhead:"आगे मरीज़",
    qTimelineTitle:"पूरी कतार · आज", qPatients:" मरीज़",
    qColName:"नाम", qColToken:"टोकन", qColDept:"विभाग", qColTime:"प्रतीक्षा", qColStatus:"स्थिति",
    qStatusIn:"अंदर", qStatusNext:"अगला", qStatusWait:"प्रतीक्षारत", qStatusYou:"आप",
    qPosNum:"नं.", qPleaseGo:"⚡ प्रतीक्षा क्षेत्र में जाएं",
    /* Book */ bkBadge:"ऑनलाइन बुकिंग", bkTitle:"अपॉइंटमेंट दर्ज करें",
    bkSteps:["पहचान","विभाग","समय","पुष्टि"],
    bkS1Title:"आधार / मोबाइल नंबर", bkS1Sub:"आधार या फ़ोन सत्यापन",
    bkS1Info:"आधार डेटा SHA-256 encrypted है। ABHA Health ID के साथ संगत।",
    bkS1Btn:"WhatsApp OTP भेजें →",
    bkS2Title:"OTP सत्यापन", bkS2Sub:"6-अंकीय कोड भेजा गया +91 ",
    bkS2Btn:"सत्यापित करें →",
    bkS3Title:"विभाग और समय चुनें", bkS3Slots:"उपलब्ध समय स्लॉट",
    bkS3Full:"भरा हुआ", bkS3Btn:"आगे बढ़ें →",
    bkS4Title:"अपॉइंटमेंट की पुष्टि करें",
    bkS4Row:["🏥","विभाग","👨‍⚕️","डॉक्टर","🕐","समय","🎫","टोकन","⏱","प्रतीक्षा"],
    bkS4RowV:["डॉ. अरुण कृष्णमूर्ती","अ-०४८","~३२ मिनिट"],
    bkConfirmBtn:"✓ अपॉइंटमेंट निश्चित करें",
    /* Success */ bkSuccessTitle:"अपॉइंटमेंट निश्चित!", bkSuccessSub:"Appointment confirmed · WhatsApp पर पुष्टि भेजी गई",
    bkToken:"आपका टोकन", bkWhatsApp:"📲 आपके पहले 2 मरीज़ रहने पर WhatsApp आएगा",
    bkWarn:"⚠️ समय से 15 मिनट पहले आएं · मूल आधार कार्ड लाएं",
    bkPdf:"📥 PDF डाउनलोड", bkTrack:"कतार देखें →",
    /* Admin */ adGovBadge:"भारत सरकार", adGovSub:"GOVT. OF INDIA",
    adAdminBadge:"प्रशासन", adTitle:"अस्पताल नियंत्रण केंद्र",
    adSub:"Hospital Control Panel · Govt. District Hospital, Pune",
    adEmergOn:"आपातकाल सक्रिय", adEmergOff:"आपातकाल Override",
    adAlertMsg:"सभी मरीज़ डॉ. रवि पिल्लई को भेजे जा रहे हैं।",
    adAlertDeact:"निष्क्रिय करें", adAddDoc:"+ डॉक्टर जोड़ें",
    adActive:"सक्रिय", adRoster:"डॉक्टर रोस्टर",
    adResume:"▶ शुरू करें", adPause:"⏸ रोकें",
    adTrafficTitle:"मरीज़ यातायात", adTrafficSub:"आज का प्रति घंटा OPD डेटा",
    adPeak:"शिखर (११AM)", adPeakLabel:"🔝 शिखर",
    adKpi:[{label:"आज के मरीज़",icon:"👥"},{label:"औसत प्रतीक्षा",icon:"⏱"},{label:"पूर्ण भेटें",icon:"✅"},{label:"सक्रिय डॉक्टर",icon:"🩺"}],
    adPeriods:[{label:"सुबह",sub:"8–11AM"},{label:"दोपहर",sub:"12–2PM"},{label:"शाम",sub:"3–5PM"}],
  },
  MR: {
    /* Navbar */ navHome:"होम", navQueue:"रांग", navBook:"बुकिंग", navAdmin:"व्यवस्थापन", bookCta:"+ बुकिंग करा",
    /* Hero */ headline:"रांगेत उभे राहणे", sub:"आता", gradient:"इतिहास जमा झाले.",
    tagline:"रांग सोडा, काळजी नाही.", sloganHi:"बिना इंतज़ार, बेहतर उपचार.",
    body:"आधार किंवा मोबाईल नंबरने सरकारी रुग्णालयात भेट बुक करा. AI प्रतीक्षा वेळाचा अचूक अंदाज देतो आणि WhatsApp वर सूचना मिळते.",
    bookBtn:"भेट बुक करा", trackBtn:"रांग पाहा",
    live:"लाइव्ह", govBadge:"महाराष्ट्र शासन",
    todayPat:"आजचे रुग्ण", avgWait:"सरासरी वेळ", satisfied:"समाधानी", doctors:"डॉक्टर",
    /* Features */ featBadge:"मंच क्षमता", featTitle:"संपूर्ण आरोग्य सेवा एका प्लॅटफॉर्मवर",
    featSub:"Complete healthcare — एका प्लॅटफॉर्मवर", learnMore:"अधिक जाणून घ्या →",
    /* How */ howTitle:"हे कसे काम करते?", howSub:"Simple as 1-2-3-4 · अगदी सोपे आहे",
    /* Queue */ qDeptBadge:"हृदयरोग ओपीडी", qLive:"लाइव्ह",
    qPageTitle:"रांग नियंत्रण केंद्र", qPageSub:"Queue Command Centre · Dr. A. Krishnamurthy · Room 204",
    qReportBtn:"📊 अहवाल काढा", qAddBtn:"+ रुग्ण जोडा",
    qConsulting:"आत्ता सल्लामसलत", qRoom:"कक्ष २०४",
    qNextUp:"पुढील रुग्ण · NEXT UP", qAlert:"⚡ कृपया कक्ष २०४ च्या प्रतीक्षा क्षेत्रात जा",
    qAlertBtn:"🔔 अलर्ट करा",
    qAiLabel:"🤖 AI अनुमान", qAiMaxWait:"नवीन रुग्णासाठी जास्तीत जास्त प्रतीक्षा",
    qWaiting:"प्रतीक्षेत", qAvgConsult:"सरासरी सल्लामसलत", qDelayBuf:"विलंब बफर",
    qMyPos:"📍 तुमचे स्थान · YOUR POSITION", qProgress:"रांग प्रगती", qComplete:"% पूर्ण",
    qEstWait:"प्रतीक्षा वेळ", qAhead:"पुढे रुग्ण",
    qTimelineTitle:"संपूर्ण रांग · आज", qPatients:" रुग्ण",
    qColName:"नाव / Name", qColToken:"टोकन", qColDept:"विभाग", qColTime:"वेळ", qColStatus:"स्थिती",
    qStatusIn:"आत आहे", qStatusNext:"पुढे आहे", qStatusWait:"प्रतीक्षेत", qStatusYou:"तुम्ही",
    qPosNum:"क्र.", qPleaseGo:"⚡ कृपया प्रतीक्षा क्षेत्रात जा",
    /* Book */ bkBadge:"ऑनलाइन बुकिंग", bkTitle:"भेट नोंदणी करा",
    bkSteps:["ओळख","विभाग","वेळ","पुष्टी"],
    bkS1Title:"आधार / मोबाईल नंबर", bkS1Sub:"Aadhaar or phone verification",
    bkS1Info:"आधार डेटा SHA-256 encrypted आहे. ABHA Health ID शी सुसंगत.",
    bkS1Btn:"WhatsApp OTP पाठवा →",
    bkS2Title:"OTP सत्यापन", bkS2Sub:"6-अंकी कोड पाठवला +91 ",
    bkS2Btn:"सत्यापित करा →",
    bkS3Title:"विभाग आणि वेळ निवडा", bkS3Slots:"उपलब्ध वेळ स्लॉट",
    bkS3Full:"भरले", bkS3Btn:"पुढे चला →",
    bkS4Title:"भेट पुष्टी करा",
    bkS4Row:["🏥","विभाग","👨‍⚕️","डॉक्टर","🕐","वेळ","🎫","टोकन","⏱","प्रतीक्षा"],
    bkS4RowV:["डॉ. अरुण कृष्णमूर्ती","अ-०४८","~३२ मिनिटे"],
    bkConfirmBtn:"✓ भेट निश्चित करा",
    /* Success */ bkSuccessTitle:"भेट निश्चित!", bkSuccessSub:"Appointment confirmed · WhatsApp confirmation sent",
    bkToken:"तुमचे टोकन · YOUR TOKEN", bkWhatsApp:"📲 तुमच्या आधी २ रुग्ण असतील तेव्हा WhatsApp येईल",
    bkWarn:"⚠️ वेळेच्या १५ मिनिटे आधी या · मूळ आधार कार्ड आणा",
    bkPdf:"📥 PDF डाउनलोड", bkTrack:"रांग पाहा →",
    /* Admin */ adGovBadge:"भारत सरकार", adGovSub:"GOVT. OF INDIA",
    adAdminBadge:"प्रशासन", adTitle:"रुग्णालय नियंत्रण केंद्र",
    adSub:"Hospital Control Panel · Govt. District Hospital, Pune",
    adEmergOn:"आपातकाल सक्रिय", adEmergOff:"आपातकाल Override",
    adAlertMsg:"सर्व रुग्ण डॉ. रवी पिल्लई यांच्याकडे पुनर्निर्देशित.",
    adAlertDeact:"निष्क्रिय करा", adAddDoc:"+ डॉक्टर जोडा",
    adActive:"सक्रिय", adRoster:"डॉक्टर रोस्टर",
    adResume:"▶ सुरू करा", adPause:"⏸ थांबवा",
    adTrafficTitle:"रुग्ण रहदारी · Patient Traffic", adTrafficSub:"आजचा तासवार ओपीडी डेटा",
    adPeak:"शिखर (११AM)", adPeakLabel:"🔝 शिखर",
    adKpi:[{label:"आजचे रुग्ण",icon:"👥"},{label:"सरासरी वेळ",icon:"⏱"},{label:"पूर्ण भेटी",icon:"✅"},{label:"सक्रिय डॉक्टर",icon:"🩺"}],
    adPeriods:[{label:"सकाळ",sub:"8–11AM"},{label:"दुपार",sub:"12–2PM"},{label:"संध्याकाळ",sub:"3–5PM"}],
  },
};

function useCounter(target, dur=1800, delay=0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let s;
      const fn = ts => {
        if(!s) s=ts;
        const p = Math.min((ts-s)/dur, 1);
        setV(Math.floor((1-Math.pow(1-p,3))*target));
        if(p<1) requestAnimationFrame(fn);
      };
      requestAnimationFrame(fn);
    }, delay);
    return () => clearTimeout(t);
  }, [target,dur,delay]);
  return v;
}

function Skel({ w="100%", h=14, r=8, mb=0 }) {
  return <div className="shimmer" style={{ width:w,height:h,borderRadius:r,marginBottom:mb }} />;
}

function Badge({ children, color, bg, border }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 11px", borderRadius:20, fontSize:11.5,
      fontWeight:600, background:bg||`${color}18`,
      color, border:`1px solid ${border||`${color}44`}`,
      fontFamily:"Mukta,sans-serif",
    }}>{children}</span>
  );
}

/* ── Avatar with Indian color palettes ── */
const AV_PAL = [
  [C.saffronSoft, C.saffron],
  [C.mehndiSoft,  C.mehndi],
  [C.peacockSoft, C.peacock],
  [C.lotusSoft,   C.lotus],
  [C.ashokaSoft,  C.ashoka],
  [C.goldSoft,    C.turmeric],
];
function Avatar({ text, size=40, idx=0, ring=false }) {
  const [bg,fg] = AV_PAL[idx % AV_PAL.length];
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%", flexShrink:0,
      background:bg, border:ring?`2.5px solid ${fg}`:`2px solid ${bg}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Mukta,sans-serif", fontWeight:700,
      fontSize:size*.28, color:fg,
      boxShadow:ring?`0 0 0 3px #FFFDF7, 0 0 0 5px ${fg}44`:"none",
    }}>{text}</div>
  );
}

/* ═══════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════ */
function Navbar({ page, setPage, lang, setLang }) {
  const [scrolled, setScrolled] = useState(false);
  const t = T[lang] || T.MR;
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll",h); return () => window.removeEventListener("scroll",h);
  },[]);

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:300,
      background: scrolled ? "rgba(255,253,247,.95)" : "rgba(255,253,247,.97)",
      backdropFilter:"blur(18px) saturate(1.6)",
      borderBottom: scrolled ? "1px solid #E8D5B0" : "1px solid transparent",
      transition:"all .3s",
      padding:"0 32px", height:66,
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      {/* Left — Brand */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {/* Indian Flag — inline nav size */}
        <div style={{ animation:"flagEntrance .6s cubic-bezier(.34,1.56,.64,1) .1s both" }}>
          <IndianFlag width={44} shadow={true} wave={true} />
        </div>

        {/* Divider */}
        <div style={{ width:1, height:32, background:C.border }} />

        {/* Emblem */}
        <div style={{
          width:40, height:40, borderRadius:10,
          background:"linear-gradient(135deg,#E85D04,#F48C06)",
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 12px rgba(232,93,4,.35)",
          position:"relative", flexShrink:0,
        }}>
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <rect x="9" y="2" width="4" height="18" rx="2" fill="white" opacity=".9"/>
            <rect x="2" y="9" width="18" height="4" rx="2" fill="white" opacity=".9"/>
          </svg>
        </div>
        <div>
          <div style={{ display:"flex", alignItems:"baseline", gap:6 }}>
            <span className="display" style={{ fontSize:18, fontWeight:900, color:C.ink, letterSpacing:"-.01em" }}>
              आरोग्य सेतु
            </span>
            <span style={{ fontFamily:"Mukta,sans-serif", fontSize:12, color:C.inkDim, fontWeight:500 }}>
              ArogyaSetu
            </span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:1 }}>
            <TricolorStrip />
            <span className="tag-india" style={{ color:C.inkDim, fontSize:9.5, letterSpacing:".07em" }}>
              महाराष्ट्र शासन · DIGITAL HEALTH
            </span>
          </div>
        </div>
      </div>

      {/* Center — Nav */}
      <div style={{
        display:"flex", gap:2, background:C.ivoryDark,
        borderRadius:14, padding:4, border:`1px solid ${C.border}`,
      }}>
        {[
          { p:"Home",  hi:t.navHome  },
          { p:"Queue", hi:t.navQueue },
          { p:"Book",  hi:t.navBook  },
          { p:"Admin", hi:t.navAdmin },
        ].map(({ p, hi }) => (
          <button key={p} onClick={() => setPage(p)} className="btn" style={{
            borderRadius:10, padding:"7px 18px",
            background: page===p ? "#FFFFFF" : "transparent",
            boxShadow: page===p ? "0 2px 8px rgba(0,0,0,.1)" : "none",
            border:"none", transition:"all .2s",
          }}>
            <span style={{ fontSize:14, fontWeight:700, color:page===p?C.saffron:C.inkMid, fontFamily:"Mukta,sans-serif" }}>
              {hi}
            </span>
            <span style={{ fontSize:11, color:C.inkDim, fontFamily:"Mukta,sans-serif" }}>
              {p}
            </span>
          </button>
        ))}
      </div>

      {/* Right */}
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        {/* Language */}
        <div style={{
          display:"flex", background:C.ivoryDark, border:`1px solid ${C.border}`,
          borderRadius:10, overflow:"hidden", padding:3, gap:2,
        }}>
          {LANGS.map(l => (
            <button key={l.c} onClick={() => setLang(l.c)} className="btn" style={{
              background: lang===l.c ? "#FFFFFF" : "transparent",
              border:"none", padding:"4px 10px",
              borderRadius:7, fontSize:12, fontWeight:700,
              color: lang===l.c ? C.saffron : C.inkDim,
              boxShadow: lang===l.c ? "0 1px 4px rgba(0,0,0,.1)" : "none",
              transition:"all .2s", fontFamily:"Mukta,sans-serif",
            }}>{l.l}</button>
          ))}
        </div>

        {/* User pill */}
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background:"#FFFFFF", border:`1px solid ${C.border}`, borderRadius:22, padding:"5px 14px 5px 6px",
        }}>
          <Avatar text="प्र" size={28} idx={3} />
          <span style={{ fontSize:13, fontWeight:600, color:C.inkMid }}>प्रिया कुलकर्णी</span>
        </div>

        <button className="btn btn-saffron" onClick={() => setPage("Book")} style={{ borderRadius:11, padding:"9px 22px", fontSize:14 }}>
          <span style={{ fontFamily:"Mukta,sans-serif" }}>{t.bookCta}</span>
        </button>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════ */
function HomePage({ setPage }) {
  return (
    <>
      <HeroSection setPage={setPage} />
      <FeaturesSection />
      <HowItWorksSection />
    </>
  );
}

function HeroSection({ setPage }) {
  const lang = useLang();
  const t = T[lang] || T.MR;
  return (
    <section style={{
      minHeight:"100vh", position:"relative", overflow:"hidden",
      display:"flex", alignItems:"center",
      padding:"90px 40px 60px",
      background:`linear-gradient(165deg, #FFFDF7 0%, #FEF8EE 40%, #FDF4E3 100%)`,
    }}>
      {/* Kolam dot pattern bg */}
      <div className="kolam-bg" style={{ position:"absolute", inset:0, pointerEvents:"none" }} />

      {/* Large rangoli — bottom right */}
      <div style={{
        position:"absolute", right:"-60px", bottom:"-60px",
        opacity:1, transform:"rotate(15deg)",
        animation:"petal 6s ease-in-out infinite",
        pointerEvents:"none",
      }}>
        <RangoliPattern size={400} color={C.saffron} />
      </div>
      {/* Small rangoli — top left */}
      <div style={{
        position:"absolute", left:"-80px", top:"10%",
        opacity:.7, transform:"rotate(-10deg)",
        animation:"petal 8s ease-in-out infinite reverse",
        pointerEvents:"none",
      }}>
        <RangoliPattern size={260} color={C.peacock} />
      </div>

      {/* Color orbs */}
      {[
        { c:"rgba(232,93,4,.09)",  w:500, t:"5%",  l:"30%", a:"orbFloat1 9s ease-in-out infinite"  },
        { c:"rgba(14,116,144,.07)", w:380, t:"55%", l:"55%", a:"orbFloat2 11s ease-in-out infinite" },
      ].map((o,i) => (
        <div key={i} style={{
          position:"absolute", width:o.w, height:o.w,
          top:o.t, left:o.l, borderRadius:"50%",
          background:o.c, filter:"blur(70px)", animation:o.a, pointerEvents:"none",
        }} />
      ))}

      <div style={{ maxWidth:1200, width:"100%", margin:"0 auto", position:"relative", zIndex:2 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:64, alignItems:"center" }}>

          {/* Left */}
          <div>
            {/* Gov badge */}
            <div className="fu0" style={{ marginBottom:22, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              {/* Waving flag */}
              <div style={{ animation:"flagEntrance .7s cubic-bezier(.34,1.56,.64,1) .2s both" }}>
                <FlagBanner width={88} />
              </div>

              <div style={{
                display:"flex", alignItems:"center", gap:8,
                background:"#FFFFFF", border:`1px solid ${C.border}`,
                borderRadius:20, padding:"5px 14px",
              }}>
                <AshokaChakra size={16} color={C.ashokaHi} spinning />
                <span style={{ fontSize:12, fontWeight:600, color:C.ashokaHi, fontFamily:"Mukta,sans-serif" }}>
                  {t.govBadge} · Digital Health
                </span>
              </div>
              <Badge color={C.mehndi} bg={C.mehndiSoft} border={`${C.mehndi}44`}>
                <span style={{ width:7, height:7, borderRadius:"50%", background:C.mehndiHi,
                  display:"inline-block", animation:"petal 1.5s ease-in-out infinite" }} />
                {t.live} · LIVE
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="fu1 display" style={{
              fontSize:"clamp(42px,5.5vw,70px)", lineHeight:1.06,
              letterSpacing:"-.02em", color:C.ink, marginBottom:8,
            }}>
              {t.headline}
            </h1>
            <h2 className="fu2" style={{
              fontFamily:"Mukta,sans-serif", fontWeight:300,
              fontSize:"clamp(22px,3vw,36px)", color:C.inkDim, marginBottom:6,
              letterSpacing:"-.01em",
            }}>
              {t.sub}{" "}
              <span style={{
                background:`linear-gradient(135deg,${C.saffron},${C.turmeric})`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                fontWeight:800,
              }}>{t.gradient}</span>
            </h2>
            <div className="fu2" style={{
              fontFamily:"Mukta,sans-serif", fontWeight:400,
              fontSize:16, color:C.inkDim, marginBottom:6,
            }}>
              {t.tagline}
            </div>

            <PaisleyBorder color={C.saffron} opacity={.3} />

            <p className="fu3" style={{
              color:C.inkMid, fontSize:17, lineHeight:1.72,
              maxWidth:540, marginTop:20, marginBottom:36,
              fontFamily:"Mukta,sans-serif",
            }}>
              {t.body}
            </p>

            <div className="fu4" style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:52 }}>
              <button className="btn btn-saffron" onClick={() => setPage("Book")}
                style={{ borderRadius:13, padding:"14px 34px", fontSize:16 }}>
                <span className="devanagari" style={{ fontSize:18 }}>🏥</span>
                {t.bookBtn}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="btn btn-outline-india" onClick={() => setPage("Queue")}
                style={{ borderRadius:13, padding:"14px 28px", fontSize:16 }}>
                {t.trackBtn}
              </button>
            </div>

            {/* Stats strip */}
            <div className="fu5" style={{
              display:"flex", gap:0,
              background:"#FFFFFF", border:`1px solid ${C.border}`,
              borderRadius:16, overflow:"hidden",
            }}>
              {[
                { label:t.todayPat, val:847, suf:"",  color:C.saffron  },
                { label:t.avgWait,  val:23,  suf:"m", color:C.peacock  },
                { label:t.satisfied,val:96,  suf:"%", color:C.mehndi   },
                { label:t.doctors,  val:38,  suf:"",  color:C.turmeric },
              ].map((s,i) => (
                <div key={i} style={{
                  flex:1, padding:"18px 20px",
                  borderRight:i<3?`1px solid ${C.border}`:"none",
                }}>
                  <HeroStat label={s.label} val={s.val} suf={s.suf} color={s.color} delay={i*100} />
                </div>
              ))}
            </div>
          </div>

          {/* Right — Live card */}
          <div className="fu5" style={{ animation:"floatUp 4s ease-in-out infinite" }}>
            <LiveCard setPage={setPage} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, val, suf, color, delay }) {
  const v = useCounter(val, 1900, 700+delay);
  return (
    <div>
      <div style={{ fontSize:11, color:C.inkDim, fontWeight:600, marginBottom:4, fontFamily:"Mukta,sans-serif" }}>
        {label}
      </div>
      <div style={{
        fontFamily:"Yatra One, serif", fontSize:30, fontWeight:900,
        color, letterSpacing:"-.02em", lineHeight:1,
      }}>{v}{suf}</div>
    </div>
  );
}

function LiveCard({ setPage }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(k=>k+1), 3200);
    return () => clearInterval(t);
  },[]);
  const activeIdx = tick % 3;

  return (
    <div style={{
      background:"#FFFFFF",
      border:`1px solid ${C.border}`,
      borderRadius:22,
      boxShadow:`0 32px 80px rgba(232,93,4,.12), 0 8px 24px rgba(0,0,0,.07)`,
      overflow:"hidden",
    }}>
      {/* Tri-color top strip */}
      <div style={{ height:5, background:`linear-gradient(90deg,${C.saffron},${C.turmeric} 33%,#FFFFFF 33%,#FFFFFF 66%,${C.mehndi} 66%)` }} />

      {/* Header */}
      <div style={{
        padding:"16px 20px",
        background:`linear-gradient(135deg,${C.saffron} 0%,${C.saffronHi} 100%)`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div>
          <div style={{ color:"rgba(255,255,255,.75)", fontSize:11, fontWeight:600, letterSpacing:".06em" }}>
            हृदयरोग ओपीडी · CARDIOLOGY OPD
          </div>
          <div style={{ color:"#FFFFFF", fontSize:15, fontWeight:700, marginTop:2, fontFamily:"Mukta,sans-serif" }}>
            डॉ. अरुण कृष्णमूर्ती
          </div>
          <div style={{ color:"rgba(255,255,255,.65)", fontSize:12 }}>Dr. A. Krishnamurthy · Room 204</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{
            background:"rgba(255,255,255,.2)", borderRadius:20, padding:"4px 12px",
            display:"flex", alignItems:"center", gap:6,
          }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80",
              animation:"petal 1.4s ease-in-out infinite" }} />
            <span style={{ color:"#FFFFFF", fontSize:11, fontWeight:700 }}>LIVE</span>
          </div>
          <div style={{ color:"rgba(255,255,255,.65)", fontSize:11, marginTop:4 }}>
            {QUEUE.length} in queue
          </div>
        </div>
      </div>

      {/* Consulting patient */}
      <div style={{ padding:"18px 20px", borderBottom:`1px solid ${C.ivoryDark}` }}>
        <div className="tag-india" style={{ color:C.inkDim, marginBottom:10 }}>आत्ता सल्लामसलत · NOW CONSULTING</div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <Avatar text={QUEUE[0].avatar} size={46} idx={0} ring />
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:15, fontFamily:"Mukta,sans-serif" }}>
              {QUEUE[0].name}
            </div>
            <div style={{ color:C.inkDim, fontSize:12 }}>{QUEUE[0].nameE} · {QUEUE[0].city}</div>
          </div>
          <Badge color={C.mehndi} bg={C.mehndiSoft} border={`${C.mehndi}44`}>आत आहे</Badge>
        </div>
        {/* Waveform */}
        <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:22, marginTop:12 }}>
          {[1,2,3,4,5,2,4,1,3,5,2,4,1,2,5].map((n,i) => (
            <div key={i} style={{ width:4, borderRadius:2,
              background:`linear-gradient(180deg,${C.saffron},${C.saffronHi})`,
              animation:`wave${Math.min(n,5)} ${.32+i*.04}s ease-in-out infinite`,
            }} />
          ))}
          <span style={{ color:C.inkDim, fontSize:11, marginLeft:6, alignSelf:"center" }}>Consulting…</span>
        </div>
      </div>

      {/* Mini queue */}
      <div style={{ padding:"14px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          <span className="tag-india" style={{ color:C.inkDim }}>पुढील रुग्ण · NEXT PATIENTS</span>
          <button onClick={() => setPage("Queue")} style={{ background:"none", border:"none",
            color:C.saffron, fontSize:12, fontWeight:700, cursor:"pointer" }}>सर्व पाहा →</button>
        </div>
        {QUEUE.slice(1,4).map((p,i) => (
          <div key={p.id} style={{
            display:"flex", alignItems:"center", gap:10, padding:"9px 0",
            borderBottom:i<2?`1px solid ${C.ivoryDark}`:"none",
            background: i===activeIdx-1?C.ivoryDark:"transparent",
            borderRadius:8, transition:"background .4s",
          }}>
            <div className="mono" style={{ width:20, fontSize:12, color:C.inkDim, textAlign:"center" }}>{i+2}</div>
            <Avatar text={p.avatar} size={30} idx={i+1} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>{p.name}</div>
              <div style={{ fontSize:11, color:C.inkDim }}>{p.city}</div>
            </div>
            <MandalaRing size={36} progress={100-(i+1)*22} color={C.saffron} bg={C.ivoryDark}>
              <span className="mono" style={{ fontSize:9, color:C.saffron, fontWeight:600 }}>{p.wait}m</span>
            </MandalaRing>
          </div>
        ))}
      </div>

      {/* AI bar */}
      <div style={{ margin:"0 16px 16px" }}>
        <div style={{
          background:`linear-gradient(135deg,${C.ashokaSoft},${C.peacockSoft})`,
          border:`1px solid ${C.peacock}33`,
          borderRadius:12, padding:"12px 14px",
          display:"flex", alignItems:"center", gap:12,
        }}>
          <div style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:`linear-gradient(135deg,${C.ashoka},${C.peacock})`,
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <AshokaChakra size={20} color="rgba(255,255,255,.85)" spinning />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.ashoka }}>AI अनुमान · AI Prediction</div>
            <div style={{ fontSize:11, color:C.inkDim, marginTop:1 }}>पुढील स्लॉट ~९ मिनिटांत</div>
          </div>
          <div style={{ fontFamily:"Yatra One,serif", fontWeight:900, fontSize:26, color:C.ashoka }}>
            9<span style={{ fontSize:13, color:C.inkDim, fontFamily:"Mukta,sans-serif" }}>m</span>
          </div>
        </div>
      </div>

      {/* Aadhaar note */}
      <div style={{
        margin:"0 16px 16px", padding:"10px 14px", borderRadius:10,
        background:C.ivoryDark, border:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", gap:8,
      }}>
        <span style={{ fontSize:16 }}>🔒</span>
        <span style={{ fontSize:11, color:C.inkDim }}>
          Aadhaar-secured · ABHA Health ID compatible
        </span>
        <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color:C.ashokaHi }}>ABHA</span>
      </div>
    </div>
  );
}

function FeaturesSection() {
  const t = T[useLang()] || T.MR;
  return (
    <section style={{ padding:"72px 40px", background:C.ivoryDark, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", right:"-40px", top:"50%", transform:"translateY(-50%)", opacity:.6, pointerEvents:"none" }}>
        <RangoliPattern size={300} color={C.turmeric} />
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <Badge color={C.saffron} bg={C.saffronSoft} border={`${C.saffron}44`}>
            <AshokaChakra size={13} color={C.saffron} spinning />
            {t.featBadge}
          </Badge>
          <h2 className="display" style={{
            fontSize:"clamp(28px,4vw,46px)", marginTop:14, color:C.ink,
          }}>
            {t.featTitle}
          </h2>
          <p style={{ color:C.inkDim, fontSize:16, marginTop:10, fontFamily:"Mukta,sans-serif" }}>
            {t.featSub}
          </p>
          <div style={{ marginTop:14 }}>
            <PaisleyBorder color={C.saffron} opacity={.4} />
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
          {FEATURES.map((f,i) => <FeatureCard key={f.en} f={f} i={i} />)}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ f, i }) {
  const t = T[useLang()] || T.MR;
  const [hov, setHov] = useState(false);
  return (
    <div className="card-india"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:26,
        animation:`fadeUp .5s ease ${i*70+100}ms both`,
        boxShadow: hov ? `0 16px 48px ${f.color}22` : "none",
        borderColor: hov ? `${f.color}55` : C.border,
      }}>
      <div style={{
        width:54, height:54, borderRadius:16,
        background: hov ? f.color : f.soft,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:26, marginBottom:16,
        transition:"all .25s",
        boxShadow: hov ? `0 8px 20px ${f.color}44` : "none",
      }}>{f.icon}</div>
      <div style={{ marginBottom:4 }}>
        <div style={{ fontFamily:"Mukta,sans-serif", fontWeight:700, fontSize:16, color:C.ink }}>{f.hi}</div>
        <div style={{ fontSize:12, color:C.inkDim }}>{f.en}</div>
      </div>
      <p style={{ color:C.inkMid, fontSize:14, lineHeight:1.65, fontFamily:"Mukta,sans-serif" }}>{f.desc}</p>
      {hov && (
        <div style={{ marginTop:16, display:"flex", alignItems:"center", gap:4,
          color:f.color, fontSize:13, fontWeight:700, animation:"fadeIn .2s ease",
          fontFamily:"Mukta,sans-serif",
        }}>
          {t.learnMore}
        </div>
      )}
    </div>
  );
}

function HowItWorksSection() {
  const t = T[useLang()] || T.MR;
  const steps = [
    { n:"१", hi:"आधार / मोबाईल",  en:"Aadhaar / Phone",   desc:"OTP द्वारे झटपट verification",    icon:"📱", color:C.saffron  },
    { n:"२", hi:"विभाग निवडा",     en:"Choose Department", desc:"उपलब्ध डॉक्टर आणि वेळ निवडा",   icon:"🏥", color:C.peacock  },
    { n:"३", hi:"AI अनुमान",       en:"AI Slot Prediction",desc:"रांगेत तुमचे स्थान AI ठरवतो",    icon:"🤖", color:C.mehndi   },
    { n:"४", hi:"WhatsApp अलर्ट",  en:"WhatsApp Alert",    desc:"तुमचा नंबर येण्यापूर्वी कळवतो",   icon:"💬", color:C.turmeric },
  ];
  return (
    <section style={{ padding:"72px 40px", background:"#FFFFFF", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", left:"-30px", bottom:"-30px", opacity:.5, pointerEvents:"none" }}>
        <RangoliPattern size={220} color={C.mehndi} />
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <h2 className="display" style={{ fontSize:"clamp(26px,3.5vw,42px)", color:C.ink }}>
            {t.howTitle}
          </h2>
          <p style={{ color:C.inkDim, fontSize:15, marginTop:8, fontFamily:"Mukta,sans-serif" }}>
            {t.howSub}
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
          {steps.map((s,i) => (
            <div key={s.n} className="card-india" style={{ padding:28, textAlign:"center", animation:`fadeUp .5s ease ${i*80}ms both` }}>
              {/* Mandala number ring */}
              <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
                <MandalaRing size={64} progress={100} color={s.color} bg={`${s.color}22`}>
                  <span className="display" style={{ fontSize:22, color:s.color }}>{s.n}</span>
                </MandalaRing>
              </div>
              <div style={{ fontSize:28, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontFamily:"Mukta,sans-serif", fontWeight:700, fontSize:15, color:C.ink, marginBottom:3 }}>
                {s.hi}
              </div>
              <div style={{ fontSize:12, color:C.inkDim, marginBottom:8 }}>{s.en}</div>
              <p style={{ color:C.inkMid, fontSize:13, lineHeight:1.6, fontFamily:"Mukta,sans-serif" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   QUEUE PAGE
═══════════════════════════════════════════ */
function QueuePage() {
  const t = T[useLang()] || T.MR;
  const [queue, setQueue]     = useState(QUEUE);
  const [loading, setLoading] = useState(true);
  const [tick, setTick]       = useState(0);
  const [toast, setToast]     = useState(null);
  const [buffer, setBuffer]   = useState(4);

  useEffect(() => { setTimeout(() => setLoading(false), 1600); },[]);
  useEffect(() => {
    const t = setInterval(() => setTick(n=>n+1), 7200);
    return () => clearInterval(t);
  },[]);
  useEffect(() => {
    if (!tick || loading) return;
    setTimeout(() => {
      setQueue(prev => {
        const rest = prev.filter(p => p.status!=="consulting");
        if (!rest.length) return prev;
        const upd = rest.map((p,i) => ({
          ...p, wait:Math.max(0,p.wait-9),
          status:i===0?"consulting":i===1?"next":"waiting",
        }));
        setToast(`📲 ${upd[1]?.name} यांना WhatsApp: "तुम्ही पुढे आहात!"`);
        setTimeout(() => setToast(null), 4500);
        setBuffer(b => Math.max(0, b+(Math.random()>.5?1:-1)));
        return upd;
      });
    }, 500);
  }, [tick, loading]);

  const consulting = queue.find(p=>p.status==="consulting");
  const next       = queue.find(p=>p.status==="next");
  const me         = queue.find(p=>p.id==="P04");
  const myPos      = queue.findIndex(p=>p.id==="P04")+1;
  const waiting    = queue.filter(p=>p.status==="waiting").length;

  return (
    <section className="page" style={{ padding:"90px 40px 60px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32 }}>
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <Badge color={C.saffron} bg={C.saffronSoft}>{t.qDeptBadge}</Badge>
            <Badge color={C.mehndi}  bg={C.mehndiSoft}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:C.mehndiHi,
                animation:"petal 1.4s ease-in-out infinite",display:"inline-block" }} />
              {t.qLive} · LIVE
            </Badge>
          </div>
          <h2 className="display" style={{ fontSize:34, color:C.ink }}>
            {t.qPageTitle}
          </h2>
          <p style={{ color:C.inkDim, marginTop:4, fontFamily:"Mukta,sans-serif", fontSize:14 }}>
            {t.qPageSub}
          </p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost-india" style={{ borderRadius:10, padding:"9px 18px", fontSize:13 }}>
            {t.qReportBtn}
          </button>
          <button className="btn btn-saffron" style={{ borderRadius:10, padding:"9px 20px", fontSize:13 }}>
            {t.qAddBtn}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          background:C.mehndiSoft, border:`1px solid ${C.mehndi}44`,
          borderRadius:12, padding:"13px 20px", marginBottom:20,
          color:C.mehndi, fontWeight:600, fontSize:14,
          animation:"fadeUp .3s ease both", display:"flex", gap:10, alignItems:"center",
          fontFamily:"Mukta,sans-serif",
        }}>
          <span style={{ fontSize:20 }}>✅</span>{toast}
        </div>
      )}

      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
          {[1,2,3].map(i=><div key={i} className="card-india" style={{padding:24}}><Skel w="55%" h={13} r={6} mb={16}/><Skel h={32} r={8} mb={12}/><Skel w="70%" h={10} r={5} mb={8}/><Skel w="50%" h={10} r={5}/></div>)}
          <div style={{gridColumn:"1/-1",background:"#FFFFFF",borderRadius:16,padding:24,border:`1px solid ${C.border}`}}><Skel h={60} r={10}/></div>
        </div>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
            <QConsultingCard p={consulting} />
            <QNextCard p={next} />
            <QAICard waiting={waiting} buffer={buffer} />
          </div>
          {me && <QMyCard p={me} pos={myPos} total={queue.length} />}
          <QTimeline queue={queue} />
        </>
      )}
    </section>
  );
}

function QConsultingCard({ p }) {
  const t = T[useLang()] || T.MR;
  if (!p) return null;
  return (
    <div style={{
      background:`linear-gradient(135deg,${C.saffron} 0%,${C.saffronHi} 100%)`,
      borderRadius:16, padding:24, color:"white", position:"relative", overflow:"hidden",
    }}>
      {/* Rangoli watermark */}
      <div style={{ position:"absolute", right:-40, bottom:-40, opacity:.15, pointerEvents:"none" }}>
        <RangoliPattern size={180} color="#FFFFFF" />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, position:"relative" }}>
        <span style={{ fontSize:11,fontWeight:700,letterSpacing:".06em",opacity:.8,fontFamily:"Mukta,sans-serif" }}>
          {t.qConsulting}
        </span>
        <span style={{ background:"rgba(255,255,255,.2)",borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700 }}>
          {t.qRoom}
        </span>
      </div>
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16, position:"relative" }}>
        <div style={{
          width:50, height:50, borderRadius:"50%",
          background:"rgba(255,255,255,.22)", border:"2.5px solid rgba(255,255,255,.55)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:15, fontWeight:800, fontFamily:"Mukta,sans-serif",
        }}>{p.avatar}</div>
        <div>
          <div style={{ fontWeight:700,fontSize:17,fontFamily:"Mukta,sans-serif" }}>{p.name}</div>
          <div style={{ opacity:.75,fontSize:12 }}>{p.nameE} · {p.city}</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:3, alignItems:"flex-end", height:24, position:"relative" }}>
        {[1,2,3,4,5,3,2,4,1,5,2,3].map((n,i) => (
          <div key={i} style={{ width:4,borderRadius:2,background:"rgba(255,255,255,.8)",
            animation:`wave${Math.min(n,5)} ${.32+i*.04}s ease-in-out infinite` }} />
        ))}
      </div>
    </div>
  );
}

function QNextCard({ p }) {
  const t = T[useLang()] || T.MR;
  if (!p) return null;
  return (
    <div className="card-india" style={{ padding:24, border:`2px solid ${C.turmeric}55` }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
        <span className="tag-india" style={{ color:C.turmeric }}>{t.qNextUp}</span>
        <Badge color={C.turmeric} bg={C.goldSoft} border={`${C.turmeric}44`}>~{p.wait}मि</Badge>
      </div>
      <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:18 }}>
        <Avatar text={p.avatar} size={50} idx={2} ring />
        <div>
          <div style={{ fontWeight:700,fontSize:16,fontFamily:"Mukta,sans-serif" }}>{p.name}</div>
          <div style={{ color:C.inkDim,fontSize:12,marginTop:1 }}>{p.nameE} · {p.city}</div>
        </div>
      </div>
      <div style={{ background:C.goldSoft,borderRadius:9,padding:"9px 12px",
        border:`1px solid ${C.turmeric}33`,color:C.turmeric,fontSize:12,fontWeight:600,
        fontFamily:"Mukta,sans-serif",
      }}>
        {t.qAlert}
      </div>
    </div>
  );
}

function QAICard({ waiting, buffer }) {
  const t = T[useLang()] || T.MR;
  const total = waiting*12 + buffer;
  return (
    <div className="card-india" style={{ padding:24, border:`1.5px solid ${C.peacock}33` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <span className="tag-india" style={{ color:C.peacock }}>{t.qAiLabel}</span>
        <Badge color={C.peacock} bg={C.peacockSoft} border={`${C.peacock}33`}>
          <AshokaChakra size={11} color={C.peacock} spinning /> ९४.२%
        </Badge>
      </div>
      <div style={{
        fontFamily:"Yatra One,serif", fontWeight:900, fontSize:52,
        color:C.peacock, letterSpacing:"-.02em", lineHeight:1,
      }}>
        {total}<span style={{ fontSize:20,color:C.inkDim,fontFamily:"Mukta,sans-serif" }}>m</span>
      </div>
      <div style={{ color:C.inkDim,fontSize:12,marginBottom:16,marginTop:4,fontFamily:"Mukta,sans-serif" }}>
        {t.qAiMaxWait}
      </div>
      {[
        [t.qWaiting,`${waiting}`,C.peacock],
        [t.qAvgConsult,"12m",C.saffron],
        [t.qDelayBuf,`+${buffer}m`,buffer>5?C.sindoor:C.mehndi],
      ].map(([k,v,c]) => (
        <div key={k} style={{
          display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"7px 10px",background:C.ivoryDark,borderRadius:7,marginBottom:6,
        }}>
          <span style={{ fontSize:12,color:C.inkDim,fontFamily:"Mukta,sans-serif" }}>{k}</span>
          <span className="mono" style={{ fontSize:12,fontWeight:600,color:c }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function QMyCard({ p, pos, total }) {
  const t = T[useLang()] || T.MR;
  const pct = Math.round((1-pos/(total+1))*100);
  return (
    <div style={{
      background:`linear-gradient(135deg,${C.mehndiSoft} 0%,${C.ivoryDark} 100%)`,
      border:`2px solid ${C.mehndi}55`, borderRadius:16, padding:24, marginBottom:16,
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", right:-30, top:-30, opacity:.4, pointerEvents:"none" }}>
        <RangoliPattern size={160} color={C.mehndi} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, position:"relative" }}>
        <div>
          <div className="tag-india" style={{ color:C.mehndi, marginBottom:5 }}>{t.qMyPos}</div>
          <div style={{ fontFamily:"Mukta,sans-serif",fontWeight:800,fontSize:20,color:C.ink }}>
            {p.name} · {p.token}
          </div>
        </div>
        <MandalaRing size={72} progress={pct} color={C.saffron} bg={C.ivoryDark}>
          <div style={{ textAlign:"center" }}>
            <div className="display" style={{ fontSize:20,color:C.saffron,lineHeight:1 }}>#{pos}</div>
            <div style={{ fontSize:9,color:C.inkDim }}>{t.qPosNum}</div>
          </div>
        </MandalaRing>
      </div>

      <div style={{ marginBottom:18, position:"relative" }}>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:C.inkDim,marginBottom:6,fontFamily:"Mukta,sans-serif" }}>
          <span>{t.qProgress}</span>
          <span style={{ fontWeight:700,color:C.mehndi }}>{pct}{t.qComplete}</span>
        </div>
        <div style={{ height:12,background:"rgba(255,255,255,.8)",borderRadius:6,overflow:"hidden",border:`1px solid ${C.mehndi}33` }}>
          <div style={{
            height:"100%",borderRadius:6,width:`${pct}%`,transition:"width 1.2s ease",
            background:`linear-gradient(90deg,${C.mehndi},${C.saffron})`,
            backgroundSize:"28px 12px",
            animation:"progressStripe .8s linear infinite",
          }} />
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12, position:"relative" }}>
        {[
          { hi:t.qEstWait,     val:`~${p.wait}मि`, color:C.mehndi  },
          { hi:t.qAhead, val:pos-1,          color:C.saffron },
        ].map(item => (
          <div key={item.hi} style={{ padding:"12px 14px",background:"rgba(255,255,255,.8)",
            borderRadius:10,border:`1px solid ${C.border}` }}>
            <div style={{ color:C.inkDim,fontSize:10,marginBottom:3,fontFamily:"Mukta,sans-serif" }}>{item.hi}</div>
            <div style={{ fontSize:9,color:C.inkDim,marginBottom:4 }}>{item.en}</div>
            <div className="mono" style={{ fontWeight:700,fontSize:22,color:item.color }}>{item.val}</div>
          </div>
        ))}
        <button className="btn btn-saffron" style={{ borderRadius:10,fontSize:13,padding:"12px 0" }}>
          {t.qAlertBtn}
        </button>
      </div>
    </div>
  );
}

function QTimeline({ queue }) {
  const t = T[useLang()] || T.MR;
  return (
    <div className="card-india" style={{ overflow:"hidden", borderRadius:16 }}>
      <div style={{
        padding:"15px 24px",borderBottom:`1px solid ${C.ivoryDark}`,
        background:C.ivoryDark,
        display:"flex",justifyContent:"space-between",alignItems:"center",
      }}>
        <h3 style={{ fontFamily:"Mukta,sans-serif",fontWeight:700,fontSize:16,color:C.ink }}>
          {t.qTimelineTitle}
        </h3>
        <span className="tag-india" style={{ color:C.inkDim }}>
          {t.qDeptBadge} · {queue.length}{t.qPatients}
        </span>
      </div>
      {/* Headers */}
      <div style={{
        display:"grid",gridTemplateColumns:"44px 44px 1fr 110px 90px 80px 90px",
        gap:12,padding:"9px 24px",background:"#FAFAF7",borderBottom:`1px solid ${C.ivoryDark}`,
      }}>
        {["#","",t.qColName,t.qColToken,t.qColDept,t.qColTime,t.qColStatus].map((h,i) => (
          <div key={i} className="tag-india" style={{ color:C.inkDim,fontSize:10,letterSpacing:".07em" }}>{h}</div>
        ))}
      </div>
      {queue.map((p,i) => <QRow key={p.id} p={p} i={i} />)}
    </div>
  );
}

function QRow({ p, i }) {
  const t = T[useLang()] || T.MR;
  const [hov, setHov] = useState(false);
  const isMe = p.id==="P04";
  const cfg = {
    consulting:{ label:t.qStatusIn,   bg:C.saffronSoft, text:C.saffron,  border:`${C.saffron}44` },
    next:      { label:t.qStatusNext, bg:C.goldSoft,    text:C.turmeric, border:`${C.turmeric}44`},
    waiting:   { label:t.qStatusWait,bg:"#FAFAF7",    text:C.inkDim,   border:C.border         },
  }[p.status];

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:"grid",gridTemplateColumns:"44px 44px 1fr 110px 90px 80px 90px",
        gap:12,padding:"13px 24px",alignItems:"center",
        borderBottom:`1px solid ${C.ivoryDark}`,
        background:isMe?`${C.mehndi}0A`:hov?C.ivoryDark:"white",
        borderLeft:isMe?`3px solid ${C.mehndi}`:"3px solid transparent",
        transition:"all .18s",
        animation:`fadeUp .3s ease ${i*35}ms both`,
      }}>
      <div className="mono" style={{ fontSize:12,fontWeight:600,color:C.inkDim,textAlign:"center" }}>{i+1}</div>
      <Avatar text={p.avatar} size={34} idx={i} />
      <div>
        <div style={{ fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:7,fontFamily:"Mukta,sans-serif" }}>
          {p.name}
          {isMe && <Badge color={C.mehndi} bg={C.mehndiSoft} border={`${C.mehndi}44`} style={{fontSize:10}}>{t.qStatusYou}</Badge>}
        </div>
        <div style={{ color:C.inkDim,fontSize:12,marginTop:1 }}>{p.nameE} · {p.city}</div>
      </div>
      <div className="mono" style={{ fontSize:13,fontWeight:600,color:C.inkMid }}>{p.token}</div>
      <div style={{ fontSize:13,color:C.inkMid,fontFamily:"Mukta,sans-serif" }}>{p.dept}</div>
      <div>
        {p.status==="consulting" ? (
          <div style={{ display:"flex",gap:2,alignItems:"flex-end",height:18 }}>
            {[1,2,3,4,5].map((n,j) => (
              <div key={j} style={{ width:3,borderRadius:2,background:C.saffron,
                animation:`wave${n} ${.3+j*.08}s ease-in-out infinite` }} />
            ))}
          </div>
        ) : (
          <span className="mono" style={{ fontSize:13,fontWeight:600,
            color:p.status==="next"?C.turmeric:C.inkDim }}>~{p.wait}मि</span>
        )}
      </div>
      <Badge color={cfg.text} bg={cfg.bg} border={cfg.border}>{cfg.label}</Badge>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BOOKING PAGE
═══════════════════════════════════════════ */
function BookPage() {
  const t = T[useLang()] || T.MR;
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp]   = useState(["","","","","",""]);
  const [dept, setDept] = useState("");
  const [slot, setSlot] = useState("");
  const refs = useRef([]);
  const FULL = [2,5,8,11];
  const SLOTS = ["09:00","09:20","09:40","10:00","10:20","10:40","11:00","11:20","11:40","12:00","12:20","12:40"];
  const STEPS = t.bkSteps;

  const handleOtp = (v,i) => {
    if(!/^\d?$/.test(v)) return;
    const n=[...otp]; n[i]=v; setOtp(n);
    if(v&&i<5) refs.current[i+1]?.focus();
  };
  if(done) return <SuccessPage token="अ-०४८" slot={slot||"11:00"} dept={dept||t.qDeptBadge} />;

  return (
    <section className="page" style={{ padding:"90px 40px 60px", maxWidth:660, margin:"0 auto", position:"relative" }}>
      <div style={{ position:"absolute", right:-40, top:80, opacity:.4, pointerEvents:"none" }}>
        <RangoliPattern size={200} color={C.saffron} />
      </div>
      <div style={{ marginBottom:28 }}>
        <Badge color={C.saffron} bg={C.saffronSoft} border={`${C.saffron}44`}>{t.bkBadge}</Badge>
        <h2 className="display" style={{ fontSize:34,color:C.ink,marginTop:10 }}>
          {t.bkTitle}
        </h2>
        <PaisleyBorder color={C.saffron} opacity={.3} />
      </div>

      {/* Stepper */}
      <div style={{ display:"flex",alignItems:"center",marginBottom:32 }}>
        {STEPS.map((s,i) => (
          <div key={s} style={{ display:"flex",alignItems:"center",flex:i<3?1:"none" }}>
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
              <div style={{
                width:38,height:38,borderRadius:"50%",flexShrink:0,
                background:i+1<step?C.mehndi:i+1===step?C.saffron:C.ivoryDark,
                border:`2px solid ${i+1<step?C.mehndi:i+1===step?C.saffron:C.border}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                color:i+1<=step?"#FFFFFF":C.inkDim, fontWeight:700, fontSize:14,
                transition:"all .3s",
                boxShadow:i+1===step?`0 0 0 5px ${C.saffron}22`:"none",
              }}>
                {i+1<step
                  ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <span className="devanagari" style={{ fontSize:16 }}>{["१","२","३","४"][i]}</span>}
              </div>
              <span style={{ fontSize:11,fontWeight:600,color:i+1===step?C.saffron:C.inkDim,
                fontFamily:"Mukta,sans-serif",whiteSpace:"nowrap" }}>{s}</span>
            </div>
            {i<3 && <div style={{ flex:1,height:2,margin:"0 8px",marginBottom:18,
              background:i+1<step?C.mehndi:C.border,transition:"background .5s" }} />}
          </div>
        ))}
      </div>

      <div className="card-india" style={{ padding:32 }} key={step}>
        {step===1 && (
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
              <div style={{ width:44,height:44,borderRadius:12,
                background:`linear-gradient(135deg,${C.ashokaHi},${C.peacock})`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>🪪</div>
              <div>
                <div style={{ fontFamily:"Mukta,sans-serif",fontWeight:700,fontSize:18,color:C.ink }}>
                  {t.bkS1Title}
                </div>
                <div style={{ fontSize:13,color:C.inkDim }}>{t.bkS1Sub}</div>
              </div>
            </div>
            <input value={phone} onChange={e=>setPhone(e.target.value)}
              placeholder="+91 · · · · · · · · · ·"
              style={{
                width:"100%",padding:"13px 16px",
                border:`1.5px solid ${C.border}`,borderRadius:11,
                fontSize:16,fontFamily:"JetBrains Mono,monospace",
                color:C.ink,background:C.ivory,marginBottom:16,outline:"none",
                transition:"border .2s",
              }}
              onFocus={e=>e.target.style.borderColor=C.saffron}
              onBlur={e=>e.target.style.borderColor=C.border}
            />
            <div style={{
              background:C.ashokaSoft,border:`1px solid ${C.ashokaHi}33`,
              borderRadius:10,padding:"10px 14px",fontSize:12,color:C.ashokaHi,marginBottom:20,
              display:"flex",gap:8,alignItems:"flex-start",fontFamily:"Mukta,sans-serif",
            }}>
              <AshokaChakra size={18} color={C.ashokaHi} />
              <span>{t.bkS1Info}</span>
            </div>
            <button className="btn btn-saffron" onClick={()=>setStep(2)}
              style={{ width:"100%",borderRadius:11,padding:"13px",fontSize:16 }}>
              {t.bkS1Btn}
            </button>
          </div>
        )}

        {step===2 && (
          <div>
            <div style={{ fontFamily:"Mukta,sans-serif",fontWeight:700,fontSize:20,marginBottom:6,color:C.ink }}>
              {t.bkS2Title}
            </div>
            <p style={{ color:C.inkDim,fontSize:14,marginBottom:24,fontFamily:"Mukta,sans-serif" }}>
              {t.bkS2Sub}{phone||"XXXXXXXXXX"}
            </p>
            <div style={{ display:"flex",gap:10,justifyContent:"center",marginBottom:28 }}>
              {otp.map((d,i) => (
                <input key={i} ref={el=>refs.current[i]=el}
                  value={d} maxLength={1} onChange={e=>handleOtp(e.target.value,i)}
                  onKeyDown={e=>{ if(e.key==="Backspace"&&!d&&i>0) refs.current[i-1]?.focus(); }}
                  style={{
                    width:50,height:58,textAlign:"center",fontSize:24,
                    fontFamily:"Yatra One,serif",fontWeight:900,
                    border:`2px solid ${d?C.saffron:C.border}`,borderRadius:12,
                    background:d?C.saffronSoft:C.ivory,color:C.ink,
                    transition:"all .15s",outline:"none",
                  }}
                />
              ))}
            </div>
            <button className="btn btn-saffron" onClick={()=>setStep(3)}
              style={{ width:"100%",borderRadius:11,padding:"13px",fontSize:16 }}>
              {t.bkS2Btn}
            </button>
          </div>
        )}

        {step===3 && (
          <div>
            <div style={{ fontFamily:"Mukta,sans-serif",fontWeight:700,fontSize:20,marginBottom:16,color:C.ink }}>
              {t.bkS3Title}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:24 }}>
              {DEPTS.map(d => (
                <button key={d.en} onClick={()=>setDept(d.hi)} style={{
                  background:dept===d.hi?C.saffronSoft:C.ivory,
                  border:`1.5px solid ${dept===d.hi?C.saffron:C.border}`,
                  borderRadius:10,padding:"11px 14px",textAlign:"left",cursor:"pointer",
                  transition:"all .18s",
                  display:"flex",alignItems:"center",gap:8,
                }}>
                  <span style={{ fontSize:20 }}>{d.icon}</span>
                  <div>
                    <div style={{ fontFamily:"Mukta,sans-serif",fontWeight:700,fontSize:13,
                      color:dept===d.hi?C.saffron:C.inkMid }}>{d.hi}</div>
                    <div style={{ fontSize:11,color:C.inkDim }}>{d.en} · {d.wait}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ fontSize:13,fontWeight:600,color:C.inkMid,marginBottom:8,fontFamily:"Mukta,sans-serif" }}>
              {t.bkS3Slots}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:24 }}>
              {SLOTS.map((s,i) => {
                const full=FULL.includes(i);
                return (
                  <button key={s} onClick={()=>!full&&setSlot(s)} disabled={full}
                    style={{
                      background:full?C.ivory:slot===s?C.saffronSoft:C.ivory,
                      border:`1.5px solid ${full?C.border:slot===s?C.saffron:C.border}`,
                      borderRadius:10,padding:"10px 4px",fontSize:13,cursor:full?"not-allowed":"pointer",
                      color:full?C.inkDim:slot===s?C.saffron:C.inkMid,
                      fontFamily:"JetBrains Mono,monospace",fontWeight:600,
                      transition:"all .18s",opacity:full?.45:1,
                    }}>
                    {s}
                    {full && <div style={{fontSize:9,marginTop:2,color:C.sindoor,fontFamily:"Mukta,sans-serif"}}>{t.bkS3Full}</div>}
                  </button>
                );
              })}
            </div>
            <button className="btn btn-saffron" onClick={()=>setStep(4)}
              style={{ width:"100%",borderRadius:11,padding:"13px",fontSize:16 }}>
              {t.bkS3Btn}
            </button>
          </div>
        )}

        {step===4 && (
          <div>
            <div style={{ fontFamily:"Mukta,sans-serif",fontWeight:700,fontSize:20,marginBottom:20,color:C.ink }}>
              {t.bkS4Title}
            </div>
            <div style={{ background:C.ivory,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:24 }}>
              {[
                [t.bkS4Row[0],t.bkS4Row[1],dept||t.qDeptBadge],
                [t.bkS4Row[2],t.bkS4Row[3],t.bkS4RowV[0]],
                [t.bkS4Row[4],t.bkS4Row[5],slot||"11:00 AM"],
                [t.bkS4Row[6],t.bkS4Row[7],t.bkS4RowV[1]],
                [t.bkS4Row[8],t.bkS4Row[9],t.bkS4RowV[2]],
              ].map(([ic,k,v],i) => (
                <div key={k} style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"12px 18px",borderBottom:i<4?`1px solid ${C.ivoryDark}`:"none",
                }}>
                  <span style={{fontSize:18}}>{ic}</span>
                  <span style={{flex:1,fontSize:14,color:C.inkDim,fontFamily:"Mukta,sans-serif"}}>{k}</span>
                  <span className="mono" style={{fontSize:14,fontWeight:600,color:C.ink}}>{v}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-saffron" onClick={()=>setDone(true)}
              style={{ width:"100%",borderRadius:11,padding:"14px",fontSize:16 }}>
              {t.bkConfirmBtn}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function SuccessPage({ token, slot, dept }) {
  const t = T[useLang()] || T.MR;
  return (
    <section className="page" style={{ padding:"100px 40px 60px",maxWidth:520,margin:"0 auto",textAlign:"center" }}>
      <div style={{ position:"relative",width:100,height:100,margin:"0 auto 28px" }}>
        <div style={{ position:"absolute",inset:0,borderRadius:"50%",
          border:`2.5px solid ${C.mehndi}`,animation:"ringOut 1s ease .2s both" }} />
        <div style={{
          width:100,height:100,borderRadius:"50%",
          background:`linear-gradient(135deg,${C.mehndiSoft},${C.saffronSoft})`,
          border:`2px solid ${C.mehndi}55`,
          display:"flex",alignItems:"center",justifyContent:"center",
          animation:"tokenPop .6s cubic-bezier(.34,1.56,.64,1) both",
        }}>
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <path d="M8 22L18 32L36 12" stroke={C.mehndi} strokeWidth="3.5"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray:80,animation:"checkDraw .5s ease .5s both" }}
            />
          </svg>
        </div>
      </div>
      <h2 className="display" style={{ fontSize:34,marginBottom:6,color:C.ink }}>
        {t.bkSuccessTitle}
      </h2>
      <p style={{ color:C.inkDim,fontSize:16,marginBottom:28,fontFamily:"Mukta,sans-serif" }}>
        {t.bkSuccessSub}
      </p>
      <div style={{
        background:`linear-gradient(135deg,${C.saffron},${C.saffronHi})`,
        borderRadius:20,padding:32,marginBottom:20,color:"white",
        boxShadow:`0 20px 60px rgba(232,93,4,.35)`,
        position:"relative",overflow:"hidden",
      }}>
        <div style={{ position:"absolute",right:-30,bottom:-30,opacity:.12,pointerEvents:"none" }}>
          <RangoliPattern size={160} color="#FFFFFF" />
        </div>
        <div style={{ opacity:.8,fontSize:12,fontWeight:600,letterSpacing:".08em",marginBottom:8 }}>
          {t.bkToken}
        </div>
        <div className="display" style={{ fontSize:68,fontWeight:900,lineHeight:1 }}>{token}</div>
        <div style={{ opacity:.8,marginTop:8,fontSize:14,fontFamily:"Mukta,sans-serif" }}>{dept} · {slot}</div>
        <div style={{
          marginTop:20,background:"rgba(255,255,255,.18)",borderRadius:12,
          padding:"12px 16px",fontSize:13,lineHeight:1.6,fontFamily:"Mukta,sans-serif",
        }}>
          {t.bkWhatsApp}
        </div>
      </div>
      <div style={{
        background:C.goldSoft,border:`1px solid ${C.turmeric}44`,borderRadius:12,
        padding:"13px 18px",color:C.turmeric,fontSize:13,lineHeight:1.65,marginBottom:24,
        fontFamily:"Mukta,sans-serif",
      }}>
        {t.bkWarn}
      </div>
      <div style={{ display:"flex",gap:12 }}>
        <button className="btn btn-outline-india" style={{ flex:1,borderRadius:11,padding:"12px" }}>
          {t.bkPdf}
        </button>
        <button className="btn btn-saffron" style={{ flex:1,borderRadius:11,padding:"12px" }}>
          {t.bkTrack}
        </button>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   ADMIN PAGE
═══════════════════════════════════════════ */
function fetchData(endpoint) {
  return fetch(`http://localhost:3001/${endpoint}`).then(res => res.json());
}

async function saveData(endpoint, data) {
  await fetch(`http://localhost:3001/${endpoint}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
}

function AdminPage() {
  const t = T[useLang()] || T.MR;
  const [docs, setDocs] = useState(DOCTORS);
  const [patients, setPatients] = useState(QUEUE);
  const [alert, setAlert] = useState(false);
  const MAX = Math.max(...TRAFFIC);

  useEffect(() => {
    fetchData('doctors').then(setDocs).catch(() => {});
    fetchData('patients').then(setPatients).catch(() => {});
  }, []);

  const toggle = id => {
    setDocs(prev => {
      const newDocs = prev.map(d => d.id===id ? {...d,status:d.status==="paused"?"active":"paused"} : d);
      saveData('doctors', newDocs).catch(() => {});
      return newDocs;
    });
  };

  const exportCSV = () => {
    const csv = Papa.unparse(patients);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hospital-queue.csv';
    a.click();
  };

  return (
    <section className="page" style={{ padding:"90px 40px 60px",maxWidth:1200,margin:"0 auto",position:"relative" }}>
      <div style={{ position:"absolute",left:-60,top:80,opacity:.5,pointerEvents:"none" }}>
        <RangoliPattern size={280} color={C.turmeric} />
      </div>

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:32,position:"relative",zIndex:1 }}>
        <div>
          <div style={{ display:"flex", gap:10, marginBottom:10, alignItems:"center" }}>
            {/* Flag badge in admin */}
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              background:"#FFFFFF", border:`1px solid ${C.border}`,
              borderRadius:12, padding:"6px 14px 6px 8px",
              boxShadow:"0 2px 8px rgba(0,0,0,.06)",
            }}>
              <IndianFlag width={34} shadow={false} wave={true} />
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:C.ashokaHi, letterSpacing:".05em", fontFamily:"Mukta,sans-serif" }}>
                  {t.adGovBadge}
                </div>
                <div style={{ fontSize:9, color:C.inkDim, fontFamily:"Mukta,sans-serif" }}>{t.adGovSub}</div>
              </div>
            </div>
            <Badge color={C.ashoka} bg={C.ashokaSoft}>
              <AshokaChakra size={12} color={C.ashoka} spinning /> {t.adAdminBadge}
            </Badge>
            <Badge color={C.saffron} bg={C.saffronSoft}>⚙️ COMMAND CENTRE</Badge>
          </div>
          <h2 className="display" style={{ fontSize:34,color:C.ink }}>{t.adTitle}</h2>
          <p style={{ color:C.inkDim,marginTop:4,fontFamily:"Mukta,sans-serif",fontSize:14 }}>
            Hospital Control Panel · Govt. District Hospital, Pune
          </p>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setAlert(a=>!a)} style={{
            background:alert?C.sindoorSoft:"white",
            border:`2px solid ${alert?C.sindoorHi:C.sindoor+"44"}`,
            borderRadius:10,padding:"10px 20px",color:C.sindoor,fontWeight:700,fontSize:13,
            cursor:"pointer",fontFamily:"Mukta,sans-serif",display:"flex",alignItems:"center",gap:8,
            boxShadow:alert?`0 0 0 4px ${C.sindoor}22`:"none",
            animation:alert?"glow 1.5s ease-in-out infinite":"none",
          }}>
            <span style={{ animation:alert?"petal .8s ease-in-out infinite":"none",display:"inline-block" }}>🚨</span>
            {alert?"t.adEmergOn":"t.adEmergOff"}
          </button>
          <button className="btn btn-saffron" style={{ borderRadius:10,padding:"10px 22px",fontSize:13 }}>
            {t.adAddDoc}
          </button>
          <button className="btn btn-ghost-india" onClick={exportCSV} style={{ borderRadius:10,padding:"10px 20px",fontSize:13 }}>
            📊 Export Queue CSV
          </button>
          <button className="btn btn-ghost-india" onClick={() => {
            const csv = Papa.unparse(patients);
            const blob = new Blob([csv], {type: 'text/csv'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'queue.csv';
            a.click();
          }} style={{ borderRadius:10,padding:"10px 18px",fontSize:13 }}>
            📊 Export CSV
          </button>
        </div>
      </div>

      {alert && (
        <div style={{
          background:C.sindoorSoft,border:`2px solid ${C.sindoor}44`,borderRadius:12,
          padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:12,
          color:C.sindoor,animation:"fadeUp .3s ease",fontFamily:"Mukta,sans-serif",
          position:"relative",zIndex:1,
        }}>
          <span style={{ fontSize:22 }}>🚨</span>
          <div>
            <strong>{t.adEmergOn}.</strong> {t.adAlertMsg}
          </div>
          <button onClick={()=>setAlert(false)} style={{
            marginLeft:"auto",background:C.sindoorSoft,border:`1px solid ${C.sindoor}44`,
            borderRadius:8,padding:"5px 12px",color:C.sindoor,cursor:"pointer",
            fontWeight:700,fontSize:12,fontFamily:"Mukta,sans-serif",
          }}>{t.adAlertDeact}</button>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:22,position:"relative",zIndex:1 }}>
        {[
          { label:t.adKpi[0].label, icon:t.adKpi[0].icon, val:docs.filter(d=>d.status==='active').length, suf:"", color:C.saffron },
          { label:t.adKpi[1].label, icon:t.adKpi[1].icon, val:23, suf:"m", color:C.peacock },
          { label:t.adKpi[2].label, icon:t.adKpi[2].icon, val:0, suf:"", color:C.mehndi },
          { label:t.adKpi[3].label, icon:t.adKpi[3].icon, val:docs.filter(d=>d.status==='active').length, suf:"", color:C.turmeric },
        ].map((s,i) => <KpiCard key={i} label={s.label} icon={s.icon} val={s.val} suf={s.suf} color={s.color} delay={i*60} />)}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1.2fr",gap:22,position:"relative",zIndex:1 }}>
        {/* Doctor Roster */}
        <div className="card-india" style={{ overflow:"hidden" }}>
          <div style={{
            padding:"16px 22px",borderBottom:`1px solid ${C.ivoryDark}`,
            display:"flex",justifyContent:"space-between",alignItems:"center",background:C.ivoryDark,
          }}>
            <h3 style={{ fontFamily:"Mukta,sans-serif",fontWeight:700,fontSize:16 }}>
              {t.adRoster}
            </h3>
            <Badge color={C.mehndi} bg={C.mehndiSoft}>
              {docs.filter(d=>d.status==="active").length} {t.adActive}
            </Badge>
          </div>
          {docs.map((doc,i) => (
            <div key={doc.id} style={{
              padding:"16px 22px",borderBottom:i<docs.length-1?`1px solid ${C.ivoryDark}`:"none",
              background:doc.status==="paused"?C.goldSoft:"white",transition:"background .3s",
            }}>
              <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                <Avatar text={doc.avatar} size={44} idx={i} ring />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:14,fontFamily:"Mukta,sans-serif" }}>{doc.name}</div>
                  <div style={{ color:C.inkDim,fontSize:12,marginTop:1 }}>
                    {doc.nameE} · {doc.dept}
                  </div>
                  <div style={{
                    height:5,background:C.ivoryDark,borderRadius:3,marginTop:6,overflow:"hidden",
                    border:`1px solid ${C.border}`,
                  }}>
                    <div style={{
                      height:"100%",borderRadius:3,transition:"width .8s ease",
                      width:`${(doc.seen/doc.cap)*100}%`,
                      background:doc.status==="paused"
                        ? `linear-gradient(90deg,${C.sindoor},${C.saffronHi})`
                        : `linear-gradient(90deg,${doc.color},${doc.color}99)`,
                    }} />
                  </div>
                  <div style={{ fontSize:11,color:C.inkDim,marginTop:3,fontFamily:"Mukta,sans-serif" }} className="mono">
                    {doc.seen}/{doc.cap} · ⭐ {doc.rating}
                  </div>
                </div>
                <button onClick={()=>toggle(doc.id)} style={{
                  background:doc.status==="paused"?C.mehndiSoft:C.sindoorSoft,
                  border:`1.5px solid ${doc.status==="paused"?C.mehndi+"55":C.sindoor+"55"}`,
                  borderRadius:9,padding:"6px 14px",fontSize:12,fontWeight:700,
                  color:doc.status==="paused"?C.mehndi:C.sindoor,
                  cursor:"pointer",fontFamily:"Mukta,sans-serif",transition:"all .2s",
                }}>
                  {doc.status==="paused"?t.adResume:t.adPause}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Traffic Chart */}
        <div className="card-india" style={{ padding:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:20 }}>
            <div>
              <h3 style={{ fontFamily:"Mukta,sans-serif",fontWeight:700,fontSize:16 }}>
                {t.adTrafficTitle}
              </h3>
              <p style={{ color:C.inkDim,fontSize:13,marginTop:2,fontFamily:"Mukta,sans-serif" }}>
                {t.adTrafficSub}
              </p>
            </div>
            <div style={{ textAlign:"right" }}>
              <MandalaRing size={52} progress={94} color={C.saffron} bg={C.ivoryDark}>
                <span style={{ fontSize:11,fontWeight:700,color:C.saffron }}>94</span>
              </MandalaRing>
              <div style={{ fontSize:11,color:C.inkDim,marginTop:3,fontFamily:"Mukta,sans-serif" }}>
                {t.adPeak}
              </div>
            </div>
          </div>
          <div style={{ display:"flex",gap:7,alignItems:"flex-end",height:130,marginBottom:10 }}>
            {TRAFFIC.map((v,i) => {
              const hrs = ["8","9","10","11","12","1","2","3","4"];
              return (
                <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,height:"100%" }}>
                  <div style={{
                    width:"100%",borderRadius:"6px 6px 0 0",marginTop:"auto",
                    height:`${(v/MAX)*116}px`,
                    background:v===MAX
                      ? `linear-gradient(180deg,${C.saffron},${C.saffronHi})`
                      : `linear-gradient(180deg,${C.saffron}66,${C.saffron}33)`,
                    animation:`barRise .5s ease ${i*50}ms both`,
                    cursor:"pointer",transition:"all .2s",
                    position:"relative",
                  }}>
                    {v===MAX && (
                      <div style={{
                        position:"absolute",top:-22,left:"50%",transform:"translateX(-50%)",
                        background:C.saffron,color:"white",borderRadius:4,
                        padding:"2px 7px",fontSize:10,fontWeight:700,whiteSpace:"nowrap",
                      }}>{t.adPeakLabel}</div>
                    )}
                  </div>
                  <div style={{ color:C.inkDim,fontSize:10,fontWeight:600,fontFamily:"Mukta,sans-serif" }}>{hrs[i]}</div>
                </div>
              );
            })}
          </div>
          <PaisleyBorder color={C.saffron} opacity={.25} />
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:16 }}>
            {[
              { label:t.adPeriods[0].label, sub:t.adPeriods[0].sub, val:155, color:C.saffron  },
              { label:t.adPeriods[1].label, sub:t.adPeriods[1].sub, val:91,  color:C.turmeric },
              { label:t.adPeriods[2].label, sub:t.adPeriods[2].sub, val:136, color:C.peacock  },
            ].map(item => (
              <div key={item.hi} style={{
                padding:"10px 12px",background:C.ivoryDark,borderRadius:10,border:`1px solid ${C.border}`,
              }}>
                <div style={{ display:"flex",gap:5,alignItems:"center",marginBottom:3 }}>
                  <div style={{ width:8,height:8,borderRadius:2,background:item.color }} />
                  <span style={{ fontSize:12,fontWeight:700,color:C.inkMid,fontFamily:"Mukta,sans-serif" }}>{item.label}</span>
                </div>
                <div style={{ fontSize:9,color:C.inkDim,marginBottom:4,fontFamily:"Mukta,sans-serif" }}>{item.sub}</div>
                <div style={{ fontFamily:"Yatra One,serif",fontSize:24,color:item.color }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, val, suf, color, icon, delay }) {
  const v = useCounter(val, 1800, 200+delay);
  return (
    <div className="card-india" style={{
      padding:22,animation:`fadeUp .4s ease ${delay}ms both`,
      borderTop:`4px solid ${color}`,
    }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:"Mukta,sans-serif",fontSize:13,color:C.inkDim,marginBottom:3 }}>{label}</div>
          <div style={{
            fontFamily:"Yatra One,serif",fontWeight:900,fontSize:40,
            color,letterSpacing:"-.02em",lineHeight:1,
          }}>{v}{suf}</div>
        </div>
        <div style={{
          width:46,height:46,borderRadius:14,
          background:`${color}18`,border:`1px solid ${color}33`,
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
        }}>{icon}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CHATBOT
═══════════════════════════════════════════ */
function ChatbotWidget() {
  const [open, setOpen]   = useState(false);
  const [rec, setRec]     = useState(false);
  const [input, setInput] = useState("");
  const [typing, setType] = useState(false);
  const [msgs, setMsgs]   = useState([{
    role:"bot",
    text:"नमस्ते! 🙏 मी आरोग्य सेतु AI सहाय्यक आहे. लक्षणे, रांग, किंवा भेट बुकिंग बद्दल विचारा.\n\nHello! I'm your ArogyaSetu AI. Ask about symptoms, queue, or booking.",
  }]);
  const scrollRef = useRef();

  const REPLIES = [
    "तुमच्या लक्षणांनुसार सामान्य ओपीडीत जाणे योग्य आहे. आत्ता ~१७ मिनिटांची प्रतीक्षा आहे. भेट बुक करायची का?\n\nBased on symptoms, General OPD is recommended. ~17min wait.",
    "तुमची भेट अ-०४७ आजसाठी ११:३० वाजता निश्चित आहे. तुम्ही सध्या #४ क्रमांकावर आहात.\n\nYour appointment A-047 is confirmed for 11:30 AM. You're #4 in queue.",
    "हृदयरोग विभागात आज दुपारी २-४ दरम्यान ४ स्लॉट उपलब्ध आहेत.\n\nCardiology has 4 slots between 2–4 PM today.",
    "तुम्ही पुढे २ रुग्णांनंतर आहात तेव्हा WhatsApp सूचना येईल.\n\nYou'll get a WhatsApp alert when 2 patients are ahead.",
  ];

  const send = () => {
    if(!input.trim()) return;
    setMsgs(m=>[...m,{role:"user",text:input}]);
    setInput(""); setType(true);
    setTimeout(() => {
      setType(false);
      setMsgs(m=>[...m,{role:"bot",text:REPLIES[Math.floor(Math.random()*REPLIES.length)]}]);
    }, 1300);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({top:99999,behavior:"smooth"});
  },[msgs,typing]);

  const CHIPS = ["लक्षणे","रांग","भेट बुक","जवळचे OPD"];

  return (
    <div style={{ position:"fixed",bottom:28,right:28,zIndex:400 }}>
      {!open ? (
        <div style={{ position:"relative" }}>
          <div style={{
            position:"absolute",inset:-12,borderRadius:"50%",
            border:`2px solid ${C.saffron}33`,animation:"ringOut 2s ease-in-out infinite",
          }} />
          <button onClick={()=>setOpen(true)} style={{
            width:62,height:62,borderRadius:"50%",
            background:`linear-gradient(135deg,${C.saffron},${C.saffronHi})`,
            border:"3px solid #FFFDF7",display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:28,cursor:"pointer",
            boxShadow:`0 8px 28px rgba(232,93,4,.45)`,
            animation:"floatUp 3s ease-in-out infinite, glow 3s ease-in-out infinite",
          }}>🤖
            <div style={{ position:"absolute",top:-2,right:-2,width:20,height:20,
              borderRadius:"50%",background:C.sindoor,border:"2.5px solid #FFFDF7",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:10,fontWeight:800,color:"white",fontFamily:"Mukta,sans-serif",
            }}>१</div>
          </button>
        </div>
      ) : (
        <div style={{
          width:365,height:530,borderRadius:22,
          background:"#FFFDF7",border:`1px solid ${C.border}`,
          boxShadow:`0 32px 80px rgba(0,0,0,.18),0 8px 24px rgba(232,93,4,.14)`,
          display:"flex",flexDirection:"column",
          animation:"expandBot .38s cubic-bezier(.34,1.56,.64,1) both",
          overflow:"hidden",
        }}>
          {/* Tri-color strip */}
          <div style={{ height:4,background:`linear-gradient(90deg,${C.saffron},${C.turmeric} 33%,white 33%,white 66%,${C.mehndi} 66%)` }} />

          {/* Header */}
          <div style={{
            padding:"13px 18px",
            background:`linear-gradient(135deg,${C.saffron} 0%,${C.saffronHi} 100%)`,
            display:"flex",alignItems:"center",gap:12,
          }}>
            <div style={{
              width:40,height:40,borderRadius:"50%",flexShrink:0,
              background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.5)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:22,animation:"floatUp 3s ease-in-out infinite",
            }}>🤖</div>
            <div style={{ flex:1 }}>
              <div style={{ color:"#FFF",fontWeight:800,fontSize:15,fontFamily:"Mukta,sans-serif" }}>
                आरोग्य सहाय्यक
              </div>
              <div style={{ color:"rgba(255,255,255,.75)",fontSize:11 }}>
                ● AI Health Assistant · ऑनलाइन
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:6 }}>
              <AshokaChakra size={18} color="rgba(255,255,255,.7)" spinning />
              <button onClick={()=>setOpen(false)} style={{
                background:"rgba(255,255,255,.2)",border:"none",color:"white",
                width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:17,
                display:"flex",alignItems:"center",justifyContent:"center",
              }}>×</button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10,
          }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ animation:"fadeUp .22s ease both" }}>
                <div style={{
                  maxWidth:"85%",marginLeft:m.role==="user"?"auto":"0",
                  background:m.role==="user"
                    ? `linear-gradient(135deg,${C.saffron},${C.saffronHi})`
                    : "#FFFFFF",
                  border:m.role==="bot"?`1px solid ${C.border}`:"none",
                  borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  padding:"11px 14px",
                  color:m.role==="user"?"white":C.ink,
                  fontSize:13,lineHeight:1.6,
                  boxShadow:m.role==="bot"?"0 2px 8px rgba(0,0,0,.06)":"none",
                  fontFamily:"Mukta,sans-serif",whiteSpace:"pre-line",
                }}>{m.text}</div>
                {m.role==="bot"&&i===0&&(
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:8 }}>
                    {CHIPS.map(c=>(
                      <button key={c} onClick={()=>setMsgs(ms=>[...ms,{role:"user",text:c}])} style={{
                        background:"#FFFFFF",border:`1px solid ${C.saffron}55`,borderRadius:20,
                        padding:"4px 12px",fontSize:12,color:C.saffron,fontWeight:600,
                        cursor:"pointer",fontFamily:"Mukta,sans-serif",transition:"all .15s",
                      }}>{c}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ animation:"fadeIn .2s ease" }}>
                <div style={{
                  background:"#FFFFFF",border:`1px solid ${C.border}`,
                  borderRadius:"16px 16px 16px 4px",
                  padding:"12px 16px",display:"inline-flex",
                }}>
                  <div className="dot-loader" style={{ display:"flex",gap:4 }}>
                    <span/><span/><span/>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Voice wave */}
          {rec && (
            <div style={{ padding:"9px 18px",background:C.sindoorSoft,
              display:"flex",alignItems:"center",justifyContent:"center",gap:4 }}>
              {[1,2,3,4,5,4,3,2,1,5,3].map((n,i) => (
                <div key={i} style={{ width:3,borderRadius:2,background:C.sindoor,
                  animation:`wave${Math.min(n,5)} ${.3+i*.04}s ease-in-out infinite` }} />
              ))}
              <span style={{ color:C.sindoor,fontSize:11,fontWeight:600,marginLeft:8,fontFamily:"Mukta,sans-serif" }}>
                रेकॉर्डिंग…
              </span>
            </div>
          )}

          {/* Input */}
          <div style={{
            padding:"11px 13px",borderTop:`1px solid ${C.ivoryDark}`,
            background:"#FFFDF7",display:"flex",gap:8,alignItems:"center",
          }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send()}
              placeholder="लक्षणे, स्लॉट विचारा…"
              style={{
                flex:1,padding:"10px 13px",background:"#FFFFFF",
                border:`1.5px solid ${C.border}`,borderRadius:11,
                fontSize:13,color:C.ink,outline:"none",
                transition:"border .2s",fontFamily:"Mukta,sans-serif",
              }}
              onFocus={e=>e.target.style.borderColor=C.saffron}
              onBlur={e=>e.target.style.borderColor=C.border}
            />
            <button onClick={()=>setRec(r=>!r)} style={{
              width:38,height:38,borderRadius:"50%",
              background:rec?C.sindoorSoft:C.ivoryDark,
              border:`1.5px solid ${rec?C.sindoor:C.border}`,
              cursor:"pointer",fontSize:18,transition:"all .2s",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>🎤</button>
            <button onClick={send} style={{
              width:38,height:38,borderRadius:"50%",
              background:`linear-gradient(135deg,${C.saffron},${C.saffronHi})`,
              border:"none",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 4px 12px rgba(232,93,4,.4)`,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("Home");
  const [lang, setLang] = useState("MR");
  const [trans, setTrans] = useState(false);

  const go = useCallback(p => {
    if(p===page) return;
    setTrans(true);
    setTimeout(() => { setPage(p); setTrans(false); window.scrollTo({top:0}); }, 200);
  }, [page]);

  return (
    <LangCtx.Provider value={lang}>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:C.cream }}>
        <Navbar page={page} setPage={go} lang={lang} setLang={setLang} />

        <div style={{
          opacity:trans?0:1,transform:trans?"translateY(12px)":"none",
          transition:"opacity .2s,transform .2s",
        }}>
          {page==="Home"  && <HomePage  setPage={go} />}
          {page==="Queue" && <QueuePage />}
          {page==="Book"  && <BookPage  />}
          {page==="Admin" && <AdminPage />}
        </div>

        {/* Footer */}
        <footer style={{
          padding:"40px 40px",borderTop:`1px solid ${C.border}`,
          background:"#FFFFFF",
          display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20,
        }}>
          <div style={{ display:"flex",alignItems:"center",gap:14 }}>
            <IndianFlag width={56} shadow={true} wave={true} />
            <div style={{ width:1, height:38, background:C.border }} />
            <div style={{
              width:36,height:36,borderRadius:10,
              background:`linear-gradient(135deg,${C.saffron},${C.saffronHi})`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 3px 10px rgba(232,93,4,.3)`,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="7.5" y="1" width="3" height="16" rx="1.5" fill="white" opacity=".9"/>
                <rect x="1" y="7.5" width="16" height="3" rx="1.5" fill="white" opacity=".9"/>
              </svg>
            </div>
            <div>
              <div className="display" style={{ fontSize:16,color:C.ink }}>आरोग्य सेतु · ArogyaSetu</div>
              <TricolorStrip />
              <div className="tag-india" style={{ color:C.inkDim,fontSize:9,marginTop:3 }}>
                महाराष्ट्र शासन · GOVT. OF MAHARASHTRA DIGITAL HEALTH
              </div>
            </div>
          </div>
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <AshokaChakra size={20} color={C.ashoka} spinning />
            <span style={{ fontSize:12,color:C.inkDim,fontFamily:"Mukta,sans-serif" }}>
              सत्यमेव जयते · Truth Alone Triumphs
            </span>
          </div>
          <div style={{ display:"flex",gap:20 }}>
            {["गोपनीयता","नियम","तक्रार","संपर्क"].map(l => (
              <button key={l} style={{ background:"none",border:"none",color:C.inkDim,fontSize:13,
                cursor:"pointer",fontFamily:"Mukta,sans-serif" }}>{l}</button>
            ))}
          </div>
          <div style={{ color:C.inkDim,fontSize:12,fontFamily:"Mukta,sans-serif" }}>
            सार्वजनिक आरोग्यासाठी ♥ सह बनवले · 2025
          </div>
        </footer>
      </div>
      <ChatbotWidget />
    </LangCtx.Provider>
  );
}
