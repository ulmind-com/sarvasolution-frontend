export interface User {
  id: string;
  name: string;
  email: string;
  sponsorId: string | null;
  leftPV: number;
  rightPV: number;
  balance: number;
  rank: string;
  avatar: string;
  status: 'active' | 'blocked';
  joinDate: string;
  leftChild?: string;
  rightChild?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  pv: number;
  image: string;
  category: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'withdrawal' | 'commission' | 'purchase' | 'bonus';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  description: string;
}

export const users: User[] = [
  {
    id: 'U001',
    name: 'Admin Master',
    email: 'admin@ulmind.com',
    sponsorId: null,
    leftPV: 125000,
    rightPV: 118000,
    balance: 250000,
    rank: 'Crown Diamond',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    status: 'active',
    joinDate: '2023-01-01',
    leftChild: 'U002',
    rightChild: 'U003'
  },
  {
    id: 'U002',
    name: 'Rahul Sharma',
    email: 'user@ulmind.com',
    sponsorId: 'U001',
    leftPV: 45000,
    rightPV: 42000,
    balance: 50000,
    rank: 'Diamond',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahul',
    status: 'active',
    joinDate: '2023-02-15',
    leftChild: 'U004',
    rightChild: 'U005'
  },
  {
    id: 'U003',
    name: 'Priya Patel',
    email: 'priya@ulmind.com',
    sponsorId: 'U001',
    leftPV: 38000,
    rightPV: 35000,
    balance: 42000,
    rank: 'Platinum',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    status: 'active',
    joinDate: '2023-02-20',
    leftChild: 'U006',
    rightChild: 'U007'
  },
  {
    id: 'U004',
    name: 'Amit Kumar',
    email: 'amit@ulmind.com',
    sponsorId: 'U002',
    leftPV: 15000,
    rightPV: 14000,
    balance: 18000,
    rank: 'Gold',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
    status: 'active',
    joinDate: '2023-03-10',
    leftChild: 'U008',
    rightChild: 'U009'
  },
  {
    id: 'U005',
    name: 'Sneha Reddy',
    email: 'sneha@ulmind.com',
    sponsorId: 'U002',
    leftPV: 12000,
    rightPV: 11000,
    balance: 15000,
    rank: 'Gold',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sneha',
    status: 'active',
    joinDate: '2023-03-15',
    leftChild: 'U010',
    rightChild: 'U011'
  },
  {
    id: 'U006',
    name: 'Vikram Singh',
    email: 'vikram@ulmind.com',
    sponsorId: 'U003',
    leftPV: 8000,
    rightPV: 7500,
    balance: 12000,
    rank: 'Silver',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vikram',
    status: 'active',
    joinDate: '2023-04-01',
    leftChild: 'U012',
    rightChild: 'U013'
  },
  {
    id: 'U007',
    name: 'Neha Gupta',
    email: 'neha@ulmind.com',
    sponsorId: 'U003',
    leftPV: 6000,
    rightPV: 5500,
    balance: 8000,
    rank: 'Silver',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neha',
    status: 'blocked',
    joinDate: '2023-04-10'
  },
  {
    id: 'U008',
    name: 'Rajesh Mehta',
    email: 'rajesh@ulmind.com',
    sponsorId: 'U004',
    leftPV: 3000,
    rightPV: 2800,
    balance: 5000,
    rank: 'Bronze',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh',
    status: 'active',
    joinDate: '2023-05-01'
  },
  {
    id: 'U009',
    name: 'Kavita Nair',
    email: 'kavita@ulmind.com',
    sponsorId: 'U004',
    leftPV: 2500,
    rightPV: 2300,
    balance: 4000,
    rank: 'Bronze',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kavita',
    status: 'active',
    joinDate: '2023-05-15'
  },
  {
    id: 'U010',
    name: 'Suresh Iyer',
    email: 'suresh@ulmind.com',
    sponsorId: 'U005',
    leftPV: 2000,
    rightPV: 1800,
    balance: 3500,
    rank: 'Bronze',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=suresh',
    status: 'active',
    joinDate: '2023-06-01'
  },
  {
    id: 'U011',
    name: 'Deepa Joshi',
    email: 'deepa@ulmind.com',
    sponsorId: 'U005',
    leftPV: 1500,
    rightPV: 1400,
    balance: 2800,
    rank: 'Starter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=deepa',
    status: 'active',
    joinDate: '2023-06-15'
  },
  {
    id: 'U012',
    name: 'Arun Pillai',
    email: 'arun@ulmind.com',
    sponsorId: 'U006',
    leftPV: 1000,
    rightPV: 900,
    balance: 2000,
    rank: 'Starter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arun',
    status: 'active',
    joinDate: '2023-07-01'
  },
  {
    id: 'U013',
    name: 'Meera Das',
    email: 'meera@ulmind.com',
    sponsorId: 'U006',
    leftPV: 800,
    rightPV: 750,
    balance: 1500,
    rank: 'Starter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=meera',
    status: 'active',
    joinDate: '2023-07-15'
  }
];

