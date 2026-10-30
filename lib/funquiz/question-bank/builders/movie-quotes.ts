export type MovieQuoteQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

/** Famous lines from films released 1980–2026 — match the quote to the movie. */
export const MOVIE_QUOTE_QUESTION_DEFS: MovieQuoteQuestionDef[] = [
  {
    prompt: "Which film features the line \"I'll be back\"?",
    options: ["RoboCop", "The Terminator", "Predator", "Total Recall"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"May the Force be with you\"?",
    options: ["Star Trek II", "The Empire Strikes Back", "Flash Gordon", "The Last Starfighter"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Who you gonna call?\"?",
    options: ["Beetlejuice", "Ghostbusters", "Gremlins", "Poltergeist"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Roads? Where we're going, we don't need roads\"?",
    options: ["Mad Max Beyond Thunderdome", "Back to the Future", "Weird Science", "The Goonies"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Say hello to my little friend\"?",
    options: ["Scarface", "Goodfellas", "Carlito's Way", "Casino"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Houston, we have a problem\"?",
    options: ["The Right Stuff", "Apollo 13", "Gravity", "First Man"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Life is like a box of chocolates\"?",
    options: ["The Green Mile", "Forrest Gump", "Big", "Cast Away"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"You can't handle the truth!\"?",
    options: ["A Few Good Men", "The Firm", "JFK", "Philadelphia"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I'm the king of the world!\"?",
    options: ["The Perfect Storm", "Titanic", "Master and Commander", "Pearl Harbor"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"My precious\"?",
    options: ["The Hobbit", "The Lord of the Rings: The Two Towers", "Legend", "Willow"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Why so serious?\"?",
    options: ["Batman Begins", "The Dark Knight", "Joker", "Suicide Squad"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"To infinity and beyond!\"?",
    options: ["Toy Story", "Monsters, Inc.", "The Incredibles", "Finding Nemo"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Just keep swimming\"?",
    options: ["Moana", "Finding Nemo", "Shark Tale", "The Little Mermaid"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I see dead people\"?",
    options: ["The Others", "The Sixth Sense", "Stir of Echoes", "Insidious"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Yippee-ki-yay, motherfucker\"?",
    options: ["Lethal Weapon", "Die Hard", "Speed", "The Rock"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I feel the need—the need for speed\"?",
    options: ["Days of Thunder", "Top Gun", "Iron Eagle", "Flight of the Intruder"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Nobody puts Baby in a corner\"?",
    options: ["Footloose", "Dirty Dancing", "Flashdance", "Staying Alive"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Greed, for lack of a better word, is good\"?",
    options: ["Boiler Room", "Wall Street", "The Wolf of Wall Street", "Margin Call"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Show me the money!\"?",
    options: ["Jerry Maguire", "Any Given Sunday", "The Replacements", "Moneyball"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Hasta la vista, baby\"?",
    options: ["Commando", "Terminator 2: Judgment Day", "True Lies", "Predator 2"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Get to the choppa!\"?",
    options: ["Predator", "Commando", "Rambo III", "Missing in Action"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"No, I am your father\"?",
    options: ["Return of the Jedi", "The Empire Strikes Back", "Revenge of the Sith", "The Force Awakens"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"It's a trap!\"?",
    options: ["The Empire Strikes Back", "Return of the Jedi", "The Phantom Menace", "Rogue One"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Snakes. Why did it have to be snakes?\"?",
    options: ["Anaconda", "Raiders of the Lost Ark", "Indiana Jones and the Temple of Doom", "King Kong"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"E.T. phone home\"?",
    options: ["Close Encounters of the Third Kind", "E.T. the Extra-Terrestrial", "Explorers", "Super 8"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"They're here\"?",
    options: ["The Exorcist", "Poltergeist", "The Amityville Horror", "The Omen"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Wolverines!\"?",
    options: ["Red Dawn", "Platoon", "Full Metal Jacket", "Born on the Fourth of July"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Say 'what' again\"?",
    options: ["Reservoir Dogs", "Pulp Fiction", "Jackie Brown", "Kill Bill"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"The first rule of Fight Club is you do not talk about Fight Club\"?",
    options: ["Se7en", "Fight Club", "The Game", "American Psycho"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I volunteer as tribute\"?",
    options: ["Divergent", "The Hunger Games", "The Maze Runner", "Battle Royale"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"May the odds be ever in your favor\"?",
    options: ["The Hunger Games", "The Hunger Games: Catching Fire", "Divergent", "The Ballad of Songbirds & Snakes"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I am inevitable\"?",
    options: ["Avengers: Endgame", "Avengers: Infinity War", "Thor: Ragnarok", "Doctor Strange"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"With great power comes great responsibility\"?",
    options: ["Spider-Man 2", "Spider-Man", "The Amazing Spider-Man", "Spider-Man: Homecoming"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Dormammu, I've come to bargain\"?",
    options: ["Doctor Strange", "Doctor Strange in the Multiverse of Madness", "Thor: Ragnarok", "Avengers: Infinity War"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"We are Groot\"?",
    options: ["Guardians of the Galaxy Vol. 2", "Guardians of the Galaxy", "Avengers: Infinity War", "Thor: Love and Thunder"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Why do we fall, Bruce?\"?",
    options: ["The Dark Knight", "Batman Begins", "The Dark Knight Rises", "Batman Forever"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"You either die a hero, or you live long enough to see yourself become the villain\"?",
    options: ["The Dark Knight Rises", "The Dark Knight", "Batman Begins", "Joker"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Red pill or blue pill\"?",
    options: ["The Matrix", "The Matrix Reloaded", "Equilibrium", "Dark City"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"There is no spoon\"?",
    options: ["The Matrix Reloaded", "The Matrix", "Inception", "Doctor Strange"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"You shall not pass!\"?",
    options: ["The Two Towers", "The Fellowship of the Ring", "The Return of the King", "The Hobbit"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"One does not simply walk into Mordor\"?",
    options: ["The Return of the King", "The Fellowship of the Ring", "The Two Towers", "The Hobbit: An Unexpected Journey"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"You had me at hello\"?",
    options: ["Pretty Woman", "When Harry Met Sally", "Notting Hill", "Love Actually"],
    correctIndex: 2,
  },
  {
    prompt: "Which film features the line \"You complete me\"?",
    options: ["Sleepless in Seattle", "Jerry Maguire", "The Notebook", "You've Got Mail"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"As if!\"?",
    options: ["Mean Girls", "Clueless", "10 Things I Hate About You", "Legally Blonde"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"On Wednesdays we wear pink\"?",
    options: ["Clueless", "Mean Girls", "Easy A", "The Duff"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"This one time, at band camp…\"?",
    options: ["Superbad", "American Pie", "Easy A", "Booksmart"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I'm kind of a big deal\"?",
    options: ["Talladega Nights", "Anchorman", "Step Brothers", "The Other Guys"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Did we just become best friends?\"?",
    options: ["Step Brothers", "Talladega Nights", "The Other Guys", "Daddy's Home"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Ohana means family\"?",
    options: ["Moana", "Lilo & Stitch", "Finding Nemo", "Brother Bear"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"We don't talk about Bruno\"?",
    options: ["Coco", "Encanto", "Soul", "Raya and the Last Dragon"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Remember me\"?",
    options: ["Soul", "Coco", "Encanto", "Onward"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Live long and prosper\"?",
    options: ["Star Trek II", "Star Trek (2009)", "Star Trek Beyond", "Star Trek: Nemesis"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Khaaan!\"?",
    options: ["Star Trek: The Motion Picture", "Star Trek II: The Wrath of Khan", "Star Trek III", "Star Trek Generations"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"What's your favorite scary movie?\"?",
    options: ["Halloween", "Scream", "I Know What You Did Last Summer", "Urban Legend"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Seven days\"?",
    options: ["The Ring", "The Grudge", "Dark Water", "One Missed Call"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I see you\"?",
    options: ["Avatar", "Avatar: The Way of Water", "Dune", "Valerian"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"The spice must flow\"?",
    options: ["Star Wars", "Dune", "Blade Runner 2049", "The Matrix"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Fear is the mind-killer\"?",
    options: ["Dune", "Blade Runner", "Arrival", "Interstellar"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Do not go gentle into that good night\"?",
    options: ["Arrival", "Interstellar", "Contact", "Ad Astra"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I'm gonna have to science the hell out of this\"?",
    options: ["The Martian", "Armageddon", "Deep Impact", "Moon"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I'll never let go, Jack\"?",
    options: ["Pearl Harbor", "Titanic", "The Notebook", "Atonement"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Draw me like one of your French girls\"?",
    options: ["Titanic", "Portrait of a Lady on Fire", "Amélie", "Midnight in Paris"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Talk to me, Goose\"?",
    options: ["Top Gun", "Top Gun: Maverick", "Iron Eagle", "Flight"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I am Kenough\"?",
    options: ["Barbie", "The Lego Movie", "Toy Story 3", "Shrek"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Now I am become Death, the destroyer of worlds\"?",
    options: ["The Imitation Game", "Oppenheimer", "Dunkirk", "The Theory of Everything"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"In another life, I would have really liked just doing laundry and taxes with you\"?",
    options: ["The Matrix", "Everything Everywhere All at Once", "Her", "Eternal Sunshine of the Spotless Mind"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Witness me!\"?",
    options: ["Mad Max: Fury Road", "Mad Max 2", "Waterworld", "Dune"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"What a day, what a lovely day!\"?",
    options: ["Mad Max: Fury Road", "Doom", "Edge of Tomorrow", "Pacific Rim"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Run, Forrest, run!\"?",
    options: ["Forrest Gump", "The Pursuit of Happyness", "Rocky", "Rudy"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Stupid is as stupid does\"?",
    options: ["Dumb and Dumber", "Forrest Gump", "Billy Madison", "Ace Ventura"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Keep the change, ya filthy animal\"?",
    options: ["Home Alone 2", "Home Alone", "Die Hard", "Jingle All the Way"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Welcome to the party, pal!\"?",
    options: ["Die Hard", "Lethal Weapon", "Speed", "The Rock"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"The name's Bond… James Bond\"?",
    options: ["Casino Royale (2006)", "GoldenEye", "Die Another Day", "No Time to Die"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Why is the rum gone?\"?",
    options: ["Master and Commander", "Pirates of the Caribbean: The Curse of the Black Pearl", "Cutthroat Island", "Treasure Planet"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Look at me, I'm the captain now\"?",
    options: ["Captain Phillips", "Life of Pi", "All Is Lost", "The Perfect Storm"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"You're killin' me, Smalls\"?",
    options: ["The Sandlot", "Little Giants", "Rookie of the Year", "A League of Their Own"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"If you build it, he will come\"?",
    options: ["The Natural", "Field of Dreams", "Bull Durham", "Major League"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"There's no crying in baseball!\"?",
    options: ["Moneyball", "A League of Their Own", "Major League", "The Natural"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"The world is yours\"?",
    options: ["Carlito's Way", "Scarface", "Casino", "American Gangster"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Funny how?\"?",
    options: ["Casino", "Goodfellas", "The Departed", "Donnie Brasco"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Get busy living, or get busy dying\"?",
    options: ["The Green Mile", "The Shawshank Redemption", "Escape from Alcatraz", "Prisoners"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Wilson!\"?",
    options: ["Cast Away", "The Martian", "Life of Pi", "All Is Lost"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I have had it with these motherfucking snakes on this motherfucking plane!\"?",
    options: ["Anaconda", "Snakes on a Plane", "Plane", "Flightplan"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"That rug really tied the room together\"?",
    options: ["Fargo", "The Big Lebowski", "A Serious Man", "Burn After Reading"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"What's the most you ever lost on a coin toss?\"?",
    options: ["Casino Royale", "No Country for Old Men", "The Gambler", "Rounders"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I drink your milkshake!\"?",
    options: ["There Will Be Blood", "The Big Short", "Wall Street", "Boiler Room"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"What's in the box?!\"?",
    options: ["Fight Club", "Se7en", "Saw", "The Game"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Sell me this pen\"?",
    options: ["The Wolf of Wall Street", "Glengarry Glen Ross", "Boiler Room", "The Founder"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"You is kind, you is smart, you is important\"?",
    options: ["The Help", "Hidden Figures", "The Color Purple", "Precious"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Get out\"?",
    options: ["Us", "Get Out", "Nope", "The Invitation"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Long live the fighters\"?",
    options: ["Dune", "Dune: Part Two", "Blade Runner 2049", "Arrival"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"What about second breakfast?\"?",
    options: ["The Hobbit: An Unexpected Journey", "The Fellowship of the Ring", "The Two Towers", "Willow"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Love you 3000\"?",
    options: ["Avengers: Infinity War", "Avengers: Endgame", "Iron Man 3", "Captain Marvel"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I am Steve Rogers\"?",
    options: ["Captain America: The First Avenger", "Captain America: The Winter Soldier", "Avengers: Endgame", "Captain America: Civil War"],
    correctIndex: 2,
  },
  {
    prompt: "Which film features the line \"We have a Hulk\"?",
    options: ["The Avengers", "Avengers: Infinity War", "Thor: Ragnarok", "The Incredible Hulk"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"That's my secret, Captain… I'm always angry\"?",
    options: ["The Incredible Hulk", "The Avengers", "Avengers: Age of Ultron", "Thor: Ragnarok"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Perfectly balanced, as all things should be\"?",
    options: ["Avengers: Infinity War", "Avengers: Endgame", "Guardians of the Galaxy", "Thor: Ragnarok"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I don't feel so good\"?",
    options: ["Avengers: Endgame", "Avengers: Infinity War", "Spider-Man: No Way Home", "Ant-Man and the Wasp"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"We need to go deeper\"?",
    options: ["The Matrix", "Inception", "Tenet", "Shutter Island"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Come with me if you want to live\"?",
    options: ["The Terminator", "Terminator 2: Judgment Day", "Terminator Salvation", "Terminator Genisys"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Game over, man! Game over!\"?",
    options: ["Predator", "Aliens", "Starship Troopers", "Edge of Tomorrow"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Get away from her, you bitch!\"?",
    options: ["Alien", "Aliens", "Avatar", "Terminator 2"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Welcome to Jurassic Park\"?",
    options: ["Jurassic World", "Jurassic Park", "The Lost World", "Jurassic Park III"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Life finds a way\"?",
    options: ["Jurassic World", "Jurassic Park", "The Lost World", "Jurassic World: Dominion"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Hold onto your butts\"?",
    options: ["Jurassic Park", "Jurassic World", "Twister", "The Day After Tomorrow"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Clever girl\"?",
    options: ["Jurassic Park III", "Jurassic Park", "Jurassic World", "The Lost World"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"You're a wizard, Harry\"?",
    options: ["Harry Potter and the Philosopher's Stone", "Harry Potter and the Chamber of Secrets", "The Sorcerer's Apprentice", "Percy Jackson & the Olympians"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Expecto Patronum\"?",
    options: ["Harry Potter and the Chamber of Secrets", "Harry Potter and the Prisoner of Azkaban", "Harry Potter and the Goblet of Fire", "Harry Potter and the Order of the Phoenix"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"After all this time? Always\"?",
    options: ["Harry Potter and the Deathly Hallows – Part 2", "Harry Potter and the Half-Blood Prince", "Harry Potter and the Order of the Phoenix", "Harry Potter and the Goblet of Fire"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I am Groot\"?",
    options: ["Guardians of the Galaxy", "Thor: Ragnarok", "Avengers: Infinity War", "The Suicide Squad"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Let it go\"?",
    options: ["Tangled", "Frozen", "Encanto", "Brave"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"You're welcome\"?",
    options: ["Encanto", "Moana", "Frozen II", "Tangled"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I have spoken\"?",
    options: ["Solo: A Star Wars Story", "Rogue One", "Star Wars: The Rise of Skywalker", "Star Wars: The Force Awakens"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Hello there\"?",
    options: ["Star Wars: Episode III – Revenge of the Sith", "Star Wars: Episode I – The Phantom Menace", "Rogue One", "Star Wars: The Clone Wars"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I don't like sand\"?",
    options: ["Star Wars: Episode II – Attack of the Clones", "Star Wars: Episode III", "The Phantom Menace", "The Force Awakens"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"It's over, Anakin! I have the high ground\"?",
    options: ["Attack of the Clones", "Revenge of the Sith", "The Phantom Menace", "Return of the Jedi"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Say my name\"?",
    options: ["El Camino: A Breaking Bad Movie", "Better Call Saul", "The Irishman", "The Departed"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I'm the Dude, so that's what you call me\"?",
    options: ["Fargo", "The Big Lebowski", "Burn After Reading", "No Country for Old Men"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Call it, friendo\"?",
    options: ["No Country for Old Men", "There Will Be Blood", "The Assassination of Jesse James", "True Grit"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"You don't talk about Fight Club\"?",
    options: ["Fight Club", "The Game", "American Psycho", "Se7en"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Never rat on your friends and always keep your mouth shut\"?",
    options: ["Casino", "Goodfellas", "The Departed", "Donnie Brasco"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Just when I thought I was out, they pull me back in\"?",
    options: ["The Godfather Part III", "Scarface", "Casino", "Carlito's Way"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Hope is a good thing, maybe the best of things\"?",
    options: ["The Green Mile", "The Shawshank Redemption", "Cast Away", "127 Hours"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I'm flying!\"?",
    options: ["Top Gun: Maverick", "Titanic", "Superman Returns", "The Aviator"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Don't think, just do\"?",
    options: ["Ford v Ferrari", "Top Gun: Maverick", "Days of Thunder", "Rush"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Hi Barbie!\"?",
    options: ["Barbie", "The Barbie Diaries", "Toy Story", "Legally Blonde"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"What's up, danger?\"?",
    options: ["Spider-Man: Homecoming", "Spider-Man: Into the Spider-Verse", "Spider-Man 3", "Venom"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I am vengeance. I am the night. I am Batman\"?",
    options: ["Batman Returns", "The Batman", "Batman v Superman", "The Dark Knight Rises"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Mama always said life was like a box of chocolates\"?",
    options: ["The Blind Side", "Forrest Gump", "The Pursuit of Happyness", "October Sky"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"For Frodo!\"?",
    options: ["The Two Towers", "The Return of the King", "The Fellowship of the Ring", "The Hobbit"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Fly, you fools!\"?",
    options: ["The Two Towers", "The Fellowship of the Ring", "The Return of the King", "Willow"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"So it begins\"?",
    options: ["The Two Towers", "The Fellowship of the Ring", "The Return of the King", "The Hobbit"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"You bow to no one\"?",
    options: ["The Return of the King", "The Two Towers", "The Fellowship of the Ring", "Kingdom of Heaven"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I am no man!\"?",
    options: ["The Two Towers", "The Return of the King", "King Arthur", "Brave"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Mr. Stark, I don't feel so good\"?",
    options: ["Avengers: Infinity War", "Avengers: Endgame", "Spider-Man: Homecoming", "Captain America: Civil War"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"You should have gone for the head\"?",
    options: ["Avengers: Endgame", "Avengers: Infinity War", "Thor: Ragnarok", "Guardians of the Galaxy Vol. 2"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"What did it cost? Everything\"?",
    options: ["Avengers: Endgame", "Avengers: Infinity War", "Doctor Strange", "Thor: Love and Thunder"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Puny god\"?",
    options: ["The Avengers", "Thor", "Thor: Ragnarok", "Avengers: Age of Ultron"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Hulk smash!\"?",
    options: ["The Avengers", "The Incredible Hulk", "Thor: Ragnarok", "Avengers: Age of Ultron"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I am Iron Man\"?",
    options: ["Iron Man", "Avengers: Endgame", "Iron Man 2", "Captain America: Civil War"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Banana!\"?",
    options: ["Minions", "Despicable Me", "Despicable Me 2", "Minions: The Rise of Gru"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Stay classy, San Diego\"?",
    options: ["Anchorman 2", "Anchorman: The Legend of Ron Burgundy", "Dodgeball", "Old School"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"That escalated quickly\"?",
    options: ["Anchorman", "Step Brothers", "Tropic Thunder", "The Hangover"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"She doesn't even go here!\"?",
    options: ["Bridesmaids", "Mean Girls", "Pitch Perfect", "Superbad"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"McLovin\"?",
    options: ["Superbad", "21 Jump Street", "Pineapple Express", "The 40-Year-Old Virgin"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Shaken, not stirred\"?",
    options: ["GoldenEye", "Casino Royale", "Skyfall", "Die Another Day"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"No time to die\"?",
    options: ["Spectre", "No Time to Die", "Skyfall", "Quantum of Solace"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"This is the day you will always remember as the day you almost caught Captain Jack Sparrow\"?",
    options: ["Dead Man's Chest", "The Curse of the Black Pearl", "At World's End", "Master and Commander"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Time to buzz the tower\"?",
    options: ["Top Gun: Maverick", "Top Gun", "Pearl Harbor", "Behind Enemy Lines"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"See you in another life, brotha\"?",
    options: ["Inception", "Interstellar", "The Prestige", "Shutter Island"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"You mustn't be afraid to dream a little bigger, darling\"?",
    options: ["The Prestige", "Inception", "Interstellar", "Tenet"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"On your left\"?",
    options: ["Captain America: The Winter Soldier", "Captain America: Civil War", "Avengers: Endgame", "Black Panther"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Wakanda forever\"?",
    options: ["Captain America: Civil War", "Black Panther", "Black Panther: Wakanda Forever", "Avengers: Infinity War"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Welcome to the real world\"?",
    options: ["The Matrix", "Ready Player One", "Tron: Legacy", "The Thirteenth Floor"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"This is my rifle. There are many like it, but this one is mine\"?",
    options: ["Platoon", "Full Metal Jacket", "Born on the Fourth of July", "Hamburger Hill"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"As far back as I can remember, I always wanted to be a gangster\"?",
    options: ["Scarface", "Goodfellas", "Casino", "American Gangster"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Say goodnight to the bad guy\"?",
    options: ["The Departed", "Goodfellas", "Casino", "Heat"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I'm not a smart man, but I know what love is\"?",
    options: ["The Notebook", "Forrest Gump", "Big Fish", "The Green Mile"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Ahh! The wet bandits!\"?",
    options: ["Home Alone", "Home Alone 2", "The Santa Clause", "Jingle All the Way"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Always be closing\"?",
    options: ["The Wolf of Wall Street", "Glengarry Glen Ross", "Boiler Room", "Margin Call"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I'm not leaving\"?",
    options: ["The Big Short", "The Wolf of Wall Street", "Wall Street", "Moneyball"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I can do this all day\"?",
    options: ["Captain America: The First Avenger", "Captain America: Civil War", "Avengers: Endgame", "Thor: The Dark World"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Doth mother know you weareth her drapes?\"?",
    options: ["Thor", "The Avengers", "Thor: Ragnarok", "Guardians of the Galaxy"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I am Iron Man\"?",
    options: ["Iron Man", "Iron Man 2", "The Avengers", "Captain America: Civil War"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Why did it have to be snakes?\"?",
    options: ["Anaconda", "Raiders of the Lost Ark", "Snakes on a Plane", "Jungle Cruise"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Get out of the car!\" (T-1000)?",
    options: ["The Terminator", "Terminator 2: Judgment Day", "Terminator 3", "Terminator Genisys"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Hasta la vista\"?",
    options: ["Commando", "Terminator 2: Judgment Day", "True Lies", "Predator"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Execute Order 66\"?",
    options: ["Attack of the Clones", "Revenge of the Sith", "The Force Awakens", "Rogue One"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I don't like sand. It's coarse and rough\"?",
    options: ["The Phantom Menace", "Attack of the Clones", "Revenge of the Sith", "The Force Awakens"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I am your father\"?",
    options: ["Return of the Jedi", "The Empire Strikes Back", "Revenge of the Sith", "The Force Awakens"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Help me, Obi-Wan Kenobi. You're my only hope\"?",
    options: ["The Empire Strikes Back", "Revenge of the Sith", "Rogue One", "The Force Awakens"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I am one with the Force; the Force is with me\"?",
    options: ["Rogue One", "The Force Awakens", "The Last Jedi", "The Rise of Skywalker"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"So this is how liberty dies—with thunderous applause\"?",
    options: ["The Force Awakens", "Revenge of the Sith", "Rogue One", "The Last Jedi"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I like those odds\"?",
    options: ["Rogue One", "The Force Awakens", "Solo", "The Last Jedi"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I am Groot\"?",
    options: ["Guardians of the Galaxy Vol. 3", "Guardians of the Galaxy Vol. 2", "Avengers: Infinity War", "Thor: Love and Thunder"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"I am inevitable\"?",
    options: ["Avengers: Endgame", "Avengers: Infinity War", "Thor: Ragnarok", "Ant-Man and the Wasp"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"Wakanda will no longer watch from the shadows\"?",
    options: ["Black Panther: Wakanda Forever", "Black Panther", "Avengers: Infinity War", "Captain America: Civil War"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the line \"I can fix him\"?",
    options: ["Barbie", "Twilight", "The Little Mermaid", "Poor Things"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Ken you believe it?\"?",
    options: ["Barbie", "The Lego Movie", "Toy Story", "Shrek"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the line \"Now I am become Death\"?",
    options: ["The Imitation Game", "Oppenheimer", "Dunkirk", "Darkest Hour"],
    correctIndex: 1,
  },
];
