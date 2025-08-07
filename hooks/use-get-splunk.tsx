import { useQuery } from '@tanstack/react-query';
import splunkApiData from '@/lib/splunk-api-data.json';

export interface SplunkDataItem {
  aiT_NUM: string;
  aiT_NAME: string;
  FLOW_DIRECTION: string;
  flow_AIT_NUM: string;
  flow_AIT_NAME: string;
  is_TRAFFIC_FOLLOWING: string | null;
  is_TRAFFIC_ON_TREND: string;
  average_TRANSACTION_COUNT: string;
  current_TRANSACTION_COUNT: string;
  historic_STD: string;
  historic_MEAN: string;
  current_STD_VARIATION: string;
}

export function useGetSplunk() {
  const splunkData = useQuery({
    queryKey: ['splunk-data'],
    queryFn: async (): Promise<SplunkDataItem[]> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return the imported JSON data
      return splunkApiData as SplunkDataItem[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    data: splunkData.data,
    isLoading: splunkData.isLoading,
    isError: splunkData.isError,
    error: splunkData.error,
    refetch: splunkData.refetch
  };
}
