export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  category: string;
  pages: number;
  language: string;
  isbn: string;
  rating: number;
  reviews: Review[];
}

export interface Review {
  id: string;
  userName: string;
  avatar: string;
  comment: string;
  rating: number;
}

export const books: Book[] = [
  {
    id: "1",
    title: "The Great Adventure",
    author: "Emily Richardson",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    description: "A thrilling journey across uncharted territories, where courage meets destiny. Follow the protagonist as they navigate through mysterious lands and discover the true meaning of adventure.",
    category: "Adventure",
    pages: 342,
    language: "English",
    isbn: "978-1-234567-89-0",
    rating: 4.8,
    reviews: [
      { id: "r1", userName: "Sarah Mitchell", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", comment: "Absolutely captivating! Couldn't put it down.", rating: 5 },
    ],
  },
  {
    id: "2",
    title: "Whispers of the Heart",
    author: "James Morrison",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
    description: "A beautiful romance that transcends time and space. Two souls destined to meet, separated by circumstances, united by fate.",
    category: "Romance",
    pages: 289,
    language: "English",
    isbn: "978-1-234567-89-1",
    rating: 4.6,
    reviews: [
      { id: "r2", userName: "Michael Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", comment: "A heartwarming story that stays with you.", rating: 5 },
    ],
  },
  {
    id: "3",
    title: "The Mystery Manor",
    author: "Victoria Blake",
    cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    description: "Dark secrets lurk within the walls of Blackwood Manor. Detective Eleanor must unravel the mystery before time runs out.",
    category: "Mystery",
    pages: 412,
    language: "English",
    isbn: "978-1-234567-89-2",
    rating: 4.9,
    reviews: [
      { id: "r3", userName: "Robert Kim", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", comment: "Best mystery I've read in years!", rating: 5 },
    ],
  },
  {
    id: "4",
    title: "Stars Beyond",
    author: "David Clarke",
    cover: "https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?w=400&h=600&fit=crop",
    description: "Humanity's first voyage to a distant galaxy. Experience the wonder and terror of deep space exploration.",
    category: "Sci-Fi",
    pages: 520,
    language: "English",
    isbn: "978-1-234567-89-3",
    rating: 4.7,
    reviews: [
      { id: "r4", userName: "Emma Watson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", comment: "Mind-blowing sci-fi masterpiece!", rating: 5 },
    ],
  },
  {
    id: "5",
    title: "The Art of Silence",
    author: "Sophia Turner",
    cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop",
    description: "A philosophical exploration of mindfulness and inner peace in our chaotic modern world.",
    category: "Self-Help",
    pages: 198,
    language: "English",
    isbn: "978-1-234567-89-4",
    rating: 4.5,
    reviews: [
      { id: "r5", userName: "John Davis", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", comment: "Life-changing perspectives on mindfulness.", rating: 4 },
    ],
  },
  {
    id: "6",
    title: "Forgotten Realms",
    author: "Alexander Wolf",
    cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop",
    description: "Epic fantasy adventure in a world where magic and mortals collide. An ancient prophecy awaits fulfillment.",
    category: "Fantasy",
    pages: 678,
    language: "English",
    isbn: "978-1-234567-89-5",
    rating: 4.8,
    reviews: [
      { id: "r6", userName: "Lisa Park", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", comment: "A fantasy world so rich and immersive!", rating: 5 },
    ],
  },
  {
    id: "7",
    title: "Ocean's Whisper",
    author: "Marina Pearce",
    cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
    description: "A coastal romance where the sea holds secrets as deep as the love between two unlikely souls.",
    category: "Romance",
    pages: 324,
    language: "English",
    isbn: "978-1-234567-89-6",
    rating: 4.4,
    reviews: [
      { id: "r7", userName: "Rachel Green", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", comment: "So romantic and beautifully written!", rating: 5 },
    ],
  },
  {
    id: "8",
    title: "The Last Kingdom",
    author: "Bernard Cornwell",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    description: "A tale of war, honor, and destiny in medieval England. Follow a warrior's journey through battle and betrayal.",
    category: "Adventure",
    pages: 456,
    language: "English",
    isbn: "978-1-234567-89-7",
    rating: 4.9,
    reviews: [
      { id: "r8", userName: "William Turner", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", comment: "Epic historical fiction at its finest!", rating: 5 },
    ],
  },
  {
    id: "9",
    title: "Digital Minds",
    author: "Kai Nakamura",
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
    description: "In a world where AI has become sentient, one programmer must decide the fate of humanity.",
    category: "Sci-Fi",
    pages: 398,
    language: "English",
    isbn: "978-1-234567-89-8",
    rating: 4.6,
    reviews: [
      { id: "r9", userName: "Tech Review", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", comment: "Thought-provoking and terrifyingly possible.", rating: 5 },
    ],
  },
  {
    id: "10",
    title: "The Hidden Truth",
    author: "Clara Bennett",
    cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
    description: "A detective uncovers a conspiracy that reaches the highest levels of power in this gripping thriller.",
    category: "Mystery",
    pages: 367,
    language: "English",
    isbn: "978-1-234567-89-9",
    rating: 4.7,
    reviews: [
      { id: "r10", userName: "Mystery Fan", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", comment: "Couldn't guess the ending!", rating: 5 },
    ],
  },
  {
    id: "11",
    title: "Dragon's Oath",
    author: "Freya Storm",
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop",
    description: "When dragons return to the realm, a young mage must forge an unlikely alliance to save her kingdom.",
    category: "Fantasy",
    pages: 589,
    language: "English",
    isbn: "978-1-234567-90-0",
    rating: 4.8,
    reviews: [
      { id: "r11", userName: "Fantasy Lover", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", comment: "Dragons have never been so real!", rating: 5 },
    ],
  },
  {
    id: "12",
    title: "Mind Over Matter",
    author: "Dr. James Wilson",
    cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop",
    description: "Unlock the power of your subconscious mind with proven techniques for success and happiness.",
    category: "Self-Help",
    pages: 245,
    language: "English",
    isbn: "978-1-234567-90-1",
    rating: 4.3,
    reviews: [
      { id: "r12", userName: "Life Coach", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", comment: "Practical advice that actually works.", rating: 4 },
    ],
  },
];

export const categories = [
  { id: "all", name: "All Books", icon: "BookOpen" },
  { id: "adventure", name: "Adventure", icon: "Compass" },
  { id: "romance", name: "Romance", icon: "Heart" },
  { id: "mystery", name: "Mystery", icon: "Search" },
  { id: "sci-fi", name: "Sci-Fi", icon: "Rocket" },
  { id: "fantasy", name: "Fantasy", icon: "Sparkles" },
  { id: "self-help", name: "Self-Help", icon: "Brain" },
];

export function getBookById(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export function getBooksByCategory(category: string): Book[] {
  if (category === "all") return books;
  return books.filter((book) => book.category.toLowerCase() === category.toLowerCase());
}
