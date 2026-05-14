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

import {
  getAssetDetails,
  approveAsset,
  removeAsset,
  downloadAsset,
} from '../../services/asset.service';

const AssetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const currentUser = localStorage.getItem(import.meta.env.USERROLE_KEY || 'userRole-DAM');
  const navigation = useNavigate();
  const [metaData, setMetaData] = useState<metaDataType>();
  const [category, setCategory] = useState<'image' | 'video' | 'pdf' | 'other'>('other');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        if (!id) {
          return;
        }

        const rawData = await getAssetDetails(id);
        const extension = rawData?.metadata?.extension?.toLowerCase() || '';
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

  const markApprove = async (id: string) => {
    try {
      await approveAsset(id);
      setMetaData((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          approval: 'approved',
        };
      });
    } catch (error: unknown) {
      logger.error(handleError(error));
    }
  };

  const handleDownloadFile = async (id: string) => {
    try {
      const response = await downloadAsset(id);
      const disposition = response.headers['content-disposition'];
      let fileName = 'downloaded_file';
      if (disposition) {
        const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
        const standardMatch = disposition.match(/filename="?([^";]+)"?/i);
        const rawName = utf8Match ? utf8Match[1] : standardMatch ? standardMatch[1] : null;
        if (rawName) {
          fileName = decodeURIComponent(rawName);
        }
      }

      const rawMimeType = response.headers['content-type'];
      const blobType = typeof rawMimeType === 'string' ? rawMimeType : 'application/octet-stream';
      const blob = new Blob([response.data], {
        type: blobType,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error: unknown) {
      logger.error(handleError(error));
    }
  };

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

        {/* BREADCRUMBS: Wrapped in nav with label */}
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
              onClick={() => {
                if (metaData?._id) {
                  handleDownloadFile(metaData._id);
                }
              }}
            >
              download
            </button>
          </div>
        </header>

        <main className={styles.mainContent}>
          {/* PREVIEW AREA: Added label for the specific asset type */}
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

          {/* ASIDE: Metadata is secondary info, perfect for aside landmark */}
          <aside className={styles.metadataPane} aria-labelledby="metadata-title">
            <div className={styles.mainBox}>
              <h3 id="metadata-title">Metadata</h3>

              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <label id="filetype-label">File Type</label>
                  <p aria-labelledby="filetype-label">
                    {metaData?.metadata.extension?.toUpperCase()}
                  </p>
                  <button
                    className={styles.deleteBtn}
                    aria-label="Delete this asset"
                    onClick={() => {
                      if (metaData?._id) {
                        deleteAsset(metaData._id);
                      }
                    }}
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
