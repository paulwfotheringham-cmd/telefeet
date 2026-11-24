import type { MovieDifficulty, MovieQuestion } from "./types";

function q(
  id: string,
  difficulty: MovieDifficulty,
  category: "Hollywood",
  film: string,
  quote: string,
  image: string,
  distractors: [string, string, string],
): MovieQuestion {
  return { id, difficulty, category, film, quote, image, distractors };
}

const EASY: MovieQuestion[] = [
  q("christopher-walken", "easy", "Hollywood", "Christopher Walken", "Who is this?", "/funquiz/star-pictures/christopher-walken.jpg", ["Steve Buscemi", "Willem Dafoe", "Jeff Goldblum"]),
  q("steve-buscemi", "easy", "Hollywood", "Steve Buscemi", "Who is this?", "/funquiz/star-pictures/steve-buscemi.jpg", ["Willem Dafoe", "Jeff Goldblum", "Alan Rickman"]),
  q("willem-dafoe", "easy", "Hollywood", "Willem Dafoe", "Who is this?", "/funquiz/star-pictures/willem-dafoe.jpg", ["Jeff Goldblum", "Alan Rickman", "Helen Mirren"]),
  q("jeff-goldblum", "easy", "Hollywood", "Jeff Goldblum", "Who is this?", "/funquiz/star-pictures/jeff-goldblum.jpg", ["Alan Rickman", "Helen Mirren", "Judi Dench"]),
  q("alan-rickman", "easy", "Hollywood", "Alan Rickman", "Who is this?", "/funquiz/star-pictures/alan-rickman.jpg", ["Helen Mirren", "Judi Dench", "Sigourney Weaver"]),
  q("helen-mirren", "easy", "Hollywood", "Helen Mirren", "Who is this?", "/funquiz/star-pictures/helen-mirren.jpg", ["Judi Dench", "Sigourney Weaver", "Gary Oldman"]),
  q("judi-dench", "easy", "Hollywood", "Judi Dench", "Who is this?", "/funquiz/star-pictures/judi-dench.jpg", ["Sigourney Weaver", "Gary Oldman", "Tilda Swinton"]),
  q("sigourney-weaver", "easy", "Hollywood", "Sigourney Weaver", "Who is this?", "/funquiz/star-pictures/sigourney-weaver.jpg", ["Gary Oldman", "Tilda Swinton", "Danny DeVito"]),
  q("gary-oldman", "easy", "Hollywood", "Gary Oldman", "Who is this?", "/funquiz/star-pictures/gary-oldman.jpg", ["Tilda Swinton", "Danny DeVito", "John Malkovich"]),
  q("tilda-swinton", "easy", "Hollywood", "Tilda Swinton", "Who is this?", "/funquiz/star-pictures/tilda-swinton.jpg", ["Danny DeVito", "John Malkovich", "Frances McDormand"]),
  q("danny-devito", "easy", "Hollywood", "Danny DeVito", "Who is this?", "/funquiz/star-pictures/danny-devito.jpg", ["John Malkovich", "Frances McDormand", "Ian McKellen"]),
  q("john-malkovich", "easy", "Hollywood", "John Malkovich", "Who is this?", "/funquiz/star-pictures/john-malkovich.jpg", ["Frances McDormand", "Ian McKellen", "Maggie Smith"]),
  q("frances-mcdormand", "easy", "Hollywood", "Frances McDormand", "Who is this?", "/funquiz/star-pictures/frances-mcdormand.jpg", ["Ian McKellen", "Maggie Smith", "Harvey Keitel"]),
  q("ian-mckellen", "easy", "Hollywood", "Ian McKellen", "Who is this?", "/funquiz/star-pictures/ian-mckellen.jpg", ["Maggie Smith", "Harvey Keitel", "Christopher Walken"]),
  q("maggie-smith", "easy", "Hollywood", "Maggie Smith", "Who is this?", "/funquiz/star-pictures/maggie-smith.jpg", ["Harvey Keitel", "Christopher Walken", "Steve Buscemi"]),
  q("harvey-keitel", "easy", "Hollywood", "Harvey Keitel", "Who is this?", "/funquiz/star-pictures/harvey-keitel.jpg", ["Christopher Walken", "Steve Buscemi", "Willem Dafoe"]),
];

