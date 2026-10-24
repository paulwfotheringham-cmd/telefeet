import type { GeneralKnowledgeSubject } from "../types";

export type GKExtraQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  generalKnowledgeSubjects: GeneralKnowledgeSubject[];
};

export const GK_EXTRA_DEFS: GKExtraQuestionDef[] = [
  {
    prompt: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctIndex: 2,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "How many planets are in the solar system (IAU definition)?",
    options: ["7", "8", "9", "10"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["space", "science"],
  },
  {
    prompt: "Who painted the Mona Lisa?",
    options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["culture"],
  },
  {
    prompt: "What is the capital of Iceland?",
    options: ["Oslo", "Reykjavik", "Helsinki", "Copenhagen"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["geography"],
  },
  {
    prompt: "Which element has atomic number 1?",
    options: ["Helium", "Hydrogen", "Lithium", "Oxygen"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "In computing, what does CPU stand for?",
    options: ["Central Processing Unit", "Computer Personal Utility", "Core Power Unit", "Cached Program Uplink"],
    correctIndex: 0,
    generalKnowledgeSubjects: ["technology"],
  },
  {
    prompt: "Which war lasted from 1950 to 1953 on the Korean Peninsula?",
    options: ["Vietnam War", "Korean War", "Gulf War", "World War I"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["history", "military"],
  },
  {
    prompt: "What is the longest bone in the human body?",
    options: ["Humerus", "Femur", "Tibia", "Radius"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "Which composer wrote the Four Seasons?",
    options: ["Bach", "Vivaldi", "Mozart", "Beethoven"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["culture"],
  },
  {
    prompt: "The Suez Canal connects the Mediterranean Sea to which sea?",
    options: ["Black Sea", "Red Sea", "Caspian Sea", "Arabian Sea"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["geography"],
  },
  {
    prompt: "What company created the iPhone?",
    options: ["Microsoft", "Apple", "Samsung", "Google"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["technology"],
  },
  {
    prompt: "Which gas makes up about 78% of Earth's atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Argon"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "Who developed the theory of general relativity?",
    options: ["Isaac Newton", "Albert Einstein", "Niels Bohr", "Galileo Galilei"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "Which country hosted the 2016 Summer Olympics?",
    options: ["China", "Brazil", "United Kingdom", "Japan"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["culture", "geography"],
  },
  {
    prompt: "What is the smallest unit of life?",
    options: ["Atom", "Cell", "Molecule", "Organ"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "The Hubble constant relates to expansion of what?",
    options: ["Earth's crust", "The universe", "Oceans", "Atmosphere only"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["space", "science"],
  },
  {
    prompt: "Which ancient wonder was located in Alexandria?",
    options: ["Colossus of Rhodes", "Lighthouse of Alexandria", "Hanging Gardens", "Temple of Artemis"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["history", "culture"],
  },
  {
    prompt: "What does HTTP stand for in web addresses?",
    options: ["HyperText Transfer Protocol", "High Transfer Text Program", "Host Transmission Terminal Process", "Hybrid Table Transfer Packet"],
    correctIndex: 0,
    generalKnowledgeSubjects: ["technology"],
  },
  {
    prompt: "Mount Everest is part of which mountain range?",
    options: ["Alps", "Himalayas", "Andes", "Rockies"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["geography"],
  },
  {
    prompt: "The European Coal and Steel Community (1951) helped lay groundwork for which later integration?",
    options: ["European Union", "League of Nations", "Warsaw Pact", "NATO"],
    correctIndex: 0,
    generalKnowledgeSubjects: ["history"],
  },
  {
    prompt: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "Which gas giant is known for its extensive ring system?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["space"],
  },
  {
    prompt: "Who wrote the novel '1984'?",
    options: ["George Orwell", "Aldous Huxley", "Ray Bradbury", "Ernest Hemingway"],
    correctIndex: 0,
    generalKnowledgeSubjects: ["culture"],
  },
  {
    prompt: "Which ocean is the Bermuda Triangle associated with?",
    options: ["Pacific", "Atlantic", "Indian", "Arctic"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["geography"],
  },
  {
    prompt: "What is the standard unit of electric current?",
    options: ["Volt", "Ampere", "Ohm", "Watt"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science", "technology"],
  },
  {
    prompt: "Which military alliance was the Warsaw Pact counterpart to?",
    options: ["NATO", "ASEAN", "EU", "UN"],
    correctIndex: 0,
    generalKnowledgeSubjects: ["military", "history"],
  },
  {
    prompt: "What programming language is named after a type of coffee?",
    options: ["Python", "Java", "Ruby", "Rust"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["technology"],
  },
  {
    prompt: "The Parthenon is located in which city?",
    options: ["Rome", "Athens", "Istanbul", "Cairo"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["culture", "history"],
  },
  {
    prompt: "Which blood type is known as the universal donor (red cells)?",
    options: ["AB positive", "O negative", "A positive", "B negative"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "What is the capital of Canada?",
    options: ["Toronto", "Ottawa", "Vancouver", "Montreal"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["geography"],
  },
  {
    prompt: "Which space probe left the solar system first (Voyager 1)?",
    options: ["Voyager 2", "Voyager 1", "Pioneer 10", "New Horizons"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["space", "technology"],
  },
  {
    prompt: "Who was the first woman to win a Nobel Prize?",
    options: ["Marie Curie", "Rosalind Franklin", "Dorothy Hodgkin", "Barbara McClintock"],
    correctIndex: 0,
    generalKnowledgeSubjects: ["science", "history"],
  },
  {
    prompt: "Which country invented paper-making traditionally credited during the Han dynasty?",
    options: ["Egypt", "China", "Greece", "India"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["history", "technology"],
  },
  {
    prompt: "What is the largest organ of the human body?",
    options: ["Liver", "Skin", "Lungs", "Brain"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "Which film studio created Mickey Mouse?",
    options: ["Warner Bros.", "Disney", "Universal", "Paramount"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["culture"],
  },
  {
    prompt: "The Richter scale measures what?",
    options: ["Wind speed", "Earthquake magnitude", "Rainfall", "Air pressure"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science", "geography"],
  },
  {
    prompt: "Which handgun is famously associated with the US M1911 design?",
    options: ["Glock 17", "Colt M1911", "Walther PPK", "Desert Eagle"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["military", "technology"],
  },
  {
    prompt: "What is the speed of light in vacuum (approximately)?",
    options: ["300,000 km/s", "30,000 km/s", "3,000 km/s", "3,000,000 km/s"],
    correctIndex: 0,
    generalKnowledgeSubjects: ["science", "space"],
  },
  {
    prompt: "Which river runs through Baghdad?",
    options: ["Euphrates", "Tigris", "Jordan", "Indus"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["geography"],
  },
  {
    prompt: "Open-source software allows users to do what legally (typical licenses)?",
    options: ["View, modify, and redistribute under license terms", "Never share code", "Only run on one PC", "Ignore copyright entirely"],
    correctIndex: 0,
    generalKnowledgeSubjects: ["technology"],
  },
  {
    prompt: "Which empire built the Colosseum in Rome?",
    options: ["Greek", "Roman", "Ottoman", "Byzantine"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["history", "culture"],
  },
  {
    prompt: "What particle carries the electromagnetic force?",
    options: ["Gluon", "Photon", "W boson", "Neutrino"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["science"],
  },
  {
    prompt: "Which African river is the longest on the continent?",
    options: ["Congo", "Nile", "Niger", "Zambezi"],
    correctIndex: 1,
    generalKnowledgeSubjects: ["geography"],
  },
  {
    prompt: "What does GPS stand for?",
    options: ["Global Positioning System", "General Pilot Signal", "Geo Polar Satellite", "Ground Pulse Sensor"],
    correctIndex: 0,
    generalKnowledgeSubjects: ["technology", "military"],
  },
];
