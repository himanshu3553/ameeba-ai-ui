import { useState, useEffect } from 'react';
import { projectAPI, promptAPI, promptVersionAPI, API_BASE_URL } from '../../services/api';
import Loading from '../Common/Loading';
import ErrorMessage from '../Common/ErrorMessage';
import ProjectForm from '../Project/ProjectForm';
import PromptForm from '../Prompt/PromptForm';
import VersionForm from '../PromptVersion/VersionForm';

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
  const [togglingVersionId, setTogglingVersionId] = useState(null);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [pendingToggleVersion, setPendingToggleVersion] = useState(null);
  const [pendingToggleState, setPendingToggleState] = useState(null);
  const [copiedPromptId, setCopiedPromptId] = useState(null);
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
  const fetchPromptAndVersions = async (promptId = null) => {
    const idToFetch = promptId || selectedPromptId;
    if (idToFetch) {
      try {
        setVersionsLoading(true);
        // Fetch prompt details
        const promptResponse = await promptAPI.getPrompt(idToFetch);
        if (promptResponse.success) {
          setSelectedPrompt(promptResponse.data);
        }

        // Fetch versions
        const versionsResponse = await promptVersionAPI.getVersions(idToFetch);
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

  const handleToggleActive = (versionId, e) => {
    e.stopPropagation(); // Prevent triggering the version click handler
    e.preventDefault(); // Prevent default checkbox toggle
    
    // Get current state from selectedVersion or versions list
    const currentVersion = selectedVersionId === versionId 
      ? selectedVersion 
      : versions.find(v => v._id === versionId);
    const currentActiveState = currentVersion?.activePrompt || false;
    const newActiveState = !currentActiveState;
    
    // Store pending toggle info and show confirmation
    setPendingToggleVersion(versionId);
    setPendingToggleState(newActiveState);
    setShowToggleConfirm(true);
  };

  const confirmToggleActive = async () => {
    if (!pendingToggleVersion) return;
    
    const versionId = pendingToggleVersion;
    const newActiveState = pendingToggleState;
    
    // Set loading state for this specific toggle (keep modal open)
    setTogglingVersionId(versionId);
    
    // Preserve the currently selected version ID
    const preservedSelectedVersionId = selectedVersionId;
    
    try {
      const response = await promptVersionAPI.updateVersion(versionId, {
        activePrompt: newActiveState,
      });
      if (response.success) {
        console.log('Version active status updated successfully!', response.data);
        // Refresh versions list to get accurate state
        const versionsResponse = await promptVersionAPI.getVersions(selectedPromptId);
        if (versionsResponse.success) {
          const versionsData = versionsResponse.data || [];
          setVersions(versionsData);
          // Restore the previously selected version
          if (preservedSelectedVersionId) {
            setSelectedVersionId(preservedSelectedVersionId);
            // Fetch the updated version details
            const versionResponse = await promptVersionAPI.getVersion(preservedSelectedVersionId);
            if (versionResponse.success) {
              setSelectedVersion(versionResponse.data);
            }
          }
        }
        // Close modal only after successful API call
        setShowToggleConfirm(false);
      } else {
        console.error('Failed to update version active status:', response.message || 'Unknown error');
        // Keep modal open on error so user can see the error or try again
      }
    } catch (err) {
      console.error('Failed to update version active status:', err.message || err);
      // Keep modal open on error so user can see the error or try again
    } finally {
      // Clear loading state and pending toggle
      setTogglingVersionId(null);
      setPendingToggleVersion(null);
      setPendingToggleState(null);
    }
  };

  const cancelToggleActive = () => {
    setShowToggleConfirm(false);
    setPendingToggleVersion(null);
    setPendingToggleState(null);
  };

  const copyToClipboard = (text, promptId) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('API URL copied to clipboard!', text);
      // Show confirmation message
      setCopiedPromptId(promptId);
      // Clear confirmation after 2 seconds
      setTimeout(() => {
        setCopiedPromptId(null);
      }, 2000);
    }).catch(() => {
      console.error('Failed to copy to clipboard');
    });
  };

  const handleCreatePrompt = async (formData) => {
    if (!selectedProjectId) {
      console.error('Please select a project first');
      return;
    }

    try {
      setCreatePromptLoading(true);
      
      // Extract versionText from formData
      const { versionText, ...promptData } = formData;
      
      // Create the prompt first
      const promptResponse = await promptAPI.createPrompt(selectedProjectId, promptData);
      if (!promptResponse.success) {
        console.error('Failed to create prompt:', promptResponse.message || 'Unknown error');
        return;
      }
      
      console.log('Prompt created successfully!', promptResponse.data);
      const newPromptId = promptResponse.data?._id;
      
      // Create the first version if versionText is provided
      if (versionText && newPromptId) {
        const versionResponse = await promptVersionAPI.createVersion(newPromptId, {
          promptText: versionText,
          activePrompt: true, // Set first version as active
          isActive: true
        });
        
        if (versionResponse.success) {
          console.log('First version created successfully!', versionResponse.data);
        } else {
          console.error('Failed to create first version:', versionResponse.message || 'Unknown error');
        }
      }
      
      setShowCreatePromptSheet(false);
      
      // Refresh prompts list
      await fetchPrompts();
      
      // Auto-select the newly created prompt and load its versions
      if (newPromptId) {
        setSelectedPromptId(newPromptId);
        // Fetch prompt details and versions for the newly created prompt
        await fetchPromptAndVersions(newPromptId);
      }
    } catch (err) {
      console.error('Failed to create prompt:', err.message || err);
    } finally {
      setCreatePromptLoading(false);
    }
  };

  const handleCreateVersion = async (formData) => {
    if (!selectedPromptId) {
      console.error('Please select a prompt first');
      return;
    }

    try {
      setCreateVersionLoading(true);
      const response = await promptVersionAPI.createVersion(selectedPromptId, formData);
      if (response.success) {
        console.log('Version created successfully!', response.data);
        setShowCreateVersionSheet(false);
        // Refresh versions list
        await fetchPromptAndVersions();
        // Auto-select the newly created version
        if (response.data?._id) {
          setSelectedVersionId(response.data._id);
        }
      } else {
        console.error('Failed to create version:', response.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to create version:', err.message || err);
    } finally {
      setCreateVersionLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      setCreateProjectLoading(true);
      const response = await projectAPI.createProject(formData);
      if (response.success) {
        console.log('Project created successfully!', response.data);
        setShowCreateProjectSheet(false);
        // Refresh projects list
        await fetchProjects();
        // Auto-select the newly created project
        if (response.data?._id) {
          setSelectedProjectId(response.data._id);
        }
      } else {
        console.error('Failed to create project:', response.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to create project:', err.message || err);
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
              className="btn btn-link text-primary p-0 text-decoration-none"
              onClick={() => setShowCreateProjectSheet(true)}
              style={{ border: 'none', background: 'none', fontSize: '1.1rem' }}
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
        <div className="d-flex align-items-center">
          <select
            id="project-select"
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: '180px', maxWidth: '250px' }}
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

      {/* Main Content - Three Columns */}
      <div className="flex-grow-1 d-flex" style={{ overflow: 'hidden' }}>
        {/* Left Column - Prompt List */}
        <div className="border-end bg-white" style={{ width: '330px', minWidth: '330px', maxWidth: '330px', flexShrink: 0, overflowY: 'auto' }}>
          <div className="p-3 border-bottom" style={{ height: '57px', display: 'flex', alignItems: 'center' }}>
            <h5 className="mb-0">Prompts</h5>
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
                  {prompts.map((prompt, index) => (
                    <button
                      key={prompt._id}
                      type="button"
                      className="list-group-item list-group-item-action border-0"
                      onClick={() => handlePromptClick(prompt._id)}
                      style={{
                        cursor: 'pointer',
                        borderLeft: selectedPromptId === prompt._id ? '3px solid #6c757d' : '3px solid transparent',
                        backgroundColor: selectedPromptId === prompt._id ? '#f8f9fa' : 'transparent',
                        padding: '0.75rem 1rem',
                        minHeight: '80px',
                        position: 'relative',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            marginRight: '0.5rem'
                          }}
                          title={prompt.name}
                        >
                          {prompt.name}
                        </span>
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
                      {index < prompts.length - 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: '1rem',
                            right: '1rem',
                            height: '1px',
                            backgroundColor: '#dee2e6',
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-muted">
                  <small>No prompts found</small>
                </div>
              )}
              {/* Always show Create button at the bottom */}
              <div className="p-3 border-top">
                <button
                  className="btn btn-link text-primary p-0 text-decoration-none w-100 text-center"
                  onClick={() => setShowCreatePromptSheet(true)}
                  disabled={!selectedProjectId}
                  style={{ border: 'none', background: 'none' }}
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
        <div className="border-end bg-white" style={{ width: '385px', minWidth: '385px', maxWidth: '385px', flexShrink: 0, overflowY: 'auto' }}>
          {selectedPrompt ? (
            <>
              <div className="p-3 border-bottom">
                <h5 className="mb-0">Prompt Versions</h5>
                {selectedPromptId && (
                  <div className="mt-2">
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={`${API_BASE_URL}/api/prompts/${selectedPromptId}/active`}
                        readOnly
                        style={{ fontFamily: 'monospace', fontSize: '0.7rem', padding: '0.15rem 0.35rem', height: '22px', flex: 1 }}
                      />
                      <div className="position-relative">
                        <button
                          className="btn btn-link text-secondary p-0 text-decoration-none d-flex align-items-center justify-content-center"
                          type="button"
                          onClick={() => copyToClipboard(`${API_BASE_URL}/api/prompts/${selectedPromptId}/active`, selectedPromptId)}
                          title="Copy to clipboard"
                          style={{ border: 'none', background: 'none', padding: '0.25rem', width: '24px', height: '24px', minWidth: '24px' }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="currentColor"
                            className="bi bi-clipboard"
                            viewBox="0 0 16 16"
                          >
                            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
                            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
                          </svg>
                        </button>
                        {copiedPromptId === selectedPromptId && (
                          <div
                            className="position-absolute"
                            style={{
                              top: '-30px',
                              right: '0',
                              backgroundColor: '#28a745',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              whiteSpace: 'nowrap',
                              zIndex: 1000,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            Prompt URL copied
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                      {versions.map((version, index) => (
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
                            padding: '0.75rem 1rem',
                            minHeight: '80px',
                            position: 'relative',
                            overflow: 'hidden',
                            width: '100%',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start" style={{ width: '100%', minWidth: 0 }}>
                            <div className="flex-grow-1" style={{ minWidth: 0, overflow: 'hidden' }}>
                              <div className="fw-semibold d-flex align-items-center gap-2">
                                {version.versionName || version.version}
                                {version.activePrompt && (
                                  <span className="badge bg-success">Active</span>
                                )}
                              </div>
                              <div 
                                className="text-muted small mt-1" 
                                style={{ 
                                  fontSize: '0.85rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  width: '100%'
                                }}
                                title={version.promptText}
                              >
                                {version.promptText}
                              </div>
                            </div>
                            {selectedVersionId === version._id && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-chevron-right ms-2"
                                viewBox="0 0 16 16"
                                style={{ flexShrink: 0 }}
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                                />
                              </svg>
                            )}
                          </div>
                          {index < versions.length - 1 && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: '1rem',
                                right: '1rem',
                                height: '1px',
                                backgroundColor: '#dee2e6',
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-muted">
                      <small>No versions found</small>
                    </div>
                  )}
                  {/* Always show Create button at the bottom */}
                  <div className="p-3 border-top">
                    <button
                      className="btn btn-link text-primary p-0 text-decoration-none w-100 text-center"
                      onClick={() => setShowCreateVersionSheet(true)}
                      disabled={!selectedPromptId}
                      style={{ border: 'none', background: 'none' }}
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
        <div className="flex-grow-1 bg-white" style={{ minWidth: 0, overflowY: 'auto' }}>
          {selectedVersion ? (
            <>
              <div className="p-3 border-bottom" style={{ height: '57px', display: 'flex', alignItems: 'center' }}>
                <div className="d-flex align-items-center justify-content-between gap-2 w-100">
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="mb-0">
                      {selectedVersion.versionName || selectedVersion.version}
                    </h5>
                    {selectedVersion.activePrompt && (
                      <span className="badge bg-success">Active Prompt Version</span>
                    )}
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id={`toggle-detail-${selectedVersion._id}`}
                      checked={selectedVersion.activePrompt || false}
                      onChange={(e) => handleToggleActive(selectedVersion._id, e)}
                      disabled={togglingVersionId === selectedVersion._id}
                      style={{
                        width: '3rem',
                        height: '1.5rem',
                        cursor: togglingVersionId === selectedVersion._id ? 'wait' : 'pointer',
                        opacity: togglingVersionId === selectedVersion._id ? 0.6 : 1
                      }}
                    />
                  </div>
                </div>
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

      {/* Toggle Confirmation Modal */}
      {showToggleConfirm && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Toggle</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelToggleActive}
                  disabled={togglingVersionId !== null}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to {pendingToggleState ? 'activate' : 'deactivate'} this version?
                  {pendingToggleState && ' This will deactivate other versions of this prompt.'}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-link text-secondary p-0 text-decoration-none"
                  onClick={cancelToggleActive}
                  disabled={togglingVersionId !== null}
                  style={{ border: 'none', background: 'none' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmToggleActive}
                  disabled={togglingVersionId !== null}
                >
                  {togglingVersionId ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Processing...
                    </>
                  ) : (
                    'Confirm'
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

export default Home;

