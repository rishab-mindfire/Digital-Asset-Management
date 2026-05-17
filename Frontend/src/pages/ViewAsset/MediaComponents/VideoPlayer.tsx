export const VideoPlayer = ({ assetId, ext }: { assetId: string; ext: string }) => {
  // Get the token
  const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY);

  // Construct the direct URL.
  const videoUrl = `${import.meta.env.VITE_BASE_URL}/admin/assets/${assetId}?stream=true&token=${token}`;

  return (
    <div>
      <video key={assetId} controls preload="metadata" style={{ height: '50vh' }}>
        <source src={videoUrl} type={ext === 'mov' ? 'video/mp4' : `video/${ext}`} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};
