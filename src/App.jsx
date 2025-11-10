import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Home from './components/Home/Home';
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
              Ameeba AI
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
                <li className="nav-item">
                  <Link className="nav-link" to="/projects">
                    Projects
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/projects"
            element={
              <main className="container py-4">
                <ProjectList />
              </main>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <main className="container py-4">
                <ProjectDetail />
              </main>
            }
          />
          <Route
            path="/prompts/:id"
            element={
              <main className="container py-4">
                <PromptDetail />
              </main>
            }
          />
          <Route
            path="/versions/:id"
            element={
              <main className="container py-4">
                <VersionDetail />
              </main>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

