import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleQuickPost = () => {
    navigate('/jobs/list');
  };

  const handleViewMore = (section) => {
    switch (section) {
      case 'students':
        navigate('/students/list');
        break;
      case 'jobs':
        navigate('/jobs/list');
        break;
      case 'alumni':
        navigate('/alumni/list');
        break;
      case 'activity':
        // For now, just show an alert
        alert('Activity page coming soon!');
        break;
      case 'statistics':
        // For now, just show an alert
        alert('Statistics page coming soon!');
        break;
      default:
        break;
    }
  };

  const handleNotification = (id) => {
    alert(`Notification ${id} marked as read`);
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Stats cards */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="text-lg font-medium text-gray-900">1,234</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <button
                  onClick={() => handleViewMore('students')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all students →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Jobs</dt>
                    <dd className="text-lg font-medium text-gray-900">56</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <button
                  onClick={() => handleViewMore('jobs')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all jobs →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Connected Alumni</dt>
                    <dd className="text-lg font-medium text-gray-900">892</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <button
                  onClick={() => handleViewMore('alumni')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all alumni →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <button
              onClick={() => handleViewMore('activity')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all →
            </button>
          </div>
          <div className="mt-4 bg-white shadow rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              <li className="p-4 hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer">
                <div className="flex space-x-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">New job posted</h3>
                      <p className="text-sm text-gray-500">2h ago</p>
                    </div>
                    <p className="text-sm text-gray-500">Software Engineer position at Tech Corp</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotification('job1');
                        }}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </li>
              <li className="p-4 hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer">
                <div className="flex space-x-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Student placed</h3>
                      <p className="text-sm text-gray-500">5h ago</p>
                    </div>
                    <p className="text-sm text-gray-500">John Doe accepted offer at Innovation Inc</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotification('placement1');
                        }}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        Send Congrats
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMore('statistics');
                        }}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200"
                      >
                        View Stats
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}