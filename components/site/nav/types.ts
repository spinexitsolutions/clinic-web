export type NavData = {
  services: { id: string; slug: string; name: string; icon: string; priceFrom: number; short: string; image: string; featured: boolean }[];
  doctors: { id: string; slug: string; name: string; specialty: string; image: string; rating: number }[];
  posts: { slug: string; title: string; category: string }[];
};
