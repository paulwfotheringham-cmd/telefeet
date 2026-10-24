export type MilitaryBattlesQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const MILITARY_BATTLES_DEFS: MilitaryBattlesQuestionDef[] = [
  {
    prompt: "In which year did the Battle of Hastings take place?",
    options: ["1066", "1215", "1415", "1588"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Waterloo (1815) ended the rule of which leader?",
    options: ["Napoleon Bonaparte", "Otto von Bismarck", "Louis XIV", "Frederick the Great"],
    correctIndex: 0,
  },
  {
    prompt: "Pearl Harbor was attacked by Japan in which year?",
    options: ["1939", "1941", "1943", "1945"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of Stalingrad (1942–1943) was a major turning point on which front?",
    options: ["Pacific", "Eastern Front", "North Africa", "Italian Front"],
    correctIndex: 1,
  },
  {
    prompt: "D-Day, the Allied invasion of Normandy, occurred on which date?",
    options: ["June 6, 1944", "December 7, 1941", "August 6, 1945", "November 11, 1918"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Gettysburg was fought during which US war?",
    options: ["Revolutionary War", "American Civil War", "War of 1812", "Mexican-American War"],
    correctIndex: 1,
  },
  {
    prompt: "Which battle is associated with King Leonidas and 300 Spartans against Persia?",
    options: ["Marathon", "Thermopylae", "Salamis", "Plataea"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of Midway (1942) was primarily a naval battle in which ocean?",
    options: ["Atlantic", "Pacific", "Indian", "Arctic"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of the Bulge was a German counteroffensive in which war?",
    options: ["World War I", "World War II", "Korean War", "Vietnam War"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of Trafalgar (1805) was a naval victory for which nation?",
    options: ["France", "Britain", "Spain", "Netherlands"],
    correctIndex: 1,
  },
  {
    prompt: "Which ancient battle saw Alexander the Great defeat Darius III of Persia?",
    options: ["Battle of Issus", "Battle of Cannae", "Battle of Actium", "Battle of Zama"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Yorktown (1781) effectively ended which war?",
    options: ["French and Indian War", "American Revolutionary War", "War of 1812", "US Civil War"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of the Somme (1916) was fought during which conflict?",
    options: ["World War I", "World War II", "Franco-Prussian War", "Crimean War"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1415 battle is famous for English longbowmen under Henry V?",
    options: ["Agincourt", "Crecy", "Poitiers", "Bannockburn"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of El Alamein (1942) was significant in which theater?",
    options: ["North African campaign", "Eastern Front", "Pacific", "Balkans"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Lepanto (1571) was a major naval clash involving the Ottoman Empire and a Holy League led largely by which country?",
    options: ["Spain", "Russia", "Sweden", "Portugal alone"],
    correctIndex: 0,
  },
  {
    prompt: "Which 216 BC battle is Hannibal's famous victory over Rome?",
    options: ["Cannae", "Metaurus", "Zama", "Trebia"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Ia Drang (1965) was an early major engagement in which war?",
    options: ["Korean War", "Vietnam War", "Gulf War", "Falklands War"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of Britain (1940) was fought primarily in which domain?",
    options: ["Land invasion of London", "Air warfare over Britain", "Naval blockade only", "Arctic convoys"],
    correctIndex: 1,
  },
  {
    prompt: "Which 1812 battle outside Moscow weakened Napoleon's army severely?",
    options: ["Borodino", "Austerlitz", "Jena", "Wagram"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Inchon (1950) was a amphibious landing during which war?",
    options: ["World War II", "Korean War", "Vietnam War", "Suez Crisis"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of Verdun (1916) was fought between Germany and which country?",
    options: ["Britain", "France", "Russia", "Italy"],
    correctIndex: 1,
  },
  {
    prompt: "Which 331 BC battle sealed Alexander's conquest of Persia at Gaugamela?",
    options: ["Gaugamela", "Granicus", "Hydaspes", "Chaeronea"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Antietam (1862) occurred in which US state?",
    options: ["Virginia", "Maryland", "Pennsylvania", "Tennessee"],
    correctIndex: 1,
  },
  {
    prompt: "Operation Desert Storm's ground campaign in 1991 liberated which country from Iraqi occupation?",
    options: ["Iran", "Kuwait", "Jordan", "Saudi Arabia"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of the Alamo (1836) was part of the struggle for independence of which region?",
    options: ["Texas", "California", "Florida", "Oregon"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1588 event involved the Spanish Armada attempting to invade England?",
    options: ["Spanish Armada campaign", "Battle of Lepanto", "Thirty Years' War start", "Seven Years' War"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Kursk (1943) is often cited as the largest what in history?",
    options: ["Naval battle", "Tank battle", "Air raid", "Siege"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of Marathon (490 BC) was fought between Athens and which empire?",
    options: ["Persian Empire", "Roman Republic", "Macedon", "Carthage"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1954 battle led to French withdrawal from Indochina?",
    options: ["Dien Bien Phu", "Khe Sanh", "Hue", "Saigon"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Actium (31 BC) established the power of which Roman leader?",
    options: ["Julius Caesar", "Octavian (Augustus)", "Mark Antony alone", "Pompey"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of the Marne (1914) helped prevent the capture of which city?",
    options: ["Berlin", "Paris", "London", "Vienna"],
    correctIndex: 1,
  },
  {
    prompt: "Which 1759 battle on the Plains of Abraham decided control of Quebec?",
    options: ["Quebec (Plains of Abraham)", "Bunker Hill", "Quebec City siege 1775", "Ticonderoga"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Guadalcanal (1942–1943) was part of which war?",
    options: ["World War I", "World War II", "Korean War", "Spanish-American War"],
    correctIndex: 1,
  },
  {
    prompt: "Which 480 BC naval battle saw the Greek fleet defeat Persia in a narrow strait?",
    options: ["Salamis", "Actium", "Lepanto", "Jutland"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of the Little Bighorn (1876) is also known by which name?",
    options: ["Custer's Last Stand", "Wounded Knee", "Alamo", "Tippecanoe"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1704 battle on the Iberian Peninsula was a major Allied victory in the War of Spanish Succession?",
    options: ["Blenheim", "Waterloo", "Austerlitz", "Leipzig"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Okinawa (1945) was one of the last major battles of which war?",
    options: ["World War I", "World War II", "Korean War", "Russo-Japanese War"],
    correctIndex: 1,
  },
  {
    prompt: "Which 732 AD battle near Tours is traditionally credited with halting Umayyad expansion into Francia?",
    options: ["Battle of Tours (Poitiers)", "Battle of Hastings", "Battle of Manzikert", "Battle of Yarmouk"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Britain's 'Few' refers primarily to pilots of which air force?",
    options: ["RAF", "Luftwaffe", "USAAF", "Regia Aeronautica"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1863 battle in Pennsylvania is considered a turning point of the US Civil War?",
    options: ["Gettysburg", "Shiloh", "Antietam", "Fredericksburg"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Tsushima (1905) was a decisive naval battle in which war?",
    options: ["Russo-Japanese War", "World War I", "Sino-Japanese War", "Crimean War"],
    correctIndex: 0,
  },
  {
    prompt: "Operation Overlord is the codename for which 1944 campaign?",
    options: ["Allied invasion of Normandy", "Battle of the Bulge", "Italian campaign start", "Market Garden"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Plataea (479 BC) finally ended which empire's invasion of Greece?",
    options: ["Persian Empire", "Roman Empire", "Macedon", "Egypt"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1916 Easter Rising city battle occurred in Ireland against British rule?",
    options: ["Dublin", "Belfast", "Cork", "Galway"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Austerlitz (1805) is considered a masterpiece of which commander?",
    options: ["Napoleon Bonaparte", "Nelson", "Wellington", "Frederick II"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1991 tank battle in Iraq is sometimes called the '100-hour war' ground climax?",
    options: ["Battle of 73 Easting", "Battle of the Bulge", "Battle of Kursk", "Battle of Cambrai"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Passchendaele (1917) is associated with mud and which country?",
    options: ["Belgium", "Turkey", "Poland", "Serbia"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1982 conflict included the Battle of Goose Green in the Falkland Islands?",
    options: ["Falklands War", "Gulf War", "Yom Kippur War", "Six-Day War"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Chancellorsville (1863) was a Confederate victory led partly by which general?",
    options: ["Robert E. Lee", "Ulysses S. Grant", "William Tecumseh Sherman", "George McClellan"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1973 battle during the Yom Kippur War involved a major crossing of the Suez Canal?",
    options: ["Operation Badr", "Six-Day War", "Operation Desert Storm", "Operation Torch"],
    correctIndex: 0,
  },
  {
    prompt: "The Battle of Jutland (1916) was the largest naval battle of which war?",
    options: ["World War I", "World War II", "Napoleonic Wars", "Crimean War"],
    correctIndex: 0,
  },
];
