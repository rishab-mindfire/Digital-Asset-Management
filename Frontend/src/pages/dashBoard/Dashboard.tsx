import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';
import { api } from '../../services/apiInterceptor';
import { useEffect, useState } from 'react';
import type { chartType, StateData } from '../../models/Types';
import { logger } from '../../utils/logger';

const AssetDashboard = () => {
  const [chartData, setChartData] = useState<chartType>({ date: [], count: [] });
  const [cardData, setCardData] = useState<StateData>({
    counts: {
      totalAssets: 18,
      expiringSoon: 0,
      duplicates: 8,
      expired: 0,
      failed: 0,
      riskLevel: '',
    },
    percentages: {
      duplicatePercentage: '44.44%',
      failedPercentage: '0.00%',
    },
  });
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
      categories: chartData.date,
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
        data: chartData.count,
        color: '#4993D2',
      },
    ],
    credits: { enabled: false },
  };

  //get chart data
  const getChartData = async () => {
    try {
      const response = await api.get('/dashboardChart/stats');
      if (response.status === 200) {
        setChartData(response.data);
      }
    } catch (error) {
      logger.info(`getting error in data Dashboar : ${error}`);
    }
  };
  //get chart data
  const getCardData = async () => {
    try {
      const response = await api.get('/dashboardData/stats');
      if (response.status === 200) {
        setCardData(response.data);
        logger.info('data', response.data);
      }
    } catch (error) {
      logger.error(`getting error in data Dashboard ${error}`);
    }
  };

  useEffect(() => {
    getChartData();
    getCardData();
  }, []);

  return (
    <div className="mainContainer">
      <header className="header">
        <h1 className="title">Asset Overview Dashboard</h1>
        <span className="bread-scrumb">
          <Link className="routes" to="/asset">
            Asset Details
          </Link>
        </span>
      </header>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Assets</p>
          <p className={styles.statValue}>{cardData.counts.totalAssets}</p>
        </div>
        <div className={`${styles.statCard} ${styles.expiring}`}>
          <p className={styles.statLabel}>Expiring Soon</p>
          <p className={styles.statValue}>{cardData.counts.expiringSoon}</p>
        </div>
        <div className={`${styles.statCard} ${styles.duplicates}`}>
          <p className={styles.statLabel}>Duplicates</p>
          <p className={styles.statValue}>{cardData.counts.duplicates}</p>
        </div>
        <div className={`${styles.statCard} ${styles.risk}`}>
          <p className={styles.statLabel}>Risk</p>
          <p className={styles.statValue}>{cardData.counts.riskLevel}</p>
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
          <h3 className={styles.panelTitle}>Asset Status</h3>

          <div className={styles.statusItem}>
            <div className={styles.statusLabelRow}>
              <span>Duplicated Assets</span>
              <span style={{ color: '#4993D2' }}>{cardData.percentages.duplicatePercentage}</span>
            </div>
            <div className={styles.progressBg}>
              <div
                className={`${styles.progressFill} ${styles.pendingFill}`}
                style={{ width: `${cardData.percentages.duplicatePercentage}` }}
              ></div>
            </div>
          </div>

          <div className={styles.statusItem}>
            <div className={styles.statusLabelRow}>
              <span>Failed</span>
              <span style={{ color: '#ef4444' }}>{cardData.percentages.failedPercentage}</span>
            </div>
            <div className={styles.progressBg}>
              <div
                className={`${styles.progressFill} ${styles.failedFill}`}
                style={{ width: `${cardData.percentages.failedPercentage}` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDashboard;
