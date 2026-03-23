export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  liked: boolean;
  tags?: string[];
}

export const posts: Post[] = [
  {
    id: 'p1',
    authorId: 'u1',
    authorName: 'Sofia Reyes',
    authorHandle: '@sofiareyes',
    authorAvatar: 'https://ui-avatars.com/api/?name=Sofia+Reyes&background=C2652A&color=fff&size=200&bold=true',
    content:
      'Just launched our third kitchen in Little Havana! 12 cocineras now earning a living from their family recipes. This is what community looks like. Esto es lo que significa apoyarnos. #SaborDeCasa #CommunityFirst',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=500&fit=crop',
    likes: 234,
    comments: 47,
    shares: 31,
    timestamp: '2h ago',
    liked: false,
    tags: ['#SaborDeCasa', '#CommunityFirst'],
  },
  {
    id: 'p2',
    authorId: 'u2',
    authorName: 'Carlos Mendoza',
    authorHandle: '@carlosmendoza',
    authorAvatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=0D9488&color=fff&size=200&bold=true',
    content:
      'Our AI bookkeeper just processed its 10,000th transaction in Spanish. 60% of our users had never used any financial software before. Technology should meet people where they are, not the other way around. Vamos! #NexoTech #FinancialInclusion',
    likes: 456,
    comments: 82,
    shares: 67,
    timestamp: '4h ago',
    liked: true,
    tags: ['#NexoTech', '#FinancialInclusion'],
  },
  {
    id: 'p3',
    authorId: 'u3',
    authorName: 'Maria Fernanda Lopez',
    authorHandle: '@maferlop',
    authorAvatar: 'https://ui-avatars.com/api/?name=Maria+Lopez&background=F59E0B&color=fff&size=200&bold=true',
    content:
      'Reminder for my fellow entrepreneurs: You don\'t need permission to build. Our abuelos crossed oceans with nothing but faith and work ethic. That DNA runs through us. Go build that thing you\'ve been thinking about. Hazlo ya.',
    likes: 892,
    comments: 156,
    shares: 203,
    timestamp: '6h ago',
    liked: false,
  },
  {
    id: 'p4',
    authorId: 'u4',
    authorName: 'Diego Ramirez',
    authorHandle: '@diegoram',
    authorAvatar: 'https://ui-avatars.com/api/?name=Diego+Ramirez&background=7C3AED&color=fff&size=200&bold=true',
    content:
      'New Raices collection dropping next month. This time we collaborated with Zapotec weavers from Oaxaca. Every piece tells a story that\'s 3,000 years old. Our ancestors were the original designers.',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=500&fit=crop',
    likes: 567,
    comments: 93,
    shares: 78,
    timestamp: '8h ago',
    liked: false,
    tags: ['#RaicesClothing', '#IndigenousArt'],
  },
  {
    id: 'p5',
    authorId: 'u5',
    authorName: 'Ana Castillo',
    authorHandle: '@anacastillo',
    authorAvatar: 'https://ui-avatars.com/api/?name=Ana+Castillo&background=EC4899&color=fff&size=200&bold=true',
    content:
      'Morning salsa cardio class had 40 people today! Health and wellness should feel like a celebration, not a punishment. When the music hits and the endorphins kick in - that\'s Fuerza. Next week we\'re adding bachata HIIT. Who\'s in?',
    likes: 312,
    comments: 67,
    shares: 24,
    timestamp: '12h ago',
    liked: true,
    tags: ['#FuerzaFitness', '#SalsaCardio'],
  },
  {
    id: 'p6',
    authorId: 'u2',
    authorName: 'Carlos Mendoza',
    authorHandle: '@carlosmendoza',
    authorAvatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=0D9488&color=fff&size=200&bold=true',
    content:
      'Excited to announce NexoTech just got accepted into Lumina Red\'s community funding program! We\'re raising funds to expand our AI bookkeeper to 5 new cities. Every dollar from our community goes further than VC money because it comes with confianza.',
    likes: 389,
    comments: 71,
    shares: 54,
    timestamp: '1d ago',
    liked: false,
    tags: ['#NexoTech', '#CommunityFunding'],
  },
  {
    id: 'p7',
    authorId: 'u1',
    authorName: 'Sofia Reyes',
    authorHandle: '@sofiareyes',
    authorAvatar: 'https://ui-avatars.com/api/?name=Sofia+Reyes&background=C2652A&color=fff&size=200&bold=true',
    content:
      'Pro tip for new entrepreneurs on Lumina Red: Don\'t just post about your business. Engage with other founders. Buy from each other. Share each other\'s posts. La comunidad se construye juntos. The algorithm rewards genuine connection.',
    likes: 678,
    comments: 112,
    shares: 145,
    timestamp: '1d ago',
    liked: false,
  },
  {
    id: 'p8',
    authorId: 'u3',
    authorName: 'Maria Fernanda Lopez',
    authorHandle: '@maferlop',
    authorAvatar: 'https://ui-avatars.com/api/?name=Maria+Lopez&background=F59E0B&color=fff&size=200&bold=true',
    content:
      'Free legal workshop this Saturday for Latino small business owners! Topics: LLC formation, trademark basics, and contractor agreements. Bilingual. No jargon. Just practical knowledge. DM me for the link. #LegalAccess',
    likes: 445,
    comments: 89,
    shares: 167,
    timestamp: '2d ago',
    liked: false,
    tags: ['#LegalAccess', '#FreeWorkshop'],
  },
  {
    id: 'p9',
    authorId: 'u4',
    authorName: 'Diego Ramirez',
    authorHandle: '@diegoram',
    authorAvatar: 'https://ui-avatars.com/api/?name=Diego+Ramirez&background=7C3AED&color=fff&size=200&bold=true',
    content:
      'Just helped a taqueria owner rebrand their entire visual identity for free through Lumina Red\'s design mentorship program. Before and after is WILD. This is what the cooperative model enables - we lift each other up.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop',
    likes: 723,
    comments: 134,
    shares: 89,
    timestamp: '2d ago',
    liked: true,
    tags: ['#DesignMentorship', '#Cooperative'],
  },
  {
    id: 'p10',
    authorId: 'u5',
    authorName: 'Ana Castillo',
    authorHandle: '@anacastillo',
    authorAvatar: 'https://ui-avatars.com/api/?name=Ana+Castillo&background=EC4899&color=fff&size=200&bold=true',
    content:
      'Fuerza Fitness just reached 42% of our funding goal on Lumina Red! Shoutout to every single person who contributed. We\'re going to build the most inclusive, culturally-rooted fitness space DC has ever seen. Gracias, familia.',
    likes: 289,
    comments: 45,
    shares: 33,
    timestamp: '3d ago',
    liked: false,
    tags: ['#FuerzaFitness', '#CommunityFunding'],
  },
];
