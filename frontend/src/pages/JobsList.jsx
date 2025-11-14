import { useState } from 'react';
import JobForm from '../components/forms/JobForm';
import JobApplicationForm from '../components/forms/JobApplicationForm';

export default function JobsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    location: 'all',
    experience: 'all'
  });
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Mock data
  const mockJobs = [
    {
      id: 1,
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Remote',
      type: 'Full-time',
      experience: '0-2 years',
      salary: '$80,000 - $100,000',
      postedDate: '2025-09-10',
      deadline: '2025-10-10',
      status: 'Active'
    },
    {
      id: 2,
      title: 'Frontend Developer',
      company: 'Innovation Inc',
      location: 'New York, NY',
      type: 'Full-time',
      experience: '1-3 years',
      salary: '$90,000 - $110,000',
      postedDate: '2025-09-11',
      deadline: '2025-10-11',
      status: 'Active'
    },
    {
      id: 3,
      title: 'Data Scientist',
      company: 'AI Solutions',
      location: 'San Francisco, CA',
      type: 'Full-time',
      experience: '2-5 years',
      salary: '$120,000 - $150,000',
      postedDate: '2025-09-09',
      deadline: '2025-10-09',
      status: 'Active'
    },
    {
      id: 4,
      title: 'Product Designer',
      company: 'Design Co',
      location: 'Remote',
      type: 'Contract',
      experience: '3+ years',
      salary: '$70/hour',
      postedDate: '2025-09-08',
      deadline: '2025-09-22',
      status: 'Active'
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'Cloud Tech',
      location: 'Seattle, WA',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '$100,000 - $130,000',
      postedDate: '2025-09-07',
      deadline: '2025-10-07',
      status: 'Active'
    },
    {
      id: 6,
      title: 'Machine Learning Engineer',
      company: 'AI Research Lab',
      location: 'Boston, MA',
      type: 'Full-time',
      experience: '1-3 years',
      salary: '$95,000 - $120,000',
      postedDate: '2025-09-06',
      deadline: '2025-10-06',
      status: 'Active'
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Job Listings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Available job opportunities for students and recent graduates.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setSelectedJob(null);
              setIsJobFormOpen(true);
            }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Post new job
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
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockJobs.map((job) => (
          <div
            key={job.id}
            className="relative flex flex-col rounded-lg border border-gray-300 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  job.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {job.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-500">{job.company}</p>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {job.location}
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {job.type}
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {job.salary}
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Posted: {new Date(job.postedDate).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Deadline: {new Date(job.deadline).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setIsApplicationFormOpen(true);
                }}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Apply Now
              </button>
              <button
                onClick={() => alert(`View details for ${job.title}`)}
                className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Job Form Dialog */}
      <JobForm
        isOpen={isJobFormOpen}
        onClose={() => {
          setIsJobFormOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        onSubmit={(formData) => {
          if (selectedJob) {
            alert(`Updating job: ${JSON.stringify(formData, null, 2)}`);
          } else {
            alert(`Posting new job: ${JSON.stringify(formData, null, 2)}`);
          }
        }}
      />

      {/* Job Application Form Dialog */}
      <JobApplicationForm
        isOpen={isApplicationFormOpen}
        onClose={() => {
          setIsApplicationFormOpen(false);
          setSelectedJob(null);
        }}
        job={selectedJob}
        onSubmit={(formData) => {
          alert(`Submitting application for ${selectedJob?.title}: ${JSON.stringify(formData, null, 2)}`);
        }}
      />
    </div>
  );
}