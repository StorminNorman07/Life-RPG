"use client";

interface SeasonalBackgroundProps {
  visualId: string;
}

type ScenePalette = {
  skyTop: string;
  skyBottom: string;
  ground: string;
  accent: string;
  accent2: string;
  glow: string;
};

const palettes: Record<string, ScenePalette> = {
  january: { skyTop: "#020617", skyBottom: "#172554", ground: "#111827", accent: "#fbbf24", accent2: "#22d3ee", glow: "#ffffff" },
  february: { skyTop: "#240718", skyBottom: "#7f1d4e", ground: "#172033", accent: "#fb7185", accent2: "#fbbf24", glow: "#fde68a" },
  march: { skyTop: "#052e16", skyBottom: "#16a34a", ground: "#14532d", accent: "#facc15", accent2: "#22c55e", glow: "#dcfce7" },
  april: { skyTop: "#312e81", skyBottom: "#93c5fd", ground: "#166534", accent: "#f9a8d4", accent2: "#67e8f9", glow: "#fdf2f8" },
  may: { skyTop: "#172554", skyBottom: "#f59e0b", ground: "#365314", accent: "#ef4444", accent2: "#f8fafc", glow: "#fef3c7" },
  june: { skyTop: "#2e1065", skyBottom: "#ec4899", ground: "#0f172a", accent: "#22d3ee", accent2: "#facc15", glow: "#ffffff" },
  july: { skyTop: "#0c4a6e", skyBottom: "#fb7185", ground: "#1e293b", accent: "#ef4444", accent2: "#3b82f6", glow: "#ffffff" },
  august: { skyTop: "#020617", skyBottom: "#0e7490", ground: "#164e63", accent: "#67e8f9", accent2: "#a78bfa", glow: "#ffffff" },
  september: { skyTop: "#78350f", skyBottom: "#fbbf24", ground: "#365314", accent: "#f97316", accent2: "#a3e635", glow: "#fef3c7" },
  october: { skyTop: "#09090b", skyBottom: "#581c87", ground: "#1c1917", accent: "#f97316", accent2: "#a855f7", glow: "#fde68a" },
  november: { skyTop: "#431407", skyBottom: "#ea580c", ground: "#3f3f1d", accent: "#f59e0b", accent2: "#dc2626", glow: "#fef3c7" },
  december: { skyTop: "#020617", skyBottom: "#1d4ed8", ground: "#dbeafe", accent: "#ef4444", accent2: "#fbbf24", glow: "#ffffff" },
};

export default function SeasonalBackground({ visualId }: SeasonalBackgroundProps) {
  const month = visualId.split("-")[1] ?? "january";
  const palette = palettes[month] ?? palettes.january;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden rounded-[2.5rem] bg-black">
      <SeasonalStyles />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 540" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`seasonal-sky-${visualId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={palette.skyTop} />
            <stop offset="100%" stopColor={palette.skyBottom} />
          </linearGradient>
          <radialGradient id={`seasonal-glow-${visualId}`}>
            <stop offset="0%" stopColor={palette.glow} stopOpacity=".95" />
            <stop offset="100%" stopColor={palette.glow} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="420" height="540" fill={`url(#seasonal-sky-${visualId})`} />
        <SceneArtwork visualId={visualId} palette={palette} />
      </svg>
      <SceneAnimation visualId={visualId} palette={palette} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/30" />
    </div>
  );
}

function SceneArtwork({ visualId, palette }: { visualId: string; palette: ScenePalette }) {
  switch (visualId) {
    case "seasonal-january-new-year-skyline":
      return <><CitySkyline neon /><Bridge /><CountdownTower /><River /></>;
    case "seasonal-january-frozen-lake-festival":
      return <><MountainRange snow /><AuroraBands /><FrozenLake /><Cabins /><TramLine /></>;
    case "seasonal-february-valentine-garden":
      return <><Moon x={330} y={90} /><GardenArches /><Fountain /><RoseBeds /></>;
    case "seasonal-february-black-history-celebration":
      return <><SunsetDisc /><CulturalPlaza /><UnityMonument /><BannerRow colors={["#dc2626", "#111827", "#16a34a", "#fbbf24"]} /></>;
    case "seasonal-march-st-patricks-festival":
      return <><CitySkyline /><River /><Rainbow /><ParadeStreet /><BannerRow colors={["#15803d", "#facc15"]} /></>;
    case "seasonal-march-emerald-highlands":
      return <><CloudMountains /><Castle x={267} y={185} /><Waterfall x={88} /><Waterfall x={334} /><ValleyRoad /></>;
    case "seasonal-april-cherry-blossom-park":
      return <><Moon x={330} y={78} /><River /><Pagoda /><BlossomTrees /><FootBridge /></>;
    case "seasonal-april-spring-rain-garden":
      return <><GlassConservatory /><GardenPaths /><Pond /><FlowerBeds /></>;
    case "seasonal-may-memorial-garden":
      return <><SunsetDisc /><MemorialWall /><EternalFlame /><FlagRow /></>;
    case "seasonal-may-botanical-conservatory":
      return <><GlassConservatory /><WaterWall /><TropicalPlants /><FlowerBeds /></>;
    case "seasonal-june-pride-festival":
      return <><FestivalStreet /><RainbowArch /><Stage /><Crowd /></>;
    case "seasonal-june-summer-carnival":
      return <><Ocean /><Pier /><FerrisWheel /><RollerCoaster /><CarnivalStalls /></>;
    case "seasonal-july-independence-fair":
      return <><Fairground /><FerrisWheel /><ParadeStreet /><FlagRow /></>;
    case "seasonal-july-tropical-boardwalk":
      return <><SunsetDisc /><Ocean /><Boardwalk /><PalmTrees /><CoastalCoaster /></>;
    case "seasonal-august-ocean-cliffs":
      return <><Moon x={328} y={92} /><Ocean /><SeaCliffs /><Lighthouse /><CaveWaterfall /></>;
    case "seasonal-august-meteor-shower-camp":
      return <><StarField /><MountainRange /><Observatory /><CampTents /><Telescope /></>;
    case "seasonal-september-harvest-festival":
      return <><SunsetDisc /><RollingFields /><Windmill /><HarvestStalls /><Barn /></>;
    case "seasonal-september-apple-orchard":
      return <><SunsetDisc /><OrchardRows /><Farmhouse /><CiderWagon /><TrainLine /></>;
    case "seasonal-october-halloween-town":
      return <><Moon x={320} y={88} /><CrookedTown /><HauntedMansion /><PumpkinRoad /></>;
    case "seasonal-october-haunted-carnival":
      return <><Moon x={323} y={78} /><BrokenFerrisWheel /><HauntedCarousel /><CarnivalGate /><Graveyard /></>;
    case "seasonal-november-thanksgiving-homestead":
      return <><SunsetDisc /><Farmhouse /><LongTable /><Barn /><RollingFields /></>;
    case "seasonal-november-maple-forest":
      return <><SunsetDisc /><MapleForest /><River /><HikingBridge /><Deer /></>;
    case "seasonal-december-christmas-village":
      return <><MountainRange snow /><ChristmasVillage /><ChristmasTree /><SkatingRink /><TrainLoop /></>;
    case "seasonal-december-hanukkah-night":
      return <><Moon x={325} y={78} /><WinterPlaza /><Menorah /><BlueGoldBuildings /><TramLine /></>;
    default:
      return <><RollingFields /><SunsetDisc /></>;
  }
}

