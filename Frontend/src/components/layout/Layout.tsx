import React from 'react';
import Header from './Header';
import styles from './Layout.module.css';

/**
 * Layout Component
 *
 * Provides a consistent page structure across the application.
 * Includes a shared Header and a main content area where
 * page-specific components are rendered.
 *
 * @component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content to be rendered inside the layout
 *
 * @returns {JSX.Element} Wrapped layout with header and content section
 *
 * @example
 * <Layout>
 *   <ProjectList />
 * </Layout>
 */
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.layoutContainer}>
      {/* Global header visible across all pages */}
      <Header />

      {/* Main content area where routed pages are rendered */}
      <main className={styles.content}>{children}</main>
    </div>
  );
};

export default Layout;
