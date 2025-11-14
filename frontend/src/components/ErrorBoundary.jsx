import { useRouteError, Link } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Oops! Something went wrong
          </h2>
          <div className="mt-4 text-center">
            <p className="text-lg text-gray-600">
              {error.status === 404 ? (
                "The page you're looking for doesn't exist."
              ) : (
                "An unexpected error occurred."
              )}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {error.message}
            </p>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}