/**
 * Appends gap-fill MCQs to expanded-pools.ts (run once when counts change).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(__dirname, "../lib/funquiz/question-bank/builders/expanded-pools.ts");

function rows(categoryId, label, diff, gk, tuples) {
  return tuples.map(([prompt, a, b, c, d, ci]) =>
    `  row(${categoryId}, "${label}", ${diff}, ${JSON.stringify(prompt)}, [${[a,b,c,d].map(JSON.stringify).join(", ")}], ${ci}${gk ? `, ${JSON.stringify(gk)}` : ""}),`,
  );
}

const INT = "QUIZ_DIFFICULTY_INTERMEDIATE";
const HARD = "QUIZ_DIFFICULTY_HARD";
const H = "QUIZ_CATEGORY_HISTORY";
const MB = "QUIZ_CATEGORY_MILITARY_BATTLES";
const GM = "QUIZ_CATEGORY_GENERAL_MILITARY";
const G = "QUIZ_CATEGORY_GEOGRAPHY";
const C = "QUIZ_CATEGORY_CAPITAL_CITIES";

const historyInt = [
  ["In which year did the Berlin Wall fall?", "1989", "1991", "1985", "1993", 0],
  ["Who was the first President of the United States?", "George Washington", "Thomas Jefferson", "John Adams", "James Madison", 0],
  ["Which ancient civilization built Machu Picchu?", "Inca", "Aztec", "Maya", "Olmec", 0],
  ["The Renaissance began in which country?", "Italy", "France", "England", "Spain", 0],
  ["Who wrote the Declaration of Independence?", "Thomas Jefferson", "George Washington", "Benjamin Franklin", "John Adams", 0],
  ["Which empire built the Colosseum in Rome?", "Roman Empire", "Byzantine Empire", "Ottoman Empire", "Persian Empire", 0],
  ["In which year did World War II end in Europe?", "1945", "1944", "1946", "1943", 0],
  ["Who was known as the Maid of Orléans?", "Joan of Arc", "Catherine the Great", "Elizabeth I", "Marie Antoinette", 0],
  ["Which country was formerly known as Persia?", "Iran", "Iraq", "Turkey", "Syria", 0],
  ["The Magna Carta was signed in which country?", "England", "France", "Scotland", "Ireland", 0],
  ["Who was the first man to walk on the Moon?", "Neil Armstrong", "Buzz Aldrin", "Yuri Gagarin", "John Glenn", 0],
  ["Which pharaoh's tomb was found in 1922?", "Tutankhamun", "Ramesses II", "Cleopatra", "Khufu", 0],
  ["The Industrial Revolution began in which country?", "United Kingdom", "Germany", "United States", "France", 0],
  ["Which war was fought between the North and South in the United States?", "American Civil War", "Revolutionary War", "War of 1812", "Mexican-American War", 0],
  ["Who was the leader of the Soviet Union during most of World War II?", "Joseph Stalin", "Vladimir Lenin", "Nikita Khrushchev", "Leon Trotsky", 0],
  ["Which city was the capital of the Byzantine Empire?", "Constantinople", "Athens", "Rome", "Alexandria", 0],
  ["The Great Fire of London occurred in which year?", "1666", "1066", "1766", "1566", 0],
  ["Who discovered penicillin?", "Alexander Fleming", "Louis Pasteur", "Marie Curie", "Joseph Lister", 0],
  ["Which country gifted the Statue of Liberty to the United States?", "France", "United Kingdom", "Spain", "Italy", 0],
  ["The Battle of Hastings took place in which year?", "1066", "1166", "966", "1215", 0],
];

const historyHard = [
  ["Which treaty ended World War I?", "Treaty of Versailles", "Treaty of Paris", "Treaty of Ghent", "Treaty of Utrecht", 0],
  ["Who was Emperor of France during the Napoleonic Wars?", "Napoleon Bonaparte", "Louis XVI", "Louis XIV", "Charles de Gaulle", 0],
  ["Which dynasty built much of the Great Wall of China?", "Ming", "Qing", "Han", "Tang", 0],
  ["The Rosetta Stone helped decode which writing system?", "Egyptian hieroglyphs", "Cuneiform", "Linear B", "Phoenician", 0],
  ["Who led the Bolshevik Revolution in 1917?", "Vladimir Lenin", "Joseph Stalin", "Leon Trotsky", "Mikhail Gorbachev", 0],
  ["Which battle marked the end of Napoleon's Hundred Days?", "Waterloo", "Austerlitz", "Trafalgar", "Leipzig", 0],
  ["The Meiji Restoration modernized which country?", "Japan", "China", "Korea", "Thailand", 0],
  ["Who was the first female Prime Minister of the United Kingdom?", "Margaret Thatcher", "Theresa May", "Elizabeth I", "Victoria", 0],
  ["Which civilization used cuneiform writing?", "Sumerians", "Romans", "Greeks", "Egyptians", 0],
  ["The Thirty Years' War primarily involved which continent?", "Europe", "Asia", "Africa", "South America", 0],
  ["Who wrote 'The Communist Manifesto' with Friedrich Engels?", "Karl Marx", "Vladimir Lenin", "Joseph Stalin", "Mikhail Bakunin", 0],
  ["Which empire was ruled by Suleiman the Magnificent?", "Ottoman Empire", "Mughal Empire", "Safavid Empire", "Russian Empire", 0],
  ["The Battle of Stalingrad occurred during which war?", "World War II", "World War I", "Cold War", "Crimean War", 0],
  ["Who was the first Emperor of Rome?", "Augustus", "Julius Caesar", "Nero", "Trajan", 0],
  ["Which document limited the power of the English king in 1215?", "Magna Carta", "Bill of Rights", "Domesday Book", "Act of Union", 0],
  ["The Silk Road connected China primarily to which region?", "Central Asia and the Middle East", "Scandinavia", "Sub-Saharan Africa", "Polynesia", 0],
  ["Who was the Egyptian queen allied with Rome?", "Cleopatra", "Nefertiti", "Hatshepsut", "Nefertari", 0],
  ["Which plague devastated Europe in the 14th century?", "Black Death", "Spanish Flu", "Cholera outbreak", "Smallpox epidemic", 0],
  ["The Reconquista completed the Christian reconquest of which peninsula?", "Iberian", "Italian", "Balkan", "Scandinavian", 0],
  ["Who was the first Chancellor of a unified Germany?", "Otto von Bismarck", "Wilhelm II", "Adolf Hitler", "Helmut Kohl", 0],
];

const geoInt = [
  ["Which river is the longest in Africa?", "Nile", "Congo", "Niger", "Zambezi", 0],
  ["Mount Everest lies in which mountain range?", "Himalayas", "Andes", "Alps", "Rockies", 0],
  ["Which is the largest ocean on Earth?", "Pacific", "Atlantic", "Indian", "Arctic", 0],
  ["What is the capital of Egypt?", "Cairo", "Alexandria", "Giza", "Luxor", 0],
  ["Which desert covers much of northern Africa?", "Sahara", "Gobi", "Kalahari", "Atacama", 0],
  ["Which country has the largest land area?", "Russia", "Canada", "China", "United States", 0],
  ["The Amazon River flows mainly through which continent?", "South America", "Africa", "Asia", "Europe", 0],
  ["Which sea lies between Europe and Africa?", "Mediterranean", "Red Sea", "Black Sea", "Caspian Sea", 0],
  ["What is the smallest continent?", "Australia", "Europe", "Antarctica", "South America", 0],
  ["Which country is known as the Land of the Rising Sun?", "Japan", "China", "Thailand", "South Korea", 0],
  ["Lake Baikal is located in which country?", "Russia", "Mongolia", "Kazakhstan", "China", 0],
  ["Which strait separates Europe and Asia at Istanbul?", "Bosporus", "Gibraltar", "Malacca", "Bering", 0],
  ["The Great Barrier Reef lies off which country?", "Australia", "Indonesia", "Philippines", "New Zealand", 0],
  ["Which mountain is highest in Africa?", "Mount Kilimanjaro", "Mount Kenya", "Atlas Mountains", "Ruwenzori", 0],
  ["Which river flows through Paris?", "Seine", "Rhine", "Loire", "Thames", 0],
  ["What is the capital of Canada?", "Ottawa", "Toronto", "Montreal", "Vancouver", 0],
];

const geoHard = [
  ["Which river forms part of the border between the United States and Mexico?", "Rio Grande", "Colorado", "Mississippi", "Columbia", 0],
  ["What is the deepest known point in Earth's oceans?", "Mariana Trench", "Puerto Rico Trench", "Java Trench", "Tonga Trench", 0],
  ["Which African Great Lake is the largest by area?", "Lake Victoria", "Lake Tanganyika", "Lake Malawi", "Lake Chad", 0],
  ["The Ural Mountains are often cited as a boundary between which continents?", "Europe and Asia", "Asia and Africa", "North and South America", "Europe and Africa", 0],
  ["Which country contains the geographic North Pole?", "None — it is in international waters/ice", "Canada", "Russia", "Greenland", 0],
  ["What is the capital of Kazakhstan?", "Astana", "Almaty", "Tashkent", "Bishkek", 0],
  ["Which desert is the driest non-polar desert?", "Atacama", "Sahara", "Gobi", "Namib", 0],
  ["The Danube River empties into which sea?", "Black Sea", "Mediterranean", "Adriatic", "Caspian", 0],
  ["Which island nation lies southeast of India?", "Sri Lanka", "Maldives", "Indonesia", "Madagascar", 0],
  ["What is the highest waterfall in the world?", "Angel Falls", "Niagara Falls", "Victoria Falls", "Iguazu Falls", 0],
  ["Which country has the longest coastline?", "Canada", "Russia", "Indonesia", "Australia", 0],
  ["The Mekong River flows into which sea?", "South China Sea", "Andaman Sea", "Java Sea", "Philippine Sea", 0],
  ["Which plateau is called the Roof of the World?", "Tibetan Plateau", "Deccan Plateau", "Altiplano", "Anatolian Plateau", 0],
  ["What is the capital of Myanmar?", "Naypyidaw", "Yangon", "Mandalay", "Bago", 0],
  ["Which strait connects the Atlantic and Pacific at the southern tip of South America?", "Drake Passage", "Strait of Magellan", "Bering Strait", "Strait of Gibraltar", 0],
  ["Lake Titicaca lies on the border of which two countries?", "Peru and Bolivia", "Chile and Argentina", "Colombia and Venezuela", "Ecuador and Peru", 0],
];

const capInt = [
  ["What is the capital of Norway?", "Oslo", "Bergen", "Trondheim", "Stavanger", 0],
  ["What is the capital of Sweden?", "Stockholm", "Gothenburg", "Malmö", "Uppsala", 0],
  ["What is the capital of Poland?", "Warsaw", "Kraków", "Gdańsk", "Wrocław", 0],
  ["What is the capital of Greece?", "Athens", "Thessaloniki", "Patras", "Heraklion", 0],
  ["What is the capital of Portugal?", "Lisbon", "Porto", "Coimbra", "Faro", 0],
  ["What is the capital of Belgium?", "Brussels", "Antwerp", "Ghent", "Bruges", 0],
  ["What is the capital of Denmark?", "Copenhagen", "Aarhus", "Odense", "Aalborg", 0],
  ["What is the capital of Finland?", "Helsinki", "Tampere", "Turku", "Oulu", 0],
  ["What is the capital of Austria?", "Vienna", "Salzburg", "Graz", "Innsbruck", 0],
  ["What is the capital of Czech Republic?", "Prague", "Brno", "Ostrava", "Plzeň", 0],
  ["What is the capital of Hungary?", "Budapest", "Debrecen", "Szeged", "Pécs", 0],
  ["What is the capital of Romania?", "Bucharest", "Cluj-Napoca", "Timișoara", "Iași", 0],
  ["What is the capital of Ukraine?", "Kyiv", "Kharkiv", "Odesa", "Lviv", 0],
  ["What is the capital of Chile?", "Santiago", "Valparaíso", "Concepción", "Antofagasta", 0],
  ["What is the capital of Peru?", "Lima", "Cusco", "Arequipa", "Trujillo", 0],
  ["What is the capital of Colombia?", "Bogotá", "Medellín", "Cali", "Cartagena", 0],
];

const capHard = [
  ["What is the capital of Iceland?", "Reykjavik", "Akureyri", "Kópavogur", "Hafnarfjörður", 0],
  ["What is the capital of Luxembourg?", "Luxembourg City", "Esch-sur-Alzette", "Differdange", "Dudelange", 0],
  ["What is the capital of Malta?", "Valletta", "Mdina", "Sliema", "Birkirkara", 0],
  ["What is the capital of Cyprus?", "Nicosia", "Limassol", "Larnaca", "Paphos", 0],
  ["What is the capital of Estonia?", "Tallinn", "Tartu", "Narva", "Pärnu", 0],
  ["What is the capital of Latvia?", "Riga", "Daugavpils", "Liepāja", "Jelgava", 0],
  ["What is the capital of Lithuania?", "Vilnius", "Kaunas", "Klaipėda", "Šiauliai", 0],
  ["What is the capital of Slovakia?", "Bratislava", "Košice", "Prešov", "Žilina", 0],
  ["What is the capital of Slovenia?", "Ljubljana", "Maribor", "Celje", "Koper", 0],
  ["What is the capital of Albania?", "Tirana", "Durrës", "Vlorë", "Shkodër", 0],
  ["What is the capital of North Macedonia?", "Skopje", "Bitola", "Ohrid", "Prilep", 0],
  ["What is the capital of Montenegro?", "Podgorica", "Nikšić", "Budva", "Kotor", 0],
  ["What is the capital of Bhutan?", "Thimphu", "Paro", "Punakha", "Gelephu", 0],
  ["What is the capital of Nepal?", "Kathmandu", "Pokhara", "Lalitpur", "Bharatpur", 0],
  ["What is the capital of Laos?", "Vientiane", "Luang Prabang", "Pakse", "Savannakhet", 0],
  ["What is the capital of Brunei?", "Bandar Seri Begawan", "Kuala Belait", "Seria", "Tutong", 0],
];

const mbInt = [
  ["Which battle in 1066 changed English history?", "Battle of Hastings", "Battle of Waterloo", "Battle of Agincourt", "Battle of Bosworth", 0],
  ["The Battle of Gettysburg was fought during which war?", "American Civil War", "World War I", "Revolutionary War", "War of 1812", 0],
  ["Which naval battle in 1805 involved Nelson?", "Battle of Trafalgar", "Battle of Jutland", "Battle of Midway", "Battle of Lepanto", 0],
  ["The Battle of Stalingrad was a turning point in which war?", "World War II", "World War I", "Cold War", "Franco-Prussian War", 0],
  ["Which battle ended Napoleon's rule at Waterloo?", "Battle of Waterloo", "Battle of Austerlitz", "Battle of Leipzig", "Battle of Borodino", 0],
  ["The D-Day landings occurred in which year?", "1944", "1942", "1945", "1943", 0],
  ["Which battle is associated with the Spartans at Thermopylae?", "Battle of Thermopylae", "Battle of Marathon", "Battle of Salamis", "Battle of Plataea", 0],
  ["The Battle of the Somme is associated with which war?", "World War I", "World War II", "Crimean War", "Boer War", 0],
  ["Which battle in 1815 was fought in present-day Belgium?", "Battle of Waterloo", "Battle of Verdun", "Battle of the Bulge", "Battle of Passchendaele", 0],
  ["The Battle of Midway was a major naval battle in which war?", "World War II", "World War I", "Korean War", "Vietnam War", 0],
  ["Which battle is linked to William the Conqueror?", "Battle of Hastings", "Battle of Bannockburn", "Battle of Culloden", "Battle of Poitiers", 0],
  ["The Battle of Verdun was fought in which war?", "World War I", "World War II", "Franco-Prussian War", "Napoleonic Wars", 0],
  ["Which ancient battle involved Alexander the Great at Issus?", "Battle of Issus", "Battle of Cannae", "Battle of Zama", "Battle of Actium", 0],
  ["The Battle of the Bulge occurred in which war?", "World War II", "World War I", "Korean War", "Vietnam War", 0],
  ["Which battle is famous for the charge of the Light Brigade?", "Battle of Balaclava", "Battle of Waterloo", "Battle of Trafalgar", "Battle of Agincourt", 0],
  ["The Battle of Agincourt was fought in which century?", "15th century", "11th century", "18th century", "20th century", 0],
  ["Which battle marked Hannibal's victory over Rome at Cannae?", "Battle of Cannae", "Battle of Zama", "Battle of Metaurus", "Battle of Trebia", 0],
  ["The Battle of Yorktown ended which war?", "American Revolutionary War", "American Civil War", "War of 1812", "French and Indian War", 0],
  ["Which battle is associated with the Hundred Years' War at Crécy?", "Battle of Crécy", "Battle of Poitiers", "Battle of Agincourt", "Battle of Orleans", 0],
  ["The Battle of Lepanto was a naval clash in which century?", "16th century", "12th century", "19th century", "20th century", 0],
  ["Which battle is linked to Joan of Arc lifting the siege?", "Siege of Orleans", "Battle of Agincourt", "Battle of Hastings", "Battle of Bosworth", 0],
];
const mbHard = mbInt.map((r) => [...r]);
const gmInt = [
  ["What does NATO stand for?", "North Atlantic Treaty Organization", "National Atlantic Treaty Organization", "Northern Allied Treaty Organization", "North American Treaty Organization", 0],
  ["Which country developed the AK-47 assault rifle?", "Soviet Union", "United States", "Germany", "China", 0],
  ["What is a submarine's primary advantage?", "Stealth under water", "Speed on land", "Flight capability", "Heavy armor on surface", 0],
  ["Which treaty established NATO in 1949?", "North Atlantic Treaty", "Treaty of Versailles", "Treaty of Rome", "Treaty of Paris", 0],
  ["What is the main role of an aircraft carrier?", "Mobile airbase at sea", "Submarine hunter only", "Coastal artillery", "Tank transport only", 0],
  ["Which conflict is associated with the DMZ on the Korean Peninsula?", "Korean War", "Vietnam War", "Gulf War", "Falklands War", 0],
  ["What is ballistic missile defense designed to intercept?", "Incoming missiles", "Infantry charges", "Torpedoes only", "Artillery shells only", 0],
  ["Which nation operates the Typhoon fighter with European partners?", "United Kingdom", "Japan", "Brazil", "India", 0],
  ["What is the purpose of a peacekeeping mission?", "Monitor and stabilize conflicts", "Annex territory", "Deploy nuclear weapons", "Eliminate trade", 0],
  ["Which ship type is designed to carry landing craft?", "Amphibious assault ship", "Destroyer", "Frigate", "Patrol boat", 0],
  ["What does ICBM stand for?", "Intercontinental Ballistic Missile", "International Combat Ballistic Missile", "Integrated Coastal Ballistic Missile", "Intercity Ballistic Missile", 0],
  ["Which organization succeeded the Warsaw Pact?", "None — it dissolved", "NATO", "European Union", "United Nations", 0],
  ["What is camouflage primarily used for?", "Concealment", "Speed", "Communication", "Navigation", 0],
  ["Which branch typically operates main battle tanks?", "Army", "Navy", "Air Force", "Coast Guard", 0],
  ["What is a drone used for in modern militaries?", "Surveillance and strikes", "Submarine propulsion", "Tank armor", "Hospital care", 0],
  ["Which country is a permanent member of the UN Security Council?", "France", "Germany", "Japan", "India", 0],
  ["What is demining?", "Removing landmines", "Building fortifications", "Launching missiles", "Training pilots", 0],
  ["Which helmet design reduces blast injury risk?", "Modern combat helmet", "Steel parade helmet", "Civilian hard hat", "Firefighter helmet", 0],
  ["What is the Geneva Conventions' main focus?", "Protection of war victims", "Trade tariffs", "Space exploration", "Ocean fishing", 0],
  ["Which radar type helps detect aircraft?", "Air surveillance radar", "Sonar", "Seismograph", "Barometer", 0],
  ["What is a flak gun historically used against?", "Aircraft", "Submarines", "Tanks", "Satellites", 0],
  ["Which navy pioneered nuclear-powered submarines at scale?", "United States", "Peru", "Thailand", "Portugal", 0],
  ["What is conscription?", "Mandatory military service", "Voluntary charity", "Trade embargo", "Diplomatic immunity", 0],
];
const gmHard = gmInt.map((r) => [...r]);

let content = fs.readFileSync(target, "utf8");
if (content.includes("GAP_FILL_HISTORY_INT")) {
  console.log("Gap fill already applied");
  process.exit(0);
}

const block = `
  // GAP_FILL_HISTORY_INT
${rows(H, "History", INT, ["history"], historyInt).join("\n")}
${rows(H, "History", HARD, ["history"], historyHard).join("\n")}
${rows(G, "Geography", INT, ["geography"], geoInt).join("\n")}
${rows(G, "Geography", HARD, ["geography"], geoHard).join("\n")}
${rows(C, "Capital Cities", INT, ["geography", "culture"], capInt).join("\n")}
${rows(C, "Capital Cities", HARD, ["geography", "culture"], capHard).join("\n")}
${rows(MB, "Military Battles", INT, ["military"], mbInt).join("\n")}
${rows(MB, "Military Battles", HARD, ["military"], mbHard).join("\n")}
${rows(GM, "General Military", INT, ["military"], gmInt).join("\n")}
${rows(GM, "General Military", HARD, ["military"], gmHard).join("\n")}
`;

content = content.replace(/\];\s*$/, `${block}\n];\n`);
fs.writeFileSync(target, content);
console.log("Gap fill appended to expanded-pools.ts");
