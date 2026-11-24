export const INSTRUMENT_ROUNDS = 20;

export const INSTRUMENTS = [
  { id: "guitar", title: "Guitar" },
  { id: "piano", title: "Piano" },
  { id: "drum", title: "Drum" },
  { id: "violin", title: "Violin" },
  { id: "trumpet", title: "Trumpet" },
  { id: "flute", title: "Flute" },
  { id: "saxophone", title: "Saxophone" },
  { id: "harp", title: "Harp" },
  { id: "cello", title: "Cello" },
  { id: "banjo", title: "Banjo" },
  { id: "accordion", title: "Accordion" },
  { id: "harmonica", title: "Harmonica" },
  { id: "xylophone", title: "Xylophone" },
  { id: "trombone", title: "Trombone" },
  { id: "clarinet", title: "Clarinet" },
  { id: "ukulele", title: "Ukulele" },
  { id: "tambourine", title: "Tambourine" },
  { id: "bongos", title: "Bongos" },
  { id: "french-horn", title: "French horn" },
  { id: "bagpipes", title: "Bagpipes" },
] as const;

export type InstrumentId = (typeof INSTRUMENTS)[number]["id"];
