import { useState, useEffect } from 'react';
import { projectAPI, promptAPI, promptVersionAPI } from '../../services/api';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import ProjectForm from '../Project/ProjectForm';
import PromptForm from '../Prompt/PromptForm';
import VersionForm from '../PromptVersion/VersionForm';
import { showToast } from '../../utils/toast';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionLoading, setVersionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateProjectSheet, setShowCreateProjectSheet] = useState(false);
  const [createProjectLoading, setCreateProjectLoading] = useState(false);
  const [showCreatePromptSheet, setShowCreatePromptSheet] = useState(false);
  const [createPromptLoading, setCreatePromptLoading] = useState(false);
  const [showCreateVersionSheet, setShowCreateVersionSheet] = useState(false);
  const [createVersionLoading, setCreateVersionLoading] = useState(false);

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectAPI.getProjects();
      if (response.success) {
        const projectsData = response.data || [];
        setProjects(projectsData);
        // Auto-select first project if available
        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0]._id);
        } else {
          setSelectedProjectId(null);
        }
      } else {
        setError(response.message || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch prompts when project is selected
  const fetchPrompts = async () => {
    if (selectedProjectId) {
      try {
        setPromptsLoading(true);
        const response = await promptAPI.getPrompts(selectedProjectId);
        if (response.success) {
          const promptsData = response.data || [];
          setPrompts(promptsData);
          // Reset selections
          setSelectedPromptId(null);
          setSelectedPrompt(null);
          setVersions([]);
          setSelectedVersionId(null);
          setSelectedVersion(null);
          // Auto-select first prompt if available
          if (promptsData.length > 0) {
            setSelectedPromptId(promptsData[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch prompts:', err);
        setPrompts([]);
      } finally {
        setPromptsLoading(false);
      }
    } else {
      setPrompts([]);
      setSelectedPromptId(null);
      setSelectedPrompt(null);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [selectedProjectId]);

  // Fetch prompt details and versions when prompt is selected
  const fetchPromptAndVersions = async () => {
    if (selectedPromptId) {
      try {
        setVersionsLoading(true);
        // Fetch prompt details
        const promptResponse = await promptAPI.getPrompt(selectedPromptId);
        if (promptResponse.success) {
          setSelectedPrompt(promptResponse.data);
        }

        // Fetch versions
        const versionsResponse = await promptVersionAPI.getVersions(selectedPromptId);
        if (versionsResponse.success) {
          const versionsData = versionsResponse.data || [];
          setVersions(versionsData);
          // Auto-select first version if available
          if (versionsData.length > 0) {
            setSelectedVersionId(versionsData[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch prompt/versions:', err);
        setVersions([]);
        setSelectedPrompt(null);
      } finally {
        setVersionsLoading(false);
      }
    } else {
      setVersions([]);
      setSelectedPrompt(null);
      setSelectedVersionId(null);
      setSelectedVersion(null);
    }
  };

  useEffect(() => {
    fetchPromptAndVersions();
  }, [selectedPromptId]);

  // Fetch version details when version is selected
  useEffect(() => {
    if (selectedVersionId) {
      const fetchVersion = async () => {
        try {
          setVersionLoading(true);
          const response = await promptVersionAPI.getVersion(selectedVersionId);
          if (response.success) {
            setSelectedVersion(response.data);
          }
        } catch (err) {
          console.error('Failed to fetch version:', err);
          setSelectedVersion(null);
        } finally {
          setVersionLoading(false);
        }
      };

      fetchVersion();
    } else {
      setSelectedVersion(null);
    }
  }, [selectedVersionId]);

  const handleProjectChange = (e) => {
    const value = e.target.value;
    if (value === 'create-project') {
      // Open the create project side sheet
      setShowCreateProjectSheet(true);
      // Reset dropdown to currently selected project
      e.target.value = selectedProjectId || '';
    } else {
      setSelectedProjectId(value || null);
    }
  };

  const handlePromptClick = (promptId) => {
    setSelectedPromptId(promptId);
  };

  const handleVersionClick = (versionId) => {
    setSelectedVersionId(versionId);
  };

  const handleCreatePrompt = async (formData) => {
    if (!selectedProjectId) {
      showToast('Please select a project first', 'error');
      return;
    }

    try {
      setCreatePromptLoading(true);
      const response = await promptAPI.createPrompt(selectedProjectId, formData);
      if (response.success) {
        showToast('Prompt created successfully!', 'success');
        setShowCreatePromptSheet(false);
        // Refresh prompts list
        await fetchPrompts();
        // Auto-select the newly created prompt
        if (response.data?._id) {
          setSelectedPromptId(response.data._id);
        }
      } else {
        showToast(response.message || 'Failed to create prompt', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create prompt', 'error');
    } finally {
      setCreatePromptLoading(false);
    }
  };

  const handleCreateVersion = async (formData) => {
    if (!selectedPromptId) {
      showToast('Please select a prompt first', 'error');
      return;
    }

    try {
      setCreateVersionLoading(true);
      const response = await promptVersionAPI.createVersion(selectedPromptId, formData);
      if (response.success) {
        showToast('Version created successfully!', 'success');
        setShowCreateVersionSheet(false);
        // Refresh versions list
        await fetchPromptAndVersions();
        // Auto-select the newly created version
        if (response.data?._id) {
          setSelectedVersionId(response.data._id);
        }
      } else {
        showToast(response.message || 'Failed to create version', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create version', 'error');
    } finally {
      setCreateVersionLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      setCreateProjectLoading(true);
      const response = await projectAPI.createProject(formData);
      if (response.success) {
        showToast('Project created successfully!', 'success');
        setShowCreateProjectSheet(false);
        // Refresh projects list
        await fetchProjects();
        // Auto-select the newly created project
        if (response.data?._id) {
          setSelectedProjectId(response.data._id);
        }
      } else {
        showToast(response.message || 'Failed to create project', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to create project', 'error');
    } finally {
      setCreateProjectLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  if (loading) {
    return <Loading message="Loading projects..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Show empty state if no projects exist
  if (projects.length === 0) {
    return (
      <>
        <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: 'calc(100vh - 56px)' }}>
          <div className="text-center">
            <h4 className="mb-3">No projects found</h4>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowCreateProjectSheet(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-plus-circle me-2"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
              Create a Project
            </button>
          </div>
        </div>

        {/* Side Sheet for Creating Project */}
        {showCreateProjectSheet && (
          <>
            {/* Backdrop */}
            <div
              className="position-fixed top-0 start-0 w-100 h-100"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1040,
              }}
              onClick={() => setShowCreateProjectSheet(false)}
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
                    onClick={() => setShowCreateProjectSheet(false)}
                    aria-label="Close"
                  />
                </div>

                {/* Body */}
                <div className="flex-grow-1 p-4">
                  <ProjectForm
                    onSubmit={handleCreateProject}
                    onCancel={() => setShowCreateProjectSheet(false)}
                    isLoading={createProjectLoading}
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
      </>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div className="border-bottom bg-white p-3">
        <div className="d-flex align-items-center justify-content-between">
          <h3 className="mb-0">{selectedProject?.name || 'Ameeba AI'}</h3>
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="project-select" className="mb-0">
              Project Name:
            </label>
            <select
              id="project-select"
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: '200px' }}
              value={selectedProjectId || ''}
              onChange={handleProjectChange}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
              <option value="create-project" style={{ fontStyle: 'italic' }}>
                + Create a Project
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content - Three Columns */}
      <div className="flex-grow-1 d-flex" style={{ overflow: 'hidden' }}>
        {/* Left Column - Prompt List */}
        <div className="border-end bg-white" style={{ width: '300px', overflowY: 'auto' }}>
          <div className="p-3 border-bottom">
            <h5 className="mb-0">Prompt List</h5>
          </div>
          {promptsLoading ? (
            <div className="p-3 text-center">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : !selectedProjectId ? (
            <div className="p-3 text-center">
              <div className="text-muted">Select a project to view prompts</div>
            </div>
          ) : (
            <>
              {prompts.length > 0 ? (
                <div className="list-group list-group-flush">
                  {prompts.map((prompt) => (
                    <button
                      key={prompt._id}
                      type="button"
                      className="list-group-item list-group-item-action border-0"
                      onClick={() => handlePromptClick(prompt._id)}
                      style={{
                        cursor: 'pointer',
                        borderLeft: selectedPromptId === prompt._id ? '3px solid #6c757d' : '3px solid transparent',
                        backgroundColor: selectedPromptId === prompt._id ? '#f8f9fa' : 'transparent',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{prompt.name}</span>
                        {selectedPromptId === prompt._id && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-chevron-right"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-muted">
                  <small>No prompts yet</small>
                </div>
              )}
              {/* Always show Create button at the bottom */}
              <div className="p-3 border-top">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowCreatePromptSheet(true)}
                  disabled={!selectedProjectId}
                >
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
                  Create a Prompt
                </button>
              </div>
            </>
          )}
        </div>

        {/* Middle Column - Version List */}
        <div className="border-end bg-white" style={{ width: '350px', overflowY: 'auto' }}>
          {selectedPrompt ? (
            <>
              <div className="p-3 border-bottom">
                <h5 className="mb-0">{selectedPrompt.name}</h5>
              </div>
              {versionsLoading ? (
                <div className="p-3 text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {versions.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {versions.map((version) => (
                        <button
                          key={version._id}
                          type="button"
                          className="list-group-item list-group-item-action border-0"
                          onClick={() => handleVersionClick(version._id)}
                          style={{
                            cursor: 'pointer',
                            borderLeft:
                              selectedVersionId === version._id ? '3px solid #6c757d' : '3px solid transparent',
                            backgroundColor: selectedVersionId === version._id ? '#f8f9fa' : 'transparent',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="fw-semibold">
                                {version.versionName || version.version} ({version.version})
                              </div>
                              <div className="text-muted small mt-1" style={{ fontSize: '0.85rem' }}>
                                {version.promptText.length > 50
                                  ? version.promptText.substring(0, 50) + '...'
                                  : version.promptText}
                              </div>
                              {version.activePrompt && (
                                <span className="badge bg-success mt-1">Active</span>
                              )}
                            </div>
                            {selectedVersionId === version._id && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-chevron-right ms-2"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-muted">
                      <small>No versions yet</small>
                    </div>
                  )}
                  {/* Always show Create button at the bottom */}
                  <div className="p-3 border-top">
                    <button
                      className="btn btn-primary w-100"
                      onClick={() => setShowCreateVersionSheet(true)}
                      disabled={!selectedPromptId}
                    >
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
                      Create a new Version
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="p-3 text-muted text-center">Select a prompt to view versions</div>
          )}
        </div>

        {/* Right Column - Prompt Text */}
        <div className="flex-grow-1 bg-white" style={{ overflowY: 'auto' }}>
          {selectedVersion ? (
            <>
              <div className="p-3 border-bottom">
                <h5 className="mb-0">
                  {selectedVersion.versionName || selectedVersion.version}
                </h5>
              </div>
              {versionLoading ? (
                <div className="p-3 text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div
                    className="bg-light p-4 rounded"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      minHeight: '200px',
                    }}
                  >
                    {selectedVersion.promptText || 'No prompt text available'}
                  </div>
                  {selectedVersion.activePrompt && (
                    <div className="mt-3">
                      <span className="badge bg-success">Active Prompt Version</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="p-3 text-muted text-center">Select a version to view prompt text</div>
          )}
        </div>
      </div>

      {/* Side Sheet for Creating Prompt */}
      {showCreatePromptSheet && (
        <>
          {/* Backdrop */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040,
            }}
            onClick={() => setShowCreatePromptSheet(false)}
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
                <h5 className="mb-0">Create a Prompt</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreatePromptSheet(false)}
                  aria-label="Close"
                />
              </div>

              {/* Body */}
              <div className="flex-grow-1 p-4">
                <PromptForm
                  onSubmit={handleCreatePrompt}
                  onCancel={() => setShowCreatePromptSheet(false)}
                  isLoading={createPromptLoading}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Side Sheet for Creating Version */}
      {showCreateVersionSheet && (
        <>
          {/* Backdrop */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040,
            }}
            onClick={() => setShowCreateVersionSheet(false)}
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
                  onClick={() => setShowCreateVersionSheet(false)}
                  aria-label="Close"
                />
              </div>

              {/* Body */}
              <div className="flex-grow-1 p-4">
                <VersionForm
                  onSubmit={handleCreateVersion}
                  onCancel={() => setShowCreateVersionSheet(false)}
                  isLoading={createVersionLoading}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Side Sheet for Creating Project */}
      {showCreateProjectSheet && (
        <>
          {/* Backdrop */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040,
            }}
            onClick={() => setShowCreateProjectSheet(false)}
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
                  onClick={() => setShowCreateProjectSheet(false)}
                  aria-label="Close"
                />
              </div>

              {/* Body */}
              <div className="flex-grow-1 p-4">
                <ProjectForm
                  onSubmit={handleCreateProject}
                  onCancel={() => setShowCreateProjectSheet(false)}
                  isLoading={createProjectLoading}
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

export default Home;

