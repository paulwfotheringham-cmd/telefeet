export type HistoryQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const HISTORY_QUESTION_DEFS: HistoryQuestionDef[] = [
  {
    prompt: "In which year did World War II end in Europe (V-E Day)?",
    options: ["1943", "1945", "1947", "1950"],
    correctIndex: 1,
  },
  {
    prompt: "Who was the first President of the United States?",
    options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
    correctIndex: 1,
  },
  {
    prompt: "The Berlin Wall fell in which year?",
    options: ["1987", "1989", "1991", "1993"],
    correctIndex: 1,
  },
  {
    prompt: "Which ancient civilization built the pyramids at Giza?",
    options: ["Romans", "Ancient Egyptians", "Mesopotamians", "Greeks"],
    correctIndex: 1,
  },
  {
    prompt: "The Magna Carta was signed in England in which century?",
    options: ["11th", "13th", "15th", "17th"],
    correctIndex: 1,
  },
  {
    prompt: "Who led the Indian independence movement and advocated nonviolent resistance?",
    options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhas Chandra Bose", "B. R. Ambedkar"],
    correctIndex: 1,
  },
  {
    prompt: "The French Revolution began in which year?",
    options: ["1776", "1789", "1804", "1815"],
    correctIndex: 1,
  },
  {
    prompt: "Which empire was ruled by Genghis Khan?",
    options: ["Ottoman Empire", "Mongol Empire", "Roman Empire", "Byzantine Empire"],
    correctIndex: 1,
  },
  {
    prompt: "The Renaissance began in which country?",
    options: ["France", "Italy", "England", "Spain"],
    correctIndex: 1,
  },
  {
    prompt: "Who was assassinated in Sarajevo in 1914, helping trigger World War I?",
    options: ["Kaiser Wilhelm II", "Archduke Franz Ferdinand", "Tsar Nicholas II", "David Lloyd George"],
    correctIndex: 1,
  },
  {
    prompt: "The United States Declaration of Independence was adopted in which year?",
    options: ["1774", "1776", "1783", "1789"],
    correctIndex: 1,
  },
  {
    prompt: "Which ship brought the Pilgrims to North America in 1620?",
    options: ["Santa Maria", "Mayflower", "Victory", "Endeavour"],
    correctIndex: 1,
  },
  {
    prompt: "The Cold War was primarily between the United States and which country?",
    options: ["China", "Soviet Union", "Germany", "Japan"],
    correctIndex: 1,
  },
  {
    prompt: "Who was the first woman to fly solo across the Atlantic Ocean?",
    options: ["Bessie Coleman", "Amelia Earhart", "Harriet Quimby", "Jacqueline Cochran"],
    correctIndex: 1,
  },
  {
    prompt: "The ancient city of Pompeii was destroyed by which volcano?",
    options: ["Etna", "Mount Vesuvius", "Stromboli", "Vulcano"],
    correctIndex: 1,
  },
  {
    prompt: "Which treaty ended World War I?",
    options: ["Treaty of Paris", "Treaty of Versailles", "Treaty of Ghent", "Treaty of Tordesillas"],
    correctIndex: 1,
  },
  {
    prompt: "Martin Luther is associated with starting which movement in 1517?",
    options: ["Enlightenment", "Protestant Reformation", "Crusades", "Industrial Revolution"],
    correctIndex: 1,
  },
  {
    prompt: "The Aztec capital Tenochtitlan is located where modern city stands today?",
    options: ["Lima", "Mexico City", "Bogotá", "Havana"],
    correctIndex: 1,
  },
  {
    prompt: "Who was the British Prime Minister during most of World War II?",
    options: ["Neville Chamberlain", "Winston Churchill", "Clement Attlee", "Harold Macmillan"],
    correctIndex: 1,
  },
  {
    prompt: "The Silk Road historically connected China with which region?",
    options: ["Sub-Saharan Africa only", "Europe and the Middle East", "South America", "Scandinavia"],
    correctIndex: 1,
  },
  {
    prompt: "Which US amendment abolished slavery?",
    options: ["First Amendment", "Thirteenth Amendment", "Nineteenth Amendment", "Twenty-second Amendment"],
    correctIndex: 1,
  },
  {
    prompt: "The Hundred Years' War was fought primarily between England and which country?",
    options: ["Spain", "France", "Germany", "Italy"],
    correctIndex: 1,
  },
  {
    prompt: "Who discovered penicillin in 1928?",
    options: ["Louis Pasteur", "Alexander Fleming", "Marie Curie", "Joseph Lister"],
    correctIndex: 1,
  },
  {
    prompt: "The Ottoman Empire's capital before World War I was?",
    options: ["Cairo", "Constantinople (Istanbul)", "Baghdad", "Athens"],
    correctIndex: 1,
  },
  {
    prompt: "Which event marked the start of the Great Depression in the US?",
    options: ["Dust Bowl", "1929 stock market crash", "Pearl Harbor", "New Deal"],
    correctIndex: 1,
  },
  {
    prompt: "Cleopatra was the last active ruler of which ancient kingdom?",
    options: ["Persia", "Ptolemaic Egypt", "Macedon", "Carthage"],
    correctIndex: 1,
  },
  {
    prompt: "The Marshall Plan provided aid to rebuild Europe after which war?",
    options: ["World War I", "World War II", "Korean War", "Vietnam War"],
    correctIndex: 1,
  },
  {
    prompt: "Who wrote the Communist Manifesto with Friedrich Engels?",
    options: ["Vladimir Lenin", "Karl Marx", "Joseph Stalin", "Leon Trotsky"],
    correctIndex: 1,
  },
  {
    prompt: "The Battle of Hastings in 1066 led to Norman conquest of which country?",
    options: ["France", "England", "Scotland", "Ireland"],
    correctIndex: 1,
  },
  {
    prompt: "Which civilization developed cuneiform writing?",
    options: ["Egyptians", "Sumerians", "Chinese", "Incas"],
    correctIndex: 1,
  },
  {
    prompt: "Nelson Mandela was imprisoned for fighting apartheid in which country?",
    options: ["Kenya", "South Africa", "Zimbabwe", "Namibia"],
    correctIndex: 1,
  },
  {
    prompt: "The Roman Empire's western half is traditionally said to have fallen in which year?",
    options: ["410", "476", "800", "1453"],
    correctIndex: 1,
  },
  {
    prompt: "Which US president issued the Emancipation Proclamation during the Civil War?",
    options: ["Andrew Johnson", "Abraham Lincoln", "Ulysses S. Grant", "Jefferson Davis"],
    correctIndex: 1,
  },
  {
    prompt: "The Meiji Restoration transformed which country in the late 19th century?",
    options: ["China", "Japan", "Korea", "Thailand"],
    correctIndex: 1,
  },
  {
    prompt: "Who was the first emperor of Rome?",
    options: ["Julius Caesar", "Augustus", "Nero", "Trajan"],
    correctIndex: 1,
  },
  {
    prompt: "The Cuban Missile Crisis occurred in which year?",
    options: ["1956", "1962", "1968", "1972"],
    correctIndex: 1,
  },
  {
    prompt: "Which queen ruled England for much of the 19th century?",
    options: ["Elizabeth I", "Victoria", "Anne", "Mary I"],
    correctIndex: 1,
  },
  {
    prompt: "The printing press was popularized in Europe by which inventor?",
    options: ["Leonardo da Vinci", "Johannes Gutenberg", "Galileo Galilei", "Isaac Newton"],
    correctIndex: 1,
  },
  {
    prompt: "The Panama Canal was opened to shipping in which year?",
    options: ["1898", "1914", "1939", "1959"],
    correctIndex: 1,
  },
  {
    prompt: "Which ancient Greek city-state is famous for its military society?",
    options: ["Athens", "Sparta", "Corinth", "Thebes"],
    correctIndex: 1,
  },
  {
    prompt: "The Reconquista completed the Christian reconquest of the Iberian Peninsula in which year?",
    options: ["1212", "1492", "1588", "1700"],
    correctIndex: 1,
  },
  {
    prompt: "Who was the first Secretary-General of the United Nations?",
    options: ["Dag Hammarskjöld", "Trygve Lie", "U Thant", "Kofi Annan"],
    correctIndex: 1,
  },
  {
    prompt: "The Black Death pandemic peaked in Europe during which century?",
    options: ["11th", "14th", "17th", "19th"],
    correctIndex: 1,
  },
  {
    prompt: "Which revolution began in Russia in 1917?",
    options: ["Industrial Revolution", "Russian Revolution", "Glorious Revolution", "Green Revolution"],
    correctIndex: 1,
  },
  {
    prompt: "The Taj Mahal was built by which Mughal emperor?",
    options: ["Akbar", "Shah Jahan", "Aurangzeb", "Babur"],
    correctIndex: 1,
  },
  {
    prompt: "Which conference divided Vietnam at the 17th parallel in 1954?",
    options: ["Yalta", "Geneva", "Potsdam", "Tehran"],
    correctIndex: 1,
  },
  {
    prompt: "The Statue of Liberty was a gift from which country?",
    options: ["United Kingdom", "France", "Italy", "Spain"],
    correctIndex: 1,
  },
  {
    prompt: "Who was known as the 'Iron Lady' Prime Minister of the UK?",
    options: ["Theresa May", "Margaret Thatcher", "Elizabeth II", "Harriet Harman"],
    correctIndex: 1,
  },
  {
    prompt: "The Han Dynasty ruled which country for over four centuries?",
    options: ["Japan", "China", "Korea", "Vietnam"],
    correctIndex: 1,
  },
  {
    prompt: "Which US civil rights leader delivered the 'I Have a Dream' speech in 1963?",
    options: ["Malcolm X", "Martin Luther King Jr.", "John Lewis", "Medgar Evers"],
    correctIndex: 1,
  },
];
