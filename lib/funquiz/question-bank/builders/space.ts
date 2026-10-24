export type SpaceQuestionDef = {
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export const SPACE_QUESTION_DEFS: SpaceQuestionDef[] = [
  {
    prompt: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Mercury"],
    correctIndex: 1,
  },
  {
    prompt: "What is the largest planet in our solar system?",
    options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
    correctIndex: 1,
  },
  {
    prompt: "Which celestial body is Earth's only natural satellite?",
    options: ["Titan", "The Moon", "Io", "Europa"],
    correctIndex: 1,
  },
  {
    prompt: "What type of star is the Sun?",
    options: ["Red giant", "Yellow dwarf", "White dwarf", "Neutron star"],
    correctIndex: 1,
  },
  {
    prompt: "Which planet has the most prominent ring system visible from Earth?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctIndex: 1,
  },
  {
    prompt: "What is a light-year a measure of?",
    options: ["Time", "Distance", "Brightness", "Mass"],
    correctIndex: 1,
  },
  {
    prompt: "Which planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Earth", "Mars"],
    correctIndex: 1,
  },
  {
    prompt: "The Milky Way is what kind of astronomical structure?",
    options: ["Globular cluster", "Spiral galaxy", "Elliptical galaxy", "Nebula"],
    correctIndex: 1,
  },
  {
    prompt: "Who was the first human to walk on the Moon?",
    options: ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin", "John Glenn"],
    correctIndex: 1,
  },
  {
    prompt: "Which space telescope was launched in 1990 and orbits Earth?",
    options: ["James Webb Space Telescope", "Hubble Space Telescope", "Spitzer Space Telescope", "Chandra X-ray Observatory"],
    correctIndex: 1,
  },
  {
    prompt: "What causes a solar eclipse?",
    options: ["Earth blocks the Sun", "The Moon passes between Earth and the Sun", "The Sun passes behind Earth", "Mars blocks the Sun"],
    correctIndex: 1,
  },
  {
    prompt: "Which planet is famous for its Great Red Spot, a giant storm?",
    options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
    correctIndex: 1,
  },
  {
    prompt: "What is the name of Saturn's largest moon?",
    options: ["Europa", "Titan", "Ganymede", "Enceladus"],
    correctIndex: 1,
  },
  {
    prompt: "Which force keeps planets in orbit around the Sun?",
    options: ["Magnetism", "Gravity", "Friction", "Nuclear force"],
    correctIndex: 1,
  },
  {
    prompt: "What is the approximate age of the universe according to current cosmology (billions of years)?",
    options: ["4.5", "13.8", "20", "100"],
    correctIndex: 1,
  },
  {
    prompt: "Which planet rotates on its side compared to most planets?",
    options: ["Neptune", "Uranus", "Venus", "Pluto"],
    correctIndex: 1,
  },
  {
    prompt: "What is a supernova?",
    options: ["A new planet forming", "The explosive death of a massive star", "A type of comet", "A solar flare"],
    correctIndex: 1,
  },
  {
    prompt: "Which mission first landed humans on the Moon?",
    options: ["Apollo 8", "Apollo 11", "Apollo 13", "Gemini 4"],
    correctIndex: 1,
  },
  {
    prompt: "What is the Kuiper Belt?",
    options: ["A ring around Saturn", "A region of icy bodies beyond Neptune", "The asteroid belt", "A cluster of stars"],
    correctIndex: 1,
  },
  {
    prompt: "Which planet has the longest day (slowest rotation) in the solar system?",
    options: ["Mercury", "Venus", "Mars", "Jupiter"],
    correctIndex: 1,
  },
  {
    prompt: "What is the name of our galaxy?",
    options: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"],
    correctIndex: 1,
  },
  {
    prompt: "Which object is at the center of our solar system?",
    options: ["Earth", "The Sun", "Jupiter", "The Moon"],
    correctIndex: 1,
  },
  {
    prompt: "What are comets primarily made of?",
    options: ["Metal and rock only", "Ice, dust, and rock", "Pure hydrogen gas", "Liquid water"],
    correctIndex: 1,
  },
  {
    prompt: "Which NASA rover landed on Mars in 2012 and explored Gale Crater?",
    options: ["Spirit", "Opportunity", "Curiosity", "Perseverance"],
    correctIndex: 2,
  },
  {
    prompt: "What is a black hole?",
    options: ["An empty region of space", "A region where gravity is so strong light cannot escape", "A dark planet", "A collapsed moon"],
    correctIndex: 1,
  },
  {
    prompt: "Which planet is known for extreme greenhouse effect and surface temperatures over 400°C?",
    options: ["Mercury", "Venus", "Mars", "Jupiter"],
    correctIndex: 1,
  },
  {
    prompt: "The International Space Station orbits which body?",
    options: ["The Moon", "Earth", "Mars", "The Sun"],
    correctIndex: 1,
  },
  {
    prompt: "What is the Oort Cloud thought to be?",
    options: ["A nebula near the Sun", "A distant shell of icy objects surrounding the solar system", "A moon of Jupiter", "A dwarf galaxy"],
    correctIndex: 1,
  },
  {
    prompt: "Which is the smallest planet in the solar system?",
    options: ["Mars", "Mercury", "Pluto", "Venus"],
    correctIndex: 1,
  },
  {
    prompt: "What instrument do astronomers use to spread light into a spectrum?",
    options: ["Telescope mirror", "Spectrograph", "Radio dish", "Magnetometer"],
    correctIndex: 1,
  },
  {
    prompt: "Which moon of Jupiter is strongly suspected to have a subsurface ocean?",
    options: ["Io", "Europa", "Callisto", "Phobos"],
    correctIndex: 1,
  },
  {
    prompt: "What is the main fuel source for stars like the Sun?",
    options: ["Coal fusion", "Hydrogen fusion", "Helium fission", "Uranium fission"],
    correctIndex: 1,
  },
  {
    prompt: "Which space agency launched the Voyager 1 and 2 probes?",
    options: ["ESA", "NASA", "Roscosmos", "JAXA"],
    correctIndex: 1,
  },
  {
    prompt: "What is an exoplanet?",
    options: ["A planet in our solar system", "A planet orbiting a star outside our solar system", "A comet", "A moon of Mars"],
    correctIndex: 1,
  },
  {
    prompt: "Which dwarf planet was visited by NASA's New Horizons in 2015?",
    options: ["Ceres", "Pluto", "Eris", "Haumea"],
    correctIndex: 1,
  },
  {
    prompt: "What phenomenon creates the northern and southern lights?",
    options: ["Moonlight reflection", "Solar wind interacting with Earth's magnetosphere", "Volcanic dust", "Meteor showers"],
    correctIndex: 1,
  },
  {
    prompt: "Which planet has two moons named Phobos and Deimos?",
    options: ["Earth", "Mars", "Jupiter", "Neptune"],
    correctIndex: 1,
  },
  {
    prompt: "What is the approximate distance from Earth to the Moon (km, rounded)?",
    options: ["38,000", "384,000", "3,840,000", "38,400,000"],
    correctIndex: 1,
  },
  {
    prompt: "Which constellation contains the star Polaris, the North Star?",
    options: ["Orion", "Ursa Minor", "Cassiopeia", "Leo"],
    correctIndex: 1,
  },
  {
    prompt: "What is the James Webb Space Telescope primarily designed to observe?",
    options: ["Radio waves only", "Infrared light from the early universe and distant objects", "X-rays from the Sun", "Gamma rays from black holes only"],
    correctIndex: 1,
  },
  {
    prompt: "Which planet has the Great Dark Spot, a storm similar to Jupiter's spot?",
    options: ["Uranus", "Neptune", "Saturn", "Mars"],
    correctIndex: 1,
  },
  {
    prompt: "What is the asteroid belt located between?",
    options: ["Earth and Mars", "Mars and Jupiter", "Jupiter and Saturn", "Neptune and Pluto"],
    correctIndex: 1,
  },
  {
    prompt: "Which Soviet cosmonaut was the first human in space?",
    options: ["Alexei Leonov", "Yuri Gagarin", "Valentina Tereshkova", "Sergei Korolev"],
    correctIndex: 1,
  },
  {
    prompt: "What is a pulsar?",
    options: ["A pulsing planet", "A rapidly rotating neutron star emitting beams of radiation", "A type of comet tail", "A solar prominence"],
    correctIndex: 1,
  },
  {
    prompt: "Which gas makes up most of the Sun's visible surface atmosphere?",
    options: ["Oxygen", "Hydrogen", "Carbon dioxide", "Nitrogen"],
    correctIndex: 1,
  },
  {
    prompt: "What is the term for the point in an orbit closest to the body being orbited?",
    options: ["Apogee", "Perihelion (for Sun) / perigee (for Earth)", "Zenith", "Nadir"],
    correctIndex: 1,
  },
  {
    prompt: "Which galaxy is the nearest large spiral galaxy to the Milky Way?",
    options: ["Triangulum", "Andromeda", "Large Magellanic Cloud", "Sombrero"],
    correctIndex: 1,
  },
  {
    prompt: "What causes the phases of the Moon?",
    options: ["Earth's shadow always", "The changing angle of sunlight on the Moon as it orbits Earth", "The Moon rotating into darkness", "Solar flares"],
    correctIndex: 1,
  },
  {
    prompt: "Which planet was demoted to dwarf planet status in 2006 by the IAU?",
    options: ["Ceres", "Pluto", "Eris", "Haumea"],
    correctIndex: 1,
  },
  {
    prompt: "What is cosmic microwave background radiation evidence for?",
    options: ["Steady-state universe", "The Big Bang", "Dark matter only", "Solar formation"],
    correctIndex: 1,
  },
];
