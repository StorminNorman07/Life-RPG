"use client";

import type { CharacterIdentity, CharacterLoadout, CosmeticItem } from "@/data/characterOptions";

type AvatarProps = {
  identity: CharacterIdentity;
  loadout: CharacterLoadout;
  cosmetics: Partial<Record<keyof CharacterLoadout, CosmeticItem | null>>;
  name?: string;
  title?: string | null;
  level?: number;
  compact?: boolean;
  scale?: number;
  showName?: boolean;
  showTitle?: boolean;
  showLevel?: boolean;
};

const skin: Record<CharacterIdentity["skinTone"], string> = {
  "tone-1": "#f7d8bd", "tone-2": "#efc3a0", "tone-3": "#dfa47f", "tone-4": "#c6865f",
  "tone-5": "#aa6948", "tone-6": "#895338", "tone-7": "#68402e", "tone-8": "#493024",
};
const hair: Record<CharacterIdentity["hairColor"], string> = {
  black: "#241e29", brown: "#64412f", blonde: "#e7c26f", red: "#a94d3d", gray: "#9aa0aa", white: "#ece8e1",
};
const eyes: Record<CharacterIdentity["eyeColor"], string> = {
  brown: "#543c2d", hazel: "#987548", blue: "#5c9abb", green: "#5e9270", gray: "#83929a", violet: "#8972ad",
};
const tier: Record<string, { a: string; b: string; glow: string }> = {
  Bronze: { a: "#d48752", b: "#844b35", glow: "#f4bb73" }, Silver: { a: "#b6d3de", b: "#637c95", glow: "#ddf4ff" },
  Gold: { a: "#f1c45d", b: "#a67535", glow: "#ffe99c" }, Platinum: { a: "#b6c9e9", b: "#596a9d", glow: "#d4e2ff" },
  Diamond: { a: "#70d6da", b: "#387ca1", glow: "#a5fbf2" }, Master: { a: "#ba8fe2", b: "#714caa", glow: "#e5c6ff" },
  Legendary: { a: "#ffb257", b: "#b94f69", glow: "#ffe39a" },
};

function HairShape({ style, color }: { style: CharacterIdentity["hairStyle"]; color: string }) {
  if (style === "bald") return null;
  const paths: Record<Exclude<CharacterIdentity["hairStyle"], "bald">, string> = {
    short: "M151 151 Q151 86 210 84 Q270 84 269 151 L250 143 Q239 124 211 126 Q180 125 164 149Z",
    medium: "M151 152 Q147 87 210 83 Q273 87 270 153 L269 206 Q253 226 244 203 L247 150 Q225 125 185 132 L165 157 L165 202 Q153 213 150 194Z",
    long: "M150 153 Q148 84 210 82 Q274 84 270 154 L273 260 Q258 273 245 252 L246 151 Q222 126 182 132 L165 155 L167 251 Q152 268 146 248Z",
    curly: "M151 156 Q136 143 146 126 Q137 111 151 99 Q148 78 171 82 Q181 65 198 81 Q216 66 229 82 Q251 73 258 94 Q279 101 270 121 Q280 140 266 157 L249 144 Q235 121 211 126 Q181 124 165 148Z",
    wavy: "M151 154 Q147 91 206 83 Q273 86 270 151 Q261 141 255 156 Q248 143 241 154 Q229 126 207 128 Q182 126 165 151 Q158 139 151 154Z",
    ponytail: "M151 152 Q150 86 210 83 Q270 86 270 151 L251 145 Q237 125 210 127 Q180 126 164 151Z",
    buzz: "M153 145 Q155 93 209 90 Q263 92 267 145 Q244 125 210 127 Q176 126 153 145Z",
  };
  return <><path d={paths[style]} fill={color} stroke="#332a34" strokeWidth="5" strokeLinejoin="round" />{style === "ponytail" && <path d="M260 126 Q292 135 282 178 Q278 194 264 196 L257 180 Q271 157 251 148Z" fill={color} stroke="#332a34" strokeWidth="4" />}</>;
}

