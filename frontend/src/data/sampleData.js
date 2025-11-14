// Sample data for the TPC application

export const students = [
  {
    id: 1,
    name: 'Jane Cooper',
    email: 'jane.cooper@example.com',
    course: 'B.Tech',
    branch: 'Computer Science',
    year: '4th',
    cgpa: '8.5',
    status: 'Placed',
    company: 'Tech Corp',
  },
  {
    id: 2,
    name: 'Robert Fox',
    email: 'robert.fox@example.com',
    course: 'B.Tech',
    branch: 'Electronics',
    year: '3rd',
    cgpa: '9.1',
    status: 'Internship',
    company: 'Innovate Inc',
  },
  {
    id: 3,
    name: 'Emily Wilson',
    email: 'emily.wilson@example.com',
    course: 'M.Tech',
    branch: 'Computer Science',
    year: '2nd',
    cgpa: '8.8',
    status: 'Searching',
    company: null,
  },
  {
    id: 4,
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    course: 'B.Tech',
    branch: 'Mechanical',
    year: '4th',
    cgpa: '7.9',
    status: 'Placed',
    company: 'BuildTech Solutions',
  }
];

export const companies = [
  {
    id: 1,
    name: 'Tech Corp',
    industry: 'Software Development',
    location: 'Bangalore',
    website: 'https://techcorp.com',
    openPositions: 5,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Innovate Inc',
    industry: 'IT Services',
    location: 'Mumbai',
    website: 'https://innovateinc.com',
    openPositions: 3,
    status: 'Active',
  },
  {
    id: 3,
    name: 'BuildTech Solutions',
    industry: 'Construction',
    location: 'Delhi',
    website: 'https://buildtech.com',
    openPositions: 2,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Global Finance Ltd',
    industry: 'Finance',
    location: 'Pune',
    website: 'https://globalfinance.com',
    openPositions: 4,
    status: 'Upcoming',
  }
];

export const jobs = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'Bangalore',
    type: 'Full-time',
    experience: 'Fresher',
    salary: '8-12 LPA',
    skills: ['JavaScript', 'React', 'Node.js'],
    status: 'Open',
    deadline: '2025-10-15',
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'Innovate Inc',
    location: 'Mumbai',
    type: 'Full-time',
    experience: 'Fresher',
    salary: '10-14 LPA',
    skills: ['Product Management', 'Analytics', 'Communication'],
    status: 'Open',
    deadline: '2025-10-20',
  },
  {
    id: 3,
    title: 'Mechanical Engineer',
    company: 'BuildTech Solutions',
    location: 'Delhi',
    type: 'Full-time',
    experience: 'Fresher',
    salary: '6-8 LPA',
    skills: ['AutoCAD', 'Mechanical Design', 'Project Management'],
    status: 'Open',
    deadline: '2025-09-30',
  }
];

export const alumni = [
  {
    id: 1,
    name: 'David Chen',
    batch: '2022',
    company: 'Tech Corp',
    designation: 'Senior Software Engineer',
    location: 'Bangalore',
    course: 'B.Tech',
    branch: 'Computer Science',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    batch: '2021',
    company: 'Global Finance Ltd',
    designation: 'Financial Analyst',
    location: 'Mumbai',
    course: 'B.Tech',
    branch: 'Electronics',
  },
  {
    id: 3,
    name: 'Priya Patel',
    batch: '2023',
    company: 'Innovate Inc',
    designation: 'Product Manager',
    location: 'Bangalore',
    course: 'M.Tech',
    branch: 'Computer Science',
  }
];

export const notifications = [
  {
    id: 1,
    type: 'job',
    title: 'New job posted',
    description: 'Software Engineer position at Tech Corp',
    timestamp: '2h ago',
    status: 'unread',
  },
  {
    id: 2,
    type: 'placement',
    title: 'Student placed',
    description: 'Jane Cooper accepted offer at Tech Corp',
    timestamp: '5h ago',
    status: 'unread',
  },
  {
    id: 3,
    type: 'event',
    title: 'Upcoming placement drive',
    description: 'Global Finance Ltd campus drive on Oct 1',
    timestamp: '1d ago',
    status: 'read',
  }
];