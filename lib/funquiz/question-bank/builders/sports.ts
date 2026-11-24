export type SportsQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

/** Familiar international sport. Football, cricket, rugby, tennis, cycling, Olympics, and the rest. Not US leagues. */
export const SPORTS_INTERMEDIATE: SportsQuestionDef[] = [
  {
    prompt: "How many players does each side have on the pitch in a football match?",
    options: ["9", "10", "11", "12"],
    correctIndex: 2,
  },
  {
    prompt: "How long is a standard football match, before added time?",
    options: ["60 minutes", "80 minutes", "90 minutes", "120 minutes"],
    correctIndex: 2,
  },
  {
    prompt: "How often is the men's FIFA World Cup usually held?",
    options: ["Every year", "Every 2 years", "Every 4 years", "Every 5 years"],
    correctIndex: 2,
  },
  {
    prompt: "How many men's FIFA World Cups had Brazil won by 2022?",
    options: ["3", "4", "5", "6"],
    correctIndex: 2,
  },
  {
    prompt: "Which country won the 2022 men's FIFA World Cup?",
    options: ["France", "Argentina", "Brazil", "Croatia"],
    correctIndex: 1,
  },
  {
    prompt: "Which country hosted the 2022 men's FIFA World Cup?",
    options: ["Russia", "Qatar", "Brazil", "South Africa"],
    correctIndex: 1,
  },
  {
    prompt: "Scoring three goals in one football match is called what?",
    options: ["A treble", "A hat-trick", "A flush", "A triple"],
    correctIndex: 1,
  },
  {
    prompt: "Which competition is the top club tournament in European football?",
    options: ["Copa Libertadores", "UEFA Champions League", "Africa Cup of Nations", "The Ashes"],
    correctIndex: 1,
  },
  {
    prompt: "Which country won the 2018 men's FIFA World Cup?",
    options: ["France", "Croatia", "Germany", "Brazil"],
    correctIndex: 0,
  },
  {
    prompt: "Which country won UEFA Euro 2024?",
    options: ["England", "Spain", "France", "Italy"],
    correctIndex: 1,
  },
  {
    prompt: "How many players are in a cricket team?",
    options: ["9", "10", "11", "15"],
    correctIndex: 2,
  },
  {
    prompt: "In cricket, how many runs is a hit over the boundary on the full?",
    options: ["4", "6", "8", "10"],
    correctIndex: 1,
  },
  {
    prompt: "The cricket contest between England and Australia is called what?",
    options: ["The Ashes", "The Bledisloe Cup", "The Ryder Cup", "The Davis Cup"],
    correctIndex: 0,
  },
  {
    prompt: "How many players are in a rugby union team?",
    options: ["11", "13", "15", "18"],
    correctIndex: 2,
  },
  {
    prompt: "England, France, Ireland, Italy, Scotland and Wales play which annual rugby tournament?",
    options: ["The Rugby Championship", "The Six Nations", "The Tri-Nations", "The Home Nations Cup"],
    correctIndex: 1,
  },
  {
    prompt: "The All Blacks are the rugby union team of which country?",
    options: ["Australia", "South Africa", "New Zealand", "Fiji"],
    correctIndex: 2,
  },
  {
    prompt: "The Springboks are the rugby union team of which country?",
    options: ["South Africa", "Kenya", "Argentina", "Wales"],
    correctIndex: 0,
  },
  {
    prompt: "How many Grand Slam tennis tournaments are played each year?",
    options: ["2", "3", "4", "5"],
    correctIndex: 2,
  },
  {
    prompt: "Which Grand Slam tennis tournament is played on clay in Paris?",
    options: ["Wimbledon", "Australian Open", "French Open", "US Open"],
    correctIndex: 2,
  },
  {
    prompt: "Which Grand Slam tennis tournament is played on grass in London?",
    options: ["French Open", "Wimbledon", "Australian Open", "US Open"],
    correctIndex: 1,
  },
  {
    prompt: "Which Grand Slam tennis tournament is played in Melbourne?",
    options: ["Australian Open", "French Open", "Wimbledon", "US Open"],
    correctIndex: 0,
  },
  {
    prompt: "A score of zero in tennis is called what?",
    options: ["Love", "Duck", "Nil", "Blank"],
    correctIndex: 0,
  },
  {
    prompt: "The overall leader of the Tour de France wears which colour jersey?",
    options: ["Green", "Polka dot", "Yellow", "White"],
    correctIndex: 2,
  },
  {
    prompt: "The Tour de France is a race in which sport?",
    options: ["Rowing", "Cycling", "Motorsport", "Skiing"],
    correctIndex: 1,
  },
  {
    prompt: "How many rings are on the Olympic flag?",
    options: ["4", "5", "6", "7"],
    correctIndex: 1,
  },
  {
    prompt: "How often are the Summer Olympic Games held?",
    options: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"],
    correctIndex: 2,
  },
  {
    prompt: "Which city hosted the 2024 Summer Olympics?",
    options: ["London", "Tokyo", "Paris", "Los Angeles"],
    correctIndex: 2,
  },
  {
    prompt: "Which city hosted the 2012 Summer Olympics?",
    options: ["London", "Beijing", "Athens", "Sydney"],
    correctIndex: 0,
  },
  {
    prompt: "Which country hosted the 2016 Summer Olympics?",
    options: ["China", "Brazil", "Japan", "Greece"],
    correctIndex: 1,
  },
  {
    prompt: "A marathon is approximately how long?",
    options: ["10 kilometres", "21 kilometres", "42 kilometres", "100 kilometres"],
    correctIndex: 2,
  },
  {
    prompt: "How many events are in an athletics decathlon?",
    options: ["5", "7", "10", "12"],
    correctIndex: 2,
  },
  {
    prompt: "Which swimming stroke is performed on the back?",
    options: ["Butterfly", "Breaststroke", "Backstroke", "Freestyle"],
    correctIndex: 2,
  },
  {
    prompt: "Which swimming stroke uses a dolphin kick?",
    options: ["Butterfly", "Breaststroke", "Backstroke", "Sidestroke"],
    correctIndex: 0,
  },
  {
    prompt: "How many holes are played in a standard round of golf?",
    options: ["9", "12", "18", "21"],
    correctIndex: 2,
  },
  {
    prompt: "One stroke under par on a golf hole is called what?",
    options: ["An eagle", "A birdie", "A bogey", "A par"],
    correctIndex: 1,
  },
  {
    prompt: "Two strokes under par on a golf hole is called what?",
    options: ["A birdie", "An albatross", "An eagle", "A bogey"],
    correctIndex: 2,
  },
  {
    prompt: "How many players from each team are on a basketball court at one time?",
    options: ["4", "5", "6", "7"],
    correctIndex: 1,
  },
  {
    prompt: "How many players from each ice hockey team are on the ice, including the goalkeeper?",
    options: ["5", "6", "7", "11"],
    correctIndex: 1,
  },
  {
    prompt: "Which object is used instead of a ball in ice hockey?",
    options: ["A shuttlecock", "A puck", "A bowl", "A quoit"],
    correctIndex: 1,
  },
  {
    prompt: "How long is one round in a professional boxing match?",
    options: ["1 minute", "2 minutes", "3 minutes", "5 minutes"],
    correctIndex: 2,
  },
  {
    prompt: "How many points is the black ball worth in snooker?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2,
  },
  {
    prompt: "How many points is a red ball worth in snooker?",
    options: ["1", "2", "3", "4"],
    correctIndex: 0,
  },
  {
    prompt: "The centre bullseye in darts is worth how many points?",
    options: ["25", "40", "50", "60"],
    correctIndex: 2,
  },
  {
    prompt: "El Clásico is the football match between which two clubs?",
    options: ["Celtic and Rangers", "Real Madrid and Barcelona", "Milan and Inter", "Boca and River"],
    correctIndex: 1,
  },
  {
    prompt: "Which football club plays its home matches at Anfield?",
    options: ["Arsenal", "Chelsea", "Liverpool", "Tottenham"],
    correctIndex: 2,
  },
  {
    prompt: "Camp Nou is the home ground of which club?",
    options: ["Real Madrid", "Bayern Munich", "FC Barcelona", "Juventus"],
    correctIndex: 2,
  },
  {
    prompt: "Which country is famous for a yellow and green football kit?",
    options: ["Italy", "Netherlands", "Brazil", "Sweden"],
    correctIndex: 2,
  },
  {
    prompt: "Cristiano Ronaldo is widely known by which nickname?",
    options: ["CR7", "The King", "Leo", "The Don"],
    correctIndex: 0,
  },
  {
    prompt: "How many players are on a field hockey team?",
    options: ["7", "9", "11", "15"],
    correctIndex: 2,
  },
  {
    prompt: "How many players per side are on court in volleyball?",
    options: ["5", "6", "7", "9"],
    correctIndex: 1,
  },
  {
    prompt: "Under current rules, a game of table tennis is first to how many points?",
    options: ["11", "15", "21", "25"],
    correctIndex: 0,
  },
  {
    prompt: "Badminton is played with which piece of equipment?",
    options: ["A puck", "A shuttlecock", "A cue ball", "A wicket"],
    correctIndex: 1,
  },
];

