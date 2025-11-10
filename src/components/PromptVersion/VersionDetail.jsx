import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { promptVersionAPI } from '../../services/api';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import Breadcrumb from '../Common/Breadcrumb';
import VersionForm from './VersionForm';
import { formatDate } from '../../utils/formatDate';
import { showToast } from '../../utils/toast';

const VersionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [version, setVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchVersion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await promptVersionAPI.getVersion(id);
      if (response.success) {
        setVersion(response.data);
      } else {
        setError(response.message || 'Version not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch version');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersion();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);
      const response = await promptVersionAPI.updateVersion(id, formData);
      if (response.success) {
        showToast('Version updated successfully!', 'success');
        setShowEditForm(false);
        fetchVersion();
      } else {
        showToast(response.message || 'Failed to update version', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update version', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await promptVersionAPI.deleteVersion(id);
      if (response.success) {
        showToast('Version deleted successfully!', 'success');
        // Navigate back to prompt page
        if (version?.promptId?._id) {
          navigate(`/prompts/${version.promptId._id}`);
        } else if (version?.promptId) {
          navigate(`/prompts/${version.promptId}`);
        } else {
          navigate('/');
        }
      } else {
        showToast(response.message || 'Failed to delete version', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete version', 'error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <Loading message="Loading version..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchVersion} />;
  }

  if (!version) {
    return <ErrorMessage message="Version not found" />;
  }

  const promptId = version.promptId?._id || version.promptId;
  const promptName = version.promptId?.name || 'Prompt';
  const projectId = version.promptId?.projectId?._id || version.promptId?.projectId;
  const projectName = version.promptId?.projectId?.name || 'Project';

  return (
    <div>
      <Breadcrumb
        items={[
          { label: 'Home', to: '/' },
          { label: projectName, to: `/projects/${projectId}` },
          { label: promptName, to: `/prompts/${promptId}` },
          { label: version.versionName || version.version },
        ]}
      />

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">{version.versionName || version.version}</h4>
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
            <VersionForm
              version={version}
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
                  <strong>Prompt:</strong>{' '}
                  <Link to={`/prompts/${promptId}`}>{promptName}</Link>
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${version.isActive ? 'bg-success' : 'bg-secondary'} me-2`}>
                    {version.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {version.activePrompt && (
                    <span className="badge bg-primary">Active Prompt</span>
                  )}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Version:</strong> {version.versionName || version.version}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Created:</strong> {formatDate(version.createdAt)}
                </div>
                <div className="col-md-6 mt-2">
                  <strong>Last Updated:</strong> {formatDate(version.updatedAt)}
                </div>
              </div>
              <div className="mt-3">
                <strong>Prompt Text:</strong>
                <div className="card mt-2">
                  <div className="card-body bg-light">
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', margin: 0 }}>
                      {version.promptText}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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
                <p>Are you sure you want to delete this version? This action cannot be undone.</p>
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

export default VersionDetail;

