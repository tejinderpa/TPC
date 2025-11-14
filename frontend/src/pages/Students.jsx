import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { students } from '../data/sampleData'
import StudentForm from '../components/forms/StudentForm'
import { storage } from '../utils/storage'

export default function Students() {
  const navigate = useNavigate()
  const location = useLocation()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [localStudents, setLocalStudents] = useState(() => {
    const stored = storage.getStudents()
    return stored && stored.length ? stored : students
  })

  useEffect(() => {
    // open add
    if (location.pathname.endsWith('/students/add')) {
      setSelectedStudent(null)
      setIsFormOpen(true)
    }

    // open edit
    const editMatch = location.pathname.match(/\/students\/edit\/(\d+)/)
    if (editMatch) {
      const id = parseInt(editMatch[1])
      const s = localStudents.find(st => st.id === id)
      if (s) {
        setSelectedStudent(s)
        setIsFormOpen(true)
      }
    }
  }, [location.pathname, localStudents])

  const filteredStudents = localStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.branch || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || (student.status || '').toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const handleFormSubmit = (formData) => {
    if (selectedStudent) {
      const updated = storage.updateStudent(selectedStudent.id, formData)
      setLocalStudents(updated)
    } else {
      const updated = storage.addStudent(formData)
      setLocalStudents(updated)
    }
    setIsFormOpen(false)
    navigate('/students')
  }

  return (
    <>
      <div>
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Students</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all students in the system including their name, course, branch, and placement status.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => navigate('/students/add')}
              className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add student
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Search students..."
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <select
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="placed">Placed</option>
              <option value="internship">Internship</option>
              <option value="searching">Searching</option>
            </select>
          </div>
          <div className="col-span-1">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
              }}
              className="w-full rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Course
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Branch
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Year
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        CGPA
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {student.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.course}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.branch}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.year}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{student.cgpa}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={`inline-flex items-center rounded-md ${
                            student.status === 'Placed' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'
                          } px-2 py-1 text-xs font-medium ring-1 ring-inset`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => navigate(`/students/edit/${student.id}`)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => navigate(`/students/${student.id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            {student.status === 'Searching' && (
                              <button
                                onClick={() => navigate(`/jobs/list?student=${student.id}`)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Find Jobs
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
      </div>

      <StudentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedStudent(null)
          navigate('/students')
        }}
        student={selectedStudent}
        onSubmit={(formData) => handleFormSubmit(formData)}
      />
    </>
  )
}
