import { Link } from 'react-router-dom';
import styles from './AssetTable.module.css';

const AssetTable = () => {
  const assets = [
    {
      id: 1,
      name: 'Img1.jpg',
      type: 'Img',
      status: 'Approved',
      owner: 'Mkt',
      updated: '2 days ago',
    },
    { id: 2, name: 'Vid1.mp4', type: 'Video', status: 'Pending', owner: 'PR', updated: 'Today' },
    {
      id: 3,
      name: 'Logo_Final.svg',
      type: 'Vector',
      status: 'Approved',
      owner: 'Design',
      updated: '5 hours ago',
    },
  ];

  return (
    <section className={styles.assetSection}>
      <div className={styles.tableHeader}>
        <header className="header">
          <h1 className="title">Asset Overview</h1>
          <Link className="routes" to="/dashboard">
            Go to dashboard
          </Link>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.actionsLeft}>
            <button className={styles.btn}>Filter</button>
            <input type="text" placeholder="Search assets..." className={styles.searchInput} />
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`}>+ Upload</button>
        </div>
      </div>

      <div className={styles.tableResponsiveWrapper}>
        <table className={styles.assetTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td style={{ fontWeight: 500 }}>{asset.name}</td>
                <td>{asset.type}</td>
                <td>
                  <span
                    className={`${styles.badge} ${asset.status === 'Approved' ? styles.approved : styles.pending}`}
                  >
                    {asset.status}
                  </span>
                </td>
                <td>{asset.owner}</td>
                <td style={{ color: '#9ca3af' }}>{asset.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AssetTable;