const MEDIUM: MovieQuestion[] = [
  q("philip-seymour-hoffman", "medium", "Hollywood", "Philip Seymour Hoffman", "Who is this?", "/funquiz/star-pictures/philip-seymour-hoffman.jpg", ["Benicio del Toro", "Paul Giamatti", "J. K. Simmons"]),
  q("benicio-del-toro", "medium", "Hollywood", "Benicio del Toro", "Who is this?", "/funquiz/star-pictures/benicio-del-toro.jpg", ["Paul Giamatti", "J. K. Simmons", "Stanley Tucci"]),
  q("paul-giamatti", "medium", "Hollywood", "Paul Giamatti", "Who is this?", "/funquiz/star-pictures/paul-giamatti.jpg", ["J. K. Simmons", "Stanley Tucci", "Richard Jenkins"]),
  q("jk-simmons", "medium", "Hollywood", "J. K. Simmons", "Who is this?", "/funquiz/star-pictures/jk-simmons.jpg", ["Stanley Tucci", "Richard Jenkins", "Michael Shannon"]),
  q("stanley-tucci", "medium", "Hollywood", "Stanley Tucci", "Who is this?", "/funquiz/star-pictures/stanley-tucci.jpg", ["Richard Jenkins", "Michael Shannon", "Christoph Waltz"]),
  q("richard-jenkins", "medium", "Hollywood", "Richard Jenkins", "Who is this?", "/funquiz/star-pictures/richard-jenkins.jpg", ["Michael Shannon", "Christoph Waltz", "Brendan Gleeson"]),
  q("michael-shannon", "medium", "Hollywood", "Michael Shannon", "Who is this?", "/funquiz/star-pictures/michael-shannon.jpg", ["Christoph Waltz", "Brendan Gleeson", "Ciarán Hinds"]),
  q("christoph-waltz", "medium", "Hollywood", "Christoph Waltz", "Who is this?", "/funquiz/star-pictures/christoph-waltz.jpg", ["Brendan Gleeson", "Ciarán Hinds", "John Hawkes"]),
  q("brendan-gleeson", "medium", "Hollywood", "Brendan Gleeson", "Who is this?", "/funquiz/star-pictures/brendan-gleeson.jpg", ["Ciarán Hinds", "John Hawkes", "David Strathairn"]),
  q("ciaran-hinds", "medium", "Hollywood", "Ciarán Hinds", "Who is this?", "/funquiz/star-pictures/ciaran-hinds.jpg", ["John Hawkes", "David Strathairn", "Viola Davis"]),
  q("john-hawkes", "medium", "Hollywood", "John Hawkes", "Who is this?", "/funquiz/star-pictures/john-hawkes.jpg", ["David Strathairn", "Viola Davis", "Octavia Spencer"]),
  q("david-strathairn", "medium", "Hollywood", "David Strathairn", "Who is this?", "/funquiz/star-pictures/david-strathairn.jpg", ["Viola Davis", "Octavia Spencer", "Michelle Yeoh"]),
  q("viola-davis", "medium", "Hollywood", "Viola Davis", "Who is this?", "/funquiz/star-pictures/viola-davis.jpg", ["Octavia Spencer", "Michelle Yeoh", "Javier Bardem"]),
  q("octavia-spencer", "medium", "Hollywood", "Octavia Spencer", "Who is this?", "/funquiz/star-pictures/octavia-spencer.jpg", ["Michelle Yeoh", "Javier Bardem", "Philip Seymour Hoffman"]),
  q("michelle-yeoh", "medium", "Hollywood", "Michelle Yeoh", "Who is this?", "/funquiz/star-pictures/michelle-yeoh.jpg", ["Javier Bardem", "Philip Seymour Hoffman", "Benicio del Toro"]),
  q("javier-bardem", "medium", "Hollywood", "Javier Bardem", "Who is this?", "/funquiz/star-pictures/javier-bardem.jpg", ["Philip Seymour Hoffman", "Benicio del Toro", "Paul Giamatti"]),
];

