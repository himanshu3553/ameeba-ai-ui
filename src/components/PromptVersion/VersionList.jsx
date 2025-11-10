import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { promptVersionAPI } from '../../services/api';
import VersionCard from './VersionCard';
import VersionForm from './VersionForm';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import { showToast } from '../../utils/toast';

const VersionList = ({ promptId: propPromptId }) => {
  const { id: routePromptId } = useParams();
  const promptId = propPromptId || routePromptId;
  const [versions, setVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const [versionsResponse, activeResponse] = await Promise.all([
        promptVersionAPI.getVersions(promptId),
        promptVersionAPI.getActiveVersion(promptId).catch(() => ({ success: false })),
      ]);

      if (versionsResponse.success) {
        setVersions(versionsResponse.data || []);
      } else {
        setError(versionsResponse.message || 'Failed to fetch versions');
      }

      if (activeResponse.success) {
        setActiveVersion(activeResponse.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch versions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (promptId) {
      fetchVersions();
    }
  }, [promptId]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);
      const response = await promptVersionAPI.createVersion(promptId, formData);
      if (response.success) {
        showToast('Version created successfully!', 'success');
        setShowCreateSheet(false);
        fetchVersions();
      } else {
        showToast(response.message || 'Failed to create version', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create version', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading versions..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchVersions} />;
  }

  return (
    <div>
      {activeVersion && (
        <div className="alert alert-success mb-3" role="alert">
          <strong>Active Version:</strong> {activeVersion.versionName || activeVersion.version} -{' '}
          {activeVersion.promptText.substring(0, 100)}
          {activeVersion.promptText.length > 100 ? '...' : ''}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Versions</h5>
        <button className="btn btn-link text-primary p-0 text-decoration-none" onClick={() => setShowCreateSheet(true)} style={{ border: 'none', background: 'none' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-plus-circle me-1"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
          Create Version
        </button>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">No versions found. Create your first version to get started!</p>
        </div>
      ) : (
        <div className="row">
          {versions.map((version) => (
            <VersionCard key={version._id} version={version} />
          ))}
        </div>
      )}

      {/* Side Sheet for Creating Version */}
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
                <h5 className="mb-0">Create a new Version</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateSheet(false)}
                  aria-label="Close"
                />
              </div>

              {/* Body */}
              <div className="flex-grow-1 p-4">
                <VersionForm
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

export default VersionList;

