import { useState, useEffect } from 'react';
import { projectAPI } from '../../services/api';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import { showToast } from '../../utils/toast';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectAPI.getProjects();
      if (response.success) {
        setProjects(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);
      const response = await projectAPI.createProject(formData);
      if (response.success) {
        showToast('Project created successfully!', 'success');
        setShowForm(false);
        fetchProjects();
      } else {
        showToast(response.message || 'Failed to create project', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create project', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading projects..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProjects} />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Projects</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-plus-circle me-2"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
          Create Project
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Create New Project</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowForm(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="card-body">
            <ProjectForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              isLoading={formLoading}
            />
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No projects found. Create your first project to get started!</p>
        </div>
      ) : (
        <div className="row">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;

