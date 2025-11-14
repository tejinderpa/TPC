import React from 'react'
import { useNavigate } from 'react-router-dom'

const iits = [
  { name: 'IIT Delhi', url: 'https://placement.iitd.ac.in' },
  { name: 'IIT Bombay', url: 'https://www.iitb.ac.in/placements' },
  { name: 'IIT Madras', url: 'https://placement.iitm.ac.in' },
  { name: 'IIT Kanpur', url: 'https://www.iitk.ac.in/spo' },
  { name: 'IIT Kharagpur', url: 'http://www.placement.iitkgp.ac.in' },
]

const nits = [
  { name: 'NIT Trichy', url: 'https://placement.nitt.edu' },
  { name: 'NIT Surathkal', url: 'https://placement.nitk.ac.in' },
  { name: 'NIT Warangal', url: 'https://nitw.ac.in/placement' },
  { name: 'NIT Rourkela', url: 'https://placement.nitrkl.ac.in' },
  { name: 'NIT Calicut', url: 'http://www.placement.nitc.ac.in' },
]

export default function Tpo() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">TPO Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">Training and Placement Office resources and coordination.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => navigate('/jobs')}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Manage Jobs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            <button
              onClick={() => navigate('/companies')}
              className="block w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              View Active Companies
            </button>
            <button
              onClick={() => navigate('/students')}
              className="block w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Manage Students
            </button>
            <button
              onClick={() => navigate('/alumni')}
              className="block w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Alumni Network
            </button>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Total Students</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">420</dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Placed</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">215</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* IITs Section */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">IIT Placement Cells</h3>
          <div className="mt-4 space-y-3">
            {iits.map((iit) => (
              <a
                key={iit.name}
                href={iit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                {iit.name}
                <span className="ml-2 text-gray-400">↗</span>
              </a>
            ))}
          </div>
        </div>

        {/* NITs Section */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">NIT Placement Cells</h3>
          <div className="mt-4 space-y-3">
            {nits.map((nit) => (
              <a
                key={nit.name}
                href={nit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
              >
                {nit.name}
                <span className="ml-2 text-gray-400">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