function SceneAnimation({ visualId, palette }: { visualId: string; palette: ScenePalette }) {
  const particles = (kind: string, count = 18) => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.5rem]">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className={`seasonal-${kind} absolute block`} style={{ left: `${(index * 37) % 100}%`, top: `${(index * 53) % 92}%`, animationDelay: `${(index % 9) * -.31}s` }} />
      ))}
    </div>
  );

  switch (visualId) {
    case "seasonal-january-new-year-skyline":
      return <>{particles("confetti", 38)}<MovingTraffic /><FireworkShow /><SweepingLights /></>;
    case "seasonal-january-frozen-lake-festival":
      return <>{particles("snow", 32)}<Skaters /><MovingTram /><AuroraMotion /></>;
    case "seasonal-february-valentine-garden":
      return <>{particles("petal", 26)}<LanternSwing /><HeartFireworks /><FountainShimmer /></>;
    case "seasonal-february-black-history-celebration":
      return <><SweepingLights /><MovingParade colors={["#dc2626", "#111827", "#16a34a", "#fbbf24"]} />{particles("gold-confetti", 24)}<MonumentPulse color={palette.accent2} /></>;
    case "seasonal-march-st-patricks-festival":
      return <><MovingParade colors={["#16a34a", "#facc15"]} />{particles("clover", 22)}<RainbowShimmer /></>;
    case "seasonal-march-emerald-highlands":
      return <><CloudDrift /><BirdFlight /><WaterfallFlow /><SunRaySweep /></>;
    case "seasonal-april-cherry-blossom-park":
      return <>{particles("petal", 34)}<MovingBoat /><TrainPass /><WaterRipple /></>;
    case "seasonal-april-spring-rain-garden":
      return <>{particles("rain", 42)}<UmbrellaWalk /><PuddleRipple /><RainbowReveal /></>;
    case "seasonal-may-memorial-garden":
      return <><FlagWave /><LanternRise /><AircraftFormation /><FlameFlicker /></>;
    case "seasonal-may-botanical-conservatory":
      return <>{particles("butterfly", 18)}<WaterWallFlow /><FlowerBloom /><BirdFlight /></>;
    case "seasonal-june-pride-festival":
      return <><MovingParade colors={["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#a855f7"]} /><StageBeams />{particles("confetti", 42)}<RainbowShimmer /></>;
    case "seasonal-june-summer-carnival":
      return <><WheelSpin /><CoasterTrain /><MovingBoat /><FireworkShow /></>;
    case "seasonal-july-independence-fair":
      return <><FireworkShow /><AircraftFormation /><MovingParade colors={["#ef4444", "#ffffff", "#2563eb"]} /><WheelSpin /></>;
    case "seasonal-july-tropical-boardwalk":
      return <><WaveMotion /><Surfers /><MovingTram /><MovingBoat /></>;
    case "seasonal-august-ocean-cliffs":
      return <><WaveMotion /><LighthouseSweep /><ShipPass /><BirdFlight /><WaterfallFlow /></>;
    case "seasonal-august-meteor-shower-camp":
      return <>{particles("star", 28)}<MeteorStorm /><SatelliteOrbit /><TelescopeRotate /><CampGlow /></>;
    case "seasonal-september-harvest-festival":
      return <><WindmillSpin /><Hayride /><LanternRise />{particles("leaf", 24)}</>;
    case "seasonal-september-apple-orchard":
      return <>{particles("apple", 15)}<WagonPass /><TrainPass /><CloudDrift /></>;
    case "seasonal-october-halloween-town":
      return <>{particles("fog", 8)}<BatFlight /><WindowFlicker /><TrickOrTreaters /><PumpkinFlicker /></>;
    case "seasonal-october-haunted-carnival":
      return <>{particles("fog", 10)}<WheelSpin /><GhostRide /><CarouselSpin /><SignFlicker /></>;
    case "seasonal-november-thanksgiving-homestead":
      return <>{particles("leaf", 26)}<ChimneySmoke /><WagonPass /><StringLightTwinkle /></>;
    case "seasonal-november-maple-forest":
      return <>{particles("leaf", 36)}<DeerWalk /><WaterRipple /><SunRaySweep /></>;
    case "seasonal-december-christmas-village":
      return <>{particles("snow", 42)}<TrainCircle /><Skaters /><SleighFlight /><StringLightTwinkle /></>;
    case "seasonal-december-hanukkah-night":
      return <>{particles("snow", 26)}<CandleFlicker /><DreidelSpin /><MovingTram /><StringLightTwinkle /></>;
    default:
      return null;
  }
}

