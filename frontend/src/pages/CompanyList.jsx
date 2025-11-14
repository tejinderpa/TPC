import { useState } from 'react';
import CompanyForm from '../components/forms/CompanyForm';

export default function CompanyList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: 'all',
    location: 'all'
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Mock data
  const mockCompanies = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      industry: 'Information Technology',
      location: 'San Francisco, CA',
      website: 'https://techcorp.example.com',
      description: 'Leading provider of enterprise software solutions.',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=128&h=128&q=80',
      contactEmail: 'contact@techcorp.example.com',
      contactPhone: '+1 (555) 123-4567',
      employeeCount: 5000,
      founded: 2005,
      jobCount: 12
    },
    {
      id: 2,
      name: 'Global Innovations',
      industry: 'Research & Development',
      location: 'Boston, MA',
      website: 'https://globalinnovations.example.com',
      description: 'Innovation lab focused on emerging technologies.',
      logo: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=128&h=128&q=80',
      contactEmail: 'hr@globalinnovations.example.com',
      contactPhone: '+1 (555) 234-5678',
      employeeCount: 2500,
      founded: 2010,
      jobCount: 8
    },
    {
      id: 3,
      name: 'DataSense Analytics',
      industry: 'Data Analytics',
      location: 'Seattle, WA',
      website: 'https://datasense.example.com',
      description: 'Data analytics and machine learning solutions.',
      logo: 'https://images.unsplash.com/photo-1529612700005-e35377bf1415?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=128&h=128&q=80',
      contactEmail: 'careers@datasense.example.com',
      contactPhone: '+1 (555) 345-6789',
      employeeCount: 1200,
      founded: 2015,
      jobCount: 5
    }
  ];

  const handleFormSubmit = (formData) => {
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
    setIsFormOpen(false);
    setSelectedCompany(null);
  };

  // Get unique industries and locations for filters
  const industries = [...new Set(mockCompanies.map(company => company.industry))];
  const locations = [...new Set(mockCompanies.map(company => company.location))];

  // Filter companies based on search term and filters
  const filteredCompanies = mockCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = filters.industry === 'all' || company.industry === filters.industry;
    const matchesLocation = filters.location === 'all' || company.location === filters.location;
    return matchesSearch && matchesIndustry && matchesLocation;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
          <p className="mt-2 text-sm text-gray-700">
            Browse and manage companies registered with the placement cell.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setSelectedCompany(null);
              setIsFormOpen(true);
            }}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add company
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            id="industry"
            name="industry"
            value={filters.industry}
            onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Industries</option>
            {industries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <select
            id="location"
            name="location"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <div
            key={company.id}
            className="flex flex-col rounded-lg border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start space-x-4 p-6">
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="h-12 w-12 flex-shrink-0 rounded-md object-contain"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {company.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {company.industry}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCompany(company);
                  setIsFormOpen(true);
                }}
                className="text-indigo-600 hover:text-indigo-900"
              >
                <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <p className="text-sm text-gray-500 line-clamp-2">
                {company.description}
              </p>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 space-y-3 text-sm text-gray-500">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {company.location}
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {company.employeeCount.toLocaleString()} employees
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Founded {company.founded}
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {company.jobCount} active jobs
              </div>
            </div>

            <div className="border-t border-gray-200 px-6 py-4 space-y-3">
              <button
                onClick={() => window.open(company.website, '_blank')}
                className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Visit Website
              </button>
              <button
                onClick={() => window.location.href = `mailto:${company.contactEmail}`}
                className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-600 hover:bg-indigo-50"
              >
                Contact Company
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Company Form Dialog */}
      <CompanyForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}