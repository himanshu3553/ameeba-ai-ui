import { useState, useEffect } from 'react';

const VersionForm = ({ version, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    promptText: '',
    activePrompt: false,
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (version) {
      setFormData({
        promptText: version.promptText || '',
        activePrompt: version.activePrompt || false,
        isActive: version.isActive !== undefined ? version.isActive : true,
      });
    }
  }, [version]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.promptText.trim()) {
      newErrors.promptText = 'Prompt text is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // For new versions, include isActive: true
      // For updates, only send promptText and activePrompt (isActive is managed by soft delete)
      const submitData = version
        ? {
            promptText: formData.promptText,
            activePrompt: formData.activePrompt,
          }
        : {
            promptText: formData.promptText,
            activePrompt: formData.activePrompt,
            isActive: true,
          };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="promptText" className="form-label">
          Prompt Text <span className="text-danger">*</span>
        </label>
        <textarea
          className={`form-control ${errors.promptText ? 'is-invalid' : ''}`}
          id="promptText"
          name="promptText"
          value={formData.promptText}
          onChange={handleChange}
          placeholder="Enter your prompt text here..."
          rows="8"
          required
        />
        {errors.promptText && <div className="invalid-feedback">{errors.promptText}</div>}
      </div>

      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="activePrompt"
          name="activePrompt"
          checked={formData.activePrompt}
          onChange={handleChange}
        />
        <label className="form-check-label" htmlFor="activePrompt">
          Set as Active Prompt
          <small className="text-muted d-block">
            (This will deactivate other versions of this prompt)
          </small>
        </label>
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            version ? 'Update Version' : 'Create Version'
          )}
        </button>
      </div>
    </form>
  );
};

export default VersionForm;