const Moon = ({ x, y }: { x: number; y: number }) => <><circle cx={x} cy={y} r="50" fill="#f8fafc" opacity=".16" /><circle cx={x} cy={y} r="34" fill="#fff7d6" /></>;
const SunsetDisc = () => <circle cx="325" cy="105" r="55" fill="#fde68a" opacity=".9" />;
const River = () => <path d="M0 390 C105 350 169 420 255 372 C324 335 374 381 420 354 L420 540 L0 540 Z" fill="#0e7490" opacity=".82" />;
const Ocean = () => <><path d="M0 330 C70 309 137 351 208 326 C281 300 351 342 420 318 L420 540 L0 540 Z" fill="#0369a1" /><path d="M0 365 C80 340 145 386 220 359 C301 330 357 374 420 351" fill="none" stroke="#bae6fd" strokeWidth="7" opacity=".8" /></>;
const RollingFields = () => <><path d="M0 310 C77 265 137 310 211 273 C288 236 350 290 420 250 L420 540 L0 540 Z" fill="#4d7c0f" /><path d="M0 382 C92 327 171 389 251 346 C320 309 366 350 420 327 L420 540 L0 540 Z" fill="#365314" /></>;
const MountainRange = ({ snow = false }: { snow?: boolean }) => <><path d="M0 350 L82 185 L163 326 L255 126 L420 350 L420 540 L0 540 Z" fill="#334155" /><path d="M50 246 L82 185 L116 246 L94 233 L82 259 L69 232 Z" fill={snow ? "#f8fafc" : "#64748b"} /><path d="M218 184 L255 126 L304 205 L274 188 L255 223 L239 188 Z" fill={snow ? "#f8fafc" : "#64748b"} /></>;
const CloudMountains = () => <><MountainRange /><path d="M0 145 C75 105 137 157 205 119 C275 80 342 142 420 98" fill="none" stroke="#dcfce7" strokeWidth="36" opacity=".35" /></>;
const CitySkyline = ({ neon = false }: { neon?: boolean }) => <g>{[18, 77, 139, 209, 282, 347].map((x, i) => <g key={x}><rect x={x} y={190 - (i % 3) * 35} width="54" height={350 + (i % 3) * 35} fill="#111827" stroke={neon ? (i % 2 ? "#f472b6" : "#22d3ee") : "#334155"} strokeWidth="3" />{Array.from({ length: 8 }).map((_, r) => <rect key={r} x={x + 10 + (r % 2) * 22} y={215 - (i % 3) * 35 + Math.floor(r / 2) * 40} width="10" height="17" fill={neon ? (r % 2 ? "#f472b6" : "#22d3ee") : "#fde68a"} opacity=".8" />)}</g>)}</g>;
const Bridge = () => <><path d="M0 390 Q210 315 420 390" fill="none" stroke="#475569" strokeWidth="18" /><path d="M0 390 Q210 315 420 390" fill="none" stroke="#f8fafc" strokeWidth="3" strokeDasharray="18 13" /></>;
const CountdownTower = () => <g><rect x="171" y="91" width="78" height="248" rx="13" fill="#0f172a" stroke="#22d3ee" strokeWidth="5" /><rect x="181" y="121" width="58" height="44" rx="7" fill="#020617" stroke="#fbbf24" strokeWidth="3" /><text x="210" y="151" textAnchor="middle" fontSize="22" fontWeight="900" fill="#ffffff">00:00</text><path d="M210 67 L225 92 L195 92 Z" fill="#fbbf24" /></g>;
const FrozenLake = () => <><path d="M0 350 C110 320 207 375 420 330 L420 540 L0 540 Z" fill="#bfdbfe" /><path d="M0 410 C117 380 230 425 420 384" fill="none" stroke="#ffffff" strokeWidth="5" opacity=".6" /></>;
const Cabins = () => <g>{[38, 310].map(x => <g key={x}><rect x={x} y="300" width="72" height="65" fill="#7c2d12" /><path d={`M${x - 10} 301 L${x + 36} 263 L${x + 82} 301 Z`} fill="#431407" /><rect x={x + 14} y="320" width="18" height="18" fill="#fde68a" /><rect x={x + 44} y="320" width="18" height="18" fill="#fde68a" /></g>)}</g>;
const TramLine = () => <><path d="M0 288 L420 288" stroke="#64748b" strokeWidth="7" /><path d="M0 297 L420 297" stroke="#cbd5e1" strokeWidth="3" /></>;
const AuroraBands = () => <><path d="M-40 105 C85 22 170 170 290 66 C345 20 390 52 460 15" fill="none" stroke="#34d399" strokeWidth="30" opacity=".25" /><path d="M-30 153 C86 72 178 199 301 96 C354 52 397 79 455 46" fill="none" stroke="#c084fc" strokeWidth="22" opacity=".22" /></>;
const GardenArches = () => <g>{[72, 210, 348].map(x => <path key={x} d={`M${x - 45} 360 L${x - 45} 235 Q${x} 170 ${x + 45} 235 L${x + 45} 360`} fill="none" stroke="#be123c" strokeWidth="14" />)}</g>;
const Fountain = () => <g><ellipse cx="210" cy="412" rx="96" ry="27" fill="#0e7490" /><path d="M210 390 Q175 310 210 270 Q245 310 210 390" fill="none" stroke="#bae6fd" strokeWidth="8" /><circle cx="210" cy="274" r="12" fill="#f9a8d4" /></g>;
const RoseBeds = () => <g>{Array.from({ length: 18 }).map((_, i) => <circle key={i} cx={25 + (i * 47) % 380} cy={430 + (i % 3) * 25} r="8" fill={i % 2 ? "#fb7185" : "#be123c"} />)}</g>;
const CulturalPlaza = () => <><path d="M0 360 L420 320 L420 540 L0 540 Z" fill="#292524" /><path d="M0 420 L420 380" stroke="#fbbf24" strokeWidth="4" strokeDasharray="20 12" /></>;
const UnityMonument = () => <g><rect x="175" y="170" width="70" height="207" rx="8" fill="#1c1917" stroke="#fbbf24" strokeWidth="5" /><circle cx="210" cy="145" r="40" fill="#fbbf24" /><path d="M183 145 Q210 105 237 145 Q210 185 183 145" fill="#111827" /></g>;
const BannerRow = ({ colors }: { colors: string[] }) => <g>{Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M${20 + i * 48} 95 L${20 + i * 48} 174 L${39 + i * 48} 157 L${58 + i * 48} 174 L${58 + i * 48} 95 Z`} fill={colors[i % colors.length]} />)}</g>;
const Rainbow = () => <g>{["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#a855f7"].map((c, i) => <path key={c} d={`M-25 ${250 + i * 10} Q210 ${10 + i * 10} 445 ${250 + i * 10}`} fill="none" stroke={c} strokeWidth="10" opacity=".75" />)}</g>;
const ParadeStreet = () => <><path d="M110 540 L168 290 L252 290 L312 540 Z" fill="#27272a" /><path d="M210 540 L210 305" stroke="#facc15" strokeWidth="5" strokeDasharray="19 14" /></>;
const Castle = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x} ${y})`}><rect x="-65" y="35" width="130" height="125" fill="#334155" stroke="#cbd5e1" strokeWidth="4" /><rect x="-85" y="0" width="42" height="160" fill="#475569" /><rect x="43" y="0" width="42" height="160" fill="#475569" /><path d="M-85 0 L-64 -35 L-43 0 Z M43 0 L64 -35 L85 0 Z" fill="#1e293b" /><rect x="-14" y="95" width="28" height="65" rx="14" fill="#111827" /></g>;
const Waterfall = ({ x }: { x: number }) => <path d={`M${x} 135 C${x - 10} 240 ${x + 15} 335 ${x} 455`} fill="none" stroke="#bae6fd" strokeWidth="18" opacity=".8" />;
const ValleyRoad = () => <path d="M165 540 C177 438 190 359 210 306 C234 372 251 451 273 540 Z" fill="#a16207" />;
const Pagoda = () => <g><rect x="310" y="230" width="63" height="160" fill="#7f1d1d" /><path d="M282 245 L342 198 L401 245 Z M291 300 L342 260 L392 300 Z" fill="#111827" /><rect x="329" y="320" width="26" height="70" fill="#431407" /></g>;
const BlossomTrees = () => <g>{[55, 145, 265].map((x, j) => <g key={x}><rect x={x - 7} y="240" width="14" height="180" fill="#5b3827" />{Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={x - 38 + (i % 3) * 38} cy={215 + Math.floor(i / 3) * 30} r="27" fill={j % 2 ? "#f9a8d4" : "#fbcfe8"} />)}</g>)}</g>;
const FootBridge = () => <path d="M20 390 Q130 320 240 390" fill="none" stroke="#7c2d12" strokeWidth="24" />;
const GlassConservatory = () => <g><path d="M38 350 L92 170 L328 170 L382 350 Z" fill="#a5f3fc" opacity=".25" stroke="#e0f2fe" strokeWidth="6" /><path d="M92 170 Q210 35 328 170" fill="#67e8f9" opacity=".18" stroke="#e0f2fe" strokeWidth="6" /><path d="M210 80 L210 350 M92 170 L328 350 M328 170 L92 350" stroke="#e0f2fe" strokeWidth="3" opacity=".8" /></g>;
const GardenPaths = () => <path d="M155 540 C171 454 187 394 210 345 C235 401 250 463 270 540 Z" fill="#d6d3d1" />;
const Pond = () => <ellipse cx="90" cy="430" rx="75" ry="32" fill="#0891b2" />;
const FlowerBeds = () => <g>{Array.from({ length: 24 }).map((_, i) => <circle key={i} cx={20 + (i * 59) % 390} cy={390 + (i % 4) * 28} r="7" fill={["#fb7185", "#facc15", "#a78bfa", "#22d3ee"][i % 4]} />)}</g>;
const MemorialWall = () => <g><rect x="60" y="238" width="300" height="170" fill="#334155" stroke="#cbd5e1" strokeWidth="5" /><path d="M88 278 H332 M88 315 H332 M88 352 H332" stroke="#94a3b8" strokeWidth="3" /></g>;
const EternalFlame = () => <g><rect x="178" y="375" width="64" height="72" fill="#1f2937" /><path d="M210 386 C179 353 215 329 203 296 C244 324 251 361 210 386 Z" fill="#f97316" /><path d="M210 375 C195 354 215 340 211 324 C229 342 230 360 210 375 Z" fill="#facc15" /></g>;
const FlagRow = () => <g>{[45, 120, 300, 375].map((x, i) => <g key={x}><path d={`M${x} 150 L${x} 400`} stroke="#e2e8f0" strokeWidth="5" /><path d={`M${x} 155 L${x + 55} 174 L${x} 195 Z`} fill={i % 2 ? "#2563eb" : "#dc2626"} /></g>)}</g>;
const WaterWall = () => <path d="M85 190 C115 270 99 330 119 410 M301 190 C276 263 296 332 278 410" stroke="#67e8f9" strokeWidth="18" opacity=".65" />;
const TropicalPlants = () => <g>{[55, 120, 300, 365].map((x, i) => <g key={x}><path d={`M${x} 440 Q${x - 30} 340 ${x} 278 Q${x + 30} 342 ${x} 440`} fill="#15803d" /><path d={`M${x} 347 Q${x - 55} 300 ${x - 60} 254 Q${x - 10} 278 ${x} 347`} fill="#22c55e" /><path d={`M${x} 347 Q${x + 55} 300 ${x + 60} 254 Q${x + 10} 278 ${x} 347`} fill="#16a34a" /></g>)}</g>;
const FestivalStreet = () => <><CitySkyline neon /><ParadeStreet /></>;
const RainbowArch = () => <g>{["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#a855f7"].map((c, i) => <path key={c} d={`M55 ${365 - i * 4} Q210 ${120 + i * 8} 365 ${365 - i * 4}`} fill="none" stroke={c} strokeWidth="9" />)}</g>;
const Stage = () => <g><rect x="122" y="300" width="176" height="104" fill="#111827" stroke="#a855f7" strokeWidth="5" /><path d="M104 300 L210 226 L316 300 Z" fill="#27272a" /><circle cx="210" cy="337" r="28" fill="#ec4899" /></g>;
const Crowd = () => <g>{Array.from({ length: 24 }).map((_, i) => <g key={i}><circle cx={20 + (i * 41) % 390} cy={430 + (i % 3) * 23} r="8" fill="#0f172a" /><rect x={14 + (i * 41) % 390} y={438 + (i % 3) * 23} width="12" height="27" rx="6" fill="#0f172a" /></g>)}</g>;
const Pier = () => <><rect x="0" y="390" width="420" height="150" fill="#78350f" /><path d="M0 412 H420 M0 462 H420 M0 512 H420" stroke="#a16207" strokeWidth="6" /></>;
const FerrisWheel = () => <g transform="translate(300 270)"><circle r="84" fill="none" stroke="#f8fafc" strokeWidth="6" /><circle r="13" fill="#fbbf24" />{Array.from({ length: 8 }).map((_, i) => <g key={i} transform={`rotate(${i * 45})`}><path d="M0 0 L0 -84" stroke="#cbd5e1" strokeWidth="3" /><rect x="-9" y="-96" width="18" height="20" rx="4" fill={i % 2 ? "#ec4899" : "#22d3ee"} /></g>)}</g>;
const RollerCoaster = () => <><path d="M0 320 C80 210 140 420 220 290 C285 180 335 300 420 210" fill="none" stroke="#facc15" strokeWidth="8" /><path d="M0 340 C80 230 140 440 220 310 C285 200 335 320 420 230" fill="none" stroke="#334155" strokeWidth="4" /></>;
const CarnivalStalls = () => <g>{[20, 105, 190].map((x, i) => <g key={x}><rect x={x} y="374" width="70" height="80" fill={i % 2 ? "#2563eb" : "#dc2626"} /><path d={`M${x - 5} 374 L${x + 35} 340 L${x + 75} 374 Z`} fill="#f8fafc" /></g>)}</g>;
const Fairground = () => <><RollingFields /><CarnivalStalls /></>;
const Boardwalk = () => <><rect x="0" y="380" width="420" height="160" fill="#92400e" /><path d="M0 405 H420 M0 455 H420 M0 505 H420" stroke="#d97706" strokeWidth="5" /></>;
const PalmTrees = () => <g>{[48, 365].map(x => <g key={x}><path d={`M${x} 400 Q${x + 18} 300 ${x} 220`} fill="none" stroke="#78350f" strokeWidth="14" /><path d={`M${x} 230 Q${x - 65} 190 ${x - 88} 232 Q${x - 35} 238 ${x} 230 M${x} 230 Q${x + 65} 190 ${x + 88} 232 Q${x + 35} 238 ${x} 230 M${x} 230 Q${x} 170 ${x + 10} 150`} fill="none" stroke="#16a34a" strokeWidth="17" /></g>)}</g>;
const CoastalCoaster = () => <path d="M5 330 C80 250 151 386 227 286 C298 194 348 309 415 245" fill="none" stroke="#f97316" strokeWidth="8" />;
const SeaCliffs = () => <><path d="M0 155 L95 120 L130 420 L0 540 Z" fill="#334155" /><path d="M420 125 L330 170 L293 430 L420 540 Z" fill="#475569" /></>;
const Lighthouse = () => <g><path d="M301 370 L318 180 L354 180 L373 370 Z" fill="#f8fafc" stroke="#dc2626" strokeWidth="7" /><rect x="312" y="148" width="48" height="35" fill="#111827" /><path d="M305 148 L336 118 L367 148 Z" fill="#dc2626" /><circle cx="336" cy="165" r="12" fill="#fde68a" /></g>;
const CaveWaterfall = () => <path d="M85 190 C70 280 99 342 82 470" stroke="#7dd3fc" strokeWidth="18" opacity=".8" />;
const StarField = () => <g>{Array.from({ length: 36 }).map((_, i) => <circle key={i} cx={(i * 71) % 420} cy={(i * 47) % 310} r={1 + (i % 3)} fill="#ffffff" opacity=".8" />)}</g>;
const Observatory = () => <g><path d="M262 390 A72 72 0 0 1 406 390 Z" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="5" /><rect x="322" y="280" width="25" height="85" fill="#64748b" /><path d="M335 280 L390 220" stroke="#e2e8f0" strokeWidth="18" /><circle cx="394" cy="216" r="19" fill="#22d3ee" /></g>;
const CampTents = () => <g>{[55, 138].map((x, i) => <path key={x} d={`M${x} 430 L${x + 38} 365 L${x + 76} 430 Z`} fill={i ? "#f97316" : "#22c55e"} stroke="#fde68a" strokeWidth="4" />)}</g>;
const Telescope = () => <g><path d="M184 390 L214 260" stroke="#94a3b8" strokeWidth="12" /><path d="M202 277 L275 237" stroke="#cbd5e1" strokeWidth="20" /><circle cx="281" cy="233" r="18" fill="#67e8f9" /></g>;
const Windmill = () => <g transform="translate(305 290)"><rect x="-24" y="0" width="48" height="145" fill="#f5deb3" /><circle cy="5" r="14" fill="#78350f" />{[0, 90, 180, 270].map(a => <path key={a} d="M0 5 L0 -80 L18 -45 Z" fill="#f8fafc" stroke="#78350f" strokeWidth="3" transform={`rotate(${a} 0 5)`} />)}</g>;
const HarvestStalls = () => <g>{[25, 115, 205].map((x, i) => <g key={x}><rect x={x} y="380" width="75" height="70" fill="#92400e" /><path d={`M${x - 5} 380 H${x + 80} L${x + 65} 350 H${x + 10} Z`} fill={i % 2 ? "#facc15" : "#f97316"} /></g>)}</g>;
const Barn = () => <g><rect x="45" y="300" width="116" height="120" fill="#991b1b" /><path d="M25 302 L103 235 L181 302 Z" fill="#450a0a" /><path d="M82 420 V340 H124 V420" fill="#451a03" /></g>;
const OrchardRows = () => <g>{[45, 115, 185, 255, 325, 395].map((x, j) => <g key={x}><rect x={x - 6} y="300" width="12" height="140" fill="#713f12" />{Array.from({ length: 5 }).map((_, i) => <circle key={i} cx={x - 27 + (i % 3) * 27} cy={278 + Math.floor(i / 3) * 32} r="26" fill={j % 2 ? "#3f6212" : "#4d7c0f"} />)}</g>)}</g>;
const Farmhouse = () => <g><rect x="265" y="310" width="120" height="110" fill="#f5deb3" /><path d="M245 312 L325 245 L405 312 Z" fill="#7c2d12" /><rect x="313" y="357" width="28" height="63" fill="#78350f" /><rect x="281" y="335" width="21" height="23" fill="#fde68a" /><rect x="351" y="335" width="21" height="23" fill="#fde68a" /><rect x="362" y="247" width="18" height="62" fill="#57534e" /></g>;
const CiderWagon = () => <g><rect x="73" y="385" width="94" height="42" fill="#92400e" /><circle cx="91" cy="434" r="18" fill="#292524" /><circle cx="150" cy="434" r="18" fill="#292524" /><circle cx="104" cy="390" r="14" fill="#dc2626" /><circle cx="133" cy="390" r="14" fill="#dc2626" /></g>;
const TrainLine = () => <><path d="M0 260 H420" stroke="#334155" strokeWidth="7" /><path d="M0 271 H420" stroke="#cbd5e1" strokeWidth="3" /></>;
const CrookedTown = () => <g>{[22, 103, 190, 287, 356].map((x, i) => <g key={x} transform={`rotate(${i % 2 ? 3 : -3} ${x + 30} 390)`}><rect x={x} y={260 - (i % 3) * 35} width="62" height={180 + (i % 3) * 35} fill="#27272a" stroke="#7e22ce" strokeWidth="4" /><path d={`M${x - 8} ${260 - (i % 3) * 35} L${x + 31} ${215 - (i % 3) * 35} L${x + 70} ${260 - (i % 3) * 35} Z`} fill="#111827" /><rect x={x + 19} y={300 - (i % 3) * 35} width="20" height="26" fill="#f97316" /></g>)}</g>;
const HauntedMansion = () => <g><rect x="250" y="210" width="135" height="220" fill="#18181b" stroke="#a855f7" strokeWidth="5" /><path d="M230 212 L318 125 L405 212 Z" fill="#09090b" /><rect x="303" y="340" width="35" height="90" rx="17" fill="#020617" /><circle cx="278" cy="264" r="13" fill="#f97316" /><circle cx="357" cy="264" r="13" fill="#f97316" /></g>;
const PumpkinRoad = () => <g>{Array.from({ length: 12 }).map((_, i) => <g key={i}><ellipse cx={28 + i * 34} cy={448 + (i % 2) * 24} rx="15" ry="12" fill="#f97316" /><path d={`M${23 + i * 34} ${448 + (i % 2) * 24} L${28 + i * 34} ${453 + (i % 2) * 24} L${33 + i * 34} ${448 + (i % 2) * 24}`} stroke="#111827" strokeWidth="3" /></g>)}</g>;
const BrokenFerrisWheel = () => <g transform="translate(300 280)"><circle r="91" fill="none" stroke="#52525b" strokeWidth="7" strokeDasharray="90 16" /><circle r="13" fill="#a855f7" />{Array.from({ length: 7 }).map((_, i) => <path key={i} d="M0 0 L0 -90" stroke="#52525b" strokeWidth="4" transform={`rotate(${i * 51})`} />)}</g>;
const HauntedCarousel = () => <g><path d="M45 400 L160 400 L145 330 L60 330 Z" fill="#27272a" stroke="#ec4899" strokeWidth="4" /><path d="M52 330 L102 280 L153 330 Z" fill="#581c87" /><path d="M70 330 V400 M101 305 V400 M132 330 V400" stroke="#f8fafc" strokeWidth="4" /></g>;
const CarnivalGate = () => <g><path d="M15 400 V190 Q95 105 175 190 V400" fill="none" stroke="#7e22ce" strokeWidth="13" /><text x="95" y="181" textAnchor="middle" fontSize="18" fontWeight="900" fill="#f97316">HAUNTED</text></g>;
const Graveyard = () => <g>{[200, 230, 370, 400].map((x, i) => <path key={x} d={`M${x} 430 V${380 - (i % 2) * 20} Q${x + 15} ${365 - (i % 2) * 20} ${x + 30} ${380 - (i % 2) * 20} V430 Z`} fill="#3f3f46" />)}</g>;
const LongTable = () => <g><rect x="30" y="410" width="255" height="28" rx="8" fill="#78350f" /><rect x="48" y="438" width="12" height="56" fill="#451a03" /><rect x="250" y="438" width="12" height="56" fill="#451a03" />{[70, 110, 150, 190, 230].map((x, i) => <circle key={x} cx={x} cy="401" r="12" fill={i % 2 ? "#f97316" : "#facc15"} />)}</g>;
const MapleForest = () => <g>{[32, 94, 158, 226, 300, 372].map((x, j) => <g key={x}><rect x={x - 8} y="230" width="16" height="230" fill="#713f12" />{Array.from({ length: 7 }).map((_, i) => <circle key={i} cx={x - 30 + (i % 3) * 30} cy={205 + Math.floor(i / 3) * 34} r="28" fill={["#b91c1c", "#ea580c", "#f59e0b"][j % 3]} />)}</g>)}</g>;
const HikingBridge = () => <path d="M40 410 Q210 350 380 410" fill="none" stroke="#78350f" strokeWidth="19" />;
const Deer = () => <g transform="translate(315 390)"><ellipse rx="30" ry="17" fill="#92400e" /><circle cx="30" cy="-18" r="12" fill="#92400e" /><path d="M26 -28 L17 -48 M35 -28 L45 -50" stroke="#78350f" strokeWidth="4" /><path d="M-20 12 L-24 53 M8 12 L12 53" stroke="#78350f" strokeWidth="7" /></g>;
const ChristmasVillage = () => <g>{[22, 100, 190, 285, 360].map((x, i) => <g key={x}><rect x={x} y={300 - (i % 2) * 30} width="68" height={120 + (i % 2) * 30} fill={i % 2 ? "#1d4ed8" : "#b91c1c"} /><path d={`M${x - 8} ${301 - (i % 2) * 30} L${x + 34} ${258 - (i % 2) * 30} L${x + 76} ${301 - (i % 2) * 30} Z`} fill="#f8fafc" /><rect x={x + 12} y={330 - (i % 2) * 30} width="18" height="20" fill="#fde68a" /><rect x={x + 40} y={330 - (i % 2) * 30} width="18" height="20" fill="#fde68a" /></g>)}</g>;
const ChristmasTree = () => <g><path d="M210 130 L130 300 H290 Z" fill="#15803d" /><path d="M210 185 L105 375 H315 Z" fill="#166534" /><rect x="196" y="375" width="28" height="70" fill="#713f12" /><path d="M210 102 L220 123 L244 126 L226 142 L232 165 L210 153 L188 165 L194 142 L176 126 L200 123 Z" fill="#facc15" />{Array.from({ length: 18 }).map((_, i) => <circle key={i} cx={145 + (i * 37) % 130} cy={205 + (i % 5) * 34} r="6" fill={["#ef4444", "#22d3ee", "#facc15", "#f8fafc"][i % 4]} />)}</g>;
const SkatingRink = () => <ellipse cx="210" cy="455" rx="150" ry="50" fill="#bfdbfe" stroke="#ffffff" strokeWidth="5" />;
const TrainLoop = () => <ellipse cx="210" cy="450" rx="180" ry="65" fill="none" stroke="#334155" strokeWidth="8" />;
const WinterPlaza = () => <><path d="M0 330 L420 300 L420 540 L0 540 Z" fill="#dbeafe" /><path d="M0 420 L420 390" stroke="#93c5fd" strokeWidth="5" /></>;
const Menorah = () => <g transform="translate(210 255)"><path d="M0 115 V-78 M0 32 H-95 M0 32 H95 M-95 32 V-34 M95 32 V-34 M-63 32 V-58 M63 32 V-58 M-32 32 V-75 M32 32 V-75" fill="none" stroke="#fbbf24" strokeWidth="9" strokeLinecap="round" />{[-95, -63, -32, 0, 32, 63, 95].map((x, i) => <path key={x} d={`M${x} ${i === 3 ? -95 : i % 3 === 0 ? -52 : i % 2 ? -76 : -93} C${x - 10} ${i === 3 ? -112 : -102} ${x + 10} ${i === 3 ? -112 : -102} ${x} ${i === 3 ? -126 : -116} C${x + 16} ${i === 3 ? -112 : -100} ${x + 12} ${i === 3 ? -99 : -87} ${x} ${i === 3 ? -95 : i % 3 === 0 ? -52 : i % 2 ? -76 : -93} Z`} fill="#60a5fa" />)}</g>;
const BlueGoldBuildings = () => <g>{[25, 315].map((x, i) => <g key={x}><rect x={x} y="235" width="82" height="190" fill={i ? "#1d4ed8" : "#172554"} stroke="#fbbf24" strokeWidth="5" /><path d={`M${x - 9} 235 L${x + 41} 180 L${x + 91} 235 Z`} fill="#f8fafc" /><rect x={x + 17} y="278" width="18" height="23" fill="#fde68a" /><rect x={x + 48} y="278" width="18" height="23" fill="#fde68a" /></g>)}</g>;

