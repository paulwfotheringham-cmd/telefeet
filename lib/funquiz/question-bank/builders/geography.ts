export type GeographyQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const GEOGRAPHY_QUESTION_DEFS: GeographyQuestionDef[] = [
  {
    prompt: "Which river flows through Cairo?",
    options: ["Niger", "Nile", "Congo", "Zambezi"],
    correctIndex: 1,
  },
  {
    prompt: "Mount Kilimanjaro is located in which country?",
    options: ["Kenya", "Tanzania", "Ethiopia", "Uganda"],
    correctIndex: 1,
  },
  {
    prompt: "Which sea lies between Europe and Africa?",
    options: ["Red Sea", "Mediterranean Sea", "Black Sea", "Adriatic Sea"],
    correctIndex: 1,
  },
  {
    prompt: "Which country has the longest coastline in the world?",
    options: ["Russia", "Canada", "Australia", "Indonesia"],
    correctIndex: 1,
  },
  {
    prompt: "The Andes mountain range runs mainly along which continent?",
    options: ["Africa", "South America", "Asia", "Europe"],
    correctIndex: 1,
  },
  {
    prompt: "Which desert covers much of northern China and southern Mongolia?",
    options: ["Sahara", "Gobi", "Kalahari", "Atacama"],
    correctIndex: 1,
  },
  {
    prompt: "Lake Baikal, the world's deepest freshwater lake, is in which country?",
    options: ["Canada", "Russia", "Finland", "Mongolia"],
    correctIndex: 1,
  },
  {
    prompt: "Which strait separates Europe from Asia at Istanbul?",
    options: ["Strait of Gibraltar", "Bosporus", "Dardanelles", "Strait of Hormuz"],
    correctIndex: 1,
  },
  {
    prompt: "The Amazon River basin lies primarily in which country?",
    options: ["Colombia", "Brazil", "Peru", "Venezuela"],
    correctIndex: 1,
  },
  {
    prompt: "Which mountain is the highest peak in Africa?",
    options: ["Mount Kenya", "Mount Kilimanjaro", "Ras Dashen", "Mount Meru"],
    correctIndex: 1,
  },
  {
    prompt: "Victoria Falls is on the border of Zambia and which other country?",
    options: ["Botswana", "Zimbabwe", "Namibia", "Mozambique"],
    correctIndex: 1,
  },
  {
    prompt: "Which ocean is the largest by surface area?",
    options: ["Atlantic Ocean", "Pacific Ocean", "Indian Ocean", "Arctic Ocean"],
    correctIndex: 1,
  },
  {
    prompt: "The Great Barrier Reef is off the coast of which country?",
    options: ["New Zealand", "Australia", "Papua New Guinea", "Indonesia"],
    correctIndex: 1,
  },
  {
    prompt: "Which river forms part of the border between the United States and Mexico?",
    options: ["Colorado River", "Rio Grande", "Mississippi River", "Columbia River"],
    correctIndex: 1,
  },
  {
    prompt: "Mount Everest lies on the border of Nepal and which country?",
    options: ["India", "China", "Bhutan", "Pakistan"],
    correctIndex: 1,
  },
  {
    prompt: "Which European country is known as the 'Land of a Thousand Lakes'?",
    options: ["Sweden", "Finland", "Norway", "Estonia"],
    correctIndex: 1,
  },
  {
    prompt: "The Danube River flows into which sea?",
    options: ["Adriatic Sea", "Black Sea", "Aegean Sea", "Baltic Sea"],
    correctIndex: 1,
  },
  {
    prompt: "Which is the largest island in the Mediterranean Sea?",
    options: ["Crete", "Sicily", "Sardinia", "Cyprus"],
    correctIndex: 1,
  },
  {
    prompt: "The Sahara Desert covers much of which continent?",
    options: ["Asia", "Africa", "Australia", "South America"],
    correctIndex: 1,
  },
  {
    prompt: "Which country contains the geographic center of South America?",
    options: ["Peru", "Brazil", "Bolivia", "Colombia"],
    correctIndex: 1,
  },
  {
    prompt: "The Ring of Fire is associated mainly with which ocean basin?",
    options: ["Atlantic", "Pacific", "Indian", "Arctic"],
    correctIndex: 1,
  },
  {
    prompt: "Which river is the longest in Europe?",
    options: ["Danube", "Volga", "Rhine", "Dnieper"],
    correctIndex: 1,
  },
  {
    prompt: "Patagonia spans southern Argentina and which other country?",
    options: ["Uruguay", "Chile", "Bolivia", "Paraguay"],
    correctIndex: 1,
  },
  {
    prompt: "Which gulf lies between the Arabian Peninsula and Iran?",
    options: ["Gulf of Aden", "Persian Gulf", "Gulf of Oman", "Red Sea"],
    correctIndex: 1,
  },
  {
    prompt: "Lake Titicaca lies on the border of Peru and which country?",
    options: ["Chile", "Bolivia", "Ecuador", "Colombia"],
    correctIndex: 1,
  },
  {
    prompt: "Which country is entirely surrounded by South Africa?",
    options: ["Swaziland", "Lesotho", "Botswana", "Namibia"],
    correctIndex: 1,
  },
  {
    prompt: "The Ural Mountains are often cited as part of the boundary between Europe and which continent?",
    options: ["Africa", "Asia", "North America", "Australia"],
    correctIndex: 1,
  },
  {
    prompt: "Which Canadian province is the largest by area?",
    options: ["Ontario", "Quebec", "British Columbia", "Nunavut"],
    correctIndex: 3,
  },
  {
    prompt: "The Mekong River flows through Southeast Asia and empties into which sea?",
    options: ["Andaman Sea", "South China Sea", "Java Sea", "Gulf of Thailand"],
    correctIndex: 1,
  },
  {
    prompt: "Which African country is separated from Spain by the Strait of Gibraltar?",
    options: ["Algeria", "Morocco", "Tunisia", "Libya"],
    correctIndex: 1,
  },
  {
    prompt: "The Dead Sea lies between Israel and which country/territory?",
    options: ["Syria", "Jordan", "Lebanon", "Egypt"],
    correctIndex: 1,
  },
  {
    prompt: "Which is the smallest country in the world by area?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correctIndex: 1,
  },
  {
    prompt: "The Isthmus of Panama connects North America to which continent?",
    options: ["Europe", "South America", "Africa", "Antarctica"],
    correctIndex: 1,
  },
  {
    prompt: "Which African lake is one of the sources of the White Nile?",
    options: ["Lake Tanganyika", "Lake Victoria", "Lake Malawi", "Lake Chad"],
    correctIndex: 1,
  },
  {
    prompt: "The Alps extend across several countries; which peak is the highest in the range?",
    options: ["Matterhorn", "Mont Blanc", "Jungfrau", "Zugspitze"],
    correctIndex: 1,
  },
  {
    prompt: "Which US state contains the Grand Canyon?",
    options: ["Utah", "Arizona", "Nevada", "Colorado"],
    correctIndex: 1,
  },
  {
    prompt: "The Bering Strait separates Alaska from which country?",
    options: ["Canada", "Russia", "Greenland", "Iceland"],
    correctIndex: 1,
  },
  {
    prompt: "Which river flows through Paris?",
    options: ["Rhine", "Seine", "Loire", "Rhône"],
    correctIndex: 1,
  },
  {
    prompt: "Madagascar is located off the southeast coast of which continent?",
    options: ["Asia", "Africa", "Australia", "South America"],
    correctIndex: 1,
  },
  {
    prompt: "Which country shares the island of Hispaniola with the Dominican Republic?",
    options: ["Cuba", "Haiti", "Jamaica", "Puerto Rico"],
    correctIndex: 1,
  },
  {
    prompt: "The Okavango Delta is a major inland delta in which country?",
    options: ["Namibia", "Botswana", "Zambia", "Angola"],
    correctIndex: 1,
  },
  {
    prompt: "Which mountain range runs along the western coast of South America?",
    options: ["Rockies", "Andes", "Alps", "Himalayas"],
    correctIndex: 1,
  },
  {
    prompt: "Lake Superior is part of which group of lakes?",
    options: ["African Great Lakes", "Great Lakes", "Alpine Lakes", "Caspian Basin"],
    correctIndex: 1,
  },
  {
    prompt: "Which country is the world's largest archipelago by number of islands (Indonesia)?",
    options: ["Philippines", "Indonesia", "Japan", "Maldives"],
    correctIndex: 1,
  },
  {
    prompt: "The Strait of Magellan is near the southern tip of which continent?",
    options: ["Africa", "South America", "Australia", "Antarctica"],
    correctIndex: 1,
  },
  {
    prompt: "Which river is traditionally associated with the city of Baghdad?",
    options: ["Euphrates", "Tigris", "Jordan River", "Karun"],
    correctIndex: 1,
  },
  {
    prompt: "The Atacama Desert is in which country?",
    options: ["Peru", "Chile", "Argentina", "Bolivia"],
    correctIndex: 1,
  },
  {
    prompt: "Which sea is the saltiest natural body of water on Earth?",
    options: ["Red Sea", "Dead Sea", "Caspian Sea", "Aral Sea"],
    correctIndex: 1,
  },
  {
    prompt: "The Pyrenees mountains form a border between France and which country?",
    options: ["Italy", "Spain", "Portugal", "Andorra"],
    correctIndex: 1,
  },
  {
    prompt: "Which country lies directly north of Lithuania?",
    options: ["Poland", "Latvia", "Estonia", "Belarus"],
    correctIndex: 1,
  },
  {
    prompt: "The Yangtze River is the longest river in which country?",
    options: ["India", "China", "Japan", "Vietnam"],
    correctIndex: 1,
  },
  {
    prompt: "Which peninsula includes Spain and Portugal?",
    options: ["Balkan Peninsula", "Iberian Peninsula", "Scandinavian Peninsula", "Apennine Peninsula"],
    correctIndex: 1,
  },
  {
    prompt: "Mount Fuji is located on which Japanese island?",
    options: ["Hokkaido", "Honshu", "Kyushu", "Shikoku"],
    correctIndex: 1,
  },
  {
    prompt: "Which country controls the enclave of Kaliningrad on the Baltic Sea?",
    options: ["Poland", "Russia", "Lithuania", "Germany"],
    correctIndex: 1,
  },
  {
    prompt: "The Serengeti ecosystem is primarily in Tanzania and extends into which country?",
    options: ["Uganda", "Kenya", "Rwanda", "Ethiopia"],
    correctIndex: 1,
  },
  {
    prompt: "Which US river flows south from Minnesota to the Gulf of Mexico?",
    options: ["Missouri River", "Mississippi River", "Ohio River", "Arkansas River"],
    correctIndex: 1,
  },
  {
    prompt: "The Galápagos Islands belong to which country?",
    options: ["Colombia", "Ecuador", "Peru", "Chile"],
    correctIndex: 1,
  },
  {
    prompt: "Which desert occupies much of Botswana and parts of Namibia and South Africa?",
    options: ["Namib", "Kalahari", "Sahara", "Karoo"],
    correctIndex: 1,
  },
];
