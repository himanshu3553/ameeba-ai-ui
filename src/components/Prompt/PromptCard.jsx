import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';

const PromptCard = ({ prompt }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title mb-0">{prompt.name}</h5>
            <span className={`badge ${prompt.isActive ? 'bg-success' : 'bg-secondary'}`}>
              {prompt.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="card-text text-muted small mb-3">
            Created: {formatDate(prompt.createdAt)}
          </p>
          <Link to={`/prompts/${prompt._id}`} className="text-decoration-none text-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;