function MovingTraffic() { return <div className="seasonal-traffic absolute bottom-[27%] left-[-22%] z-10 flex gap-8"><span className="h-3 w-10 rounded bg-red-400 shadow-[0_0_10px_#ef4444]"/><span className="h-3 w-12 rounded bg-cyan-300 shadow-[0_0_10px_#22d3ee]"/><span className="h-3 w-9 rounded bg-yellow-300 shadow-[0_0_10px_#facc15]"/></div>; }
function FireworkShow() { return <div className="absolute inset-0 z-10">{[[20,18],[55,9],[78,24],[34,31]].map(([l,t],i)=><span key={i} className="seasonal-firework absolute h-3 w-3 rounded-full" style={{left:`${l}%`,top:`${t}%`,color:["#fbbf24","#f472b6","#22d3ee","#ffffff"][i],boxShadow:"0 -28px currentColor, 20px -20px currentColor, 28px 0 currentColor, 20px 20px currentColor, 0 28px currentColor, -20px 20px currentColor, -28px 0 currentColor, -20px -20px currentColor",animationDelay:`${i*.8}s`}} />)}</div>; }
function SweepingLights() { return <div className="absolute inset-0 z-10 overflow-hidden"><span className="seasonal-searchlight absolute bottom-0 left-[18%] h-[120%] w-12 origin-bottom bg-gradient-to-t from-yellow-200/35 to-transparent blur-xl"/><span className="seasonal-searchlight-two absolute bottom-0 right-[18%] h-[120%] w-12 origin-bottom bg-gradient-to-t from-cyan-200/35 to-transparent blur-xl"/></div>; }
function Skaters() { return <div className="absolute bottom-[12%] left-[20%] z-10 flex w-[60%] justify-between"><span className="seasonal-skater text-2xl">⛸️</span><span className="seasonal-skater-two text-2xl">⛸️</span><span className="seasonal-skater text-2xl">⛸️</span></div>; }
function MovingTram() { return <div className="seasonal-tram absolute left-[-30%] top-[47%] z-10 h-8 w-28 rounded bg-red-600 shadow-[0_0_12px_rgba(239,68,68,.8)]"><div className="mt-2 flex justify-around"><i className="h-3 w-4 bg-yellow-200"/><i className="h-3 w-4 bg-yellow-200"/><i className="h-3 w-4 bg-yellow-200"/></div></div>; }
function AuroraMotion() { return <div className="seasonal-aurora absolute left-[-20%] top-[5%] z-10 h-40 w-[140%] rotate-[-8deg] bg-gradient-to-r from-transparent via-emerald-300/30 to-purple-400/30 blur-2xl"/>; }
function LanternSwing() { return <div className="absolute inset-x-0 top-[18%] z-10 flex justify-around"><span className="seasonal-lantern text-3xl">🏮</span><span className="seasonal-lantern-two text-3xl">🏮</span><span className="seasonal-lantern text-3xl">🏮</span></div>; }
function HeartFireworks() { return <div className="seasonal-heart-firework absolute right-[15%] top-[15%] z-10 text-6xl drop-shadow-[0_0_18px_#fb7185]">♡</div>; }
function FountainShimmer() { return <div className="seasonal-fountain-glow absolute bottom-[18%] left-1/2 z-10 h-20 w-44 -translate-x-1/2 rounded-full bg-cyan-200/25 blur-xl"/>; }
function MovingParade({ colors }: { colors: string[] }) { return <div className="seasonal-parade absolute bottom-[16%] left-[-50%] z-10 flex gap-5">{colors.map((c,i)=><span key={i} className="h-10 w-20 rounded-t-2xl border-2 border-white/60" style={{backgroundColor:c}} />)}</div>; }
function MonumentPulse({ color }: { color: string }) { return <div className="seasonal-monument-pulse absolute left-1/2 top-[22%] z-10 h-40 w-24 -translate-x-1/2 rounded-full blur-2xl" style={{backgroundColor:`${color}55`}}/>; }
function RainbowShimmer() { return <div className="seasonal-rainbow-shimmer absolute left-[8%] top-[9%] z-10 h-44 w-[84%] rounded-[50%] border-[18px] border-white/20 blur-lg"/>; }
function CloudDrift() { return <><div className="seasonal-cloud absolute left-[-30%] top-[10%] z-10 h-16 w-48 rounded-full bg-white/25 blur-xl"/><div className="seasonal-cloud-two absolute left-[-40%] top-[25%] z-10 h-12 w-40 rounded-full bg-white/20 blur-xl"/></>; }
function BirdFlight() { return <div className="seasonal-birds absolute left-[-20%] top-[18%] z-10 text-2xl tracking-[1.5em]">⌁⌁⌁</div>; }
function WaterfallFlow() { return <div className="seasonal-waterfall absolute bottom-[8%] left-[18%] z-10 h-[52%] w-6 bg-gradient-to-b from-cyan-100/10 via-cyan-200/60 to-white/10 blur-sm"/>; }
function SunRaySweep() { return <div className="seasonal-sunray absolute -right-[20%] -top-[15%] z-10 h-[80%] w-[70%] rotate-[25deg] bg-gradient-to-l from-yellow-100/25 to-transparent blur-2xl"/>; }
function MovingBoat() { return <div className="seasonal-boat absolute bottom-[23%] left-[-25%] z-10 text-4xl">⛵</div>; }
function TrainPass() { return <div className="seasonal-train absolute left-[-45%] top-[46%] z-10 flex"><span className="h-8 w-28 rounded-l bg-slate-800 border border-white/50"/><span className="h-8 w-20 bg-slate-700 border border-white/50"/><span className="h-8 w-20 rounded-r bg-slate-700 border border-white/50"/></div>; }
function WaterRipple() { return <div className="seasonal-ripple absolute bottom-[10%] left-[25%] z-10 h-8 w-36 rounded-full border-2 border-cyan-100/70"/>; }
function UmbrellaWalk() { return <div className="seasonal-umbrella absolute bottom-[13%] left-[-20%] z-10 flex gap-8 text-3xl">☂️☂️☂️</div>; }
function PuddleRipple() { return <div className="absolute bottom-[8%] left-[15%] z-10 flex w-[70%] justify-between"><span className="seasonal-ripple h-6 w-20 rounded-full border border-cyan-100/70"/><span className="seasonal-ripple-two h-6 w-20 rounded-full border border-cyan-100/70"/></div>; }
function RainbowReveal() { return <div className="seasonal-rainbow-reveal absolute left-[4%] top-[8%] z-10 h-44 w-[92%] rounded-[50%] border-[16px] border-fuchsia-300/30 blur-sm"/>; }
function FlagWave() { return <div className="absolute inset-x-0 top-[26%] z-10 flex justify-between px-8"><span className="seasonal-flag text-4xl">🇺🇸</span><span className="seasonal-flag-two text-4xl">🇺🇸</span></div>; }
function LanternRise() { return <div className="absolute inset-0 z-10">{Array.from({length:10}).map((_,i)=><span key={i} className="seasonal-lantern-rise absolute text-xl" style={{left:`${10+(i*29)%80}%`,bottom:`${(i%4)*7}%`,animationDelay:`${i*-.45}s`}}>🏮</span>)}</div>; }
function AircraftFormation() { return <div className="seasonal-aircraft absolute left-[-35%] top-[13%] z-10 text-3xl tracking-[1em]">✈︎ ✈︎ ✈︎</div>; }
function FlameFlicker() { return <div className="seasonal-flame absolute bottom-[21%] left-1/2 z-10 h-16 w-10 -translate-x-1/2 rounded-[50%_50%_45%_45%] bg-orange-400 blur-sm shadow-[0_0_22px_#f97316]"/>; }
function WaterWallFlow() { return <div className="seasonal-water-wall absolute inset-y-[27%] left-[18%] z-10 w-5 bg-cyan-200/50 blur-sm"/>; }
function FlowerBloom() { return <div className="seasonal-bloom absolute bottom-[10%] left-1/2 z-10 text-5xl">🌺</div>; }
function StageBeams() { return <><div className="seasonal-stagebeam absolute bottom-[22%] left-[34%] z-10 h-[70%] w-6 origin-bottom rotate-[-20deg] bg-gradient-to-t from-fuchsia-300/40 to-transparent blur-xl"/><div className="seasonal-stagebeam-two absolute bottom-[22%] right-[34%] z-10 h-[70%] w-6 origin-bottom rotate-[20deg] bg-gradient-to-t from-cyan-300/40 to-transparent blur-xl"/></>; }
function WheelSpin() { return <div className="seasonal-wheel absolute right-[7%] top-[27%] z-10 h-40 w-40 rounded-full border-4 border-white/40"><div className="absolute left-1/2 top-1/2 h-[2px] w-full -translate-x-1/2 -translate-y-1/2 bg-white/50"/><div className="absolute left-1/2 top-1/2 h-full w-[2px] -translate-x-1/2 -translate-y-1/2 bg-white/50"/></div>; }
function CoasterTrain() { return <div className="seasonal-coaster absolute left-[-20%] top-[43%] z-10 flex gap-1"><span className="h-4 w-6 rounded bg-red-500"/><span className="h-4 w-6 rounded bg-yellow-400"/><span className="h-4 w-6 rounded bg-blue-500"/></div>; }
function WaveMotion() { return <><div className="seasonal-wave absolute bottom-[17%] left-[-25%] z-10 h-8 w-[150%] rounded-[50%] border-t-4 border-cyan-100/70"/><div className="seasonal-wave-two absolute bottom-[9%] left-[-30%] z-10 h-8 w-[160%] rounded-[50%] border-t-4 border-white/50"/></>; }
function Surfers() { return <div className="seasonal-surfer absolute bottom-[18%] left-[-20%] z-10 text-4xl">🏄</div>; }
function LighthouseSweep() { return <div className="seasonal-lighthouse-beam absolute right-[18%] top-[25%] z-10 h-12 w-[70%] origin-right rotate-[-12deg] bg-gradient-to-l from-yellow-100/45 to-transparent blur-xl"/>; }
function ShipPass() { return <div className="seasonal-ship absolute bottom-[25%] left-[-30%] z-10 text-5xl">🚢</div>; }
function MeteorStorm() { return <div className="absolute inset-0 z-10">{Array.from({length:8}).map((_,i)=><span key={i} className="seasonal-meteor absolute h-[3px] w-32 rotate-[-28deg] bg-gradient-to-r from-white via-cyan-200 to-transparent shadow-[0_0_9px_#fff]" style={{left:`${(i*19)%90}%`,top:`${5+(i*13)%45}%`,animationDelay:`${i*-.7}s`}} />)}</div>; }
function SatelliteOrbit() { return <div className="seasonal-satellite absolute left-1/2 top-[20%] z-10 text-3xl">🛰️</div>; }
function TelescopeRotate() { return <div className="seasonal-telescope absolute bottom-[24%] right-[19%] z-10 h-6 w-20 origin-left rotate-[-28deg] rounded bg-slate-300"/>; }
function CampGlow() { return <div className="seasonal-campglow absolute bottom-[15%] left-[24%] z-10 h-24 w-36 rounded-full bg-orange-300/25 blur-2xl"/>; }
function WindmillSpin() { return <div className="seasonal-windmill absolute right-[17%] top-[47%] z-10 h-32 w-32"><span className="absolute left-1/2 top-1/2 h-3 w-full -translate-x-1/2 -translate-y-1/2 bg-white/70"/><span className="absolute left-1/2 top-1/2 h-full w-3 -translate-x-1/2 -translate-y-1/2 bg-white/70"/></div>; }
function Hayride() { return <div className="seasonal-hayride absolute bottom-[15%] left-[-30%] z-10 text-5xl">🚜</div>; }
function WagonPass() { return <div className="seasonal-wagon absolute bottom-[15%] left-[-30%] z-10 text-5xl">🛻</div>; }
function BatFlight() { return <div className="seasonal-bats absolute left-[-30%] top-[17%] z-10 text-2xl tracking-[1.2em]">🦇🦇🦇</div>; }
function WindowFlicker() { return <div className="seasonal-window-flicker absolute right-[17%] top-[48%] z-10 h-8 w-8 bg-orange-300 shadow-[0_0_22px_#f97316]"/>; }
function TrickOrTreaters() { return <div className="seasonal-treaters absolute bottom-[10%] left-[-25%] z-10 text-4xl">🧙‍♀️ 🧛 🧟</div>; }
function PumpkinFlicker() { return <div className="seasonal-pumpkin-glow absolute bottom-[8%] left-[12%] z-10 h-16 w-[76%] bg-orange-400/20 blur-2xl"/>; }
function GhostRide() { return <div className="seasonal-ghost absolute bottom-[25%] left-[-20%] z-10 text-5xl">👻</div>; }
function CarouselSpin() { return <div className="seasonal-carousel absolute bottom-[20%] left-[12%] z-10 h-24 w-24 rounded-full border-4 border-fuchsia-400/50"/>; }
function SignFlicker() { return <div className="seasonal-sign absolute left-[8%] top-[27%] z-10 text-xl font-black text-orange-400 drop-shadow-[0_0_12px_#f97316]">HAUNTED</div>; }
function ChimneySmoke() { return <div className="absolute right-[9%] top-[31%] z-10"><span className="seasonal-smoke block h-12 w-12 rounded-full bg-white/25 blur-xl"/><span className="seasonal-smoke-two mt-[-18px] ml-5 block h-16 w-16 rounded-full bg-white/20 blur-xl"/></div>; }
function StringLightTwinkle() { return <div className="absolute inset-x-[8%] top-[32%] z-10 flex justify-between">{Array.from({length:13}).map((_,i)=><span key={i} className="seasonal-light h-3 w-3 rounded-full" style={{backgroundColor:["#ef4444","#22d3ee","#facc15","#ffffff"][i%4],boxShadow:"0 0 9px currentColor",animationDelay:`${i*.14}s`}} />)}</div>; }
function DeerWalk() { return <div className="seasonal-deer absolute bottom-[13%] left-[-20%] z-10 text-5xl">🦌</div>; }
function TrainCircle() { return <div className="seasonal-train-circle absolute bottom-[10%] left-[5%] z-10 text-4xl">🚂</div>; }
function SleighFlight() { return <div className="seasonal-sleigh absolute left-[-35%] top-[16%] z-10 text-5xl">🛷</div>; }
function CandleFlicker() { return <div className="absolute left-1/2 top-[24%] z-10 flex -translate-x-1/2 gap-4">{Array.from({length:7}).map((_,i)=><span key={i} className="seasonal-candle block h-5 w-3 rounded-[50%] bg-blue-200 shadow-[0_0_14px_#60a5fa]" style={{animationDelay:`${i*.11}s`}} />)}</div>; }
function DreidelSpin() { return <div className="seasonal-dreidel absolute bottom-[13%] left-[18%] z-10 text-5xl">🔯</div>; }

