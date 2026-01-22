// src/data/academyData.ts
import { BookOpen, TrendingUp, Globe, BarChart3 } from 'lucide-react';

export const categories = [
  { id: 'blockchain', name: 'Blockchain Basics', icon: BookOpen, color: 'text-blue-500', count: 6 },
  { id: 'trading', name: 'Crypto Trading', icon: TrendingUp, color: 'text-green-500', count: 8 },
  { id: 'web3', name: 'Web3 & DeFi', icon: Globe, color: 'text-purple-500', count: 10 },
  { id: 'invest', name: 'Investment Strategies', icon: BarChart3, color: 'text-gold', count: 7 },
];

export const courses = [
  {
    id: 1,
    title: "Introduction to Blockchain Technology",
    instructor: "Sarah Johnson",
    rating: 4.9,
    reviews: 2456,
    duration: "3h 45min",
    level: "Beginner",
    price: 0,
    category: "Blockchain Basics",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&q=80",
    bestseller: true
  },
  {
    id: 2,
    title: "Mastering DeFi Protocols",
    instructor: "David Chen",
    rating: 4.8,
    reviews: 1023,
    duration: "8h 20min",
    level: "Advanced",
    price: 49,
    category: "Web3 & DeFi",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&q=80",
    bestseller: false
  },
  {
    id: 3,
    title: "Technical Analysis Masterclass",
    instructor: "Mike Ross",
    rating: 4.7,
    reviews: 850,
    duration: "6h 15min",
    level: "Intermediate",
    price: 29,
    category: "Crypto Trading",
    image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?w=500&q=80",
    bestseller: true
  },
  {
    id: 4,
    title: "NFTs & The Metaverse",
    instructor: "Emma Watson",
    rating: 4.6,
    reviews: 530,
    duration: "4h 00min",
    level: "Beginner",
    price: 0,
    category: "Web3 & DeFi",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&q=80",
    bestseller: false
  }
];

export const myLearning = [
  { ...courses[0], progress: 75, lastWatched: "Lecture 3.1" },
  { ...courses[2], progress: 15, lastWatched: "Lecture 1.4" }
];