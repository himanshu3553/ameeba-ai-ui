import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { promptAPI } from '../../services/api';
import PromptCard from './PromptCard';
import PromptForm from './PromptForm';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import { showToast } from '../../utils/toast';

const PromptList = ({ projectId: propProjectId, showCreateButton = true }) => {
  const { id: routeProjectId } = useParams();
  const projectId = propProjectId || routeProjectId;
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await promptAPI.getPrompts(projectId);
      if (response.success) {
        setPrompts(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch prompts');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchPrompts();
    }
  }, [projectId]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);
      const response = await promptAPI.createPrompt(projectId, formData);
      if (response.success) {
        showToast('Prompt created successfully!', 'success');
        setShowForm(false);
        fetchPrompts();
      } else {
        showToast(response.message || 'Failed to create prompt', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create prompt', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading prompts..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchPrompts} />;
  }

  return (
    <div>
      <div className={`d-flex ${showCreateButton ? 'justify-content-between' : ''} align-items-center mb-3`}>
        <h5 className="mb-0">Prompts</h5>
        {showCreateButton && (
          <button className="btn btn-sm btn-primary" onClick={() => setShowForm(true)}>
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
            Create Prompt
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Create New Prompt</h6>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowForm(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="card-body">
            <PromptForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              isLoading={formLoading}
            />
          </div>
        </div>
      )}

      {prompts.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted">No prompts found. Create your first prompt to get started!</p>
        </div>
      ) : (
        <div className="row">
          {prompts.map((prompt) => (
            <PromptCard key={prompt._id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptList;