function SeasonalStyles() {
  return <style>{`
    @keyframes seasonalAcross { from { transform: translateX(0); } to { transform: translateX(620px); } }
    @keyframes seasonalAcrossFar { from { transform: translateX(0); } to { transform: translateX(760px); } }
    @keyframes seasonalRise { 0% { transform: translateY(100px) scale(.6); opacity:0; } 15% {opacity:1;} 100% { transform: translateY(-620px) scale(1.2); opacity:0; } }
    @keyframes seasonalFall { from { transform: translateY(-120px) rotate(0deg); opacity:0; } 10% {opacity:1;} to { transform: translateY(680px) rotate(480deg); opacity:0; } }
    @keyframes seasonalPulse { 0%,100% { transform:scale(.65); opacity:.25;} 50% {transform:scale(1.15); opacity:1;} }
    @keyframes seasonalSpin { to { transform:rotate(360deg); } }
    @keyframes seasonalSwing { 0%,100% {transform:rotate(-8deg);} 50% {transform:rotate(8deg);} }
    @keyframes seasonalDrift { 0%,100% {transform:translateX(-25px);} 50% {transform:translateX(45px);} }
    @keyframes seasonalWave { 0%,100% {transform:translateX(-4%) scaleY(.8);} 50% {transform:translateX(4%) scaleY(1.25);} }
    @keyframes seasonalFlicker { 0%,100% {opacity:.35;} 30% {opacity:1;} 45% {opacity:.55;} 70% {opacity:.9;} }
    @keyframes seasonalOrbit { from {transform:rotate(0deg) translateX(130px) rotate(0deg);} to {transform:rotate(360deg) translateX(130px) rotate(-360deg);} }
    @keyframes seasonalMeteor { from {transform:translate3d(-180px,-120px,0) rotate(-28deg);opacity:0;} 12%{opacity:1;} to{transform:translate3d(500px,300px,0) rotate(-28deg);opacity:0;} }
    @keyframes seasonalRainbow { 0%,100%{filter:hue-rotate(0deg);opacity:.45;}50%{filter:hue-rotate(35deg);opacity:.95;} }
    @keyframes seasonalSkate { 0%,100%{transform:translateX(-18px) rotate(-4deg);}50%{transform:translateX(22px) rotate(5deg);} }
    @keyframes seasonalSearch { 0%,100%{transform:rotate(-30deg);}50%{transform:rotate(32deg);} }
    @keyframes seasonalBounce { 0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);} }
    @keyframes seasonalBloom { 0%,100%{transform:scale(.72) rotate(-5deg);}50%{transform:scale(1.15) rotate(6deg);} }
    .seasonal-traffic,.seasonal-parade,.seasonal-tram,.seasonal-train,.seasonal-boat,.seasonal-ship,.seasonal-aircraft,.seasonal-hayride,.seasonal-wagon,.seasonal-treaters,.seasonal-ghost,.seasonal-deer,.seasonal-sleigh { animation:seasonalAcrossFar 8s linear infinite; }
    .seasonal-coaster,.seasonal-surfer { animation:seasonalAcross 5s linear infinite; }
    .seasonal-train-circle { animation:seasonalAcross 7s linear infinite; }
    .seasonal-firework,.seasonal-heart-firework,.seasonal-monument-pulse,.seasonal-fountain-glow,.seasonal-window-flicker,.seasonal-pumpkin-glow,.seasonal-sign,.seasonal-campglow { animation:seasonalPulse 2.3s ease-in-out infinite; }
    .seasonal-searchlight { animation:seasonalSearch 4.5s ease-in-out infinite; }
    .seasonal-searchlight-two { animation:seasonalSearch 5.2s ease-in-out infinite reverse; }
    .seasonal-skater,.seasonal-skater-two { animation:seasonalSkate 3s ease-in-out infinite; }
    .seasonal-skater-two {animation-direction:reverse;}
    .seasonal-aurora,.seasonal-cloud,.seasonal-cloud-two,.seasonal-sunray,.seasonal-lighthouse-beam {animation:seasonalDrift 6s ease-in-out infinite;}
    .seasonal-lantern,.seasonal-lantern-two {transform-origin:top center;animation:seasonalSwing 2.6s ease-in-out infinite;}.seasonal-lantern-two{animation-direction:reverse;}
    .seasonal-rainbow-shimmer,.seasonal-rainbow-reveal {animation:seasonalRainbow 3.5s ease-in-out infinite;}
    .seasonal-birds,.seasonal-bats {animation:seasonalAcrossFar 9s linear infinite;}
    .seasonal-waterfall,.seasonal-water-wall {animation:seasonalWave 2.2s ease-in-out infinite;}
    .seasonal-ripple,.seasonal-ripple-two {animation:seasonalPulse 2.3s ease-out infinite;}.seasonal-ripple-two{animation-delay:1s;}
    .seasonal-flag,.seasonal-flag-two {transform-origin:left center;animation:seasonalSwing 1.8s ease-in-out infinite;}.seasonal-flag-two{animation-direction:reverse;}
    .seasonal-flame,.seasonal-candle {animation:seasonalFlicker .75s ease-in-out infinite;}
    .seasonal-bloom {animation:seasonalBloom 3s ease-in-out infinite;}
    .seasonal-stagebeam {animation:seasonalSearch 3s ease-in-out infinite;}.seasonal-stagebeam-two{animation:seasonalSearch 3.4s ease-in-out infinite reverse;}
    .seasonal-wheel,.seasonal-windmill,.seasonal-carousel,.seasonal-dreidel {animation:seasonalSpin 7s linear infinite;}
    .seasonal-wave,.seasonal-wave-two {animation:seasonalWave 3s ease-in-out infinite;}.seasonal-wave-two{animation-direction:reverse;}
    .seasonal-satellite {transform-origin:0 0;animation:seasonalOrbit 8s linear infinite;}
    .seasonal-telescope {animation:seasonalSwing 4s ease-in-out infinite;}
    .seasonal-smoke,.seasonal-smoke-two,.seasonal-lantern-rise {animation:seasonalRise 5.5s ease-out infinite;}
    .seasonal-light {animation:seasonalFlicker 1.4s ease-in-out infinite;}
    .seasonal-dreidel {transform-origin:center;}
    .seasonal-confetti,.seasonal-gold-confetti,.seasonal-petal,.seasonal-clover,.seasonal-leaf,.seasonal-apple,.seasonal-snow,.seasonal-rain,.seasonal-butterfly,.seasonal-star,.seasonal-fog {width:8px;height:8px;border-radius:3px;animation:seasonalFall 5s linear infinite;}
    .seasonal-confetti{background:#f472b6;box-shadow:0 0 7px #fff;}.seasonal-gold-confetti{background:#fbbf24;box-shadow:0 0 9px #fbbf24;}.seasonal-petal{width:13px;height:8px;border-radius:70% 30%;background:#f9a8d4;}.seasonal-clover{background:#22c55e;transform:rotate(45deg);}.seasonal-leaf{width:14px;height:9px;border-radius:80% 20%;background:#ea580c;}.seasonal-apple{width:12px;height:12px;border-radius:50%;background:#dc2626;}.seasonal-snow{border-radius:50%;background:#fff;box-shadow:0 0 8px #fff;}.seasonal-rain{width:2px;height:35px;border-radius:0;background:linear-gradient(transparent,#bae6fd);}.seasonal-butterfly{width:15px;height:10px;background:#facc15;border-radius:70% 30%;animation-duration:7s;}.seasonal-star{width:4px;height:4px;border-radius:50%;background:#fff;box-shadow:0 0 9px #fff;animation:seasonalPulse 2s ease-in-out infinite;}.seasonal-fog{width:180px;height:55px;border-radius:50%;background:rgba(255,255,255,.13);filter:blur(16px);animation:seasonalAcrossFar 11s linear infinite;}
    .seasonal-meteor {animation:seasonalMeteor 4.8s linear infinite;}
  `}</style>;
}
