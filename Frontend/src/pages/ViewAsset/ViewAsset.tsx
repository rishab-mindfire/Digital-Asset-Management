import { useParams } from 'react-router-dom';

const ViewAsset = () => {
  const { assetId } = useParams<{ assetId: string }>();
  console.log(assetId);
  return <div>ViewAsset {assetId}</div>;
};

export default ViewAsset;
