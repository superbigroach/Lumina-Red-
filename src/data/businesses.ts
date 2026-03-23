export interface Business {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  image: string;
  gallery: string[];
  location: string;
  foundedYear: number;
  founders: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  }[];
  fundingGoal: number;
  fundingRaised: number;
  backers: number;
  tags: string[];
  website?: string;
  featured: boolean;
}

export const categories = [
  'All',
  'Food & Beverage',
  'Technology',
  'Fashion',
  'Health & Fitness',
  'Services',
] as const;

export const businesses: Business[] = [
  {
    id: 'b1',
    name: 'Sabor de Casa',
    tagline: 'Authentic home-cooked meals, delivered with love',
    description:
      'Sabor de Casa connects home cooks from across Latin America with hungry neighbors who miss the taste of home. Our platform enables talented cocineras to build sustainable businesses from their kitchens, sharing recipes passed down through generations. Every meal tells a story of family, tradition, and resilience. We partner with local farms for fresh ingredients and provide our cooks with food safety training, business mentorship, and marketing support.',
    category: 'Food & Beverage',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=800&h=500&fit=crop',
    ],
    location: 'Miami, FL',
    foundedYear: 2024,
    founders: [
      {
        name: 'Sofia Reyes',
        role: 'CEO & Co-Founder',
        avatar: 'https://ui-avatars.com/api/?name=Sofia+Reyes&background=C2652A&color=fff&size=200&bold=true',
        bio: 'Former restaurant manager with 10+ years in the food industry. Passionate about empowering home cooks.',
      },
      {
        name: 'Luis Morales',
        role: 'CTO & Co-Founder',
        avatar: 'https://ui-avatars.com/api/?name=Luis+Morales&background=0D9488&color=fff&size=200&bold=true',
        bio: 'Full-stack engineer who built delivery logistics platforms. Believes technology should serve community.',
      },
    ],
    fundingGoal: 50000,
    fundingRaised: 32500,
    backers: 148,
    tags: ['Food Delivery', 'Community Kitchen', 'Cultural Heritage'],
    website: 'sabordecasa.co',
    featured: true,
  },
  {
    id: 'b2',
    name: 'Pan Dulce Bakery',
    tagline: 'Where every bite is a piece of home',
    description:
      'Pan Dulce Bakery is a brick-and-mortar bakery specializing in traditional Mexican and Central American pastries. From conchas and cuernos to tres leches cakes and empanadas, we bake everything fresh daily using recipes from our abuela. We are expanding to a second location and launching a subscription box to ship our pastries nationwide. Our mission is to keep these traditions alive while creating living-wage jobs in our neighborhood.',
    category: 'Food & Beverage',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1486427944544-d2c246c4df4e?w=800&h=500&fit=crop',
    ],
    location: 'Chicago, IL',
    foundedYear: 2022,
    founders: [
      {
        name: 'Elena Gutierrez',
        role: 'Founder & Head Baker',
        avatar: 'https://ui-avatars.com/api/?name=Elena+Gutierrez&background=F59E0B&color=fff&size=200&bold=true',
        bio: 'Third-generation baker from Oaxaca. Trained at Le Cordon Bleu. Making abuela proud one concha at a time.',
      },
    ],
    fundingGoal: 35000,
    fundingRaised: 28700,
    backers: 203,
    tags: ['Bakery', 'Mexican Pastries', 'Subscription Box'],
    website: 'pandulcebakery.com',
    featured: true,
  },
  {
    id: 'b3',
    name: 'NexoTech Labs',
    tagline: 'AI-powered tools for underbanked Latino businesses',
    description:
      'NexoTech Labs builds accessible fintech and AI tools specifically designed for the 60% of Latino small businesses that are underbanked or unbanked. Our flagship product is an AI bookkeeper that speaks Spanish, understands cash-heavy businesses, and helps owners track income, expenses, and tax obligations through WhatsApp. We are bridging the digital divide one negocio at a time.',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    ],
    location: 'Austin, TX',
    foundedYear: 2024,
    founders: [
      {
        name: 'Carlos Mendoza',
        role: 'CEO & Founder',
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=0D9488&color=fff&size=200&bold=true',
        bio: 'Ex-Google engineer. First-gen college grad. Building the tools his parents never had access to.',
      },
      {
        name: 'Valentina Torres',
        role: 'CPO & Co-Founder',
        avatar: 'https://ui-avatars.com/api/?name=Valentina+Torres&background=EC4899&color=fff&size=200&bold=true',
        bio: 'Former product lead at Stripe. Focused on making financial tools accessible to every community.',
      },
    ],
    fundingGoal: 75000,
    fundingRaised: 41200,
    backers: 89,
    tags: ['Fintech', 'AI', 'Financial Inclusion'],
    website: 'nexotechlabs.io',
    featured: true,
  },
  {
    id: 'b4',
    name: 'Raices Clothing',
    tagline: 'Streetwear meets ancestral pride',
    description:
      'Raices Clothing creates premium streetwear that celebrates Latin American indigenous art and heritage. Each collection is designed in collaboration with artisans from Mexico, Guatemala, and Peru, ensuring fair trade and cultural respect. Our designs blend modern street fashion with traditional patterns like huipil embroidery and Aztec geometry. 10% of every sale funds art education programs in indigenous communities.',
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=500&fit=crop',
    ],
    location: 'Los Angeles, CA',
    foundedYear: 2023,
    founders: [
      {
        name: 'Diego Ramirez',
        role: 'Creative Director & Founder',
        avatar: 'https://ui-avatars.com/api/?name=Diego+Ramirez&background=7C3AED&color=fff&size=200&bold=true',
        bio: 'Colombian-born designer who worked with Nike and Adidas before launching his own heritage-inspired brand.',
      },
    ],
    fundingGoal: 40000,
    fundingRaised: 18900,
    backers: 127,
    tags: ['Fashion', 'Indigenous Art', 'Fair Trade'],
    website: 'raicesclothing.com',
    featured: false,
  },
  {
    id: 'b5',
    name: 'Cafecito Hub',
    tagline: 'More than coffee, it\'s community',
    description:
      'Cafecito Hub is a specialty coffee shop and coworking space designed for Latino entrepreneurs, freelancers, and creatives. We source beans directly from small farms in Colombia, Honduras, and Guatemala, paying 3x the fair trade minimum. Our space hosts weekly networking events, mentorship circles, and pitch nights. The goal is to become the "third place" where Latino professionals build wealth together over great coffee.',
    category: 'Food & Beverage',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800&h=500&fit=crop',
    ],
    location: 'Houston, TX',
    foundedYear: 2023,
    founders: [
      {
        name: 'Isabella Herrera',
        role: 'Founder & CEO',
        avatar: 'https://ui-avatars.com/api/?name=Isabella+Herrera&background=C2652A&color=fff&size=200&bold=true',
        bio: 'Honduran-American with a passion for specialty coffee and community spaces. Former barista turned entrepreneur.',
      },
      {
        name: 'Mateo Cruz',
        role: 'Operations Lead',
        avatar: 'https://ui-avatars.com/api/?name=Mateo+Cruz&background=0D9488&color=fff&size=200&bold=true',
        bio: 'Ran logistics for Blue Bottle Coffee. Now building supply chains that actually benefit farmers.',
      },
    ],
    fundingGoal: 60000,
    fundingRaised: 54300,
    backers: 312,
    tags: ['Coffee', 'Coworking', 'Networking'],
    website: 'cafecitohub.com',
    featured: false,
  },
  {
    id: 'b6',
    name: 'Fuerza Fitness',
    tagline: 'Wellness rooted in cultura',
    description:
      'Fuerza Fitness is a hybrid fitness studio offering in-person and virtual classes that blend modern workout science with Latin dance, traditional movement practices, and culturally relevant nutrition coaching. Our trainers are bilingual and understand the unique health challenges facing Latino communities. We offer sliding-scale memberships so price is never a barrier to health. Our app features meal plans with traditional recipes reimagined for optimal nutrition.',
    category: 'Health & Fitness',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=500&fit=crop',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=500&fit=crop',
    ],
    location: 'Washington, DC',
    foundedYear: 2024,
    founders: [
      {
        name: 'Ana Castillo',
        role: 'Founder & Head Coach',
        avatar: 'https://ui-avatars.com/api/?name=Ana+Castillo&background=EC4899&color=fff&size=200&bold=true',
        bio: 'Salvadoran-American certified personal trainer. Former college athlete. Passionate about culturally-inclusive wellness.',
      },
    ],
    fundingGoal: 30000,
    fundingRaised: 12800,
    backers: 67,
    tags: ['Fitness', 'Latin Dance', 'Wellness'],
    website: 'fuerzafitness.co',
    featured: false,
  },
];
