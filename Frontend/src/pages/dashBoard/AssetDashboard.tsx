import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';

const AssetDashboard = () => {
  const chartOptions = {
    chart: {
      type: 'area',
      height: 300,
      reflow: true,
      width: null,
      backgroundColor: 'transparent',
      style: { fontFamily: 'inherit' },
    },
    title: { text: '' },
    xAxis: {
      categories: [
        '12-11-26',
        '13-11-26',
        '14-11-26',
        '15-11-26',
        '16-11-26',
        '17-11-26',
        '18-11-26',
      ],
    },
    yAxis: { title: { text: 'Uploads' }, gridLineColor: '#f3f4f6' },
    plotOptions: {
      area: {
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, '#4993D2'],
            [1, '#3b82f600'],
          ],
        },
      },
    },
    series: [
      {
        name: 'Files Uploaded',
        data: [30, 45, 32, 70, 55, 40, 80],
        color: '#4993D2',
      },
    ],
    credits: { enabled: false },
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className="header">
        <h1 className="title">Asset Overview Dashboard</h1>
        <Link className="routes" to="/asset">
          Go to assets
        </Link>
      </header>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Assets</p>
          <p className={styles.statValue}>12,450</p>
        </div>
        <div className={`${styles.statCard} ${styles.expiring}`}>
          <p className={styles.statLabel}>Expiring Soon</p>
          <p className={styles.statValue}>42</p>
        </div>
        <div className={`${styles.statCard} ${styles.duplicates}`}>
          <p className={styles.statLabel}>Duplicates</p>
          <p className={styles.statValue}>128</p>
        </div>
        <div className={`${styles.statCard} ${styles.risk}`}>
          <p className={styles.statLabel}>Risk</p>
          <p className={styles.statValue}>Low</p>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Graph Area */}
        <div className={styles.graphPanel}>
          <h3 className={styles.panelTitle}>Usage Trends Chart</h3>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>

        {/* Processing Status */}
        <div className={styles.cardPanel}>
          <h3 className={styles.panelTitle}>Processing Status</h3>

          <div className={styles.statusItem}>
            <div className={styles.statusLabelRow}>
              <span>Pending</span>
              <span style={{ color: '#4993D2' }}>85%</span>
            </div>
            <div className={styles.progressBg}>
              <div
                className={`${styles.progressFill} ${styles.pendingFill}`}
                style={{ width: '85%' }}
              ></div>
            </div>
          </div>

          <div className={styles.statusItem}>
            <div className={styles.statusLabelRow}>
              <span>Failed</span>
              <span style={{ color: '#ef4444' }}>12%</span>
            </div>
            <div className={styles.progressBg}>
              <div
                className={`${styles.progressFill} ${styles.failedFill}`}
                style={{ width: '12%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDashboard;
