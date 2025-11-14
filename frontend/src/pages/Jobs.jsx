import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { jobs } from '../data/sampleData'

export default function Jobs() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [salaryRange, setSalaryRange] = useState('all')
  const [jobType, setJobType] = useState('all')

  const searchParams = new URLSearchParams(location.search)
  const studentId = searchParams.get('student')

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSalary = salaryRange === 'all' || (() => {
      const minSalary = parseInt(job.salary.split('-')[0])
      switch(salaryRange) {
        case 'below-10': return minSalary < 10
        case '10-15': return minSalary >= 10 && minSalary < 15
        case 'above-15': return minSalary >= 15
        default: return true
      }
    })()

    const matchesType = jobType === 'all' || job.type.toLowerCase() === jobType.toLowerCase()

    return matchesSearch && matchesSalary && matchesType
  })

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Jobs</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all job openings including position, company, location, and requirements.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Post new job
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-6 mb-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Search jobs..."
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="all">All Salaries</option>
              <option value="below-10">Below 10 LPA</option>
              <option value="10-15">10-15 LPA</option>
              <option value="above-15">Above 15 LPA</option>
            </select>
          </div>
          <div>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="part-time">Part-time</option>
            </select>
          </div>
        </div>

        {studentId && (
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">Showing jobs matching your profile</p>
                <p className="mt-3 text-sm md:mt-0 md:ml-6">
                  <button
                    onClick={() => navigate('/jobs')}
                    className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
                  >
                    Clear filters
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Job Cards */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
          >
            <div className="p-6">
              <div className="flex w-full items-center justify-between space-x-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="truncate text-lg font-medium text-gray-900">{job.title}</h3>
                    <span className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      job.status === 'Open' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                    } ring-1 ring-inset`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-500">{job.company}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{job.location}</span>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  <span>{job.type}</span>
                </div>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span>{job.salary}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/apply/${job.id}`)}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    <svg className="mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    Apply Now
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <svg className="mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}