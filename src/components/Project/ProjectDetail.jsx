import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectAPI, promptAPI } from '../../services/api';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import Breadcrumb from '../Common/Breadcrumb';
import PromptList from '../Prompt/PromptList';
import ProjectForm from './ProjectForm';
import { formatDate } from '../../utils/formatDate';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectAPI.getProject(id);
      if (response.success) {
        setProject(response.data);
      } else {
        setError(response.message || 'Project not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);
      const response = await projectAPI.updateProject(id, formData);
      if (response.success) {
        console.log('Project updated successfully!', response.data);
        setShowEditForm(false);
        fetchProject();
      } else {
        console.error('Failed to update project:', response.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to update project:', err.message || err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await projectAPI.deleteProject(id);
      if (response.success) {
        console.log('Project deleted successfully!');
        navigate('/');
      } else {
        console.error('Failed to delete project:', response.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to delete project:', err.message || err);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <Loading message="Loading project..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchProject} />;
  }

  if (!project) {
    return <ErrorMessage message="Project not found" />;
  }

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: project.name },
        ]}
      />

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{project.name}</h4>
          <div className="d-flex gap-3">
            <button
              className="btn btn-link text-primary p-0 text-decoration-none"
              onClick={() => setShowEditForm(!showEditForm)}
              style={{ border: 'none', background: 'none' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-pencil me-1"
                viewBox="0 0 16 16"
              >
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707 10.293 16h6.586l-7-7zm-9.761 5.175-.11.67L.5 13l.408-.245.11-.67-.377-.295-.377.295z" />
              </svg>
              Edit
            </button>
            <button
              className="btn btn-link text-danger p-0 text-decoration-none"
              onClick={() => setShowDeleteConfirm(true)}
              style={{ border: 'none', background: 'none' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-trash me-1"
                viewBox="0 0 16 16"
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path
                  fillRule="evenodd"
                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
        <div className="card-body">
          {showEditForm ? (
            <ProjectForm
              project={project}
              onSubmit={handleUpdate}
              onCancel={() => setShowEditForm(false)}
              isLoading={formLoading}
            />
          ) : (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${project.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {project.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="col-md-6">
                  <strong>Created:</strong> {formatDate(project.createdAt)}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Last Updated:</strong> {formatDate(project.updatedAt)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <PromptList projectId={id} showCreateButton={false} />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this project? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-link text-secondary p-0 text-decoration-none"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                  style={{ border: 'none', background: 'none' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-link text-danger p-0 text-decoration-none"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  style={{ border: 'none', background: 'none' }}
                >
                  {deleteLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

