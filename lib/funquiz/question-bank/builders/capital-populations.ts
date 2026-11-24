import { QUIZ_DIFFICULTY_HARD, QUIZ_DIFFICULTY_INTERMEDIATE, type QuizDifficulty } from "../../difficulties";

export type CapitalPopulationDef = {
  city: string;
  country: string;
  /** Official capital-area population, rounded. Not the wider metro area. */
  population: number;
  difficulty: QuizDifficulty;
};

/**
 * City-proper / official capital-area populations, rounded.
 * Easy uses the intermediate pool. Within 2,000,000 of these figures wins.
 */
export const CAPITAL_POPULATION_DEFS: CapitalPopulationDef[] = [
  ...intermediate([
    ["Beijing", "China", 21_900_000],
    ["Tokyo", "Japan", 14_100_000],
    ["Moscow", "Russia", 13_300_000],
    ["Kinshasa", "DR Congo", 12_700_000],
    ["Jakarta", "Indonesia", 10_600_000],
    ["Lima", "Peru", 10_200_000],
    ["Cairo", "Egypt", 10_100_000],
    ["Seoul", "South Korea", 9_500_000],
    ["Mexico City", "Mexico", 9_200_000],
    ["London", "United Kingdom", 9_000_000],
    ["Dhaka", "Bangladesh", 8_900_000],
    ["Tehran", "Iran", 8_700_000],
    ["Bangkok", "Thailand", 8_300_000],
    ["Hanoi", "Vietnam", 8_100_000],
    ["Baghdad", "Iraq", 7_700_000],
    ["Riyadh", "Saudi Arabia", 7_700_000],
    ["Bogotá", "Colombia", 7_200_000],
    ["Santiago", "Chile", 6_300_000],
    ["Singapore", "Singapore", 5_900_000],
    ["Ankara", "Turkey", 5_700_000],
    ["Kabul", "Afghanistan", 4_600_000],
    ["Nairobi", "Kenya", 4_400_000],
    ["Amman", "Jordan", 4_100_000],
    ["Algiers", "Algeria", 3_900_000],
    ["Berlin", "Germany", 3_700_000],
    ["Madrid", "Spain", 3_300_000],
    ["Buenos Aires", "Argentina", 3_100_000],
    ["Addis Ababa", "Ethiopia", 3_000_000],
    ["Brasília", "Brazil", 3_000_000],
    ["Guatemala City", "Guatemala", 2_900_000],
    ["Pretoria", "South Africa", 2_900_000],
    ["Kyiv", "Ukraine", 2_900_000],
    ["Pyongyang", "North Korea", 2_900_000],
    ["Tashkent", "Uzbekistan", 2_900_000],
    ["Quito", "Ecuador", 2_800_000],
    ["Yaoundé", "Cameroon", 2_800_000],
    ["Rome", "Italy", 2_800_000],
    ["Lusaka", "Zambia", 2_700_000],
    ["Khartoum", "Sudan", 2_700_000],
    ["Taipei", "Taiwan", 2_600_000],
    ["Sanaa", "Yemen", 2_600_000],
    ["Luanda", "Angola", 2_600_000],
    ["Ouagadougou", "Burkina Faso", 2_500_000],
    ["Accra", "Ghana", 2_400_000],
    ["Mogadishu", "Somalia", 2_400_000],
    ["Baku", "Azerbaijan", 2_300_000],
    ["Phnom Penh", "Cambodia", 2_300_000],
    ["Caracas", "Venezuela", 2_200_000],
    ["Paris", "France", 2_100_000],
    ["Havana", "Cuba", 2_100_000],
  ]),
  ...hard([
    ["Harare", "Zimbabwe", 2_100_000],
    ["Damascus", "Syria", 2_100_000],
    ["Minsk", "Belarus", 2_000_000],
    ["Vienna", "Austria", 2_000_000],
    ["Warsaw", "Poland", 1_900_000],
    ["Manila", "Philippines", 1_800_000],
    ["Bamako", "Mali", 1_800_000],
    ["Kuala Lumpur", "Malaysia", 1_800_000],
    ["Bucharest", "Romania", 1_700_000],
    ["Budapest", "Hungary", 1_700_000],
    ["Belgrade", "Serbia", 1_700_000],
    ["Kampala", "Uganda", 1_700_000],
    ["Astana", "Kazakhstan", 1_500_000],
    ["Ulaanbaatar", "Mongolia", 1_500_000],
    ["Tegucigalpa", "Honduras", 1_400_000],
    ["Dakar", "Senegal", 1_400_000],
    ["Prague", "Czech Republic", 1_400_000],
    ["Montevideo", "Uruguay", 1_300_000],
    ["Sofia", "Bulgaria", 1_300_000],
    ["Muscat", "Oman", 1_300_000],
    ["Antananarivo", "Madagascar", 1_300_000],
    ["Abuja", "Nigeria", 1_200_000],
    ["Tbilisi", "Georgia", 1_200_000],
    ["Doha", "Qatar", 1_200_000],
    ["Tripoli", "Libya", 1_200_000],
    ["Kigali", "Rwanda", 1_100_000],
    ["Maputo", "Mozambique", 1_100_000],
    ["Santo Domingo", "Dominican Republic", 1_100_000],
    ["Yerevan", "Armenia", 1_100_000],
    ["Panama City", "Panama", 1_100_000],
    ["Managua", "Nicaragua", 1_100_000],
    ["Ottawa", "Canada", 1_000_000],
    ["Islamabad", "Pakistan", 1_000_000],
    ["Abu Dhabi", "United Arab Emirates", 1_000_000],
    ["Port-au-Prince", "Haiti", 990_000],
    ["Stockholm", "Sweden", 980_000],
    ["Jerusalem", "Israel", 940_000],
    ["Vientiane", "Laos", 930_000],
    ["Amsterdam", "Netherlands", 910_000],
    ["Washington", "United States", 670_000],
    ["Athens", "Greece", 640_000],
    ["Copenhagen", "Denmark", 640_000],
    ["Oslo", "Norway", 700_000],
    ["Helsinki", "Finland", 660_000],
    ["Dublin", "Ireland", 590_000],
    ["Lisbon", "Portugal", 510_000],
    ["Canberra", "Australia", 430_000],
    ["Wellington", "New Zealand", 220_000],
    ["Brussels", "Belgium", 190_000],
    ["Bern", "Switzerland", 130_000],
  ]),
];

function intermediate(rows: [string, string, number][]): CapitalPopulationDef[] {
  return rows.map(([city, country, population]) => ({
    city,
    country,
    population,
    difficulty: QUIZ_DIFFICULTY_INTERMEDIATE,
  }));
}

function hard(rows: [string, string, number][]): CapitalPopulationDef[] {
  return rows.map(([city, country, population]) => ({
    city,
    country,
    population,
    difficulty: QUIZ_DIFFICULTY_HARD,
  }));
}
