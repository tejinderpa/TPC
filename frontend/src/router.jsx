import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Jobs from './pages/Jobs';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Tpo from './pages/Tpo';
import Alumni from './pages/Alumni';
import StudentsList from './pages/StudentsList';
import JobsList from './pages/JobsList';
import AlumniList from './pages/AlumniList';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Student routes
      {
        path: 'students',
        element: <Students />,
      },
      {
        path: 'students/add',
        element: <Students />,
      },
      {
        path: 'students/edit/:id',
        element: <Students />,
      },
      {
        path: 'students/list',
        element: <StudentsList />,
      },
      // Company routes
      {
        path: 'companies',
        element: <Companies />,
      },
      {
        path: 'companies/:id',
        element: <CompanyDetail />,
      },
      {
        path: 'jobs/company/:companyId',
        element: <JobsList />,
      },
      // company add/edit routes removed temporarily
      // Alumni routes
      {
        path: 'alumni',
        element: <Alumni />,
      },
      {
        path: 'alumni/list',
        element: <AlumniList />,
      },
      // alumni add/edit routes removed temporarily
      // Job routes
      {
        path: 'jobs',
        element: <Jobs />,
      },
      {
        path: 'jobs/list',
        element: <JobsList />,
      },
      // job add/edit/apply routes removed temporarily
      // Other routes
      {
        path: 'tpo',
        element: <Tpo />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      // Catch-all route for 404s
      {
        path: '*',
        element: <ErrorBoundary />
      }
    ],
  },
]);