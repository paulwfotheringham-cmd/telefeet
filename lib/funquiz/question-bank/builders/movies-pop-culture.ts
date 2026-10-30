export type MoviesPopCultureQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const MOVIES_POP_CULTURE_QUESTION_DEFS: MoviesPopCultureQuestionDef[] = [
  {
    prompt: "Which film features the line 'May the Force be with you'?",
    options: ["Star Trek", "Star Wars", "Guardians of the Galaxy", "The Matrix"],
    correctIndex: 1,
  },
  {
    prompt: "Who directed 'Jurassic Park' (1993)?",
    options: ["James Cameron", "Steven Spielberg", "Ridley Scott", "George Lucas"],
    correctIndex: 1,
  },
  {
    prompt: "Which superhero is known as the 'Friendly Neighborhood' web-slinger?",
    options: ["Batman", "Spider-Man", "Superman", "Flash"],
    correctIndex: 1,
  },
  {
    prompt: "The sitcom 'Friends' is primarily set in which US city?",
    options: ["Los Angeles", "Chicago", "New York", "Boston"],
    correctIndex: 2,
  },
  {
    prompt: "Which animated film features the song 'Let It Go'?",
    options: ["Moana", "Frozen", "Tangled", "Encanto"],
    correctIndex: 1,
  },
  {
    prompt: "Who played Jack Dawson in 'Titanic' (1997)?",
    options: ["Brad Pitt", "Leonardo DiCaprio", "Tom Cruise", "Matt Damon"],
    correctIndex: 1,
  },
  {
    prompt: "Which TV series is set in the fictional town of Hawkins, Indiana?",
    options: ["Wednesday", "Stranger Things", "Euphoria", "The Last of Us"],
    correctIndex: 1,
  },
  {
    prompt: "The Oscars are awarded annually by which organization?",
    options: ["BAFTA", "Academy of Motion Picture Arts and Sciences", "Golden Globes", "Cannes Festival"],
    correctIndex: 1,
  },
  {
    prompt: "Which film franchise features a character named Indiana Jones?",
    options: ["Mission: Impossible", "Indiana Jones", "James Bond", "Fast & Furious"],
    correctIndex: 1,
  },
  {
    prompt: "Who is the 'King of Pop'?",
    options: ["Prince", "Michael Jackson", "Elvis Presley", "Freddie Mercury"],
    correctIndex: 1,
  },
  {
    prompt: "Which 1994 film is set mostly inside Shawshank State Penitentiary?",
    options: ["The Green Mile", "The Shawshank Redemption", "Prisoners", "Escape Plan"],
    correctIndex: 1,
  },
  {
    prompt: "In 'The Lion King', what is the name of Simba's father?",
    options: ["Scar", "Mufasa", "Zazu", "Rafiki"],
    correctIndex: 1,
  },
  {
    prompt: "Which streaming platform produced 'Squid Game'?",
    options: ["HBO Max", "Netflix", "Disney+", "Amazon Prime Video"],
    correctIndex: 1,
  },
  {
    prompt: "Who played Iron Man in the Marvel Cinematic Universe?",
    options: ["Chris Evans", "Robert Downey Jr.", "Chris Hemsworth", "Mark Ruffalo"],
    correctIndex: 1,
  },
  {
    prompt: "Which band recorded 'Bohemian Rhapsody'?",
    options: ["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"],
    correctIndex: 1,
  },
  {
    prompt: "The wizarding school Hogwarts appears in which series?",
    options: ["The Chronicles of Narnia", "Harry Potter", "Percy Jackson", "His Dark Materials"],
    correctIndex: 1,
  },
  {
    prompt: "Which film won the Academy Award for Best Picture in 2020 (2019 ceremony)?",
    options: ["1917", "Parasite", "Joker", "Once Upon a Time in Hollywood"],
    correctIndex: 1,
  },
  {
    prompt: "Who created the 'Star Wars' saga?",
    options: ["Steven Spielberg", "George Lucas", "James Cameron", "Ridley Scott"],
    correctIndex: 1,
  },
  {
    prompt: "Which TV show features dragons and the Iron Throne?",
    options: ["The Witcher", "Game of Thrones", "House of the Dragon only", "Lord of the Rings: The Rings of Power"],
    correctIndex: 1,
  },
  {
    prompt: "In 'The Matrix', which pill does Neo take to learn the truth?",
    options: ["Blue pill", "Red pill", "Green pill", "Yellow pill"],
    correctIndex: 1,
  },
  {
    prompt: "Which actress starred as Elle Woods in 'Legally Blonde'?",
    options: ["Reese Witherspoon", "Jennifer Aniston", "Julia Roberts", "Sandra Bullock"],
    correctIndex: 0,
  },
  {
    prompt: "What is the name of Batman's home city?",
    options: ["Metropolis", "Gotham City", "Central City", "Star City"],
    correctIndex: 1,
  },
  {
    prompt: "Which 1985 film features a DeLorean time machine?",
    options: ["Back to the Future", "Terminator", "Bill & Ted's Excellent Adventure", "Looper"],
    correctIndex: 0,
  },
  {
    prompt: "Who sang 'Shape of You', one of the best-selling digital singles of the 2010s?",
    options: ["Ed Sheeran", "Bruno Mars", "Justin Bieber", "The Weeknd"],
    correctIndex: 0,
  },
  {
    prompt: "Which Pixar film is about emotions inside a young girl's mind?",
    options: ["Soul", "Inside Out", "Up", "Coco"],
    correctIndex: 1,
  },
  {
    prompt: "The character Gollum appears in which film series?",
    options: ["The Hobbit only", "The Lord of the Rings", "Both The Lord of the Rings and The Hobbit", "Game of Thrones"],
    correctIndex: 2,
  },
  {
    prompt: "Which reality TV franchise features the Kardashian-Jenner family?",
    options: ["The Real Housewives", "Keeping Up with the Kardashians", "Love Island", "Big Brother"],
    correctIndex: 1,
  },
  {
    prompt: "Who directed 'Pulp Fiction' (1994)?",
    options: ["Martin Scorsese", "Quentin Tarantino", "Coen Brothers", "David Fincher"],
    correctIndex: 1,
  },
  {
    prompt: "Which Disney princess has long magical hair?",
    options: ["Cinderella", "Rapunzel", "Ariel", "Belle"],
    correctIndex: 1,
  },
  {
    prompt: "In 'Breaking Bad', what is Walter White's criminal alias?",
    options: ["The Chemist", "Heisenberg", "Blue Sky", "Mr. White"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features the character Jack Sparrow?",
    options: ["Treasure Island", "Pirates of the Caribbean", "Master and Commander", "Cutthroat Island"],
    correctIndex: 1,
  },
  {
    prompt: "Taylor Swift's 'Eras Tour' is primarily associated with which profession?",
    options: ["Acting", "Music performance", "Fashion design", "Sports"],
    correctIndex: 1,
  },
  {
    prompt: "Which horror film franchise features the villain Freddy Krueger?",
    options: ["Halloween", "A Nightmare on Elm Street", "Scream", "Friday the 13th"],
    correctIndex: 1,
  },
  {
    prompt: "Who played the Joker in 'The Dark Knight' (2008)?",
    options: ["Joaquin Phoenix", "Heath Ledger", "Jack Nicholson", "Jared Leto"],
    correctIndex: 1,
  },
  {
    prompt: "Which animated series features characters named Homer, Marge, Bart, and Lisa?",
    options: ["Family Guy", "The Simpsons", "South Park", "Bob's Burgers"],
    correctIndex: 1,
  },
  {
    prompt: "The Met Gala is most closely associated with which magazine?",
    options: ["Vogue", "Time", "Rolling Stone", "National Geographic"],
    correctIndex: 0,
  },
  {
    prompt: "Which film is famous for the quote 'Here's looking at you, kid'?",
    options: ["Gone with the Wind", "Casablanca", "Citizen Kane", "Singin' in the Rain"],
    correctIndex: 1,
  },
  {
    prompt: "Who is the lead character in the 'James Bond' spy films?",
    options: ["Ethan Hunt", "James Bond", "Jason Bourne", "John Wick"],
    correctIndex: 1,
  },
  {
    prompt: "Which K-pop group performed 'Dynamite' and 'Butter'?",
    options: ["BLACKPINK", "BTS", "TWICE", "EXO"],
    correctIndex: 1,
  },
  {
    prompt: "In 'The Office' (US), which paper company do the characters work for?",
    options: ["Staples", "Dunder Mifflin", "Sabre", "Vance Refrigeration"],
    correctIndex: 1,
  },
  {
    prompt: "Which movie monster is awakened by nuclear tests in classic kaiju films?",
    options: ["King Kong", "Godzilla", "Mothra", "Rodan"],
    correctIndex: 1,
  },
  {
    prompt: "Who directed 'Avatar' (2009)?",
    options: ["Peter Jackson", "James Cameron", "Steven Spielberg", "Christopher Nolan"],
    correctIndex: 1,
  },
  {
    prompt: "Which TV series follows a chemistry teacher turned meth producer?",
    options: ["Better Call Saul", "Breaking Bad", "Ozark", "Narcos"],
    correctIndex: 1,
  },
  {
    prompt: "The character Woody is a toy in which film series?",
    options: ["Toy Story", "Small Soldiers", "The Lego Movie", "Wreck-It Ralph"],
    correctIndex: 0,
  },
  {
    prompt: "Which actress played Hermione Granger in the Harry Potter films?",
    options: ["Emma Watson", "Emma Stone", "Keira Knightley", "Natalie Portman"],
    correctIndex: 0,
  },
  {
    prompt: "Which awards show honors achievements in music with a golden gramophone trophy?",
    options: ["Oscars", "Grammy Awards", "Emmys", "Tonys"],
    correctIndex: 1,
  },
  {
    prompt: "In 'Seinfeld', what is the name of Jerry's neurotic neighbor?",
    options: ["Newman", "Kramer", "George", "Elaine"],
    correctIndex: 1,
  },
  {
    prompt: "Which 1975 thriller made many beachgoers wary of sharks?",
    options: ["The Deep", "Jaws", "Deep Blue Sea", "Open Water"],
    correctIndex: 1,
  },
  {
    prompt: "Who played Black Panther in the MCU before the character's film legacy continued in other projects?",
    options: ["Michael B. Jordan", "Chadwick Boseman", "Anthony Mackie", "Don Cheadle"],
    correctIndex: 1,
  },
  {
    prompt: "Which video game franchise inspired the 'The Last of Us' TV adaptation?",
    options: ["Uncharted", "The Last of Us", "Resident Evil", "Horizon"],
    correctIndex: 1,
  },
  {
    prompt: "Which director is known for 'Inception', 'The Dark Knight', and 'Oppenheimer'?",
    options: ["Denis Villeneuve", "Christopher Nolan", "David Lynch", "Paul Thomas Anderson"],
    correctIndex: 1,
  },
  {
    prompt: "In 'Forrest Gump', what food does Forrest's friend Bubba dream of selling?",
    options: ["Corn dogs", "Shrimp", "Pizza", "Burgers"],
    correctIndex: 1,
  },
  {
    prompt: "Which singer is nicknamed 'Queen Bey'?",
    options: ["Rihanna", "Beyoncé", "Ariana Grande", "Lady Gaga"],
    correctIndex: 1,
  },
  {
    prompt: "The 'MCU' stands for what in film fandom?",
    options: ["Marvel Comics Universe", "Marvel Cinematic Universe", "Major Cinema Unit", "Media Content Universe"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features dinosaurs cloned from ancient DNA?",
    options: ["King Kong", "Jurassic Park", "Land of the Lost", "The Lost World: Jurassic Park only"],
    correctIndex: 1,
  },
  {
    prompt: "Who played Wonder Woman in the 2017 DC film?",
    options: ["Gal Gadot", "Scarlett Johansson", "Jennifer Lawrence", "Zoe Saldana"],
    correctIndex: 0,
  },
  {
    prompt: "Which animated film features a rat who wants to become a chef in Paris?",
    options: ["Ratatouille", "The Aristocats", "An American Tail", "Flushed Away"],
    correctIndex: 0,
  },
  {
    prompt: "The Emmy Awards primarily honor excellence in what medium?",
    options: ["Film", "Television", "Theatre", "Music"],
    correctIndex: 1,
  },
  {
    prompt: "Which 1999 film popularized 'bullet time' slow-motion effects?",
    options: ["The Matrix", "Blade", "Dark City", "Existenz"],
    correctIndex: 0,
  },
  {
    prompt: "In 'The Wizard of Oz', what does Dorothy click her heels to say?",
    options: ["There's no place like home", "Follow the yellow brick road", "We're off to see the wizard", "Lions and tigers and bears"],
    correctIndex: 0,
  },
  {
    prompt: "Which British author created Sherlock Holmes, adapted many times for screen?",
    options: ["Agatha Christie", "Arthur Conan Doyle", "J.K. Rowling", "Ian Fleming"],
    correctIndex: 1,
  },
  {
    prompt: "Who played Captain Jack in 'Titanic' opposite Leonardo DiCaprio?",
    options: ["Kate Winslet", "Cate Blanchett", "Nicole Kidman", "Julia Roberts"],
    correctIndex: 0,
  },
  {
    prompt: "Which franchise includes the character Darth Vader?",
    options: ["Star Trek", "Star Wars", "Dune", "Battlestar Galactica"],
    correctIndex: 1,
  },
  {
    prompt: "The Coachella festival is best known for which type of entertainment?",
    options: ["Classical opera", "Music and live performance", "Ice skating", "Comic books only"],
    correctIndex: 1,
  },
  {
    prompt: "Which film features a talking snowman named Olaf?",
    options: ["Frozen", "Snow White", "The Snowman", "Ice Age"],
    correctIndex: 0,
  },
  {
    prompt: "Who is the creator of the 'Marvel' superhero universe in comics (co-creator of many iconic heroes)?",
    options: ["Stan Lee", "Bob Kane only", "Frank Miller", "Alan Moore"],
    correctIndex: 0,
  },
  {
    prompt: "Which TV comedy is set in the town of Pawnee, Indiana?",
    options: ["Brooklyn Nine-Nine", "Parks and Recreation", "The Good Place", "Community"],
    correctIndex: 1,
  },
  {
    prompt: "In 'The Godfather', what is the surname of the crime family at the center of the story?",
    options: ["Corleone", "Soprano", "Barzini", "Tattaglia"],
    correctIndex: 0,
  },
  {
    prompt: "Which singer released the album '1989' (Taylor's Version)?",
    options: ["Taylor Swift", "Adele", "Lana Del Rey", "Billie Eilish"],
    correctIndex: 0,
  },
  {
    prompt: "Which horror villain wears a white mask and stalks the town of Woodsboro?",
    options: ["Ghostface", "Michael Myers", "Jason Voorhees", "Pinhead"],
    correctIndex: 0,
  },
  {
    prompt: "The film 'La La Land' (2016) is primarily set in which city?",
    options: ["New York", "Los Angeles", "Chicago", "Las Vegas"],
    correctIndex: 1,
  },
  {
    prompt: "Which actor played Johnny in 'The Room', later celebrated in 'The Disaster Artist'?",
    options: ["Tommy Wiseau", "James Franco", "Greg Sestero", "Seth Rogen"],
    correctIndex: 0,
  },
  {
    prompt: "Which streaming service is home to 'The Mandalorian'?",
    options: ["Netflix", "Disney+", "Hulu", "Peacock"],
    correctIndex: 1,
  },
  {
    prompt: "In 'Mean Girls', which day is famously celebrated with pink outfits?",
    options: ["Monday", "Wednesday", "Friday", "Saturday"],
    correctIndex: 1,
  },
  {
    prompt: "Which band wrote 'Smells Like Teen Spirit'?",
    options: ["Pearl Jam", "Nirvana", "Soundgarden", "Alice in Chains"],
    correctIndex: 1,
  },
  {
    prompt: "Who played the Terminator in the original 1984 film?",
    options: ["Sylvester Stallone", "Arnold Schwarzenegger", "Dolph Lundgren", "Jean-Claude Van Damme"],
    correctIndex: 1,
  },
  {
    prompt: "Which film series features minions who serve Gru?",
    options: ["Despicable Me", "Minions only spin-off", "Both Despicable Me and Minions", "Megamind"],
    correctIndex: 2,
  },
  {
    prompt: "The character Eleven has psychic powers in which series?",
    options: ["Dark", "Stranger Things", "Heroes", "Sense8"],
    correctIndex: 1,
  },
  {
    prompt: "Which movie won Best Picture at the 2024 Oscars ceremony (2023 films)?",
    options: ["Barbie", "Oppenheimer", "Everything Everywhere All at Once", "Killers of the Flower Moon"],
    correctIndex: 1,
  },
  {
    prompt: "Who played Captain America in the MCU?",
    options: ["Chris Evans", "Chris Pratt", "Chris Hemsworth", "Chris Pine"],
    correctIndex: 0,
  },
  {
    prompt: "Which 1980s film features a time-traveling DeLorean and Marty McFly?",
    options: ["Back to the Future", "The Terminator", "Time Bandits", "Flight of the Navigator"],
    correctIndex: 0,
  },
  {
    prompt: "The Tonys celebrate excellence in which field?",
    options: ["Broadway theatre", "Television", "Film", "Dance sports"],
    correctIndex: 0,
  },
  {
    prompt: "Which actress stars as Wednesday Addams in the Netflix series 'Wednesday'?",
    options: ["Jenna Ortega", "Millie Bobby Brown", "Zendaya", "Florence Pugh"],
    correctIndex: 0,
  },
  {
    prompt: "In 'Finding Nemo', what type of fish is Nemo?",
    options: ["Clownfish", "Blue tang", "Angelfish", "Pufferfish"],
    correctIndex: 0,
  },
  {
    prompt: "Which pop star is known for the hit 'Bad Guy'?",
    options: ["Billie Eilish", "Dua Lipa", "Olivia Rodrigo", "Doja Cat"],
    correctIndex: 0,
  },
  {
    prompt: "Which film franchise features the character Ethan Hunt?",
    options: ["James Bond", "Mission: Impossible", "Bourne", "Kingsman"],
    correctIndex: 1,
  },
  {
    prompt: "Who directed 'Get Out' (2017)?",
    options: ["Jordan Peele", "Spike Lee", "Barry Jenkins", "Ryan Coogler"],
    correctIndex: 0,
  },
  {
    prompt: "Which classic film features the line 'Frankly, my dear, I don't give a damn'?",
    options: ["Casablanca", "Gone with the Wind", "The Maltese Falcon", "Double Indemnity"],
    correctIndex: 1,
  },
  {
    prompt: "The 'Barbie' film (2023) starred Margot Robbie and which actor as Ken?",
    options: ["Ryan Reynolds", "Ryan Gosling", "Chris Evans", "Timothée Chalamet"],
    correctIndex: 1,
  },
  {
    prompt: "Which TV series is about a fictional 1960s advertising agency in New York?",
    options: ["Mad Men", "The Marvelous Mrs. Maisel", "Succession", "Boardwalk Empire"],
    correctIndex: 0,
  },
  {
    prompt: "In 'The Hunger Games', what is the name of the protagonist?",
    options: ["Katniss Everdeen", "Tris Prior", "Hermione Granger", "Furiosa"],
    correctIndex: 0,
  },
  {
    prompt: "Which composer is famous for scores on 'Star Wars', 'Jaws', and 'Indiana Jones'?",
    options: ["Hans Zimmer", "John Williams", "Ennio Morricone", "Danny Elfman"],
    correctIndex: 1,
  },
  {
    prompt: "Which social platform is most associated with short vertical videos and trends in the 2020s?",
    options: ["LinkedIn", "TikTok", "MySpace", "Flickr"],
    correctIndex: 1,
  },
  {
    prompt: "Who played Gandalf in 'The Lord of the Rings' films?",
    options: ["Ian McKellen", "Christopher Lee", "Sean Connery", "Patrick Stewart"],
    correctIndex: 0,
  },
  {
    prompt: "Which animated Disney film features the song 'Circle of Life'?",
    options: ["The Lion King", "Tarzan", "Mulan", "Hercules"],
    correctIndex: 0,
  },
  {
    prompt: "The 'Fast & Furious' franchise is primarily built around what activity?",
    options: ["Street racing and heists", "Surfing", "Mountain climbing", "Chess tournaments"],
    correctIndex: 0,
  },
  {
    prompt: "Which singer performed at the Super Bowl halftime show and is known for 'Single Ladies'?",
    options: ["Beyoncé", "Shakira", "Madonna", "Katy Perry"],
    correctIndex: 0,
  },
  {
    prompt: "In 'Ghostbusters', what do the heroes catch?",
    options: ["Ghosts", "Aliens", "Robots", "Sharks"],
    correctIndex: 0,
  },
  {
    prompt: "Which Wes Anderson film features a hotel in the fictional Republic of Zubrowka?",
    options: ["The Grand Budapest Hotel", "Moonrise Kingdom", "Fantastic Mr. Fox", "The Royal Tenenbaums"],
    correctIndex: 0,
  },
  {
    prompt: "Who voices Shrek in the DreamWorks films?",
    options: ["Mike Myers", "Eddie Murphy", "John Lithgow", "Antonio Banderas"],
    correctIndex: 0,
  },
  {
    prompt: "Which series follows the wealthy Roy family and their media empire?",
    options: ["Succession", "Billions", "Industry", "The Morning Show"],
    correctIndex: 0,
  },
  {
    prompt: "The character Thanos seeks what in 'Avengers: Infinity War'?",
    options: ["The Infinity Stones", "The One Ring", "The Holy Grail", "The Philosopher's Stone"],
    correctIndex: 0,
  },
  {
    prompt: "Which film features the quote 'I'll be back'?",
    options: ["Predator", "The Terminator", "Commando", "Total Recall"],
    correctIndex: 1,
  },
  {
    prompt: "Who played the lead in 'Edward Scissorhands' (1990)?",
    options: ["Johnny Depp", "Tim Burton", "Winona Ryder", "Michael Keaton"],
    correctIndex: 0,
  },
  {
    prompt: "Which British sci-fi series features a time-traveling police box called the TARDIS?",
    options: ["Doctor Who", "Black Mirror", "Red Dwarf", "Torchwood"],
    correctIndex: 0,
  },
];
