// Simple toast notification system
let toastContainer = null;

export const showToast = (message, type = 'success') => {
  // Ensure Bootstrap is available
  if (typeof window === 'undefined' || !window.bootstrap) {
    console.warn('Bootstrap not available, using fallback alert');
    alert(message);
    return;
  }

  // Create toast container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Initialize Bootstrap toast
  try {
    const bsToast = new window.bootstrap.Toast(toast, { autohide: true, delay: 3000 });
    bsToast.show();

    // Remove toast element after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  } catch (error) {
    console.error('Error showing toast:', error);
    // Fallback to alert
    alert(message);
  }
};