export default function CresceraAvatar({ identity, loadout, cosmetics, name, title, level, compact, scale = 1, showName = true, showTitle = true, showLevel = true }: AvatarProps) {
  const outfit = cosmetics.outfit;
  const accessory = cosmetics.accessory;
  const background = cosmetics.background;
  const aura = cosmetics.aura;
  const held = cosmetics.heldItem;
  const frame = cosmetics.frame;
  const effect = cosmetics.sceneEffect;
  const variantOf = (item?: CosmeticItem | null) => Number(item?.id.match(/-(\d+)$/)?.[1] ?? 0);
  const outfitVariant = variantOf(outfit);
  const gearVariant = variantOf(accessory);
  const heldVariant = variantOf(held);
  const worldVariant = variantOf(background);
  const poseVariant = variantOf(cosmetics.pose);
  const colors = tier[outfit?.tier ?? "Bronze"] ?? tier.Bronze;
  const bgColors = tier[background?.tier ?? "Silver"] ?? tier.Silver;
  const skinColor = skin[identity.skinTone];
  const hairColor = hair[identity.hairColor];
  const eyeColor = eyes[identity.eyeColor] ?? eyes.brown;
  const torsoPath = identity.bodyShape === "broad"
    ? "M145 266 Q123 272 119 313 L108 363 Q106 377 122 382 Q138 386 145 370 L161 333 166 350 Q210 372 254 350 L259 333 275 370 Q282 386 298 382 Q314 377 310 363 L301 313 Q297 272 275 266Z"
    : identity.bodyShape === "compact"
      ? "M164 266 Q145 276 143 313 L132 360 Q130 374 143 379 Q155 383 161 369 L174 334 177 350 Q210 365 243 350 L246 334 259 369 Q265 383 277 379 Q290 374 288 360 L277 313 Q275 276 256 266Z"
      : "M154 266 Q134 275 130 315 L117 363 Q114 377 128 381 Q140 384 145 370 L163 333 168 350 Q207 370 252 350 L257 333 275 370 Q280 384 293 381 Q307 377 302 363 L290 315 Q286 275 266 266Z";
  const width = 320 * scale;
  const height = 410 * scale;
  const hasAura = !!aura && aura.id !== "none";
  const itemLabel = [outfit?.name, accessory?.name, held?.name].filter(Boolean).join(" · ");

  return <div className="flex flex-col items-center text-center" style={{ width }}>
    <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[#11131d] shadow-[0_28px_80px_rgba(0,0,0,.38)]" style={{ width: 320, height: 410, transform: `scale(${scale})`, transformOrigin: "top center", marginBottom: height - 410 }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 33%, ${bgColors.glow}33, transparent 46%), linear-gradient(145deg, #20283b 0%, #121827 55%, #0e111b 100%)` }} />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/55 to-transparent" />
      {background && background.id !== "default-background" && <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[9px] font-black uppercase tracking-[.2em] text-white/55">{background.name}</div>}
      {hasAura && <div className="absolute left-1/2 top-[44%] h-56 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: `${colors.glow}30` }} />}
      <div className="absolute inset-x-0 bottom-5 h-8 rounded-[50%] bg-black/40 blur-md" />
      <svg viewBox="0 0 420 500" className="absolute inset-0 h-full w-full" role="img" aria-label={`${name ?? "Your"} customizable avatar`}>
        <defs>
          <linearGradient id="heroSuit" x1="0" y1="0" x2="1" y2="1"><stop stopColor={colors.a} /><stop offset="1" stopColor={colors.b} /></linearGradient>
          <linearGradient id="skinShade" x1="0" y1="0" x2=".8" y2="1"><stop stopColor="#fff" stopOpacity=".2" /><stop offset="1" stopColor="#612f26" stopOpacity=".16" /></linearGradient>
          <filter id="softGlow"><feGaussianBlur stdDeviation="8" /></filter>
        </defs>
        {background && <g opacity=".3" fill={bgColors.a}>
          {worldVariant === 1 && <><path d="M0 334 84 244l58 54 75-102 113 131 45-49 45 55v167H0Z" opacity=".34"/><path d="M0 382q105-79 210-4t210-2v112H0Z" opacity=".48"/><circle cx="324" cy="92" r="30" fill={bgColors.glow} opacity=".3"/></>}
          {worldVariant === 2 && <><path d="M0 380h420v120H0Z" opacity=".38"/><path d="M45 380V238h45v-54h36v54h38v142m88 0V210h40v-70h42v70h42v170" opacity=".24"/><path d="M254 140v-22h42v22" fill="none" stroke={bgColors.glow} strokeWidth="6"/></>}
          {worldVariant === 3 && <>{Array.from({ length: 16 }, (_, i) => <circle key={i} cx={(i * 83 + 37) % 410} cy={(i * 57 + 34) % 260} r={i % 4 === 0 ? 2.5 : 1.4} fill={bgColors.glow} opacity={i % 3 === 0 ? .9 : .55}/>)}<path d="M0 420q95-64 210 0t210 0v80H0Z" opacity=".2"/></>}
        </g>}
        {hasAura && <ellipse cx="210" cy="270" rx="96" ry="145" fill="none" stroke={colors.glow} strokeOpacity=".46" strokeWidth="3" strokeDasharray="5 13"><animateTransform attributeName="transform" type="rotate" from="0 210 270" to="360 210 270" dur="38s" repeatCount="indefinite" /></ellipse>}
        {effect?.id !== "none" && effect && <g fill={colors.glow} opacity=".7"><circle cx="77" cy="210" r="3"><animate attributeName="cy" values="215;175;215" dur="4s" repeatCount="indefinite" /></circle><circle cx="341" cy="281" r="2.5"><animate attributeName="cy" values="286;239;286" dur="5s" repeatCount="indefinite" /></circle><path d="M84 310l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" /></g>}
        {frame?.id !== "none" && frame && <rect x="12" y="12" width="396" height="476" rx="34" fill="none" stroke={colors.glow} strokeOpacity=".55" strokeWidth="2" />}
        <g className="avatar-idle" transform={poseVariant === 2 ? "rotate(-2 210 290)" : poseVariant === 3 ? "rotate(2 210 290)" : undefined}>
          {accessory && gearVariant === 1 && <g><rect x="161" y="287" width="98" height="80" rx="22" fill={colors.b} stroke="#302b36" strokeWidth="5"/><path d="M175 302q35-24 70 0v51h-70z" fill={colors.a} stroke="#302b36" strokeWidth="4"/><path d="M184 298v58m52-58v58" stroke={colors.glow} strokeWidth="5"/></g>}
          {accessory && gearVariant === 2 && <path d="M151 288 Q127 309 137 421 L172 400 184 336 M269 288 Q293 309 283 421 L248 400 236 336Z" fill={colors.b} stroke="#302b36" strokeWidth="5" strokeLinejoin="round"/>}
          {accessory && gearVariant === 3 && <g fill="none" stroke={colors.glow} strokeWidth="7" strokeLinejoin="round"><path d="M164 305Q103 258 88 299q-9 33 55 67l28-19m85-42q61-52 76-11 9 33-55 67l-28-19"/><path d="M157 319q-36-11-41 14m147-14q36-11 41 14" strokeWidth="4"/></g>}
          {held && <g transform={loadout.heldItemHand === "left" ? "translate(104 309) rotate(-16)" : "translate(286 309) rotate(16)"}><path d="M-3 6 Q0 -4 8 0 L18 8 Q18 19 10 21 L0 15Z" fill={skinColor} stroke="#342d34" strokeWidth="4"/>
            {heldVariant === 2 ? <g transform="translate(8 -37)"><path d="M4 7h23v-41H4Z" fill={colors.b} stroke="#382d3b" strokeWidth="4"/><path d="M8-28h15M8-18h15M8-8h11" stroke={colors.glow} strokeWidth="3"/><path d="M1 10h29v7H1z" fill={colors.glow} stroke="#382d3b" strokeWidth="3"/></g>
              : heldVariant === 3 ? <g transform="translate(8 -38)"><path d="M10-24q-15-2-10 15l11 15 11-15q5-17-10-15Z" fill={colors.a} stroke="#382d3b" strokeWidth="4"/><path d="M11 5v30m-8-9h16" stroke={colors.glow} strokeWidth="5" strokeLinecap="round"/></g>
                : <g transform="translate(8 -32)"><path d="M0 0l13-42 8 44-9 23z" fill={colors.glow} stroke="#382d3b" strokeWidth="4"/><path d="M10 10v24" stroke="#382d3b" strokeWidth="7" strokeLinecap="round"/></g>}
          </g>}
          <path d="M168 350 L159 425 Q164 438 199 436 L208 371 L218 436 Q250 441 261 428 L250 348Z" fill="#273145" stroke="#302b36" strokeWidth="5" strokeLinejoin="round" />
          <path d="M190 425l-3 18h-37q-11 0-9-8l17-12zm38 0 4 18h37q11 0 9-8l-18-12z" fill="#d6e4ed" stroke="#302b36" strokeWidth="4" strokeLinejoin="round" />
          <path d={torsoPath} fill="url(#heroSuit)" stroke="#302b36" strokeWidth="6" strokeLinejoin="round" />
          <path d="M170 271 Q210 302 250 271 L239 344 Q211 356 181 344Z" fill="#fff" fillOpacity=".1" />
          <path d="M185 291l25 24 25-24-8 49h-33z" fill={colors.glow} stroke="#382f3a" strokeWidth="4" strokeLinejoin="round" />
          <path d="M202 312h16l-8 25z" fill="#fff" fillOpacity=".65" />
          {outfitVariant === 1 && <path d="M180 278 210 306 240 278 229 300 210 319 191 300Z" fill={colors.b} stroke="#302b36" strokeWidth="4" strokeLinejoin="round"/>}
          {outfitVariant === 2 && <g fill="none" stroke={colors.glow} strokeWidth="5"><path d="M177 281q-26-4-31 20l16 20m81-40q26-4 31 20l-16 20"/><path d="M178 346h64" stroke="#f0d5aa"/></g>}
          {outfitVariant === 3 && <g><path d="M170 280h80l-8 55h-64z" fill="none" stroke={colors.glow} strokeWidth="5"/><path d="m190 280 20 22 20-22" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="4"/><circle cx="210" cy="330" r="6" fill={colors.glow}/></g>}
          <rect x="195" y="238" width="30" height="43" rx="13" fill={skinColor} stroke="#342d34" strokeWidth="4" />
          <ellipse cx="210" cy="171" rx={identity.faceShape === "square" ? 58 : 55} ry="67" fill={skinColor} stroke="#342d34" strokeWidth="5" />
          <ellipse cx="210" cy="171" rx="55" ry="66" fill="url(#skinShade)" />
          <HairShape style={identity.hairStyle} color={hairColor} />
          {identity.hairStyle === "long" && <path d="M164 150 Q147 224 160 264 M256 150 Q273 224 260 264" fill="none" stroke={hairColor} strokeWidth="14" strokeLinecap="round" />}
          {identity.earrings !== "none" && <><circle cx="153" cy="190" r="5" fill={colors.glow}/><circle cx="267" cy="190" r="5" fill={colors.glow}/></>}
          <path d="M180 166 Q190 158 199 166 M221 166 Q230 158 240 166" fill="none" stroke="#49313a" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="190" cy="178" rx="5" ry="7" fill={eyeColor}/><ellipse cx="230" cy="178" rx="5" ry="7" fill={eyeColor}/>
          {identity.glasses !== "none" && <g fill="none" stroke="#342d34" strokeWidth="4"><rect x="169" y="166" width="36" height="26" rx={identity.glasses === "round" ? 13 : 8}/><rect x="215" y="166" width="36" height="26" rx={identity.glasses === "round" ? 13 : 8}/><path d="M205 176h10"/></g>}
          <path d="M205 187l-3 8 6 1" fill="none" stroke="#a86657" strokeWidth="3" strokeLinecap="round" />
          <path d="M197 204 Q210 214 223 204" fill="none" stroke="#9c514f" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="178" cy="196" rx="9" ry="4" fill="#ed9e91" opacity=".38"/><ellipse cx="242" cy="196" rx="9" ry="4" fill="#ed9e91" opacity=".38"/>
          {accessory && gearVariant === 2 && <g><path d="M159 257 Q210 283 261 257 L267 276 Q210 307 153 276Z" fill={colors.glow} stroke="#342d34" strokeWidth="4"/><circle cx="210" cy="279" r="8" fill="#fff4c9" stroke="#342d34" strokeWidth="3"/></g>}
          <path d="M176 367h68" stroke="#fff" strokeOpacity=".45" strokeWidth="4" strokeLinecap="round"/><circle cx="210" cy="335" r="7" fill={colors.glow} stroke="#382d3b" strokeWidth="3" />
          {outfit && <g><path d="M150 290h26 M244 290h26" stroke="#fff" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round"/><text x="210" y="327" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fff" opacity=".8">{outfit.tier === "Legendary" ? "✦" : outfit.tier === "Diamond" ? "◇" : outfit.tier === "Master" ? "✧" : "•"}</text></g>}
        </g>
      </svg>
      <div className="absolute bottom-4 left-0 right-0 text-[9px] font-black uppercase tracking-[.25em] text-white/45">{itemLabel || "Your hero · in progress"}</div>
      <style>{`@keyframes avatar-idle-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}.avatar-idle{transform-box:fill-box;transform-origin:center bottom;animation:avatar-idle-float 4.8s ease-in-out infinite}@media(prefers-reduced-motion:reduce){.avatar-idle{animation:none}}`}</style>
    </div>
    {showName && <p className={`font-black text-white ${compact ? "-mt-1 text-lg" : "mt-1 text-xl"}`}>{name}</p>}
    {showTitle && title && <p className="mt-1 text-xs font-semibold text-amber-200/80">{title}</p>}
    {showLevel && <p className="mt-2 text-[10px] font-black uppercase tracking-[.22em] text-white/40">Level {level}</p>}
  </div>;
}
