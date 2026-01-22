export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  price?: number;
  url: string; // Public URL to the skill that customers receive after purchase
  tags: string[];
  created_at: string;
}
