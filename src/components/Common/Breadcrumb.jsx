import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {items.map((item, index) => (
          <li
            key={index}
            className={`breadcrumb-item ${index === items.length - 1 ? 'active' : ''}`}
            aria-current={index === items.length - 1 ? 'page' : undefined}
          >
            {item.to && index < items.length - 1 ? (
              <Link to={item.to}>{item.label}</Link>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

