export type GeneralMilitaryQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const GENERAL_MILITARY_DEFS: GeneralMilitaryQuestionDef[] = [
  {
    prompt: "What does NATO stand for?",
    options: [
      "North Atlantic Treaty Organization",
      "National Allied Treaty Organization",
      "Northern Army Tactical Operations",
      "North American Treaty Office",
    ],
    correctIndex: 0,
  },
  {
    prompt: "Which US military branch operates aircraft carriers as its primary capital ships?",
    options: ["Army", "Navy", "Air Force", "Marine Corps"],
    correctIndex: 1,
  },
  {
    prompt: "The AK-47 assault rifle was designed in which country?",
    options: ["United States", "Soviet Union", "Germany", "China"],
    correctIndex: 1,
  },
  {
    prompt: "Which bolt-action rifle served as the standard British service rifle for much of the early 20th century?",
    options: ["M1 Garand", "Lee–Enfield", "Mauser 98", "SKS"],
    correctIndex: 1,
  },
  {
    prompt: "Which rank is typically the highest in the US Army during peacetime (four stars)?",
    options: ["Colonel", "General", "Major", "Brigadier"],
    correctIndex: 1,
  },
  {
    prompt: "A submarine-launched ballistic missile is commonly abbreviated as?",
    options: ["ICBM", "SLBM", "SAM", "ATGM"],
    correctIndex: 1,
  },
  {
    prompt: "Which organization is the United Nations' primary peacekeeping body?",
    options: ["UNESCO", "UN Security Council authorized missions", "WHO", "IMF"],
    correctIndex: 1,
  },
  {
    prompt: "The F-35 is a family of aircraft developed primarily by which country?",
    options: ["Russia", "United States", "France", "Sweden"],
    correctIndex: 1,
  },
  {
    prompt: "What type of ship is designed to transport and land Marines and equipment?",
    options: ["Destroyer", "Amphibious assault ship", "Frigate", "Corvette"],
    correctIndex: 1,
  },
  {
    prompt: "Which treaty limits strategic nuclear arms between the US and Russia (successor to START)?",
    options: ["Geneva Conventions", "New START", "Treaty of Versailles", "Montreux Convention"],
    correctIndex: 1,
  },
  {
    prompt: "Radar stands for which phrase (historical expansion)?",
    options: [
      "Radio Detection and Ranging",
      "Remote Air Defense and Reconnaissance",
      "Rapid Automatic Detection Array Relay",
      "Range and Direction Analysis Radar",
    ],
    correctIndex: 0,
  },
  {
    prompt: "Which vehicle is a main battle tank used by the US Army (M1 series)?",
    options: ["Leopard 2", "Abrams", "Challenger 2", "T-90"],
    correctIndex: 1,
  },
  {
    prompt: "What does IED stand for in modern conflict reporting?",
    options: ["Integrated Electronic Device", "Improvised Explosive Device", "Internal Engine Detonator", "Infantry Engagement Drone"],
    correctIndex: 1,
  },
  {
    prompt: "Which branch of the US Department of Defense includes the Rangers and Green Berets?",
    options: ["Navy", "Army Special Operations", "Coast Guard", "Space Force only"],
    correctIndex: 1,
  },
  {
    prompt: "The Geneva Conventions primarily address treatment of whom during war?",
    options: ["Weapons manufacturers", "Wounded, prisoners, and civilians", "Mercenaries only", "Politicians"],
    correctIndex: 1,
  },
  {
    prompt: "Which missile defense system uses the Patriot name?",
    options: ["US surface-to-air system", "Russian ICBM", "Chinese cruise missile", "UK torpedo"],
    correctIndex: 0,
  },
  {
    prompt: "An aircraft carrier's angled flight deck helps with what?",
    options: ["Submarine docking", "Simultaneous launch and recovery operations", "Helicopter-only ops", "Stealth from radar"],
    correctIndex: 1,
  },
  {
    prompt: "Which country developed the Mirage fighter aircraft series?",
    options: ["France", "Israel", "Italy", "Canada"],
    correctIndex: 0,
  },
  {
    prompt: "What is a drone used for military reconnaissance often called?",
    options: ["UAV", "APC", "MLRS", "LHD"],
    correctIndex: 0,
  },
  {
    prompt: "Which US service academy is located at West Point, New York?",
    options: ["Naval Academy", "Military Academy (Army)", "Air Force Academy", "Coast Guard Academy"],
    correctIndex: 1,
  },
  {
    prompt: "The B-52 Stratofortress is primarily what type of aircraft?",
    options: ["Fighter", "Long-range bomber", "Transport", "Tanker only"],
    correctIndex: 1,
  },
  {
    prompt: "Which naval rank is equivalent to a ground force general (O-10 in US)?",
    options: ["Captain", "Admiral", "Commander", "Lieutenant"],
    correctIndex: 1,
  },
  {
    prompt: "Body armor rated to stop rifle rounds is often referred to as?",
    options: ["Level I soft only", "Hard plate / higher NIJ rifle-rated protection", "Ceramic paint", "Kevlar paint only"],
    correctIndex: 1,
  },
  {
    prompt: "Which organization coordinates military standards among many Western nations?",
    options: ["Warsaw Pact", "NATO", "ASEAN", "OPEC"],
    correctIndex: 1,
  },
  {
    prompt: "The Humvee (HMMWV) is primarily a?",
    options: ["Fighter jet", "Tactical wheeled vehicle", "Submarine", "Howitzer"],
    correctIndex: 1,
  },
  {
    prompt: "Which country operates the aircraft carrier HMS Queen Elizabeth?",
    options: ["United States", "United Kingdom", "France", "India"],
    correctIndex: 1,
  },
  {
    prompt: "What does RPG commonly stand for in military context?",
    options: ["Rocket-Propelled Grenade", "Rapid Pulse Gun", "Remote Piloted Glider", "Rotary Propulsion Generator"],
    correctIndex: 0,
  },
  {
    prompt: "Which treaty established rules for conduct on the high seas in warfare (1907 Hague context)?",
    options: ["Hague Conventions", "Kyoto Protocol", "Maastricht Treaty", "Camp David Accords"],
    correctIndex: 0,
  },
  {
    prompt: "The M777 is a lightweight what?",
    options: ["Artillery howitzer", "Jet engine", "Radar set", "Submarine periscope"],
    correctIndex: 0,
  },
  {
    prompt: "Which US military branch was established as an independent service in 1947?",
    options: ["Marine Corps", "Air Force", "Coast Guard", "Space Force"],
    correctIndex: 1,
  },
  {
    prompt: "Stealth aircraft design primarily reduces what?",
    options: ["Fuel use only", "Radar cross-section", "Pilot weight", "Engine noise entirely"],
    correctIndex: 1,
  },
  {
    prompt: "Which ship class is smallest among these US surface combatants?",
    options: ["Aircraft carrier", "Destroyer", "Patrol boat / littoral craft", "Amphibious assault ship"],
    correctIndex: 2,
  },
  {
    prompt: "The term 'boot camp' in the US refers to?",
    options: ["Officer academy only", "Basic military training", "Veterans hospital", "Reserve retirement"],
    correctIndex: 1,
  },
  {
    prompt: "Which country produces the T-90 main battle tank?",
    options: ["Russia", "Germany", "Japan", "Brazil"],
    correctIndex: 0,
  },
  {
    prompt: "Aircraft designed to refuel others in flight are called?",
    options: ["Tankers", "Fighters", "AWACS only", "Gliders"],
    correctIndex: 0,
  },
  {
    prompt: "Which medal is the highest US military decoration for valor?",
    options: ["Bronze Star", "Medal of Honor", "Purple Heart", "Legion of Merit"],
    correctIndex: 1,
  },
  {
    prompt: "Sonar is primarily used for detection under what medium?",
    options: ["Air", "Water", "Vacuum", "Soil only"],
    correctIndex: 1,
  },
  {
    prompt: "Which acronym describes a multi-barrel rocket artillery system?",
    options: ["MLRS", "UAV", "APC", "SAM"],
    correctIndex: 0,
  },
  {
    prompt: "The Pentagon serves as headquarters for which department?",
    options: ["State Department", "Department of Defense", "Treasury", "Homeland Security only"],
    correctIndex: 1,
  },
  {
    prompt: "Which camouflage pattern name is associated with US Army adoption in the 2000s?",
    options: ["UCP / ACU-era patterns", "Dazzle ship paint only", "Red coat", "Blue uniform"],
    correctIndex: 0,
  },
  {
    prompt: "An APC (Armored Personnel Carrier) is designed to do what?",
    options: ["Carry troops with protection", "Launch ICBMs", "Mine asteroids", "Refuel jets"],
    correctIndex: 0,
  },
  {
    prompt: "Which country developed the Saab Gripen fighter?",
    options: ["Sweden", "Norway", "Netherlands", "Turkey"],
    correctIndex: 0,
  },
  {
    prompt: "The term 'friendly fire' means?",
    options: ["Fireworks display", "Casualties from one's own forces", "Diplomatic talks", "Training exercise only"],
    correctIndex: 1,
  },
  {
    prompt: "Which US military installation is in Norfolk, Virginia, and is the world's largest naval station?",
    options: ["Naval Station Norfolk", "Fort Bragg", "Camp Pendleton", "Wright-Patterson AFB"],
    correctIndex: 0,
  },
  {
    prompt: "A nuclear triad typically includes land-based missiles, submarines, and what?",
    options: ["Tanks", "Strategic bombers", "Aircraft carriers only", "Infantry"],
    correctIndex: 1,
  },
  {
    prompt: "Which handheld launcher is famous for the US M72 LAW?",
    options: ["Disposable anti-tank rocket launcher", "Sniper rifle", "Mortar", "Flamethrower"],
    correctIndex: 0,
  },
  {
    prompt: "The term 'sortie' in air operations means?",
    options: ["A single mission flight by one aircraft", "A naval rank", "A type of tank tread", "A ceasefire document"],
    correctIndex: 0,
  },
  {
    prompt: "Which international symbol marks protected medical facilities under Geneva rules?",
    options: ["Red Cross / Red Crescent", "Skull and crossbones", "Green triangle only", "Blue square only"],
    correctIndex: 0,
  },
  {
    prompt: "Which US service operates the U-2 high-altitude reconnaissance aircraft (historically)?",
    options: ["Air Force", "Army National Guard only", "Coast Guard", "NOAA"],
    correctIndex: 0,
  },
  {
    prompt: "The term 'logistics' in military affairs refers to?",
    options: ["Supply, transport, and sustainment", "Front-line sniping only", "Parade marching", "Cryptography only"],
    correctIndex: 0,
  },
  {
    prompt: "Which helmet standard material became widespread in modern combat helmets alongside aramids?",
    options: ["High-density polyethylene / advanced composites", "Pure gold", "Glass only", "Paper mache"],
    correctIndex: 0,
  },
];
