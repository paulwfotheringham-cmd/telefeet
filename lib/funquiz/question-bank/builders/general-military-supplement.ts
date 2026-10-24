import type { GeneralMilitaryQuestionDef } from "./general-military";

/** Replacements for misclassified geography items and additional hard military items. */
export const GENERAL_MILITARY_INTERMEDIATE_SUPPLEMENT: GeneralMilitaryQuestionDef[] = [
  {
    prompt: "Which military alliance was established in 1949?",
    options: ["NATO", "Warsaw Pact", "SEATO", "CENTO"],
    correctIndex: 0,
  },
  {
    prompt: "Which document governs the treatment of prisoners of war in international law?",
    options: [
      "Third Geneva Convention",
      "Universal Declaration of Human Rights",
      "Treaty of Westphalia",
      "Montreal Protocol",
    ],
    correctIndex: 0,
  },
  {
    prompt: "Which US service branch operates most fixed-wing tanker aircraft for air refueling?",
    options: ["Air Force", "Army", "Navy", "Coast Guard"],
    correctIndex: 0,
  },
  {
    prompt: "What does SAM stand for in air-defence terminology?",
    options: [
      "Surface-to-Air Missile",
      "Strategic Air Mobility",
      "Submarine Attack Module",
      "Secure Access Matrix",
    ],
    correctIndex: 0,
  },
  {
    prompt: "Which formation is designed to move infantry with armored protection?",
    options: [
      "Mechanized infantry",
      "Coastal artillery",
      "Balloon observation corps",
      "Static garrison militia",
    ],
    correctIndex: 0,
  },
  {
    prompt: "Which NATO reporting name prefix is commonly used for Soviet/Russian fighter aircraft?",
    options: ["Flanker/Fulcrum-style names", "Lightning-style names", "Mustang-style names", "Spitfire-style names"],
    correctIndex: 0,
  },
  {
    prompt: "Which rank is one star in the US armed forces?",
    options: ["Brigadier general / Rear admiral (lower half)", "Colonel", "Captain", "Major"],
    correctIndex: 0,
  },
  {
    prompt: "Which system is used to identify friendly forces on the battlefield to reduce fratricide?",
    options: ["IFF (Identification Friend or Foe)", "GPS-only navigation", "Morse lamp signals", "Paper dog tags only"],
    correctIndex: 0,
  },
  {
    prompt: "Which type of mine is designed to disable or destroy armored vehicles?",
    options: ["Anti-tank mine", "Training mine", "Decorative mine", "Acoustic decoy mine"],
    correctIndex: 0,
  },
  {
    prompt: "Which branch traditionally operates attack submarines in the US Navy?",
    options: ["Submarine Force", "Merchant Marine", "National Guard Bureau", "Civil Affairs Command"],
    correctIndex: 0,
  },
  {
    prompt: "What is a squad in basic infantry organization?",
    options: [
      "A small unit typically led by a non-commissioned officer",
      "A fleet carrier group",
      "A strategic bomber wing",
      "A division headquarters staff",
    ],
    correctIndex: 0,
  },
  {
    prompt: "Which weapon is classified as a crew-served machine gun rather than a personal sidearm?",
    options: ["M240 general-purpose machine gun", "Service pistol", "Folding knife", "Hand grenade only"],
    correctIndex: 0,
  },
  {
    prompt: "Which term describes moving supplies forward to sustain combat units?",
    options: ["Logistics / sustainment", "Demobilization", "Demilitarization", "Disarmament talks"],
    correctIndex: 0,
  },
  {
    prompt: "Which aircraft role focuses on detecting hostile aircraft and directing interceptors?",
    options: ["Airborne early warning and control", "Ground-attack only", "Agricultural spraying", "Passenger transport"],
    correctIndex: 0,
  },
  {
    prompt: "Which international agreement restricts certain conventional weapons such as mines and incendiary weapons?",
    options: ["CCW (Convention on Certain Conventional Weapons)", "Antarctic Treaty", "Paris Climate Agreement", "Berne Copyright Convention"],
    correctIndex: 0,
  },
  {
    prompt: "Which US medal is awarded for wounds received in combat?",
    options: ["Purple Heart", "Medal of Honor", "Silver Star", "Good Conduct Medal"],
    correctIndex: 0,
  },
];

