export type LeadersQuestionDef = {
  prompt: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
};

/**
 * Current heads of government and presidents in South America, Europe, and Asia.
 * Names follow the UN Protocol list of heads of state, heads of government, and
 * foreign ministers dated 13 November 2026. The correct choice is always first
 * and is shuffled when the bank is built. Distractors are the previous holder
 * or the other current office in the same region.
 */
export const LEADERS_INTERMEDIATE: LeadersQuestionDef[] = [
  {
    prompt: "Who is the president of Argentina?",
    options: ["Javier Milei", "Lula da Silva", "José Antonio Kast"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Brazil?",
    options: ["Lula da Silva", "Javier Milei", "Daniel Noboa"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Chile?",
    options: ["José Antonio Kast", "Gabriel Boric", "Yamandú Orsi"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Colombia?",
    options: ["Abelardo de la Espriella", "Gustavo Petro", "Daniel Noboa"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of France?",
    options: ["Emmanuel Macron", "Sébastien Lecornu", "Friedrich Merz"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of France?",
    options: ["Sébastien Lecornu", "Emmanuel Macron", "Bart De Wever"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the chancellor of Germany?",
    options: ["Friedrich Merz", "Olaf Scholz", "Frank-Walter Steinmeier"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Germany?",
    options: ["Frank-Walter Steinmeier", "Friedrich Merz", "Alexander Van der Bellen"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Italy?",
    options: ["Giorgia Meloni", "Sergio Mattarella", "Pedro Sánchez"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Spain?",
    options: ["Pedro Sánchez", "Luís Montenegro", "Kyriakos Mitsotakis"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of the United Kingdom?",
    options: ["Andrew Burnham", "Keir Starmer", "Micheál Martin"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Russia?",
    options: ["Vladimir Putin", "Mikhail Mishustin", "Aleksandr Lukashenko"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Russia?",
    options: ["Mikhail Mishustin", "Vladimir Putin", "Donald Tusk"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of India?",
    options: ["Narendra Modi", "Droupadi Murmu", "Shehbaz Sharif"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of India?",
    options: ["Droupadi Murmu", "Narendra Modi", "Asif Ali Zardari"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Japan?",
    options: ["Sanae Takaichi", "Shigeru Ishiba", "Fumio Kishida"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of China?",
    options: ["Xi Jinping", "Li Qiang", "To Lam"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the premier of China?",
    options: ["Li Qiang", "Xi Jinping", "Le Minh Hung"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of South Korea?",
    options: ["Lee Jae-myung", "Yoon Suk Yeol", "Han Seong-sook"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Indonesia?",
    options: ["Prabowo Subianto", "Joko Widodo", "Ferdinand Marcos Jr."],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Pakistan?",
    options: ["Shehbaz Sharif", "Imran Khan", "Asif Ali Zardari"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Türkiye?",
    options: ["Recep Tayyip Erdoğan", "Masoud Pezeshkian", "Kyriakos Mitsotakis"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Ukraine?",
    options: ["Volodymyr Zelenskyy", "Sergii Koretskyi", "Maia Sandu"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Poland?",
    options: ["Donald Tusk", "Karol Nawrocki", "Robert Fico"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Poland?",
    options: ["Karol Nawrocki", "Andrzej Duda", "Donald Tusk"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Israel?",
    options: ["Benjamin Netanyahu", "Isaac Herzog", "Nawaf Salam"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Iran?",
    options: ["Masoud Pezeshkian", "Ebrahim Raisi", "Ali Khamenei"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the taoiseach of Ireland?",
    options: ["Micheál Martin", "Simon Harris", "Catherine Connolly"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of the Netherlands?",
    options: ["Rob Jetten", "Dick Schoof", "Bart De Wever"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Belgium?",
    options: ["Bart De Wever", "Alexander De Croo", "Luc Frieden"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Sweden?",
    options: ["Ulf Kristersson", "Magdalena Andersson", "Mette Frederiksen"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Denmark?",
    options: ["Mette Frederiksen", "Ulf Kristersson", "Jonas Gahr Støre"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Norway?",
    options: ["Jonas Gahr Støre", "Erna Solberg", "Petteri Orpo"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Finland?",
    options: ["Petteri Orpo", "Sanna Marin", "Alexander Stubb"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the chancellor of Austria?",
    options: ["Christian Stocker", "Karl Nehammer", "Alexander Van der Bellen"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Greece?",
    options: ["Kyriakos Mitsotakis", "Alexis Tsipras", "Nikos Christodoulides"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Portugal?",
    options: ["Luís Montenegro", "António Costa", "António Seguro"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Czechia?",
    options: ["Andrej Babiš", "Petr Fiala", "Petr Pavel"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Hungary?",
    options: ["Péter Magyar", "Viktor Orbán", "Robert Fico"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Slovakia?",
    options: ["Robert Fico", "Peter Pellegrini", "Janez Janša"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Romania?",
    options: ["Nicușor Dan", "Klaus Iohannis", "Maia Sandu"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Serbia?",
    options: ["Aleksandar Vučić", "Đuro Macut", "Zoran Milanović"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Croatia?",
    options: ["Andrej Plenković", "Zoran Milanović", "Milojko Spajić"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Peru?",
    options: ["Keiko Fujimori", "Dina Boluarte", "Javier Milei"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Bolivia?",
    options: ["Rodrigo Paz", "Luis Arce", "Yamandú Orsi"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Uruguay?",
    options: ["Yamandú Orsi", "Luis Lacalle Pou", "Santiago Peña"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Ecuador?",
    options: ["Daniel Noboa", "Guillermo Lasso", "Abelardo de la Espriella"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the acting president of Venezuela?",
    options: ["Delcy Rodríguez", "Nicolás Maduro", "Keiko Fujimori"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Singapore?",
    options: ["Lawrence Wong", "Lee Hsien Loong", "Tharman Shanmugaratnam"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Malaysia?",
    options: ["Anwar Ibrahim", "Muhyiddin Yassin", "Lawrence Wong"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Thailand?",
    options: ["Anutin Charnvirakul", "Paetongtarn Shinawatra", "Hun Manet"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of the Philippines?",
    options: ["Ferdinand Marcos Jr.", "Rodrigo Duterte", "Prabowo Subianto"],
    correctIndex: 0,
  },
];

export const LEADERS_HARD: LeadersQuestionDef[] = [
  {
    prompt: "Who is the prime minister of Latvia?",
    options: ["Andris Kulbergs", "Edgars Rinkēvičs", "Inga Ruginienė"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Latvia?",
    options: ["Edgars Rinkēvičs", "Andris Kulbergs", "Gitanas Nausėda"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Lithuania?",
    options: ["Inga Ruginienė", "Gitanas Nausėda", "Andris Kulbergs"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Estonia?",
    options: ["Ülle Madise", "Alar Karis", "Kristen Michal"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Estonia?",
    options: ["Kristen Michal", "Kaja Kallas", "Ülle Madise"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Iceland?",
    options: ["Kristrún Frostadóttir", "Katrín Jakobsdóttir", "Halla Tómasdóttir"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Iceland?",
    options: ["Halla Tómasdóttir", "Guðni Th. Jóhannesson", "Kristrún Frostadóttir"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Luxembourg?",
    options: ["Luc Frieden", "Xavier Bettel", "Bart De Wever"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Malta?",
    options: ["Robert Abela", "Joseph Muscat", "Myriam Spiteri Debono"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Malta?",
    options: ["Myriam Spiteri Debono", "George Vella", "Robert Abela"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Moldova?",
    options: ["Vasile Tofan", "Maia Sandu", "Dorin Recean"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Moldova?",
    options: ["Maia Sandu", "Vasile Tofan", "Nicușor Dan"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Montenegro?",
    options: ["Milojko Spajić", "Jakov Milatović", "Đuro Macut"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Montenegro?",
    options: ["Jakov Milatović", "Milo Đukanović", "Milojko Spajić"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of North Macedonia?",
    options: ["Hristijan Mickoski", "Dimitar Kovačevski", "Gordana Siljanovska-Davkova"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of North Macedonia?",
    options: ["Gordana Siljanovska-Davkova", "Stevo Pendarovski", "Hristijan Mickoski"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Cyprus?",
    options: ["Nikos Christodoulides", "Nicos Anastasiades", "Kyriakos Mitsotakis"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Georgia?",
    options: ["Irakli Kobakhidze", "Irakli Garibashvili", "Mikheil Kavelashvili"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Georgia?",
    options: ["Mikheil Kavelashvili", "Salome Zourabichvili", "Irakli Kobakhidze"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Bulgaria?",
    options: ["Iliana Iotova", "Rumen Radev", "Zoran Milanović"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Bulgaria?",
    options: ["Rumen Radev", "Boyko Borisov", "Iliana Iotova"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Slovenia?",
    options: ["Janez Janša", "Robert Golob", "Nataša Pirc Musar"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Slovenia?",
    options: ["Nataša Pirc Musar", "Borut Pahor", "Janez Janša"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Slovakia?",
    options: ["Peter Pellegrini", "Zuzana Čaputová", "Robert Fico"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Czechia?",
    options: ["Petr Pavel", "Andrej Babiš", "Peter Pellegrini"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Austria?",
    options: ["Alexander Van der Bellen", "Christian Stocker", "Frank-Walter Steinmeier"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Greece?",
    options: ["Konstantinos Tasoulas", "Katerina Sakellaropoulou", "Kyriakos Mitsotakis"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Hungary?",
    options: ["András Bálint Baka", "Katalin Novák", "Péter Magyar"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Albania?",
    options: ["Edi Rama", "Bajram Begaj", "Milojko Spajić"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Albania?",
    options: ["Bajram Begaj", "Ilir Meta", "Edi Rama"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Serbia?",
    options: ["Đuro Macut", "Miloš Vučević", "Aleksandar Vučić"],
    correctIndex: 0,
  },
  {
    prompt: "Who chairs the Council of Ministers of Bosnia and Herzegovina?",
    options: ["Borjana Krišto", "Denis Bećirović", "Željka Cvijanović"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the current chairman of the Presidency of Bosnia and Herzegovina?",
    options: ["Denis Bećirović", "Borjana Krišto", "Željko Komšić"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Switzerland for 2026?",
    options: ["Guy Parmelin", "Karin Keller-Sutter", "Ignazio Cassis"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Ukraine?",
    options: ["Sergii Koretskyi", "Denys Shmyhal", "Volodymyr Zelenskyy"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Belarus?",
    options: ["Aleksandr Turchin", "Roman Golovchenko", "Aleksandr Lukashenko"],
    correctIndex: 0,
  },
  {
    prompt: "Which country has Aleksandr Lukashenko as president?",
    options: ["Belarus", "Russia", "Kazakhstan"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Armenia?",
    options: ["Nikol Pashinyan", "Vahagn Khachaturyan", "Irakli Kobakhidze"],
    correctIndex: 0,
  },
  {
    prompt: "Which country has Ilham Aliyev as president?",
    options: ["Azerbaijan", "Armenia", "Georgia"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Iraq?",
    options: ["Ali Falih Al-Zaidi", "Mohammed Shia' Al Sudani", "Nazar Amedi"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Iraq?",
    options: ["Nazar Amedi", "Abdul Latif Rashid", "Ali Falih Al-Zaidi"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Lebanon?",
    options: ["Nawaf Salam", "Najib Mikati", "Joseph Aoun"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Lebanon?",
    options: ["Joseph Aoun", "Michel Aoun", "Nawaf Salam"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Syria?",
    options: ["Ahmed al-Sharaa", "Bashar al-Assad", "Nawaf Salam"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Jordan?",
    options: ["Jafar Hassan", "Bisher Al-Khasawneh", "Abdullah II"],
    correctIndex: 0,
  },
  {
    prompt: "Which country has Isaac Herzog as president?",
    options: ["Israel", "Lebanon", "Jordan"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the crown prince and prime minister of Saudi Arabia?",
    options: ["Mohammed bin Salman", "Mohammed bin Zayed", "Mohammed bin Abdulrahman Al Thani"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Qatar?",
    options: ["Mohammed bin Abdulrahman Al Thani", "Mohammed bin Salman", "Mohammed bin Rashid"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of the United Arab Emirates?",
    options: ["Mohamed bin Zayed", "Mohammed bin Rashid", "Mohammed bin Salman"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Laos?",
    options: ["Saleumxay Kommasith", "Thongloun Sisoulith", "Sonexay Siphandone"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Vietnam?",
    options: ["Le Minh Hung", "Pham Minh Chinh", "To Lam"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Mongolia?",
    options: ["Uchral Nyam-Osor", "Luvsannamsrain Oyun-Erdene", "Khurelsukh Ukhnaa"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Sri Lanka?",
    options: ["Harini Amarasuriya", "Dinesh Gunawardena", "Anura Kumara Dissanayake"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the prime minister of Bangladesh?",
    options: ["Tarique Rahman", "Sheikh Hasina", "Muhammad Yunus"],
    correctIndex: 0,
  },
  {
    prompt: "Which country has Kassym-Jomart Tokayev as president?",
    options: ["Kazakhstan", "Uzbekistan", "Kyrgyzstan"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the president of Suriname?",
    options: ["Jennifer Geerlings-Simons", "Chan Santokhi", "Irfaan Ali"],
    correctIndex: 0,
  },
];
