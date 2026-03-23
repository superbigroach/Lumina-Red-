export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  location: string;
  joinedDate: string;
  connections: number;
  posts: number;
  impactScore: number;
  skills: string[];
  socials: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export const users: User[] = [
  {
    id: 'u1',
    name: 'Sofia Reyes',
    handle: '@sofiareyes',
    avatar: 'https://ui-avatars.com/api/?name=Sofia+Reyes&background=C2652A&color=fff&size=200&bold=true',
    bio: 'Emprendedora social y amante del cafe. Building bridges between communities through food and culture.',
    location: 'Miami, FL',
    joinedDate: 'Jan 2025',
    connections: 342,
    posts: 87,
    impactScore: 4200,
    skills: ['Marketing Digital', 'Community Building', 'Food Industry'],
    socials: {
      instagram: '@sofiareyes.co',
      twitter: '@sofiareyes',
      website: 'sofiareyes.co',
    },
  },
  {
    id: 'u2',
    name: 'Carlos Mendoza',
    handle: '@carlosmendoza',
    avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=0D9488&color=fff&size=200&bold=true',
    bio: 'Tech founder building tools for our gente. Ex-Google. First-gen college grad. Let\'s build together.',
    location: 'Austin, TX',
    joinedDate: 'Feb 2025',
    connections: 518,
    posts: 124,
    impactScore: 6800,
    skills: ['Software Engineering', 'Product Management', 'AI/ML'],
    socials: {
      twitter: '@carlosmdev',
      linkedin: 'carlos-mendoza-dev',
      website: 'carlosmendoza.dev',
    },
  },
  {
    id: 'u3',
    name: 'Maria Fernanda Lopez',
    handle: '@maferlop',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Lopez&background=F59E0B&color=fff&size=200&bold=true',
    bio: 'Abogada turned entrepreneur. Fighting for economic equity one business at a time. Orgullosamente Mexicana.',
    location: 'Los Angeles, CA',
    joinedDate: 'Dec 2024',
    connections: 289,
    posts: 56,
    impactScore: 3100,
    skills: ['Legal', 'Business Strategy', 'Nonprofits'],
    socials: {
      instagram: '@maferlop',
      linkedin: 'maria-fernanda-lopez',
    },
  },
  {
    id: 'u4',
    name: 'Diego Ramirez',
    handle: '@diegoram',
    avatar: 'https://ui-avatars.com/api/?name=Diego+Ramirez&background=7C3AED&color=fff&size=200&bold=true',
    bio: 'Designer & creative director. Turning cultura into brand identity. Colombiano in NYC.',
    location: 'New York, NY',
    joinedDate: 'Mar 2025',
    connections: 421,
    posts: 93,
    impactScore: 5500,
    skills: ['Brand Design', 'UI/UX', 'Photography'],
    socials: {
      instagram: '@diegoram.design',
      twitter: '@diegoramdesign',
      website: 'diegoram.design',
    },
  },
  {
    id: 'u5',
    name: 'Ana Castillo',
    handle: '@anacastillo',
    avatar: 'https://ui-avatars.com/api/?name=Ana+Castillo&background=EC4899&color=fff&size=200&bold=true',
    bio: 'Fitness coach & wellness advocate. Empowering Latinas to prioritize health. Born in El Salvador, raised in DC.',
    location: 'Washington, DC',
    joinedDate: 'Jan 2025',
    connections: 267,
    posts: 71,
    impactScore: 2900,
    skills: ['Fitness Coaching', 'Nutrition', 'Content Creation'],
    socials: {
      instagram: '@anacastillo.fit',
      twitter: '@anacastillofit',
    },
  },
];

export const currentUser: User = users[0];
