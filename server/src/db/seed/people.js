// Fake people for DEVELOPMENT ONLY. Nothing in the real app imports this file.

// Times of day are stored as minutes after midnight, so 23:50 is 23*60+50.
const time = (hours, minutes = 0) => hours * 60 + minutes;

// Everyone starts from these values. Each person below overrides only what
// makes them special, so the unusual values are easy to spot.
const DEFAULTS = {
  gender: 'woman',
  genderPref: 'anyone',
  city: 'Bengaluru',
  budgetMin: 14000,
  budgetMax: 20000,
  moveInDays: 30, // move-in date = today + this many days
  bedtime: time(23),
  wake: time(7),
  cleanliness: 3,
  guests: 'sometimes',
  smokes: false,
  okWithSmokers: true,
  hasPets: false,
  okWithPets: true,
  age: 25,
  occupation: 'Software Engineer',
  workplace: 'Example Corp',
  bio: 'Easy-going and tidy. Looking for a calm flat and a flatmate who respects quiet hours.',
  tags: ['Quiet evenings'],
  localities: ['Koramangala', 'HSR Layout'],
};

const handwritten = [
  // The three sample people from the UI design.
  {
    name: 'Rhea Sengupta',
    age: 24,
    occupation: 'Product Designer',
    budgetMin: 14000,
    budgetMax: 18000,
    bedtime: time(1),
    wake: time(9),
    cleanliness: 4,
    localities: ['Indiranagar', 'Domlur'],
    tags: ['Night owl', 'Board games'],
    bio: 'Designer who loves slow weekends, filter coffee and a tidy kitchen. Usually up late.',
  },
  {
    name: 'Kabir Sharma',
    gender: 'man',
    age: 26,
    occupation: 'Software Engineer',
    budgetMin: 16000,
    budgetMax: 22000,
    bedtime: time(22, 30),
    wake: time(6, 30),
    cleanliness: 4,
    localities: ['Koramangala', 'HSR Layout'],
    tags: ['Early bird', 'Filter coffee lover'],
    bio: 'Early riser, gym before work, cooks on Sundays. Happy to share chores on a rota.',
  },
  {
    name: 'Ananya Deshmukh',
    age: 25,
    occupation: 'Brand Strategist',
    budgetMin: 13000,
    budgetMax: 19000,
    localities: ['HSR Layout', 'BTM Layout'],
    tags: ['Morning person', 'Quiet evenings'],
    bio: 'Strategist who works hybrid. Calm evenings, occasional friends over on weekends.',
  },

  // Edge: bedtimes 20 minutes apart, but on opposite sides of midnight.
  { name: 'Arjun Nair', gender: 'man', bedtime: time(23, 50) },
  { name: 'Meera Iyer', bedtime: time(0, 10) },

  // Edge: budget ranges that share exactly one rupee value (15,000).
  { name: 'Vikram Rao', gender: 'man', budgetMin: 12000, budgetMax: 15000, localities: ['BTM Layout'] },
  { name: 'Sneha Reddy', budgetMin: 15000, budgetMax: 19000, localities: ['BTM Layout'] },

  // Edge: a smoker who accepts smokers, and a non-smoker who does not.
  { name: 'Rohan Bhatt', gender: 'man', smokes: true, okWithSmokers: true },
  { name: 'Isha Kulkarni', smokes: false, okWithSmokers: false },

  // Edge: a pet owner, and someone who is not okay with pets.
  { name: 'Tanvi Joshi', hasPets: true, okWithPets: true },
  { name: 'Harsh Patel', gender: 'man', okWithPets: false },

  // Edge: gender preferences.
  { name: 'Pooja Menon', genderPref: 'women_only' },
  { name: 'Aditya Verma', gender: 'man', genderPref: 'men_only' },

  // Edge: a non-binary user.
  { name: 'Kiran Das', gender: 'non_binary' },

  // Edge: a user with a single locality.
  { name: 'Zoya Khan', localities: ['Whitefield'] },

  // These four are linked together by seed.js (a block and a match).
  { name: 'Nikhil Gupta', gender: 'man' },
  { name: 'Divya Rao' },
  { name: 'Aarav Singh', gender: 'man' },
  { name: 'Simran Kaur' },
];

// 21 filler people. Names alternate woman, man, woman, man... to match
// the "even index = woman" rule in the generator below.
const GENERATED_NAMES = [
  'Aditi Kapoor', 'Rahul Mehta', 'Sanya Malhotra', 'Manish Tiwari',
  'Pallavi Hegde', 'Kunal Shah', 'Lavanya Pillai', 'Yash Agarwal',
  'Ritika Bose', 'Sameer Chopra', 'Bhavna Sethi', 'Tarun Nambiar',
  'Neha Banerjee', 'Ishaan Dutta', 'Aisha Siddiqui', 'Varun Khanna',
  'Anjali Pandey', 'Gaurav Mishra', 'Shruti Rangan', 'Rajat Saxena',
  'Kavya Prakash',
];

const LOCALITY_PAIRS = [
  ['Koramangala', 'HSR Layout'],
  ['Indiranagar', 'Domlur'],
  ['BTM Layout', 'Bellandur'],
  ['Whitefield', 'Marathahalli'],
  ['Jayanagar', 'JP Nagar'],
  ['HSR Layout', 'Sarjapur Road'],
];
const BUDGETS = [[8000, 14000], [12000, 18000], [15000, 22000], [18000, 26000], [10000, 16000]];
const BEDTIMES = [time(22), time(23), time(0), time(1)];
const WAKES = [time(6), time(7), time(8), time(9)];
const GUESTS = ['rarely', 'sometimes', 'often'];
const OCCUPATIONS = ['Student', 'Software Engineer', 'Accountant', 'Marketing Executive', 'Nurse', 'Data Analyst'];

// i % n cycles through a list of n items: 0, 1, 2, 0, 1, 2, ...
const generated = GENERATED_NAMES.map((name, i) => {
  const [budgetMin, budgetMax] = BUDGETS[i % BUDGETS.length];
  return {
    name,
    gender: i % 2 === 0 ? 'woman' : 'man',
    age: 20 + (i % 10),
    occupation: OCCUPATIONS[i % OCCUPATIONS.length],
    budgetMin,
    budgetMax,
    localities: LOCALITY_PAIRS[i % LOCALITY_PAIRS.length],
    bedtime: BEDTIMES[i % BEDTIMES.length],
    wake: WAKES[i % WAKES.length],
    cleanliness: (i % 5) + 1,
    guests: GUESTS[i % GUESTS.length],
    smokes: i % 7 === 0,
    hasPets: i % 6 === 0,
    moveInDays: 7 + i * 10,
  };
});

// Merge: later keys win, so each person's own values replace the defaults.
export const PEOPLE = [...handwritten, ...generated].map((person) => ({
  ...DEFAULTS,
  ...person,
}));

// Names that seed.js uses to build the relationships.
export const BLOCKED_PAIR = { blocker: 'Nikhil Gupta', blocked: 'Divya Rao' };
export const MATCHED_PAIR = ['Aarav Singh', 'Simran Kaur'];

// Every fake email ends with this. ".test" is reserved and can never be real.
export const SEED_EMAIL_DOMAIN = 'seed.settle.test';