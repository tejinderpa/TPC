import { useState } from 'react';
import AlumniForm from '../components/forms/AlumniForm';

export default function AlumniList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    batch: 'all',
    company: 'all',
    location: 'all'
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);

  const handleFormSubmit = (formData) => {
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
    setIsFormOpen(false);
    setSelectedAlumni(null);
  };

  // Mock data
  const mockAlumni = [
    {
      id: 1,
      name: 'Alice Johnson',
      batch: '2024',
      company: 'Google',
      role: 'Senior Software Engineer',
      location: 'Mountain View, CA',
      linkedin: 'https://linkedin.com/in/alice',
      email: 'alice@example.com',
      achievements: ['Led ML team', 'Published 2 papers'],
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 2,
      name: 'David Chen',
      batch: '2023',
      company: 'Microsoft',
      role: 'Product Manager',
      location: 'Seattle, WA',
      linkedin: 'https://linkedin.com/in/david',
      email: 'david@example.com',
      achievements: ['Launched major product feature', 'Mentored 5 interns'],
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 3,
      name: 'Sarah Williams',
      batch: '2022',
      company: 'Amazon',
      role: 'Software Development Engineer',
      location: 'New York, NY',
      linkedin: 'https://linkedin.com/in/sarah',
      email: 'sarah@example.com',
      achievements: ['Built scalable cloud architecture', 'AWS Certified'],
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 4,
      name: 'Michael Rodriguez',
      batch: '2023',
      company: 'Meta',
      role: 'Research Scientist',
      location: 'Menlo Park, CA',
      linkedin: 'https://linkedin.com/in/michael',
      email: 'michael@example.com',
      achievements: ['Published in top conferences', 'Patent holder'],
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 5,
      name: 'Emily Kim',
      batch: '2024',
      company: 'Apple',
      role: 'UX Designer',
      location: 'Cupertino, CA',
      linkedin: 'https://linkedin.com/in/emily',
      email: 'emily@example.com',
      achievements: ['Design system lead', 'Speaker at Design Week'],
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: 6,
      name: 'James Wilson',
      batch: '2022',
      company: 'Netflix',
      role: 'Senior Data Engineer',
      location: 'Los Gatos, CA',
      linkedin: 'https://linkedin.com/in/james',
      email: 'james@example.com',
      achievements: ['Built data pipeline', 'Reduced processing time by 60%'],
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Alumni Directory</h1>
          <p className="mt-2 text-sm text-gray-700">
            Connect with our successful alumni network and explore their journeys.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setSelectedAlumni(null);
              setIsFormOpen(true);
            }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add alumni
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            name="search"
            id="search"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Search alumni..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="batch" className="block text-sm font-medium text-gray-700">
            Batch
          </label>
          <select
            id="batch"
            name="batch"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.batch}
            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
          >
            <option value="all">All Batches</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockAlumni.map((person) => (
          <div
            key={person.id}
            className="relative flex flex-col rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-4">
              <img
                src={person.imageUrl}
                alt={person.name}
                className="h-12 w-12 rounded-full"
              />
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-gray-900">{person.name}</h3>
                <p className="text-sm text-gray-500">{person.role}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedAlumni(person);
                  setIsFormOpen(true);
                }}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {person.company}
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {person.location}
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                Batch of {person.batch}
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Achievements</h4>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
                {person.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => window.open(person.linkedin, '_blank')}
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                LinkedIn
              </button>
              <button
                onClick={() => window.location.href = `mailto:${person.email}`}
                className="flex-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-100"
              >
                Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Alumni Form Dialog */}
      <AlumniForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedAlumni(null);
        }}
        alumni={selectedAlumni}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}