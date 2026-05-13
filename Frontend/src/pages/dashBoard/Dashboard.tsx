import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { chartType, StateData } from '../../models/Types';
import { getCardData, getChartData } from '../../services/dasboard.service';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/getErrorMessage';

const AssetDashboard = () => {
  const [chartData, setChartData] = useState<chartType>({
    date: [],
    count: [],
  });

  const [cardData, setCardData] = useState<StateData>({
    counts: {
      totalAssets: 0,
      expiringSoon: 0,
      duplicates: 0,
      expired: 0,
      failed: 0,
      riskLevel: '',
    },
    percentages: {
      duplicatePercentage: '0%',
      failedPercentage: '0%',
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

    yAxis: {
      title: { text: 'Uploads' },
      gridLineColor: '#f3f4f6',
    },

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [chartResponse, cardResponse] = await Promise.all([getChartData(), getCardData()]);

      setChartData(chartResponse);
      setCardData(cardResponse);
    } catch (error) {
      const message = getErrorMessage(error);
      logger.error(message);
    }
  };

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
          <p className={styles.statLabel}>Total</p>
          <p className={styles.statValue}>{cardData.counts.totalAssets}</p>
        </div>

        <div className={`${styles.statCard} ${styles.expiring}`}>
          <p className={styles.statLabel}>Expired</p>
          <p className={styles.statValue}>{cardData.counts.expiringSoon}</p>
        </div>

        <div className={`${styles.statCard} ${styles.duplicates}`}>
          <p className={styles.statLabel}>Duplicates</p>
          <p className={styles.statValue}>{cardData.counts.duplicates}</p>
        </div>

        <div className={`${styles.statCard} ${styles.risk}`}>
          <p className={styles.statLabel}>Risk</p>
          <p
            className={`${styles.statValue} ${cardData.counts.riskLevel === 'High' ? styles.highRisk : ''}`}
          >
            {cardData.counts.riskLevel}
          </p>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Graph */}
        <div className={styles.graphPanel}>
          <h3 className={styles.panelTitle}>Usage Trends Chart</h3>

          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>

        {/* Status */}
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
                style={{
                  width: cardData.percentages.duplicatePercentage,
                }}
              ></div>
            </div>
          </div>

          <div className={styles.statusItem}>
            <div className={styles.statusLabelRow}>
              <span>Failed</span>
              <span className={styles.highRisk}>{cardData.percentages.failedPercentage}</span>
            </div>

            <div className={styles.progressBg}>
              <div
                className={`${styles.progressFill} ${styles.failedFill}`}
                style={{
                  width: cardData.percentages.failedPercentage,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDashboard;
