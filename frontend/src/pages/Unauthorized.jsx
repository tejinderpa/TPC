import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturn = () => {
    // Navigate based on user role
    if (!user) {
      navigate('/login');
      return;
    }

    switch (user.role) {
      case 'STUDENT':
        navigate('/jobs/list');
        break;
      case 'COMPANY':
        navigate('/students/list');
        break;
      case 'TPO':
        navigate('/');
        break;
      case 'ALUMNI':
        navigate('/alumni/list');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Unauthorized Access
          </h2>
          <p className="mt-4 text-center text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleReturn}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}