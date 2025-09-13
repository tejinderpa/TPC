import { useState } from 'react'

const alumni = [
  {
    id: 1,
    name: 'Alex Johnson',
    batch: '2020',
    degree: 'B.Tech',
    branch: 'Computer Science',
    company: 'Google',
    position: 'Senior Software Engineer',
    location: 'Bangalore',
    imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  // Add more dummy data as needed
]

const mentorshipPosts = [
  {
    id: 1,
    author: 'Alex Johnson',
    title: 'Mock Interviews for Software Engineering Roles',
    description: 'Offering mock interviews and resume reviews for students interested in software engineering positions.',
    topic: 'Career Guidance',
    date: '2023-09-10',
  },
  // Add more dummy data as needed
]

export default function Alumni() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAlumni = alumni.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Alumni Network</h1>
          <p className="mt-2 text-sm text-gray-700">
            Connect with our alumni and explore mentorship opportunities.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add alumni
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6 mb-4">
        <input
          type="text"
          placeholder="Search alumni..."
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Alumni Cards */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAlumni.map((person) => (
          <div
            key={person.id}
            className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
          >
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="truncate text-sm font-medium text-gray-900">{person.name}</h3>
                  <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    {person.batch}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-gray-500">{person.position}</p>
                <p className="mt-1 truncate text-sm text-gray-500">{person.company}</p>
              </div>
              <img className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300" src={person.imageUrl} alt="" />
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex w-0 flex-1">
                  <a
                    href={`mailto:${person.email}`}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                  >
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Email
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <a
                    href="#"
                    className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                  >
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mentorship Opportunities */}
      <div className="mt-12">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Mentorship Opportunities</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mentorshipPosts.map((post) => (
            <div key={post.id} className="flex flex-col rounded-lg bg-white shadow">
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center gap-x-4">
                  <span className="text-xs leading-5 text-gray-500">{post.date}</span>
                  <span className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100">
                    {post.topic}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-x-4">
                  <div className="text-sm font-semibold leading-6 text-gray-900">{post.title}</div>
                </div>
                <div className="mt-4 flex flex-1 flex-col">
                  <p className="text-sm leading-6 text-gray-600">{post.description}</p>
                </div>
                <div className="mt-6 flex items-center gap-x-4">
                  <button
                    type="button"
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Learn more
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Apply for mentorship
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}