export const GENERAL_MILITARY_HARD_SUPPLEMENT: GeneralMilitaryQuestionDef[] = [
  {
    prompt:
      "Which German operational concept during the 1940 campaign relied on concentrating armoured formations to achieve a breakthrough, followed by rapid exploitation into the operational rear?",
    options: ["Schwerpunktbildung", "Auftragstaktik", "Elastische Verteidigung", "Kesselschlacht"],
    correctIndex: 0,
  },
  {
    prompt: "Which Soviet deep-operation theorist emphasized successive echeloned blows to collapse the enemy's entire operational depth?",
    options: ["Mikhail Tukhachevsky", "Carl von Clausewitz", "Antoine-Henri Jomini", "Alfred Thayer Mahan"],
    correctIndex: 0,
  },
  {
    prompt: "In NATO doctrine, which term describes the coordinated application of lethal and non-lethal actions to influence, neutralize, or destroy enemy capabilities?",
    options: ["Effects-based approach", "Single-service attrition", "Static trench parity", "Unilateral ceasefire"],
    correctIndex: 0,
  },
  {
    prompt: "Which US Army concept formalized modular brigade combat teams after the early 2000s force redesign?",
    options: ["Modular force / BCT structure", "Pentomic division only", "Horse cavalry centric model", "Coastal fortification plan"],
    correctIndex: 0,
  },
  {
    prompt: "Which radar mode compares a stored signature with a received echo to classify a target?",
    options: ["Non-cooperative target recognition techniques", "Visual parallax only", "Barometric altitude averaging", "Magnetic compass bias"],
    correctIndex: 0,
  },
  {
    prompt: "Which treaty framework governs accountability for cluster munition stockpiles and transfers among signatories?",
    options: ["Convention on Cluster Munitions", "Open Skies Treaty", "Antarctic Treaty", "Outer Space Treaty only"],
    correctIndex: 0,
  },
  {
    prompt: "Which airpower concept prioritizes destroying an enemy's ability to operate as a system rather than only attriting platforms?",
    options: ["Effects-based / system paralysis approaches", "Pure platform counting", "Ceremonial flyovers", "Unarmed reconnaissance only"],
    correctIndex: 0,
  },
  {
    prompt: "Which naval concept groups carrier, escorts, and logistics into a self-contained fighting formation?",
    options: ["Carrier strike group", "Coastal fishing flotilla", "Single-submarine patrol box", "Riverine ferry chain"],
    correctIndex: 0,
  },
  {
    prompt: "Which Cold War US doctrine emphasized forward defense and reinforcement of NATO's central front in Europe?",
    options: ["Flexible Response / forward defense posture", "Island-hopping only", "Fortress America isolation", "Unilateral disarmament"],
    correctIndex: 0,
  },
  {
    prompt: "Which metric is central to evaluating artillery fire planning against time-sensitive targets?",
    options: ["Time on target / synchronized impact", "Parade-ground alignment", "Uniform color matching", "Band rehearsal timing"],
    correctIndex: 0,
  },
  {
    prompt: "Which electronic warfare discipline focuses on intercepting and analyzing adversary emissions?",
    options: ["Signals intelligence (SIGINT) support to EW", "Mess-hall logistics", "Physical training testing", "Chapel scheduling"],
    correctIndex: 0,
  },
  {
    prompt: "Which amphibious doctrine phase establishes a secure area for follow-on forces after initial assault waves?",
    options: ["Build-up and expansion of the beachhead", "Permanent demobilization", "Immediate national election", "Total fleet decommissioning"],
    correctIndex: 0,
  },
  {
    prompt: "Which concept describes dispersing forces to reduce vulnerability to massed fires while retaining the ability to mass for decisive action?",
    options: ["Dispersal and concentration trade-offs", "Permanent static line only", "Single-file road march doctrine", "No-reserve employment"],
    correctIndex: 0,
  },
  {
    prompt: "Which precision-guidance method compares live terrain elevation to a stored digital map?",
    options: ["TERCOM / DSMAC-related terrain correlation", "Sextant celestial fix only", "Paper map tracing", "Voice radio compass"],
    correctIndex: 0,
  },
  {
    prompt: "Which logistics metric measures demand satisfaction under combat consumption rates?",
    options: ["Fill rate / supply responsiveness", "Parade attendance", "Uniform inspection score", "Band performance rating"],
    correctIndex: 0,
  },
  {
    prompt: "Which rank structure change in many modern militaries pushed combined-arms planning to brigade level?",
    options: ["Flattened brigade-centric command", "Corps-only decision making", "Squad-autonomous nuclear release", "Elimination of NCO roles"],
    correctIndex: 0,
  },
  {
    prompt: "Which anti-access/area denial (A2/AD) capability most directly threatens carrier operations far from shore?",
    options: ["Long-range anti-ship ballistic/cruise missile complexes", "Unarmed weather balloons", "Coastal lighthouse networks", "Harbor tugboats"],
    correctIndex: 0,
  },
  {
    prompt: "Which intelligence discipline analyzes adversary order of battle and unit dispositions?",
    options: ["Order-of-battle analysis (often IMINT/SIGINT fused)", "Culinary inspection", "Sports performance analytics", "Retail inventory counting"],
    correctIndex: 0,
  },
  {
    prompt: "Which historical staff system standardized operational planning cycles in many Western armies?",
    options: ["Prussian/German general staff model", "Athenian lottery magistrates", "Viking thing assemblies", "Merchant guild schedules"],
    correctIndex: 0,
  },
  {
    prompt: "Which concept governs proportionality and distinction in targeting under the laws of armed conflict?",
    options: ["International humanitarian law targeting principles", "Maximum collateral regardless of aim", "Random target selection", "Unrestricted city bombardment doctrine"],
    correctIndex: 0,
  },
  {
    prompt: "Which missile defense layer is intended to intercept threats in their midcourse phase outside the atmosphere?",
    options: ["Midcourse intercept systems (e.g., GMD-class roles)", "Harbor mine nets", "Infantry bayonet charges", "Acoustic foghorns"],
    correctIndex: 0,
  },
  {
    prompt: "Which operational pause is deliberately used to reconstitute combat power, resupply, and plan the next phase?",
    options: ["Operational halt / reset period", "Permanent disbandment", "Immediate unit dissolution", "Cessation of all communications"],
    correctIndex: 0,
  },
  {
    prompt: "Which naval tactic crosses the enemy's 'T' to bring maximum broadside fire while limiting return fire?",
    options: ["Line-of-battle crossing maneuver", "Single-ship ramming only", "Anchor in port indefinitely", "Remove all gun turrets"],
    correctIndex: 0,
  },
  {
    prompt: "Which aviation planning cell integrates air tasking orders with ground scheme of maneuver?",
    options: ["Joint air-ground integration / JAOC planning", "Mess committee", "Uniform tailoring shop", "Recruiting poster studio"],
    correctIndex: 0,
  },
  {
    prompt: "Which concept uses decoys and signature control to mislead enemy sensors and weapons?",
    options: ["Military deception and signature management", "Always emit maximum radar power", "Paint all vehicles neon", "Disable all camouflage"],
    correctIndex: 0,
  },
  {
    prompt: "Which sustainment challenge is most acute in high-tempo armored advances far from fixed depots?",
    options: ["Fuel and ammunition throughput to leading echelons", "Parade uniform starching", "Library book rotation", "Chapel choir scheduling"],
    correctIndex: 0,
  },
  {
    prompt: "Which command relationship gives a commander authority over assigned forces for specific missions?",
    options: ["Operational control (OPCON) in mission context", "No authority at all", "Only moral persuasion", "Exclusive logistics without command"],
    correctIndex: 0,
  },
  {
    prompt: "Which urban warfare problem most increases fratricide and collateral damage risk?",
    options: ["Compressed battlespace and intermixed civilians/combatants", "Open desert with no structures", "Empty training ranges", "Uninhabited polar ice"],
    correctIndex: 0,
  },
  {
    prompt: "Which satellite constellation concept enables rapid revisit for tactical imagery in modern conflicts?",
    options: ["Low Earth orbit commercial/military remote sensing constellations", "Geostationary-only weather paint", "Lunar surface mirrors", "Balloon-only navigation"],
    correctIndex: 0,
  },
  {
    prompt: "Which historical doctrine emphasized indirect approach and disruption of enemy cohesion rather than frontal attrition?",
    options: ["B.H. Liddell Hart indirect approach (influence on modern thinking)", "Pure frontal trench parity only", "No maneuver allowed", "Single-axis human wave only"],
    correctIndex: 0,
  },
  {
    prompt: "Which cyber effect is most aligned with degrading adversary command-and-control networks during crisis?",
    options: ["Disruption of C2 nodes and communications pathways", "Changing cafeteria menus", "Editing public sports scores", "Recoloring unit patches"],
    correctIndex: 0,
  },
  {
    prompt: "Which combined-arms breach sequence typically follows suppress, obscure, secure, and reduce obstacles?",
    options: ["Synchronized breach drill with engineers and infantry", "Unprotected run through minefields", "Abandon all armor", "Cease all indirect fires"],
    correctIndex: 0,
  },
  {
    prompt: "Which French operational concept in the 1920s–30s envisioned deep armored thrusts to disrupt enemy rear areas?",
    options: ["Deep battle / mechanized exploitation ideas (interwar French doctrine)", "Static trench parity only", "Exclusive cavalry raids", "Naval blockade alone"],
    correctIndex: 0,
  },
  {
    prompt: "Which US joint publication family describes doctrine for planning and executing joint operations?",
    options: ["Joint Publication (JP) series", "Merchant shipping tariffs", "Municipal zoning codes", "University course catalogs"],
    correctIndex: 0,
  },
  {
    prompt: "Which factor most limits sustained high sortie rates from aircraft carriers in combat?",
    options: ["Flight-deck handling cycles, maintenance, and aircrew endurance", "Paint color of the island", "Number of mess hall seats", "Band practice hours"],
    correctIndex: 0,
  },
  {
    prompt: "Which Russian formal military doctrine term emphasizes non-military means alongside armed force to achieve strategic goals?",
    options: ["Hybrid warfare / integrated strategic coercion concepts", "Single-tank duel doctrine", "Exclusive parade marching", "Unarmed neutrality only"],
    correctIndex: 0,
  },
  {
    prompt: "Which targeting process step validates that the selected aimpoint matches commander intent and ROE?",
    options: ["Weaponeering and collateral-damage estimation review", "Random grid selection", "Ignoring intelligence updates", "Skipping legal review"],
    correctIndex: 0,
  },
  {
    prompt: "Which logistics concept prepositions materiel afloat or ashore to reduce response time to a crisis?",
    options: ["Prepositioning ships and forward stocks", "Eliminating all warehouses", "Single depots at home only", "Just-in-time with no reserves"],
    correctIndex: 0,
  },
  {
    prompt: "Which infantry tactic uses bounding overwatch to maintain continuous mutual cover during movement?",
    options: ["Fire and movement / leapfrog bounds", "Static clustering in open ground", "Abandoning all security", "Single-file sprint without cover"],
    correctIndex: 0,
  },
  {
    prompt: "Which electronic protection measure reduces an platform's detectability to hostile radar?",
    options: ["Emission control and low-probability-of-intercept techniques", "Continuous maximum-power radar", "Bright reflective paint", "Always-on radio chatter"],
    correctIndex: 0,
  },
  {
    prompt: "Which historical naval arms-control treaty limited capital ship tonnage among major powers in the interwar period?",
    options: ["Washington Naval Treaty (1922 framework)", "Treaty of Tordesillas", "Camp David Accords", "Kyoto Protocol"],
    correctIndex: 0,
  },
  {
    prompt: "Which operational metric evaluates how quickly a wounded soldier reaches surgical care?",
    options: ["Medical evacuation timeline / golden hour responsiveness", "Parade formation speed", "Uniform inspection pass rate", "Band rehearsal attendance"],
    correctIndex: 0,
  },
  {
    prompt: "Which maneuver warfare principle emphasizes rapid decision cycles to disrupt enemy plans?",
    options: ["Tempo and initiative (OODA-style disruption)", "Predictable fixed timetables only", "Avoid all reconnaissance", "Centralize every decision at national level"],
    correctIndex: 0,
  },
  {
    prompt: "Which mine-countermeasure approach uses acoustic and magnetic sweeps to clear sea lanes?",
    options: ["Combined MCM sweep and hunt operations", "Ignoring mine warnings", "Sailing in single unprotected column", "Disabling all sonar"],
    correctIndex: 0,
  },
];
