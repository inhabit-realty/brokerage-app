import { useState } from "react";

const B = {
  prussian:  "#1A3044",
  onyx:      "#1A1A1A",
  canvas:    "#F8F6F2",
  gold:      "#8A6500",
  goldLight: "#C4922A",
  ash:       "#7A7A7A",
  mist:      "#E8E4DC",
  white:     "#FFFFFF",
};

function getLuminance(hex) {
  const r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  const l=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
  return 0.2126*l(r)+0.7152*l(g)+0.0722*l(b);
}
function contrast(a,b){
  const l1=getLuminance(a),l2=getLuminance(b);
  return((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(1);
}

const BlueprintGrid = ({ opacity = 0.03, color = "#fff" }) => (
  <>
    {[...Array(12)].map((_,i)=><div key={`h${i}`} style={{position:"absolute",left:0,right:0,top:`${(i+1)*8.3}%`,height:1,background:color,opacity}}/>)}
    {[...Array(12)].map((_,i)=><div key={`v${i}`} style={{position:"absolute",top:0,bottom:0,left:`${(i+1)*8.3}%`,width:1,background:color,opacity}}/>)}
  </>
);

const Section = ({ id, children, bg = B.white, style = {} }) => (
  <section id={id} style={{ background: bg, padding: "72px 0", ...style }}>
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 40px" }}>{children}</div>
  </section>
);

const Label = ({ children, color = B.goldLight }) => (
  <div style={{ fontSize: 9, letterSpacing: 5, textTransform: "uppercase", color, fontFamily: "DM Sans, sans-serif", marginBottom: 14, fontWeight: 600 }}>{children}</div>
);

const nav = [
  { id:"brand", label:"Brand" },
  { id:"color", label:"Color" },
  { id:"type",  label:"Type" },
  { id:"logo",  label:"Logo" },
  { id:"voice", label:"Voice" },
  { id:"ui",    label:"UI" },
  { id:"values",label:"Values" },
];

const colors = [
  {
    name: "Prussian",
    hex: B.prussian,
    role: "Signature",
    pantone: "Pantone 296 C",
    ral: "RAL 5003",
    cmyk: "C:87 M:62 Y:28 K:52",
    rgb: "26 / 48 / 68",
    origin: "Named for the Prussian blue pigment of 1704 - the color of architectural blueprints, drafting paper, and precision plans.",
    textOn: B.canvas,
  },
  {
    name: "Onyx",
    hex: B.onyx,
    role: "Primary",
    pantone: "Pantone Black 6 C",
    ral: "RAL 9005",
    cmyk: "C:0 M:0 Y:0 K:90",
    rgb: "26 / 26 / 26",
    origin: "The structural backbone. Load-bearing weight. Used for body text, navigation, and any element that must anchor the composition.",
    textOn: B.canvas,
  },
  {
    name: "Canvas",
    hex: B.canvas,
    role: "Base",
    pantone: "Pantone 9183 C",
    ral: "RAL 9001",
    cmyk: "C:2 M:2 Y:5 K:1",
    rgb: "248 / 246 / 242",
    origin: "Not white - warmer, more considered. The surface on which everything is drawn. Gives the palette warmth without softness.",
    textOn: B.onyx,
  },
  {
    name: "Ochre Gold",
    hex: B.gold,
    role: "Accent",
    pantone: "Pantone 7554 C",
    ral: "RAL 1024",
    cmyk: "C:0 M:18 Y:100 K:46",
    rgb: "138 / 101 / 0",
    origin: "An earth mineral pigment - tactile, aged, permanent. Used sparingly as an accent to signal warmth, quality, and distinction.",
    textOn: B.canvas,
  },
  {
    name: "White",
    hex: B.white,
    role: "Pure Ground",
    pantone: "Pantone 11-0601 TCX",
    ral: "RAL 9010",
    cmyk: "C:0 M:0 Y:0 K:0",
    rgb: "255 / 255 / 255",
    origin: "Pure ground. Used for card-heavy sections, modal surfaces, and component interiors where Canvas would read too warm.",
    textOn: B.onyx,
  },
];

const values = [
  { n:"01", name:"Loyalty",    latin:"Fidelitas",   statement:"We stand by our clients from the first showing to the final signature - and long after.", color: "#243548" },
  { n:"02", name:"Integrity",  latin:"Integritas",   statement:"We disclose, document, and tell the truth even when it costs us the deal.", color: "#1A2530" },
  { n:"03", name:"Foundation", latin:"Fundamentum",  statement:"We build slowly, deliberately, and permanently - because every lasting structure starts with a foundation that holds.", color: "#2A3830" },
  { n:"04", name:"Mastery",    latin:"Magisterium",  statement:"We pursue expertise relentlessly - our clients deserve advisors, not order-takers.", color: "#382A10" },
  { n:"05", name:"Belonging",  latin:"Habitare",     statement:"We believe a home is where a life takes shape. We handle that with the weight it deserves.", color: "#5C3800" },
];

const matrixColors = [
  { name: "Prussian", hex: B.prussian },
  { name: "Onyx",     hex: B.onyx     },
  { name: "Canvas",   hex: B.canvas   },
  { name: "Gold",     hex: B.gold     },
  { name: "White",    hex: B.white    },
];

export default function BrandGuide() {
  const [copied, setCopied] = useState(null);
  const copy = hex => { navigator.clipboard.writeText(hex); setCopied(hex); setTimeout(()=>setCopied(null),1600); };
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} ::selection{background:${B.prussian};color:${B.canvas};} input{outline:none;}`}</style>

      <nav style={{ position:"sticky", top:0, zIndex:100, background:B.onyx, borderBottom:`2px solid ${B.prussian}`, padding:"0 40px", display:"flex", alignItems:"center", justifyContent:"space-between", height:52 }}>
        <span style={{ fontSize:16, fontWeight:700, color:B.canvas, fontFamily:"Playfair Display, serif", letterSpacing:-0.5 }}>
          inhabit<span style={{ color:B.goldLight }}>.</span>
        </span>
        <div style={{ display:"flex", gap:28 }}>
          {nav.map(n=>(
            <button key={n.id} onClick={()=>scrollTo(n.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:10, fontFamily:"DM Sans, sans-serif", fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:"#555", transition:"color 0.15s" }}
              onMouseEnter={e=>e.target.style.color=B.goldLight}
              onMouseLeave={e=>e.target.style.color="#555"}
            >{n.label}</button>
          ))}
        </div>
      </nav>

      <div id="brand" style={{ background:B.prussian, padding:"96px 0 84px", position:"relative", overflow:"hidden" }}>
        <div style={{ maxWidth:800, margin:"0 auto", padding:"0 40px", position:"relative" }}>
          <Label color={B.goldLight}>Brand Identity System / v1.0</Label>

          <div style={{ fontSize:"clamp(64px,10vw,108px)", fontFamily:"Playfair Display, serif", fontWeight:700, color:B.canvas, letterSpacing:-4, lineHeight:0.88, marginBottom:32 }}>
            inhabit<span style={{ color:B.goldLight, fontWeight:400 }}>.</span>
          </div>

          <div style={{ display:"flex", gap:0, marginBottom:36 }}>
            <div style={{ width:3, background:B.goldLight, opacity:0.5, marginRight:20 }} />
            <p style={{ fontSize:15, color:"rgba(248,246,242,0.5)", fontFamily:"DM Sans, sans-serif", lineHeight:1.75, maxWidth:460 }}>
              A complete reference for how Inhabit Realty presents itself - in color, type, language, and design - across every surface and channel.
            </p>
          </div>

          <div style={{ display:"flex", gap:0, borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:28, marginTop:8 }}>
            {[
              { label:"Established",  value:"January 1, 2019" },
              { label:"Broker",       value:"James Meyer" },
              { label:"Market",       value:"Florida" },
              { label:"Version",      value:"1.0.0" },
            ].map((s,i)=>(
              <div key={s.label} style={{ flex:1, paddingRight:20, borderRight: i<3 ? "1px solid rgba(255,255,255,0.08)":"none", paddingLeft: i>0?20:0 }}>
                <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"rgba(248,246,242,0.25)", fontFamily:"DM Sans, sans-serif", marginBottom:5 }}>{s.label}</div>
                <div style={{ fontSize:12, fontWeight:600, color:"rgba(248,246,242,0.65)", fontFamily:"DM Sans, sans-serif" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Section id="color" bg={B.white}>
        <Label>Color System</Label>
        <h2 style={{ fontSize:36, fontFamily:"Playfair Display, serif", color:B.onyx, marginBottom:8, letterSpacing:-0.5 }}>Five Colors. No More.</h2>
        <p style={{ fontSize:13, color:B.ash, fontFamily:"DM Sans, sans-serif", lineHeight:1.75, marginBottom:44, maxWidth:520 }}>
          Every design decision begins and ends here. Prussian is the hero. The others provide structure, space, and warmth in support.
        </p>

        <div style={{ display:"flex", height:72, borderRadius:12, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.10)", marginBottom:32 }}>
          {[
            { name:"Prussian",   hex:B.prussian, flex:3 },
            { name:"Onyx",       hex:B.onyx,     flex:2 },
            { name:"Canvas",     hex:B.canvas,   flex:2, borderLeft:`1px solid ${B.mist}` },
            { name:"Ochre Gold", hex:B.gold,     flex:2 },
            { name:"White",      hex:B.white,    flex:2, borderLeft:`1px solid ${B.mist}` },
          ].map(c=>(
            <div key={c.hex} onClick={()=>copy(c.hex)}
              style={{ flex:c.flex, background:c.hex, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", borderLeft:c.borderLeft||"none" }}>
              <span style={{ fontSize:9, fontFamily:"DM Sans, sans-serif", fontWeight:600, color:(c.hex===B.canvas||c.hex===B.white)?B.ash:"rgba(248,246,242,0.55)", letterSpacing:1 }}>
                {copied===c.hex ? "Copied" : c.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="values" bg={B.prussian} style={{ borderTop:`3px solid ${B.goldLight}` }}>
        <Label color={B.goldLight}>Mission &amp; Values</Label>
        <h2 style={{ fontSize:36, fontFamily:"Playfair Display, serif", color:B.canvas, marginBottom:28, letterSpacing:-0.5 }}>Why We Exist</h2>

        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:14, padding:"32px 36px", marginBottom:52, borderLeft:`3px solid ${B.goldLight}` }}>
          <div style={{ fontSize:10, letterSpacing:4, textTransform:"uppercase", color:B.goldLight, fontFamily:"DM Sans, sans-serif", marginBottom:14 }}>Mission Statement</div>
          <div style={{ fontSize:22, fontFamily:"Playfair Display, serif", color:B.canvas, fontStyle:"italic", lineHeight:1.55 }}>
            "To guide people home - not just to a property, but to the place where their life takes root."
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {values.map((v,i)=>(
            <div key={v.n} style={{ background:"rgba(255,255,255,0.05)", borderRadius:12, padding:"22px 26px", display:"flex", gap:18, alignItems:"flex-start" }}>
              <div style={{ width:40, height:40, borderRadius:8, background:v.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontSize:10, fontWeight:700, color:"rgba(248,246,242,0.7)", fontFamily:"DM Sans, sans-serif" }}>{v.n}</span>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:6, flexWrap:"wrap" }}>
                  <span style={{ fontSize:18, fontWeight:700, color:B.canvas, fontFamily:"Playfair Display, serif" }}>{v.name}</span>
                  <span style={{ fontSize:10, color:"rgba(248,246,242,0.25)", fontFamily:"DM Sans, sans-serif", fontStyle:"italic", letterSpacing:1 }}>{v.latin}</span>
                </div>
                <div style={{ fontSize:13, color:"rgba(248,246,242,0.6)", fontFamily:"DM Sans, sans-serif", fontStyle:"italic", lineHeight:1.6 }}>"{v.statement}"</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
