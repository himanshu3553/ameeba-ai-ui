import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';

const VersionCard = ({ version }) => {
  const isActive = version.activePrompt && version.isActive;
  
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className={`card h-100 shadow-sm ${isActive ? 'border-success border-2' : ''}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0">{version.versionName || version.version}</h5>
            <div>
              {isActive && (
                <span className="badge bg-success me-1">Active</span>
              )}
              {!version.isActive && (
                <span className="badge bg-secondary">Inactive</span>
              )}
            </div>
          </div>
          <p className="card-text text-muted small mb-2" style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {version.promptText}
          </p>
          <p className="card-text text-muted small mb-3">
            Created: {formatDate(version.createdAt)}
          </p>
          <Link to={`/versions/${version._id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VersionCard;

