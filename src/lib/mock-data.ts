export type User = {
  id: string;
  name: string;
  avatar?: string;
  email: string;
};

export type Goal = {
  id: string;
  title: string;
  type: 'count' | 'percentage' | 'binary';
  target_value: number;
  current_value: number;
  owner_id: string;
  group_id?: string;
  frequency: string;
  history?: { date: string; value: number }[];
};

export type Win = {
  id: string;
  title: string;
  owner_id: string;
  date: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  members: User[];
  goals: Goal[];
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Amanda', email: 'amanda@example.com', avatar: 'https://i.pravatar.cc/150?u=amanda' },
  { id: 'u2', name: 'Alexa', email: 'alexa@example.com', avatar: 'https://i.pravatar.cc/150?u=alexa' },
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'ACount for You',
    description: 'Self-improvement is easier when done together.',
    members: MOCK_USERS,
    goals: [
      {
        id: 'g_goal_1',
        title: 'Weekly Walking Goal',
        type: 'count',
        target_value: 28000,
        current_value: 12500,
        owner_id: 'u1',
        group_id: 'g1',
        frequency: 'weekly',
      },
      {
        id: 'g_goal_2',
        title: 'Monthly Reading',
        type: 'percentage',
        target_value: 100,
        current_value: 45,
        owner_id: 'u1',
        group_id: 'g1',
        frequency: 'monthly',
      },
    ],
  },
];

export const MOCK_PERSONAL_GOALS: Goal[] = [
  {
    id: 'p_goal_1',
    title: 'Sauna',
    type: 'count',
    target_value: 2,
    current_value: 1,
    owner_id: 'u1',
    frequency: 'weekly',
    history: [
      { date: 'Mon', value: 0 },
      { date: 'Tue', value: 0 },
      { date: 'Wed', value: 1 },
      { date: 'Thu', value: 1 },
      { date: 'Fri', value: 1 },
      { date: 'Sat', value: 1 },
      { date: 'Sun', value: 1 },
    ]
  },
  {
    id: 'p_goal_2',
    title: 'Meditate',
    type: 'count',
    target_value: 3,
    current_value: 2,
    owner_id: 'u1',
    frequency: 'weekly',
    history: [
      { date: 'Mon', value: 1 },
      { date: 'Tue', value: 1 },
      { date: 'Wed', value: 1 },
      { date: 'Thu', value: 2 },
      { date: 'Fri', value: 2 },
      { date: 'Sat', value: 2 },
      { date: 'Sun', value: 2 },
    ]
  },
  {
    id: 'p_goal_3',
    title: 'Yoga',
    type: 'count',
    target_value: 4,
    current_value: 3,
    owner_id: 'u2',
    frequency: 'weekly',
  },
  {
    id: 'p_goal_4',
    title: 'Reading',
    type: 'percentage',
    target_value: 100,
    current_value: 45,
    owner_id: 'u2',
    frequency: 'daily',
  },
];

export const MOCK_WINS: Win[] = [
  {
    id: 'w1',
    title: 'Finished packing for our move 📦',
    owner_id: 'u1',
    date: new Date().toISOString(),
  },
  {
    id: 'w2',
    title: 'Got a promotion at work! 🚀',
    owner_id: 'u1',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'w3',
    title: 'Ran my first 5k today! 🏃‍♀️',
    owner_id: 'u2',
    date: new Date().toISOString(),
  }
];
