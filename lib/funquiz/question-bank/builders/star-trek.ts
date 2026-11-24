export type StarTrekQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const STAR_TREK_INTERMEDIATE: StarTrekQuestionDef[] = [
  {
    prompt: "What is the name of Captain Kirk's starship in the original series?",
    options: ["USS Defiant", "USS Voyager", "USS Enterprise", "USS Discovery"],
    correctIndex: 2,
  },
  {
    prompt: "What is James T. Kirk's rank in the original series?",
    options: ["Commander", "Captain", "Admiral", "Lieutenant"],
    correctIndex: 1,
  },
  {
    prompt: "Who is the Vulcan first officer of Kirk's Enterprise?",
    options: ["Sarek", "Spock", "Tuvok", "T'Pol"],
    correctIndex: 1,
  },
  {
    prompt: "Spock's famous farewell wish is what?",
    options: ["Peace and long life", "Live long and prosper", "Today is a good day to die", "Make it so"],
    correctIndex: 1,
  },
  {
    prompt: "What colour is Vulcan blood?",
    options: ["Red", "Blue", "Green", "Purple"],
    correctIndex: 2,
  },
  {
    prompt: "Dr. McCoy's nickname is what?",
    options: ["Scotty", "Bones", "Pille", "Doc"],
    correctIndex: 1,
  },
  {
    prompt: "Who captains the Enterprise-D in The Next Generation?",
    options: ["James T. Kirk", "Benjamin Sisko", "Jean-Luc Picard", "Kathryn Janeway"],
    correctIndex: 2,
  },
  {
    prompt: "What is the name of the android officer on the Enterprise-D?",
    options: ["Lore", "Data", "Hugh", "The Doctor"],
    correctIndex: 1,
  },
  {
    prompt: "Which Klingon is security chief on the Enterprise-D?",
    options: ["Worf", "Martok", "Gowron", "Kor"],
    correctIndex: 0,
  },
  {
    prompt: "What is the Federation's space service called?",
    options: ["The Imperial Fleet", "Starfleet", "The Bajoran Militia", "Section 31"],
    correctIndex: 1,
  },
  {
    prompt: "Which handheld weapon do Starfleet landing parties usually carry?",
    options: ["A bat'leth", "A phaser", "A disruptor pistol", "A lightsaber"],
    correctIndex: 1,
  },
  {
    prompt: "Which device moves people instantly between a ship and a planet?",
    options: ["A replicator", "A transporter", "A holodeck", "A tractor beam"],
    correctIndex: 1,
  },
  {
    prompt: "Faster-than-light travel in Star Trek uses which drive?",
    options: ["Impulse drive", "Warp drive", "Ion drive", "Solar sail"],
    correctIndex: 1,
  },
  {
    prompt: "A room that creates interactive environments is called what?",
    options: ["A ready room", "A holodeck", "A brig", "Ten Forward"],
    correctIndex: 1,
  },
  {
    prompt: "The Borg's famous warning is what?",
    options: ["Today is a good day to die", "Resistance is futile", "Live long and prosper", "Make it so"],
    correctIndex: 1,
  },
  {
    prompt: "Which species prizes logic and works to suppress emotion?",
    options: ["Klingons", "Ferengi", "Vulcans", "Bajorans"],
    correctIndex: 2,
  },
  {
    prompt: "Which warrior species is known for honour and ridged foreheads?",
    options: ["Vulcans", "Klingons", "Betazoids", "Talaxians"],
    correctIndex: 1,
  },
  {
    prompt: "The Prime Directive forbids interference with what?",
    options: ["The affairs of pre-warp societies", "Klingon religion", "Holodeck safety rules", "Starfleet promotions"],
    correctIndex: 0,
  },
  {
    prompt: "Who played Captain Kirk in the original television series?",
    options: ["Leonard Nimoy", "William Shatner", "Patrick Stewart", "DeForest Kelley"],
    correctIndex: 1,
  },
  {
    prompt: "Who played Spock in the original series?",
    options: ["Leonard Nimoy", "James Doohan", "George Takei", "Walter Koenig"],
    correctIndex: 0,
  },
  {
    prompt: "Who played Captain Picard?",
    options: ["Avery Brooks", "Patrick Stewart", "Scott Bakula", "Jonathan Frakes"],
    correctIndex: 1,
  },
  {
    prompt: "What is the registry number of Kirk's Enterprise?",
    options: ["NX-01", "NCC-1701", "NCC-74656", "NCC-1701-D"],
    correctIndex: 1,
  },
  {
    prompt: "What is the registry of the Enterprise-D?",
    options: ["NCC-1701", "NCC-1701-D", "NCC-1701-E", "NX-74205"],
    correctIndex: 1,
  },
  {
    prompt: "Geordi La Forge sees with which device?",
    options: ["A tricorder", "A VISOR", "A cortical implant only", "A pair of binoculars"],
    correctIndex: 1,
  },
  {
    prompt: "Picard's usual replicator order is what?",
    options: ["Coffee, black", "Tea, Earl Grey, hot", "Romulan ale", "A prune juice"],
    correctIndex: 1,
  },
  {
    prompt: "The curved Klingon sword is called a what?",
    options: ["Mek'leth", "Bat'leth", "Lirpa", "Ahn'woon"],
    correctIndex: 1,
  },
  {
    prompt: "Small furry creatures that multiply rapidly are called what?",
    options: ["Tribbles", "Sehlats", "Targs", "Regulan bloodworms"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the villain of The Wrath of Khan?",
    options: ["Shinzon", "Khan Noonien Singh", "General Chang", "The Borg Queen"],
    correctIndex: 1,
  },
  {
    prompt: "The franchise's opening mission line begins with which words?",
    options: ["In the beginning", "Space, the final frontier", "A long time ago", "Once upon a time"],
    correctIndex: 1,
  },
  {
    prompt: "Who commands the station Deep Space Nine?",
    options: ["Jean-Luc Picard", "Benjamin Sisko", "Kathryn Janeway", "Jonathan Archer"],
    correctIndex: 1,
  },
  {
    prompt: "Who captains the starship Voyager?",
    options: ["Kathryn Janeway", "Beverly Crusher", "Kira Nerys", "Deanna Troi"],
    correctIndex: 0,
  },
  {
    prompt: "Deep Space Nine is set mainly on what?",
    options: ["A generation ship", "A space station", "A Borg cube", "A Klingon monastery"],
    correctIndex: 1,
  },
  {
    prompt: "Voyager is stranded in which quadrant?",
    options: ["Alpha", "Beta", "Gamma", "Delta"],
    correctIndex: 3,
  },
  {
    prompt: "The Bajoran wormhole opens into which quadrant?",
    options: ["Alpha", "Gamma", "Delta", "The Mirror Universe"],
    correctIndex: 1,
  },
  {
    prompt: "Which species is assimilated into a hive mind called the Collective?",
    options: ["The Borg", "The Dominion", "The Ferengi", "The Romulans"],
    correctIndex: 0,
  },
  {
    prompt: "Q belongs to which group?",
    options: ["The Q Continuum", "The Prophets", "The Founders", "The Organians"],
    correctIndex: 0,
  },
  {
    prompt: "The Emergency Medical Hologram is the doctor on which ship?",
    options: ["Enterprise-D", "Defiant", "Voyager", "NX-01"],
    correctIndex: 2,
  },
  {
    prompt: "Seven of Nine was disconnected from which group?",
    options: ["The Maquis", "The Borg", "The Dominion", "Section 31"],
    correctIndex: 1,
  },
  {
    prompt: "Uhura's post on Kirk's Enterprise is what?",
    options: ["Helm", "Communications", "Engineering", "Security"],
    correctIndex: 1,
  },
  {
    prompt: "Montgomery Scott's department is what?",
    options: ["Medical", "Engineering", "Science", "Communications"],
    correctIndex: 1,
  },
  {
    prompt: "Hikaru Sulu's post on the original Enterprise is what?",
    options: ["Helm", "Navigator only", "Chief surgeon", "Yeoman"],
    correctIndex: 0,
  },
  {
    prompt: "Who created Star Trek?",
    options: ["Gene Roddenberry", "J.J. Abrams", "Nicholas Meyer", "Rick Berman"],
    correctIndex: 0,
  },
  {
    prompt: "Ferengi culture is built around what?",
    options: ["Logic", "Honour in battle", "Profit", "Religious prophecy"],
    correctIndex: 2,
  },
  {
    prompt: "The Ferengi code of commerce is called what?",
    options: ["The Prime Directive", "The Rules of Acquisition", "The Omega Directive", "The Kolinahr"],
    correctIndex: 1,
  },
  {
    prompt: "Betazoids are known for which ability?",
    options: ["Shapeshifting", "Telepathy", "Photosynthesis", "Regeneration"],
    correctIndex: 1,
  },
  {
    prompt: "Deanna Troi serves the Enterprise-D as what?",
    options: ["Chief engineer", "Counselor", "Helmsman", "Transporter chief"],
    correctIndex: 1,
  },
  {
    prompt: "A red alert means the ship is at what?",
    options: ["A dinner party", "Battle stations", "Warp factor one", "Shore leave"],
    correctIndex: 1,
  },
  {
    prompt: "The Starfleet insignia is shaped most like what?",
    options: ["A circle", "An arrowhead", "A square", "A crescent"],
    correctIndex: 1,
  },
  {
    prompt: "Which series follows a ship trying to get home from the far side of the galaxy?",
    options: ["Deep Space Nine", "Voyager", "The Next Generation", "Enterprise"],
    correctIndex: 1,
  },
  {
    prompt: "Which 1960s series began the franchise?",
    options: ["The Next Generation", "The Original Series", "Deep Space Nine", "Discovery"],
    correctIndex: 1,
  },
  {
    prompt: "Pavel Chekov's post on Kirk's bridge is what?",
    options: ["Navigator", "Ship's cook", "Chaplain", "Botanist"],
    correctIndex: 0,
  },
  {
    prompt: "Which order is most associated with Captain Picard?",
    options: ["Beam me up", "Make it so", "I'm a doctor", "I cannae change the laws of physics"],
    correctIndex: 1,
  },
];

export const STAR_TREK_HARD: StarTrekQuestionDef[] = [
  {
    prompt: "What is James T. Kirk's middle name?",
    options: ["Tiberius", "Thomas", "Theodore", "Titus"],
    correctIndex: 0,
  },
  {
    prompt: "In which year did The Next Generation premiere?",
    options: ["1979", "1987", "1993", "1995"],
    correctIndex: 1,
  },
  {
    prompt: "In which year did Deep Space Nine premiere?",
    options: ["1987", "1991", "1993", "1995"],
    correctIndex: 2,
  },
  {
    prompt: "In which year did Voyager premiere?",
    options: ["1993", "1995", "1998", "2001"],
    correctIndex: 1,
  },
  {
    prompt: "Star Trek: The Motion Picture was released in which year?",
    options: ["1977", "1979", "1982", "1984"],
    correctIndex: 1,
  },
  {
    prompt: "The Wrath of Khan was released in which year?",
    options: ["1979", "1982", "1984", "1986"],
    correctIndex: 1,
  },
  {
    prompt: "Kirk famously reprogrammed which no-win Academy test?",
    options: ["The Kobayashi Maru", "The Kolinahr", "The Fal-tor-pan", "The Bridge Officer's Test"],
    correctIndex: 0,
  },
  {
    prompt: "Spock dies in which film?",
    options: ["The Motion Picture", "The Wrath of Khan", "The Voyage Home", "The Undiscovered Country"],
    correctIndex: 1,
  },
  {
    prompt: "Whose project regenerates Spock's body?",
    options: ["The Genesis Device", "The Nexus", "The Caretaker", "The Guardian of Forever"],
    correctIndex: 0,
  },
  {
    prompt: "Spock places his katra in whom before he dies?",
    options: ["Kirk", "Scotty", "Dr. McCoy", "Sarek"],
    correctIndex: 2,
  },
  {
    prompt: "The refusion ceremony on Mount Seleya is called what?",
    options: ["Kolinahr", "Pon farr", "Fal-tor-pan", "Rite of Ascension"],
    correctIndex: 2,
  },
  {
    prompt: "Khan's full name is what?",
    options: ["Khan Noonien Singh", "Khan Singh Soong", "Noonien Khan Chang", "Sybok Khan"],
    correctIndex: 0,
  },
  {
    prompt: "The Voyage Home is which numbered original-cast film?",
    options: ["II", "III", "IV", "V"],
    correctIndex: 2,
  },
  {
    prompt: "George and Gracie in The Voyage Home are what?",
    options: ["Humpback whales", "Tribbles", "Deltan diplomats", "Klingon birds of prey"],
    correctIndex: 0,
  },
  {
    prompt: "The Search for Spock is which numbered film?",
    options: ["II", "III", "IV", "VI"],
    correctIndex: 1,
  },
  {
    prompt: "The Undiscovered Country is which numbered film?",
    options: ["IV", "V", "VI", "VII"],
    correctIndex: 2,
  },
  {
    prompt: "General Chang quotes which Earth author?",
    options: ["Dickens", "Shakespeare", "Homer", "Twain"],
    correctIndex: 1,
  },
  {
    prompt: "The Khitomer Accords are a peace agreement with whom?",
    options: ["The Romulans", "The Klingons", "The Cardassians", "The Borg"],
    correctIndex: 1,
  },
  {
    prompt: "Who built the android Data?",
    options: ["Dr. Noonien Soong", "Dr. Carol Marcus", "Dr. Lewis Zimmerman", "Admiral Pressman"],
    correctIndex: 0,
  },
  {
    prompt: "Which android brother of Data appears in The Next Generation?",
    options: ["Lore", "B-4", "Lal", "Hugh"],
    correctIndex: 0,
  },
  {
    prompt: "What is the name of Data's cat?",
    options: ["Spot", "Livingston", "Porthos", "Number One"],
    correctIndex: 0,
  },
  {
    prompt: "Picard is assimilated under which Borg name?",
    options: ["Locutus", "Hugh", "Seven", "The Queen"],
    correctIndex: 0,
  },
  {
    prompt: "Jennifer Sisko is killed at which battle?",
    options: ["Wolf 359", "Sector 001", "Chin'toka", "Narendra III"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Wolf 359 is fought against whom?",
    options: ["The Dominion", "The Borg", "The Romulans", "The Klingons"],
    correctIndex: 1,
  },
  {
    prompt: "Kirk dies in which film?",
    options: ["The Undiscovered Country", "Generations", "First Contact", "Nemesis"],
    correctIndex: 1,
  },
  {
    prompt: "The energy ribbon in Generations is called what?",
    options: ["The Nexus", "The Caretaker's array", "The Bajoran wormhole", "Fluidic space"],
    correctIndex: 0,
  },
  {
    prompt: "Zefram Cochrane's warp ship is named what?",
    options: ["Phoenix", "Enterprise", "Botany Bay", "Reliant"],
    correctIndex: 0,
  },
  {
    prompt: "Humans and Vulcans make first contact after a warp flight in which year?",
    options: ["2063", "2161", "2265", "2364"],
    correctIndex: 0,
  },
  {
    prompt: "Cochrane launches that flight from near which town?",
    options: ["Riverside, Iowa", "Bozeman, Montana", "La Barre, France", "San Francisco"],
    correctIndex: 1,
  },
  {
    prompt: "The Borg travel to 2063 in which film?",
    options: ["Generations", "First Contact", "Insurrection", "Nemesis"],
    correctIndex: 1,
  },
  {
    prompt: "What is the registry of the Enterprise-E?",
    options: ["NCC-1701-D", "NCC-1701-E", "NX-01", "NCC-74656"],
    correctIndex: 1,
  },
  {
    prompt: "Picard receives a flute after living a lifetime in which episode?",
    options: ["The Inner Light", "Darmok", "Chain of Command", "The Offspring"],
    correctIndex: 0,
  },
  {
    prompt: "\"Darmok and Jalad at Tanagra\" is a saying of which people?",
    options: ["The Tamarians", "The Vulcans", "The Klingons", "The Ferengi"],
    correctIndex: 0,
  },
  {
    prompt: "Which entity kills Tasha Yar?",
    options: ["Armus", "The Borg Queen", "Gul Madred", "Shinzon"],
    correctIndex: 0,
  },
  {
    prompt: "Guinan works in which lounge?",
    options: ["Quark's", "Ten Forward", "The Replimat", "Engineering"],
    correctIndex: 1,
  },
  {
    prompt: "Beverly Crusher's son is named what?",
    options: ["Wesley", "Jake", "Alexander", "Nog"],
    correctIndex: 0,
  },
  {
    prompt: "Picard often calls Riker by which nickname?",
    options: ["Number One", "Bones", "Hawk", "Trip"],
    correctIndex: 0,
  },
  {
    prompt: "The colourful computer displays of the Enterprise-D are called what?",
    options: ["LCARS", "DUET", "OKUDAGRAMS as a ship system", "PADD"],
    correctIndex: 0,
  },
  {
    prompt: "The crawlways engineers use inside a starship are called what?",
    options: ["Jefferies tubes", "Pattern buffers", "EPS conduits only", "Turbolifts"],
    correctIndex: 0,
  },
  {
    prompt: "The covert Federation organisation uncovered on Deep Space Nine is called what?",
    options: ["Section 31", "The Tal Shiar", "The Obsidian Order", "The Maquis"],
    correctIndex: 0,
  },
  {
    prompt: "Odo belongs to which species?",
    options: ["Changeling", "Vorta", "Trill", "Bajoran"],
    correctIndex: 0,
  },
  {
    prompt: "The Founders rule which power?",
    options: ["The Dominion", "The Klingon Empire", "The Cardassian Union", "The Romulan Star Empire"],
    correctIndex: 0,
  },
  {
    prompt: "The Dominion's soldiers, bred for war, are called what?",
    options: ["Jem'Hadar", "Vorta", "Breen", "Hirogen"],
    correctIndex: 0,
  },
  {
    prompt: "The Dominion's cloned administrators are called what?",
    options: ["Vorta", "Jem'Hadar", "Kazon", "Vidiians"],
    correctIndex: 0,
  },
  {
    prompt: "Elim Garak's shop on the station is what kind of business?",
    options: ["A tailor", "A bar", "A clinic", "A temple"],
    correctIndex: 0,
  },
  {
    prompt: "Gul Dukat is a member of which species?",
    options: ["Cardassian", "Romulan", "Bajoran", "Klingon"],
    correctIndex: 0,
  },
  {
    prompt: "The Dax symbiont is joined to a member of which species?",
    options: ["Trill", "Betazoid", "Vulcan", "Changeling"],
    correctIndex: 0,
  },
  {
    prompt: "Bajorans revere Benjamin Sisko as what?",
    options: ["The Emissary", "The Kai", "The Praetor", "The Nagus"],
    correctIndex: 0,
  },
  {
    prompt: "Quark's brother, who works in the bar, is named what?",
    options: ["Rom", "Nog", "Brunt", "Zek"],
    correctIndex: 0,
  },
  {
    prompt: "Rom's son, who joins Starfleet, is named what?",
    options: ["Nog", "Jake", "Alexander", "Molly"],
    correctIndex: 0,
  },
  {
    prompt: "Which entity pulls Voyager into the Delta Quadrant?",
    options: ["The Caretaker", "Q", "The Borg Queen", "The Prophets"],
    correctIndex: 0,
  },
  {
    prompt: "Voyager's half-Klingon chief engineer is who?",
    options: ["B'Elanna Torres", "Kes", "Seska", "Seven of Nine"],
    correctIndex: 0,
  },
  {
    prompt: "Voyager's Vulcan security officer is who?",
    options: ["Tuvok", "T'Pol", "Spock", "Sarek"],
    correctIndex: 0,
  },
  {
    prompt: "Seven of Nine's human name is what?",
    options: ["Annika Hansen", "Seven Hansen", "Annika Paris", "Erin Hansen"],
    correctIndex: 0,
  },
  {
    prompt: "Species 8472 comes from where?",
    options: ["Fluidic space", "The Gamma Quadrant", "The Mirror Universe", "The Nexus"],
    correctIndex: 0,
  },
  {
    prompt: "Who commanded the Enterprise immediately before Kirk?",
    options: ["Christopher Pike", "Robert April", "Jonathan Archer", "Matt Decker"],
    correctIndex: 0,
  },
];
