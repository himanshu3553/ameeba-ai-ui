import { useState, useEffect } from 'react';

const PromptForm = ({ prompt, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name || '',
        isActive: prompt.isActive !== undefined ? prompt.isActive : true,
      });
    }
  }, [prompt]);

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
    if (!formData.name.trim()) {
      newErrors.name = 'Prompt name is required';
    } else if (formData.name.trim().length > 200) {
      newErrors.name = 'Prompt name must be 200 characters or less';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // For new prompts, include isActive: true
      // For updates, only send name (isActive is managed by soft delete)
      const submitData = prompt 
        ? { name: formData.name }
        : { name: formData.name, isActive: true };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Prompt Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter prompt name"
          maxLength={200}
          required
        />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
      </div>

      <div className="d-flex justify-content-end gap-3">
        <button type="button" className="btn btn-link text-secondary p-0 text-decoration-none" onClick={onCancel} disabled={isLoading} style={{ border: 'none', background: 'none' }}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            prompt ? 'Update Prompt' : 'Create Prompt'
          )}
        </button>
      </div>
    </form>
  );
};

export default PromptForm;

