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
  const [showCreateSheet, setShowCreateSheet] = useState(false);
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
        setShowCreateSheet(false);
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
        <button className="btn btn-primary" onClick={() => setShowCreateSheet(true)}>
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

      {/* Side Sheet for Creating Project */}
      {showCreateSheet && (
        <>
          {/* Backdrop */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040,
            }}
            onClick={() => setShowCreateSheet(false)}
          />
          {/* Side Sheet */}
          <div
            className="position-fixed top-0 end-0 h-100 bg-white shadow-lg"
            style={{
              width: '500px',
              maxWidth: '90vw',
              zIndex: 1050,
              overflowY: 'auto',
              animation: 'slideInRight 0.3s ease-out',
            }}
          >
            <div className="d-flex flex-column h-100">
              {/* Header */}
              <div className="border-bottom p-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Create a Project</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateSheet(false)}
                  aria-label="Close"
                />
              </div>

              {/* Body */}
              <div className="flex-grow-1 p-4">
                <ProjectForm
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreateSheet(false)}
                  isLoading={formLoading}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectList;

