import { Link } from 'react-router-dom';
import styles from './PageNotFound.module.css';

/**
 * PageNotFound Component (404)
 *
 * Displays a fallback UI when the user navigates to a route
 * that does not exist in the application.
 *
 * Provides a quick navigation link back to the projects page.
 *
 * @component
 *
 * @returns {JSX.Element} A styled 404 error page
 *
 * @example
 * <Route path="*" element={<PageNotFound />} />
 */
const PageNotFound = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.errorCode}>404</h1>
      <h2 className={styles.message}>Oops! Page Not Found</h2>
      <Link to="/projects" className={styles.backLink}>
        Back to projects
      </Link>
    </div>
  );
};

export default PageNotFound;
