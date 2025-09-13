import { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext';
import StudentForm from '../components/forms/StudentForm';
import { storage } from '../utils/storage';

export default function StudentsList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    year: 'all',
    branch: 'all',
    placementStatus: 'all'
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState(() => storage.getStudents());

  // Mock data
  // Filter students based on user role
  const filterStudentsByRole = (students) => {
    switch(user.role) {
      case ROLES.COMPANY:
        // Companies only see students who are not placed
        return students.filter(student => student.placementStatus === 'Not Placed');
      case ROLES.TPO:
        // TPO sees all students
        return students;
      case ROLES.STUDENT:
        // Students only see placed students for reference
        return students.filter(student => student.placementStatus === 'Placed');
      default:
        return [];
    }
  };

  const mockStudents = [
    {
      id: 1,
      name: 'John Doe',
      rollNo: '2021CS001',
      branch: 'Computer Science',
      year: '4th',
      cgpa: '8.5',
      placementStatus: 'Placed',
      company: 'Tech Corp'
    },
    {
      id: 2,
      name: 'Jane Smith',
      rollNo: '2021CS002',
      branch: 'Computer Science',
      year: '4th',
      cgpa: '9.2',
      placementStatus: 'Placed',
      company: 'Google'
    },
    {
      id: 3,
      name: 'Alice Johnson',
      rollNo: '2021EC001',
      branch: 'Electronics',
      year: '4th',
      cgpa: '8.8',
      placementStatus: 'Not Placed',
      company: null
    },
    {
      id: 4,
      name: 'Bob Wilson',
      rollNo: '2021ME001',
      branch: 'Mechanical',
      year: '4th',
      cgpa: '7.9',
      placementStatus: 'Placed',
      company: 'Ford'
    },
    {
      id: 5,
      name: 'Emma Davis',
      rollNo: '2022CS001',
      branch: 'Computer Science',
      year: '3rd',
      cgpa: '9.0',
      placementStatus: 'Not Placed',
      company: null
    },
    {
      id: 6,
      name: 'Michael Brown',
      rollNo: '2022EC002',
      branch: 'Electronics',
      year: '3rd',
      cgpa: '8.2',
      placementStatus: 'Not Placed',
      company: null
    }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          <p className="mt-2 text-sm text-gray-700">
            {user.role === ROLES.COMPANY 
              ? "View eligible students for recruitment opportunities."
              : user.role === ROLES.TPO 
                ? "Manage and monitor all student records and placement status."
                : "Access student information and placement details."}
          </p>
        </div>
        {user.role === ROLES.TPO && (
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setSelectedStudent(null);
                setIsFormOpen(true);
              }}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add student
            </button>
          </div>
        )}
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
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Add filters for year, branch, placement status */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            id="year"
            name="year"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            <option value="all">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Roll No</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Branch</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Year</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">CGPA</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filterStudentsByRole(mockStudents).map((student) => (
                    <tr key={student.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.rollNo}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.branch}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.year}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.cgpa}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          student.placementStatus === 'Placed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.placementStatus}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex space-x-3 justify-end">
                          {user.role === ROLES.TPO ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setIsFormOpen(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => alert(`Viewing details for ${student.name}`)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View details
                              </button>
                            </>
                          ) : user.role === ROLES.COMPANY ? (
                            <button
                              onClick={() => alert(`View student profile and schedule interview for ${student.name}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Profile
                            </button>
                          ) : (
                            <button
                              onClick={() => alert(`Viewing details for ${student.name}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View details
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Student Form Dialog */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSubmit={(formData) => {
          if (selectedStudent) {
            const updatedStudents = storage.updateStudent(selectedStudent.id, formData);
            setStudents(updatedStudents);
          } else {
            const updatedStudents = storage.addStudent(formData);
            setStudents(updatedStudents);
          }
          setIsFormOpen(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
}