const HARD: MovieQuestion[] = [
  q("harry-dean-stanton", "hard", "Hollywood", "Harry Dean Stanton", "Who is this?", "/funquiz/star-pictures/harry-dean-stanton.jpg", ["Richard E. Grant", "Toby Jones", "Mark Rylance"]),
  q("richard-e-grant", "hard", "Hollywood", "Richard E. Grant", "Who is this?", "/funquiz/star-pictures/richard-e-grant.jpg", ["Toby Jones", "Mark Rylance", "Bruno Ganz"]),
  q("toby-jones", "hard", "Hollywood", "Toby Jones", "Who is this?", "/funquiz/star-pictures/toby-jones.jpg", ["Mark Rylance", "Bruno Ganz", "Stellan Skarsgård"]),
  q("mark-rylance", "hard", "Hollywood", "Mark Rylance", "Who is this?", "/funquiz/star-pictures/mark-rylance.jpg", ["Bruno Ganz", "Stellan Skarsgård", "Mads Mikkelsen"]),
  q("bruno-ganz", "hard", "Hollywood", "Bruno Ganz", "Who is this?", "/funquiz/star-pictures/bruno-ganz.jpg", ["Stellan Skarsgård", "Mads Mikkelsen", "Song Kang-ho"]),
  q("stellan-skarsgard", "hard", "Hollywood", "Stellan Skarsgård", "Who is this?", "/funquiz/star-pictures/stellan-skarsgard.jpg", ["Mads Mikkelsen", "Song Kang-ho", "Tony Leung Chiu-wai"]),
  q("mads-mikkelsen", "hard", "Hollywood", "Mads Mikkelsen", "Who is this?", "/funquiz/star-pictures/mads-mikkelsen.jpg", ["Song Kang-ho", "Tony Leung Chiu-wai", "Isabelle Huppert"]),
  q("song-kang-ho", "hard", "Hollywood", "Song Kang-ho", "Who is this?", "/funquiz/star-pictures/song-kang-ho.jpg", ["Tony Leung Chiu-wai", "Isabelle Huppert", "Charlotte Rampling"]),
  q("tony-leung", "hard", "Hollywood", "Tony Leung Chiu-wai", "Who is this?", "/funquiz/star-pictures/tony-leung.jpg", ["Isabelle Huppert", "Charlotte Rampling", "John Hurt"]),
  q("isabelle-huppert", "hard", "Hollywood", "Isabelle Huppert", "Who is this?", "/funquiz/star-pictures/isabelle-huppert.jpg", ["Charlotte Rampling", "John Hurt", "Pete Postlethwaite"]),
  q("charlotte-rampling", "hard", "Hollywood", "Charlotte Rampling", "Who is this?", "/funquiz/star-pictures/charlotte-rampling.jpg", ["John Hurt", "Pete Postlethwaite", "Yaphet Kotto"]),
  q("john-hurt", "hard", "Hollywood", "John Hurt", "Who is this?", "/funquiz/star-pictures/john-hurt.jpg", ["Pete Postlethwaite", "Yaphet Kotto", "Delroy Lindo"]),
  q("pete-postlethwaite", "hard", "Hollywood", "Pete Postlethwaite", "Who is this?", "/funquiz/star-pictures/pete-postlethwaite.jpg", ["Yaphet Kotto", "Delroy Lindo", "Ruth Negga"]),
  q("yaphet-kotto", "hard", "Hollywood", "Yaphet Kotto", "Who is this?", "/funquiz/star-pictures/yaphet-kotto.jpg", ["Delroy Lindo", "Ruth Negga", "Harry Dean Stanton"]),
  q("delroy-lindo", "hard", "Hollywood", "Delroy Lindo", "Who is this?", "/funquiz/star-pictures/delroy-lindo.jpg", ["Ruth Negga", "Harry Dean Stanton", "Richard E. Grant"]),
  q("ruth-negga", "hard", "Hollywood", "Ruth Negga", "Who is this?", "/funquiz/star-pictures/ruth-negga.jpg", ["Harry Dean Stanton", "Richard E. Grant", "Toby Jones"]),
];

export const MOVIE_QUESTIONS: MovieQuestion[] = [...EASY, ...MEDIUM, ...HARD];
