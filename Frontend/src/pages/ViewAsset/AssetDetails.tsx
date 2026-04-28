import { useState } from 'react';
import styles from './AssetDetails.module.css';
import { Link } from 'react-router-dom';

const AssetDetails = () => {
  const [activeTab, setActiveTab] = useState('Versions');

  const versions = [
    { id: 1, version: 'v3.0', date: '2026-04-28', user: 'user name' },
    {
      id: 2,
      version: 'v2.0',
      date: '2026-04-20',
      user: 'Manager 1',
    },
    { id: 3, version: 'v1.0', date: '2026-04-15', user: 'user name 1' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Versions':
        return (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Date</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <span className={styles.versionTag}>{v.version}</span>
                    </td>
                    <td>{v.date}</td>
                    <td>{v.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'Activity':
        return <div className={styles.tabPlaceholder}>Activity Log coming soon...</div>;
      case 'Usage History':
        return <div className={styles.tabPlaceholder}>Usage tracking details...</div>;
      default:
        return null;
    }
  };

  return (
    <section className="mainContainer">
      <header className="header">
        <h1 className="title">Asset Details</h1>
        <Link className="routes" to="/asset">
          Go to assets
        </Link>
      </header>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Asset: marketing_hero_v2.jpg</h1>
            <button className={styles.downloadBtn}>Download</button>
          </div>
        </header>

        <main className={styles.mainContent}>
          <section className={styles.previewArea}>
            <div className={styles.imagePlaceholder}>
              <span>Preview</span>
            </div>
          </section>

          <aside className={styles.metadataPane}>
            <h3>Metadata</h3>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <label>Owner</label>
                <p>User name</p>
              </div>
              <div className={styles.metaItem}>
                <label>Status</label>
                <p>
                  <span className={styles.statusBadge}>Uploaded</span>
                </p>
              </div>
            </div>
          </aside>
        </main>

        <footer className={styles.footerTabs}>
          {['Versions', 'Activity', 'Usage History'].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </footer>

        <section className={styles.detailsContent}>{renderTabContent()}</section>
      </div>
    </section>
  );
};

export default AssetDetails;
