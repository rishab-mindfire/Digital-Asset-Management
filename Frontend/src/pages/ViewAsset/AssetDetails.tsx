import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './AssetDetails.module.css';
import { VideoPlayer } from './MediaComponents/VideoPlayer';
import { ImagePreview } from './MediaComponents/ImagePreview';
import { PdfViewer } from './MediaComponents/PdfViewer';
import type { metaDataType } from '../../models/Types';
import { logger } from '../../utils/logger';
import { handleError } from '../../utils/handleError';
import PageNotFound from '../errorPage/PageNotFound';

// Import service functions for data handling
import {
  getAssetDetails,
  approveAsset,
  removeAsset,
  triggerAssetDownload,
} from '../../services/asset.service';

const AssetDetails = () => {
  // Hook to get the asset ID from the URL path
  const { id } = useParams<{ id: string }>();
  // Retrieve user role from storage for permission-based UI
  const currentUser = localStorage.getItem(import.meta.env.USERROLE_KEY || 'userRole-DAM');
  const navigation = useNavigate();

  // Component state management
  const [metaData, setMetaData] = useState<metaDataType>();
  const [category, setCategory] = useState<'image' | 'video' | 'pdf' | 'other'>('other');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch asset data and determine file category for rendering
    const fetchDetails = async () => {
      try {
        setLoading(true);
        if (!id) {
          return;
        }

        const rawData = await getAssetDetails(id);
        const extension = rawData?.metadata?.extension?.toLowerCase() || '';
        setMetaData(rawData);

        // Map file extensions to UI categories
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
          setCategory('image');
        } else if (['mp4', 'mov', 'webm'].includes(extension)) {
          setCategory('video');
        } else if (extension === 'pdf') {
          setCategory('pdf');
        } else {
          setCategory('other');
        }
      } catch (error: unknown) {
        const message = handleError(error);
        setError(message);
        logger.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Handle administrator approval action
  const markApprove = async (id: string) => {
    try {
      await approveAsset(id);
      setMetaData((prev) => (prev ? { ...prev, approval: 'approved' } : prev));
    } catch (error: unknown) {
      logger.error(handleError(error));
    }
  };

  // Trigger native browser download (handles large files without RAM crashes)
  const handleDownloadFile = (id: string) => {
    try {
      triggerAssetDownload(id);
    } catch (err) {
      logger.error(`Download failed to initiate : ${err}`);
      console.error('Download failed to initiate', err);
    }
  };

  // Handle permanent deletion of the asset
  const deleteAsset = async (id: string) => {
    try {
      setLoading(true);
      await removeAsset(id);
      navigation('/asset');
    } catch (error: unknown) {
      logger.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // Loading state UI
  if (loading) {
    return (
      <section className="mainContainer">
        <p>Loading asset...</p>
      </section>
    );
  }

  // Error/404 state UI
  if (error) {
    return (
      <section className="mainContainer">
        <PageNotFound />
      </section>
    );
  }

  return (
    <section className="mainContainer" aria-labelledby="page-title">
      <header className="header">
        <h1 id="page-title" className="title">
          Asset Details
        </h1>

        {/* Navigation breadcrumbs */}
        <nav className="bread-scrumb" aria-label="Breadcrumb">
          <Link className="routes" to="/dashboard">
            Go to dashboard
          </Link>
          <span className="separator" aria-hidden="true">
            {' '}
            /{' '}
          </span>
          <Link className="routes" to="/asset">
            Asset list
          </Link>
          <span className="separator" aria-hidden="true">
            {' '}
            /{' '}
          </span>
          <span className="bread-scrumb-bold" aria-current="page">
            Asset Details
          </span>
        </nav>
      </header>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Asset: {metaData?.fileType}</h1>
            <button
              className={styles.downloadBtn}
              aria-label={`Download ${metaData?.fileType} file`}
              onClick={() => metaData?._id && handleDownloadFile(metaData._id)}
            >
              download
            </button>
          </div>
        </header>

        <main className={styles.mainContent}>
          {/* Dynamic Preview Section based on category */}
          <section className={styles.previewArea} aria-label={`${category} preview`}>
            <div className={styles.previewContainer}>
              {category === 'video' && (
                <VideoPlayer assetId={id!} ext={metaData?.metadata.extension || ''} />
              )}
              {category === 'image' && <ImagePreview assetId={id!} />}
              {category === 'pdf' && <PdfViewer assetId={id!} />}
              {category === 'other' && (
                <div className={styles.imagePlaceholder} role="status">
                  <span>No Preview Available ( .{metaData?.metadata.extension})</span>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar containing file metadata and secondary actions */}
          <aside className={styles.metadataPane} aria-labelledby="metadata-title">
            <div className={styles.mainBox}>
              <h3 id="metadata-title">Metadata</h3>

              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <label id="filetype-label">File Type</label>
                  <p aria-labelledby="filetype-label">
                    {metaData?.metadata.extension?.toUpperCase()}
                  </p>
                  {/* Delete button (accessible to all viewers of this page) */}
                  <button
                    className={styles.deleteBtn}
                    aria-label="Delete this asset"
                    onClick={() => metaData?._id && deleteAsset(metaData._id)}
                  >
                    delete
                  </button>
                </div>

                <div className={styles.metaItem}>
                  <label id="status-label">Status</label>
                  <div aria-labelledby="status-label">
                    <span className={styles.statusBadge} role="status">
                      Uploaded
                    </span>
                  </div>
                </div>

                <div className={styles.metaItem}>
                  <label id="owner-label">Owner</label>
                  <p aria-labelledby="owner-label">{metaData?.owner || 'System'}</p>
                </div>

                {/* Admin-only Approval Button */}
                {metaData && currentUser === 'admin' && (
                  <div className={styles.buttomBtn}>
                    <button
                      className="secondaryBtn"
                      disabled={metaData.approval !== 'pending'}
                      aria-label="Mark asset as approved"
                      onClick={() => markApprove(metaData._id)}
                    >
                      {metaData.approval === 'pending' ? 'Mark approve' : 'Approved'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </section>
  );
};

export default AssetDetails;
