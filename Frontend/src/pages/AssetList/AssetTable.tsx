import { Link } from 'react-router-dom';
import styles from './AssetTable.module.css';
import Modal from '../../components/modal/Modal';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from 'react';
import useChunkedUpload from '../../hooks/useChunkedUpload';
import usePagination from '../../hooks/usePagination';
import Loader from '../../components/common/Loader';

const AssetTable = () => {
  // file (asset chunk) upload
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadMultipalFiles, isUploading, progressMap, setProgressMap, error } =
    useChunkedUpload();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      return;
    }

    try {
      await uploadMultipalFiles(selectedFiles);
      // alert('All files uploaded successfully!');
      setSelectedFiles([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  const onModelClose = () => {
    setIsModelOpen(false);
  };

  const onModelOpen = () => {
    setIsModelOpen(true);
    if (!isUploading) {
      setProgressMap({});
      setMessage('');
    }
  };

  useEffect(() => {
    if (isUploading) {
      setMessage('file uploading...');
    } else if (!isUploading && !error && Object.keys(progressMap).length !== 0) {
      setMessage('file uploaded !');
      fetchAssets();
    }
  }, [error, isUploading]);

  //get Asset list table
  const { assets, pagination, loadingAssets, fetchAssets, setSearch, search } = usePagination();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };
  useEffect(() => {
    const time = setTimeout(() => {
      setSearch(searchValue);
      fetchAssets();
    }, 600);
    return () => clearTimeout(time);
  }, [searchValue, setSearch]);

  useEffect(() => {
    fetchAssets(1);
  }, [search, fetchAssets]);
  return (
    <section className="mainContainer">
      <header className="header">
        <h1 className="title">Asset Overview</h1>
        <span className="bread-scrumb">
          <Link className="routes" to="/dashboard">
            Go to dashboard
          </Link>
          <span className="separator"> / </span>
          <span className="bread-scrumb-bold">Asset Details</span>
        </span>
      </header>
      <div className={styles.tableContainer}>
        <div className={styles.toolbar}>
          <div className={styles.actionsLeft}>
            <span className={styles.btn}>Search</span>
            <input
              type="text"
              placeholder="Search assets..."
              className={styles.searchInput}
              value={searchValue}
              onChange={handleSearch}
            />
            {searchValue && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchValue('')}
                type="button"
              >
                &times;
              </button>
            )}
          </div>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onModelOpen}>
            <div> + Upload</div>{' '}
            {isUploading && <div className={`spinner ${styles.mySpiner}`}></div>}
          </button>
        </div>

        {loadingAssets ? (
          <Loader />
        ) : (
          <>
            {assets.length > 0 ? (
              <div className={styles.container}>
                <div className={styles.tableResponsiveWrapper}>
                  <table className={styles.assetTable}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Approval</th>
                        <th>Owner</th>
                        <th>Uploaded At</th>
                        <th>View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.id}>
                          <td style={{ fontWeight: 500 }}>{asset.name}</td>
                          <td>{asset.type}</td>
                          <td>
                            <span
                              className={`${styles.badge} ${
                                asset.Approval === 'Approved' ? styles.approved : styles.pending
                              }`}
                            >
                              {asset.Approval}
                            </span>
                          </td>
                          <td>{asset.owner}</td>
                          <td style={{ color: '#9ca3af' }}>{asset.updated}</td>
                          <td>
                            <Link to={`/asset/${asset.id}`}>Open</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                <div className={styles.pagination}>
                  <div className={styles.paginationInfo}>
                    Showing page <b>{pagination.page}</b> of <b>{pagination.totalPages}</b>
                  </div>
                  <div className={styles.paginationControls}>
                    <button
                      className={styles.pageBtn}
                      disabled={pagination.page === 1}
                      onClick={() => fetchAssets(pagination.page - 1)}
                    >
                      &larr; Previous
                    </button>

                    <button
                      className={styles.pageBtn}
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => fetchAssets(pagination.page + 1)}
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.noResult}>no result found !</div>
            )}
          </>
        )}
      </div>

      {/* upload files Modal */}
      <Modal isOpen={isModelOpen} onClose={onModelClose} title="Upload Asset">
        <form onSubmit={handleSubmit} className={styles.form}>
          {message && <p className="successMessage">{message}</p>}
          <div
            className={styles.dropZone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFiles.length > 0 ? (
              <div className={styles.fileStack}>
                {selectedFiles.map((f) => (
                  <p key={f.name}>{f.name}</p>
                ))}
              </div>
            ) : (
              <p className={styles.dropText}>Drag files here or click to browse</p>
            )}
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/*Progress Bars Container */}
          <div className={styles.progresscontainer}>
            {Object.entries(progressMap).map(([filename, prg]) => (
              <div key={filename} className={styles.progressWrapper}>
                <span className={styles.filenameText}>{filename}</span>

                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${prg}%` }} />
                </div>

                <span className={styles.percentageText}>{prg}%</span>
              </div>
            ))}
          </div>

          {error && <div className={styles.errorMessage}>{error || errorMessage}</div>}

          <div className="center">
            <button
              type="submit"
              className={styles.uploadFileBtn}
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading
                ? 'Uploading Files...'
                : `Upload ${selectedFiles.length > 1 ? selectedFiles.length : ''} File${selectedFiles.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default AssetTable;
