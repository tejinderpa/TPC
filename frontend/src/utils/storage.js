const STORAGE_KEYS = {
  AUTH: 'tpc_auth',
  STUDENTS: 'tpc_students',
  JOBS: 'tpc_jobs',
  ALUMNI: 'tpc_alumni',
  COMPANIES: 'tpc_companies',
};

export const storage = {
  // Authentication
  setAuth: (data) => localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(data)),
  getAuth: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTH));
    } catch {
      return null;
    }
  },
  clearAuth: () => localStorage.removeItem(STORAGE_KEYS.AUTH),

  // Students
  getStudents: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS)) || [];
    } catch {
      return [];
    }
  },
  setStudents: (data) => localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data)),
  addStudent: (student) => {
    const students = storage.getStudents();
    students.push({ ...student, id: Date.now() });
    storage.setStudents(students);
    return students;
  },
  updateStudent: (id, data) => {
    const students = storage.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = { ...students[index], ...data };
      storage.setStudents(students);
    }
    return students;
  },

  // Jobs
  getJobs: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS)) || [];
    } catch {
      return [];
    }
  },
  setJobs: (data) => localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(data)),
  addJob: (job) => {
    const jobs = storage.getJobs();
    jobs.push({ ...job, id: Date.now() });
    storage.setJobs(jobs);
    return jobs;
  },
  updateJob: (id, data) => {
    const jobs = storage.getJobs();
    const index = jobs.findIndex(j => j.id === id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...data };
      storage.setJobs(jobs);
    }
    return jobs;
  },

  // Alumni
  getAlumni: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ALUMNI)) || [];
    } catch {
      return [];
    }
  },
  setAlumni: (data) => localStorage.setItem(STORAGE_KEYS.ALUMNI, JSON.stringify(data)),
  addAlumni: (alumni) => {
    const alumniList = storage.getAlumni();
    alumniList.push({ ...alumni, id: Date.now() });
    storage.setAlumni(alumniList);
    return alumniList;
  },
  updateAlumni: (id, data) => {
    const alumniList = storage.getAlumni();
    const index = alumniList.findIndex(a => a.id === id);
    if (index !== -1) {
      alumniList[index] = { ...alumniList[index], ...data };
      storage.setAlumni(alumniList);
    }
    return alumniList;
  },

  // Companies
  getCompanies: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPANIES)) || [];
    } catch {
      return [];
    }
  },
  setCompanies: (data) => localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(data)),
  addCompany: (company) => {
    const companies = storage.getCompanies();
    companies.push({ ...company, id: Date.now() });
    storage.setCompanies(companies);
    return companies;
  },
  updateCompany: (id, data) => {
    const companies = storage.getCompanies();
    const index = companies.findIndex(c => c.id === id);
    if (index !== -1) {
      companies[index] = { ...companies[index], ...data };
      storage.setCompanies(companies);
    }
    return companies;
  },
};