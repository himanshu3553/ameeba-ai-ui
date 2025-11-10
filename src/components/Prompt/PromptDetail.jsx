import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { promptAPI, API_BASE_URL } from '../../services/api';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import Breadcrumb from '../Common/Breadcrumb';
import VersionList from '../PromptVersion/VersionList';
import PromptForm from './PromptForm';
import { formatDate } from '../../utils/formatDate';
import { showToast } from '../../utils/toast';

const PromptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPrompt = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await promptAPI.getPrompt(id);
      if (response.success) {
        setPrompt(response.data);
      } else {
        setError(response.message || 'Prompt not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch prompt');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompt();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);
      const response = await promptAPI.updatePrompt(id, formData);
      if (response.success) {
        showToast('Prompt updated successfully!', 'success');
        setShowEditForm(false);
        fetchPrompt();
      } else {
        showToast(response.message || 'Failed to update prompt', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update prompt', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await promptAPI.deletePrompt(id);
      if (response.success) {
        showToast('Prompt deleted successfully!', 'success');
        // Navigate back to project page
        if (prompt?.projectId?._id) {
          navigate(`/projects/${prompt.projectId._id}`);
        } else if (prompt?.projectId) {
          navigate(`/projects/${prompt.projectId}`);
        } else {
          navigate('/');
        }
      } else {
        showToast(response.message || 'Failed to delete prompt', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete prompt', 'error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <Loading message="Loading prompt..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchPrompt} />;
  }

  if (!prompt) {
    return <ErrorMessage message="Prompt not found" />;
  }

  const projectId = prompt.projectId?._id || prompt.projectId;
  const projectName = prompt.projectId?.name || 'Project';
  const activeVersionApiUrl = `${API_BASE_URL}/api/prompts/${id}/active`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('API URL copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy to clipboard', 'error');
    });
  };

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: projectName, to: `/projects/${projectId}` },
          { label: prompt.name },
        ]}
      />

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{prompt.name}</h4>
          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setShowEditForm(!showEditForm)}
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
              className="btn btn-sm btn-outline-danger"
              onClick={() => setShowDeleteConfirm(true)}
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
            <PromptForm
              prompt={prompt}
              onSubmit={handleUpdate}
              onCancel={() => setShowEditForm(false)}
              isLoading={formLoading}
            />
          ) : (
            <>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Project:</strong>{' '}
                  <Link to={`/projects/${projectId}`}>{projectName}</Link>
                </div>
                <div className="col-md-6">
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${prompt.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {prompt.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Created:</strong> {formatDate(prompt.createdAt)}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Last Updated:</strong> {formatDate(prompt.updatedAt)}
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <strong>Active Version API URL:</strong>
                  <div className="input-group mt-2">
                    <input
                      type="text"
                      className="form-control"
                      value={activeVersionApiUrl}
                      readOnly
                      style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => copyToClipboard(activeVersionApiUrl)}
                      title="Copy to clipboard"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-clipboard"
                        viewBox="0 0 16 16"
                      >
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                      </svg>
                    </button>
                  </div>
                  <small className="text-muted">
                    Use this endpoint to retrieve the active version of this prompt
                  </small>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <VersionList promptId={id} />

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
                <p>Are you sure you want to delete this prompt? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
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

export default PromptDetail;