/** Harder international sport: records, laws, and named contests. Counts are locked to a year when a record can change. */
export const SPORTS_HARD: SportsQuestionDef[] = [
  {
    prompt: "Which country hosted and won the first men's FIFA World Cup in 1930?",
    options: ["Brazil", "Italy", "Uruguay", "Argentina"],
    correctIndex: 2,
  },
  {
    prompt: "Diego Maradona's Hand of God goal was scored against which country?",
    options: ["Brazil", "Germany", "England", "Italy"],
    correctIndex: 2,
  },
  {
    prompt: "In which World Cup did Diego Maradona score the Hand of God goal?",
    options: ["1982", "1986", "1990", "1994"],
    correctIndex: 1,
  },
  {
    prompt: "How many goals did Miroslav Klose score across men's World Cups?",
    options: ["12", "14", "16", "18"],
    correctIndex: 2,
  },
  {
    prompt: "Which country won the 2010 men's FIFA World Cup?",
    options: ["Netherlands", "Spain", "Germany", "Italy"],
    correctIndex: 1,
  },
  {
    prompt: "Which country won UEFA Euro 2004?",
    options: ["Portugal", "Greece", "Czech Republic", "France"],
    correctIndex: 1,
  },
  {
    prompt: "Which country won UEFA Euro 2016?",
    options: ["France", "Wales", "Portugal", "Germany"],
    correctIndex: 2,
  },
  {
    prompt: "What was the score when Germany beat Brazil in the 2014 World Cup semi-final?",
    options: ["5-0", "6-1", "7-1", "8-2"],
    correctIndex: 2,
  },
  {
    prompt: "Who scored Germany's winning goal in the 2014 World Cup final?",
    options: ["Thomas Müller", "Mario Götze", "Miroslav Klose", "Mesut Özil"],
    correctIndex: 1,
  },
  {
    prompt: "Which player won the 1998 World Cup with France and managed France to the 2018 title?",
    options: ["Zinedine Zidane", "Didier Deschamps", "Laurent Blanc", "Thierry Henry"],
    correctIndex: 1,
  },
  {
    prompt: "The Old Firm is the rivalry between which clubs?",
    options: ["Liverpool and Everton", "Celtic and Rangers", "Ajax and Feyenoord", "Boca and River"],
    correctIndex: 1,
  },
  {
    prompt: "Which two clubs share the San Siro?",
    options: ["Roma and Lazio", "Inter and AC Milan", "Juventus and Torino", "Benfica and Sporting"],
    correctIndex: 1,
  },
  {
    prompt: "The Copa Libertadores is a club competition in which continent?",
    options: ["Europe", "Africa", "South America", "Asia"],
    correctIndex: 2,
  },
  {
    prompt: "The Africa Cup of Nations is organised by which body?",
    options: ["UEFA", "CONMEBOL", "CAF", "AFC"],
    correctIndex: 2,
  },
  {
    prompt: "How far is a football penalty spot from the goal line?",
    options: ["8 yards", "10 yards", "12 yards", "18 yards"],
    correctIndex: 2,
  },
  {
    prompt: "How high is a full-size football goal?",
    options: ["2.00 m", "2.20 m", "2.44 m", "2.67 m"],
    correctIndex: 2,
  },
  {
    prompt: "In football, a player is onside if at least how many opponents are closer to the goal line?",
    options: ["1", "2", "3", "4"],
    correctIndex: 1,
  },
  {
    prompt: "Which country won the first Cricket World Cup in 1975?",
    options: ["Australia", "England", "West Indies", "India"],
    correctIndex: 2,
  },
  {
    prompt: "How long is a cricket pitch between the stumps?",
    options: ["18 yards", "20 yards", "22 yards", "24 yards"],
    correctIndex: 2,
  },
  {
    prompt: "A Test match in cricket is scheduled for how many days?",
    options: ["3", "4", "5", "6"],
    correctIndex: 2,
  },
  {
    prompt: "What does LBW stand for in cricket?",
    options: ["Long boundary wide", "Leg before wicket", "Left bat wedge", "Last ball wicket"],
    correctIndex: 1,
  },
  {
    prompt: "How many legal deliveries are in a standard cricket over?",
    options: ["4", "5", "6", "8"],
    correctIndex: 2,
  },
  {
    prompt: "A batter's score of zero in cricket is called what?",
    options: ["Love", "A duck", "A bye", "A maiden"],
    correctIndex: 1,
  },
  {
    prompt: "A batter who reaches 100 runs in one innings has scored what?",
    options: ["A maiden", "A century", "A five-for", "A duck"],
    correctIndex: 1,
  },
  {
    prompt: "How many points is a try worth in rugby union?",
    options: ["3", "4", "5", "6"],
    correctIndex: 2,
  },
  {
    prompt: "How many points is a conversion worth after a try in rugby union?",
    options: ["1", "2", "3", "5"],
    correctIndex: 1,
  },
  {
    prompt: "How many points is a penalty goal worth in rugby union?",
    options: ["2", "3", "4", "5"],
    correctIndex: 1,
  },
  {
    prompt: "Which trophy is awarded to the winner of the Rugby World Cup?",
    options: ["Webb Ellis Cup", "Jules Rimet Trophy", "Calcutta Cup", "Bledisloe Cup"],
    correctIndex: 0,
  },
  {
    prompt: "Which nation won the first Rugby World Cup in 1987?",
    options: ["Australia", "South Africa", "New Zealand", "England"],
    correctIndex: 2,
  },
  {
    prompt: "The Bledisloe Cup is contested by which two rugby teams?",
    options: ["England and Scotland", "Australia and New Zealand", "South Africa and New Zealand", "France and England"],
    correctIndex: 1,
  },
  {
    prompt: "Which team joined in 2000 to turn the Five Nations into the Six Nations?",
    options: ["Georgia", "Romania", "Italy", "Portugal"],
    correctIndex: 2,
  },
  {
    prompt: "The Calcutta Cup is played between which rugby teams?",
    options: ["England and Scotland", "Wales and Ireland", "France and Italy", "Australia and New Zealand"],
    correctIndex: 0,
  },
  {
    prompt: "How many Rugby World Cups had South Africa won by the end of 2023?",
    options: ["2", "3", "4", "5"],
    correctIndex: 2,
  },
  {
    prompt: "Rod Laver's second calendar-year Grand Slam was in which year?",
    options: ["1962", "1969", "1974", "1988"],
    correctIndex: 1,
  },
  {
    prompt: "Steffi Graf won the calendar-year Grand Slam in which year?",
    options: ["1984", "1988", "1992", "1996"],
    correctIndex: 1,
  },
  {
    prompt: "Men's singles matches at tennis Grand Slams are the best of how many sets?",
    options: ["1", "3", "5", "7"],
    correctIndex: 2,
  },
  {
    prompt: "The King of the Mountains in the Tour de France wears which jersey?",
    options: ["Green", "White", "Polka dot", "Yellow"],
    correctIndex: 2,
  },
  {
    prompt: "The points classification leader in the Tour de France wears which jersey?",
    options: ["Green", "White", "Polka dot", "Red"],
    correctIndex: 0,
  },
  {
    prompt: "How many Tours de France did Eddy Merckx win?",
    options: ["3", "4", "5", "7"],
    correctIndex: 2,
  },
  {
    prompt: "What does a black flag tell a Formula 1 driver to do?",
    options: ["Slow for a slippery track", "Return to the pits and stop", "Start the final lap", "Let a faster car pass"],
    correctIndex: 1,
  },
  {
    prompt: "What does DRS stand for in Formula 1?",
    options: ["Drive Response Setting", "Drag Reduction System", "Downforce Racing Switch", "Direct Race Start"],
    correctIndex: 1,
  },
  {
    prompt: "Since 2010, how many points does a Formula 1 race winner receive?",
    options: ["10", "18", "25", "30"],
    correctIndex: 2,
  },
  {
    prompt: "The British Grand Prix is held at which circuit?",
    options: ["Monza", "Silverstone", "Spa", "Monaco"],
    correctIndex: 1,
  },
  {
    prompt: "The Italian Grand Prix is held at which circuit?",
    options: ["Imola", "Monza", "Mugello", "Misano"],
    correctIndex: 1,
  },
  {
    prompt: "Which driver won seven Formula 1 world titles, five of them with Ferrari?",
    options: ["Alain Prost", "Michael Schumacher", "Sebastian Vettel", "Ayrton Senna"],
    correctIndex: 1,
  },
  {
    prompt: "Which city hosted the 2008 Summer Olympics?",
    options: ["Sydney", "Athens", "Beijing", "Seoul"],
    correctIndex: 2,
  },
  {
    prompt: "Which city hosted the 2000 Summer Olympics?",
    options: ["Sydney", "Atlanta", "Barcelona", "Seoul"],
    correctIndex: 0,
  },
  {
    prompt: "Which city hosted the 1992 Summer Olympics?",
    options: ["Madrid", "Barcelona", "Seville", "Lisbon"],
    correctIndex: 1,
  },
  {
    prompt: "In which year were the first modern Olympic Games held?",
    options: ["1896", "1900", "1904", "1924"],
    correctIndex: 0,
  },
  {
    prompt: "Where were the first modern Olympic Games held?",
    options: ["Paris", "London", "Athens", "Rome"],
    correctIndex: 2,
  },
  {
    prompt: "How long is one lap of a standard outdoor running track?",
    options: ["200 m", "300 m", "400 m", "800 m"],
    correctIndex: 2,
  },
  {
    prompt: "What is the official weight of the men's shot put?",
    options: ["5 kg", "6.26 kg", "7.26 kg", "8.26 kg"],
    correctIndex: 2,
  },
  {
    prompt: "Usain Bolt's 100 metre world record is which time?",
    options: ["9.58 seconds", "9.63 seconds", "9.69 seconds", "9.72 seconds"],
    correctIndex: 0,
  },
  {
    prompt: "Nadia Comăneci scored the first Olympic perfect 10 in which year?",
    options: ["1972", "1976", "1980", "1984"],
    correctIndex: 1,
  },
  {
    prompt: "The Boat Race is rowed between which universities?",
    options: ["Harvard and Yale", "Oxford and Cambridge", "Sydney and Melbourne", "Edinburgh and Glasgow"],
    correctIndex: 1,
  },
  {
    prompt: "What is the maximum standard break in snooker?",
    options: ["147", "155", "167", "180"],
    correctIndex: 0,
  },
];
