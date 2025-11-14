import { useState } from 'react';
import { Dialog } from '@headlessui/react';

export default function JobApplicationForm({ isOpen, onClose, job, onSubmit }) {
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: '',
    portfolio: '',
    availability: 'Immediate',
    expectedSalary: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Apply for {job?.title} at {job?.company}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                  Resume Link
                </label>
                <input
                  type="url"
                  name="resume"
                  id="resume"
                  value={formData.resume}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://drive.google.com/..."
                  required
                />
              </div>

              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                  Cover Letter
                </label>
                <textarea
                  name="coverLetter"
                  id="coverLetter"
                  rows={6}
                  value={formData.coverLetter}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Why are you a good fit for this position?"
                  required
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700">
                  Portfolio/GitHub Link (Optional)
                </label>
                <input
                  type="url"
                  name="portfolio"
                  id="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  Availability
                </label>
                <select
                  name="availability"
                  id="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="Immediate">Immediate</option>
                  <option value="2 weeks">2 weeks notice</option>
                  <option value="1 month">1 month notice</option>
                  <option value="More than 1 month">More than 1 month</option>
                </select>
              </div>

              <div>
                <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-700">
                  Expected Salary (Optional)
                </label>
                <input
                  type="text"
                  name="expectedSalary"
                  id="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g., $80,000/year"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Submit Application
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}