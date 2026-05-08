import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../../services/apiInterceptor';
import styles from './AssetDetails.module.css';
import { VideoPlayer } from './MediaComponents/VideoPlayer';
import { ImagePreview } from './MediaComponents/ImagePreview';
import { PdfViewer } from './MediaComponents/PdfViewer';
import type { metaDataType } from '../../models/Types';

const AssetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [metaData, setMetaData] = useState<metaDataType>();
  const [category, setCategory] = useState<'image' | 'video' | 'pdf' | 'other'>('other');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`admin/assetsDetails/${id}`);

        // Handle if response.data is a string ("jpg") or an object
        const rawData = response.data;
        const data: string = rawData?.metadata?.extension;
        const extension = data.toLowerCase();

        // Store the raw data for metadata
        setMetaData(rawData);

        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
          setCategory('image');
        } else if (['mp4', 'mov', 'webm'].includes(extension)) {
          setCategory('video');
        } else if (extension === 'pdf') {
          setCategory('pdf');
        } else {
          setCategory('other');
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <section className="mainContainer">
        <p>Loading asset...</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="mainContainer">
        <p className={styles.error}>{error}</p>
      </section>
    );
  }

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
            <h1>Asset: {metaData?.fileType}</h1>
            {/* link for download */}
            <a className={styles.downloadBtn}>Download</a>
          </div>
        </header>

        <main className={styles.mainContent}>
          <section className={styles.previewArea}>
            <div className={styles.previewContainer}>
              {category === 'video' && (
                <VideoPlayer assetId={id!} ext={metaData?.metadata.extension || ''} />
              )}
              {category === 'image' && <ImagePreview assetId={id!} />}
              {category === 'pdf' && <PdfViewer assetId={id!} />}
              {category === 'other' && (
                <div className={styles.imagePlaceholder}>
                  <span>No Preview Available (.{metaData?.metadata.extension})</span>
                </div>
              )}
            </div>
          </section>

          <aside className={styles.metadataPane}>
            <h3>Metadata</h3>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <label>File Type</label>
                <p>{metaData?.metadata.extension?.toUpperCase()}</p>
              </div>
              <div className={styles.metaItem}>
                <label>Status</label>
                <p>
                  <span className={styles.statusBadge}>Uploaded</span>
                </p>
              </div>
              {/* If data is an object, show owner */}
              {
                <div className={styles.metaItem}>
                  <label>Owner</label>
                  <p>{metaData?.owner || 'System'}</p>
                </div>
              }
            </div>
          </aside>
        </main>
      </div>
    </section>
  );
};

export default AssetDetails;
