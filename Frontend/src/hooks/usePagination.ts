import { useState, useCallback } from 'react';
import type { AssetApiResponse, AssetListType, FormattedAsset } from '../models/Types';
import { api } from '../services/apiInterceptor';

const usePagination = () => {
  const [assets, setAssets] = useState<FormattedAsset[]>([]);
  const [loadingAssets, setAssetLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const mapAssets = (rawAssets: AssetListType[]): FormattedAsset[] => {
    return rawAssets.map((asset) => ({
      id: asset._id,
      name: asset.title,
      type: asset.fileType,
      // null-check and uppercase for approval
      Approval: asset.approval
        ? asset.approval.charAt(0).toUpperCase() + asset.approval.slice(1)
        : 'Pending',
      owner: asset.owner,
      updated: new Date(asset.updatedAt).toLocaleDateString(),
    }));
  };

  const fetchAssets = useCallback(
    async (page = 1) => {
      setAssetLoading(true);
      try {
        // Use URLSearchParams to handle filters
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          search: search,
        });

        const response = await api.get(`/assets?${params.toString()}`);

        // the data  response.data
        const data: AssetApiResponse = response.data;

        if (data?.assets) {
          setAssets(mapAssets(data.assets));
          setPagination({
            total: data.total,
            page: data.page,
            totalPages: data.totalPages,
          });
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
      } finally {
        setAssetLoading(false);
      }
    },
    [search],
  );

  return { assets, pagination, loadingAssets, fetchAssets, setSearch, search };
};

export default usePagination;
