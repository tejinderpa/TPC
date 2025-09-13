import { useParams } from 'react-router-dom'
import { companies as sampleCompanies } from './_companiesData'

export default function CompanyDetail() {
  const { id } = useParams()
  const cid = parseInt(id)
  const company = sampleCompanies.find(c => c.id === cid)

  if (!company) return <div>Company not found</div>

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">{company.name}</h1>
          <p className="mt-2 text-sm text-gray-700">{company.industry} — {company.location}</p>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded shadow">
        <p className="text-sm text-gray-700">{company.description}</p>
        <div className="mt-4">
          <a href={company.website} target="_blank" rel="noreferrer" className="text-indigo-600">Visit website</a>
        </div>
      </div>
    </div>
  )
}
