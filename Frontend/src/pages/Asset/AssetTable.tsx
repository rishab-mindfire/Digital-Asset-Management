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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress, error } = useChunkedUpload();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      return;
    }
    try {
      await uploadFile(selectedFile);
      setIsModelOpen(false);
      alert('Upload successful! Background processing has started.');
    } catch (err) {
      console.log('error in file', err);
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
          {/* Drag & Drop Area */}
          <div
            className={styles.dropZone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <p>
                Ready to upload: <strong>{selectedFile.name}</strong>
              </p>
            ) : (
              <p>Drag files here or click to browse</p>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {/* Dynamic Progress Feedback */}
          {isUploading && (
            <div className={styles.progressWrapper}>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.percentageText}>{progress}%</span>
            </div>
          )}

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className="center">
            <button
              type="submit"
              className={styles.uploadFile}
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? 'Sending Chunks...' : 'Upload File'}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
};

export default AssetTable;
