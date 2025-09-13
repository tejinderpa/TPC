export default function Profile() {
  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    rollNo: "2021CS001",
    branch: "Computer Science",
    cgpa: "8.5",
    placementStatus: "Not Placed"
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <div className="mt-1 text-sm text-gray-900">{user.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 text-sm text-gray-900">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <div className="mt-1 text-sm text-gray-900">{user.role}</div>
              </div>
            </div>
          </div>
          
          {/* Additional sections can be added here based on role */}
          {user.role === 'STUDENT' && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">Academic Information</h2>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                  <div className="mt-1 text-sm text-gray-900">{user.rollNo || 'Not available'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <div className="mt-1 text-sm text-gray-900">{user.branch || 'Not available'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CGPA</label>
                  <div className="mt-1 text-sm text-gray-900">{user.cgpa || 'Not available'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Placement Status</label>
                  <div className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.placementStatus === 'Placed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.placementStatus || 'Not Placed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}