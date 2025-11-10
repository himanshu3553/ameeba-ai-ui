import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import ProjectList from './components/Project/ProjectList';
import ProjectDetail from './components/Project/ProjectDetail';
import PromptDetail from './components/Prompt/PromptDetail';
import VersionDetail from './components/PromptVersion/VersionDetail';

function App() {
  return (
    <Router>
      <div className="min-vh-100 bg-light">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <Link className="navbar-brand" to="/">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                className="bi bi-folder-fill me-2"
                viewBox="0 0 16 16"
              >
                <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819L.275 3.181A2 2 0 0 1 2.267 2h3.982a1.5 1.5 0 0 1 .759.139l.554 1.122A1.5 1.5 0 0 0 8.122 4h1.706a1.5 1.5 0 0 1 .759.139L11.277 5.5A1.5 1.5 0 0 0 12.122 6h1.706z" />
              </svg>
              Ameba UI
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Home
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <main className="container py-4">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/prompts/:id" element={<PromptDetail />} />
            <Route path="/versions/:id" element={<VersionDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-dark text-light py-3 mt-5">
          <div className="container text-center">
            <p className="mb-0">&copy; 2024 Ameba UI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