export const products: Product[] = [
  {
    id: 'P001',
    name: 'Vital Health Supplement',
    description: 'Premium multivitamin complex for daily wellness support',
    price: 2499,
    pv: 25,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&h=300&fit=crop',
    category: 'Health'
  },
  {
    id: 'P002',
    name: 'Energy Boost Powder',
    description: 'Natural energy enhancement formula with adaptogens',
    price: 1899,
    pv: 20,
    image: 'https://images.unsplash.com/photo-1622484211148-c6b9e5c70295?w=300&h=300&fit=crop',
    category: 'Energy'
  },
  {
    id: 'P003',
    name: 'Protein Pro Max',
    description: 'High-quality whey protein for muscle recovery',
    price: 3499,
    pv: 35,
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop',
    category: 'Fitness'
  },
  {
    id: 'P004',
    name: 'Skin Glow Serum',
    description: 'Anti-aging serum with vitamin C and hyaluronic acid',
    price: 1299,
    pv: 15,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop',
    category: 'Beauty'
  },
  {
    id: 'P005',
    name: 'Omega-3 Fish Oil',
    description: 'Pure fish oil capsules for heart and brain health',
    price: 999,
    pv: 10,
    image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300&h=300&fit=crop',
    category: 'Health'
  },
  {
    id: 'P006',
    name: 'Detox Tea Collection',
    description: 'Organic herbal tea blend for natural detoxification',
    price: 799,
    pv: 8,
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&h=300&fit=crop',
    category: 'Wellness'
  },
  {
    id: 'P007',
    name: 'Collagen Peptides',
    description: 'Marine collagen for skin elasticity and joint support',
    price: 2199,
    pv: 22,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=300&fit=crop',
    category: 'Beauty'
  },
  {
    id: 'P008',
    name: 'Immunity Shield',
    description: 'Powerful immune system support with zinc and elderberry',
    price: 1599,
    pv: 18,
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=300&h=300&fit=crop',
    category: 'Health'
  }
];

export const transactions: Transaction[] = [
  {
    id: 'T001',
    userId: 'U002',
    type: 'commission',
    amount: 5000,
    status: 'completed',
    date: '2024-01-15',
    description: 'Binary commission payout'
  },
  {
    id: 'T002',
    userId: 'U002',
    type: 'withdrawal',
    amount: 10000,
    status: 'pending',
    date: '2024-01-18',
    description: 'Withdrawal request to bank'
  },
  {
    id: 'T003',
    userId: 'U002',
    type: 'purchase',
    amount: 2499,
    status: 'completed',
    date: '2024-01-10',
    description: 'Purchased Vital Health Supplement'
  },
  {
    id: 'T004',
    userId: 'U003',
    type: 'bonus',
    amount: 3000,
    status: 'completed',
    date: '2024-01-12',
    description: 'Rank advancement bonus'
  },
  {
    id: 'T005',
    userId: 'U004',
    type: 'withdrawal',
    amount: 5000,
    status: 'pending',
    date: '2024-01-17',
    description: 'Withdrawal request to bank'
  },
  {
    id: 'T006',
    userId: 'U002',
    type: 'commission',
    amount: 7500,
    status: 'completed',
    date: '2024-01-20',
    description: 'Weekly team bonus'
  },
  {
    id: 'T007',
    userId: 'U005',
    type: 'withdrawal',
    amount: 8000,
    status: 'rejected',
    date: '2024-01-14',
    description: 'Withdrawal request - insufficient KYC'
  },
  {
    id: 'T008',
    userId: 'U006',
    type: 'commission',
    amount: 2500,
    status: 'completed',
    date: '2024-01-19',
    description: 'Direct referral commission'
  }
];
