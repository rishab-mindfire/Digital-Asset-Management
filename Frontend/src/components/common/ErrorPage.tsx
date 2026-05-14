import { Link } from 'react-router-dom';
import styles from './common.module.css';

const ErrorPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.code}>404</h1>

        <h2 className={styles.title}>Page Not Found</h2>

        <p className={styles.description}>
          The page you are looking for does not exist or was moved.
        </p>

        <Link to="/" className={styles.button}>
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
