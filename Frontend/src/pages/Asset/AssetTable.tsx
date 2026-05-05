import { Link } from 'react-router-dom';
import styles from './AssetTable.module.css';
import Modal from '../../components/modal/Modal';
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import useChunkedUpload from '../../hooks/useChunkedUpload';

const AssetTable = () => {
  const assets = [
    {
      id: 1,
      name: 'Img1.jpg',
      type: 'Img',
      status: 'Approved',
      owner: 'Public',
      updated: '2 days ago',
    },
    {
      id: 2,
      name: 'Vid1.mp4',
      type: 'Video',
      status: 'Pending',
      owner: 'Manager',
      updated: 'Today',
    },
    {
      id: 3,
      name: 'Logo_Final.svg',
      type: 'Vector',
      status: 'Approved',
      owner: 'Admin',
      updated: '5 hours ago',
    },
  ];

  // file (asset chunk) upload
  const [isModelOpen, setIsModelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadMultipalFiles, isUploading, progressMap, error } = useChunkedUpload();

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
      alert('All files uploaded successfully!');
      setSelectedFiles([]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <section className="mainContainer">
      <header className="header">
        <h1 className="title">Asset Overview</h1>
        <Link className="routes" to="/dashboard">
          Go to dashboard
        </Link>
      </header>
      <div className={styles.tableContainer}>
        <div className={styles.toolbar}>
          <div className={styles.actionsLeft}>
            <button className={styles.btn}>Filter</button>
            <input type="text" placeholder="Search assets..." className={styles.searchInput} />
          </div>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setIsModelOpen(true)}
          >
            + Upload
          </button>
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
                      className={`${styles.badge} ${asset.status === 'Approved' ? styles.approved : styles.pending}`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td>{asset.owner}</td>
                  <td style={{ color: '#9ca3af' }}>{asset.updated}</td>
                  <td>
                    <Link to={`${asset.id}`}>Open</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* upload files Modal */}
      <Modal
        isOpen={isModelOpen}
        onClose={() => !isUploading && setIsModelOpen(false)}
        title="Upload Asset"
      >
        <form onSubmit={handleSubmit} className={styles.form}>
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
          {/* Multiple Progress Bars Container */}
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
                : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default AssetTable;
