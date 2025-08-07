import { useQuery } from '@tanstack/react-query';
import splunkApiData from '@/lib/splunk-api-data.json';

export interface SplunkDataItem {
  aiT_NUM: string;
  aiT_NAME: string;
  floW_DIRECTION: string;
  floW_AIT_NUM: string;
  floW_AIT_NAME: string;
  iS_TRAFFIC_FOLLOWING: "Yes" | "No" | null;
  iS_TRAFFIC_ON_TREND: string;
  averagE_TRANSACTION_COUNT: string;
  currenT_TRANSACTION_COUNT: string;
  historiC_STD: string;
  historiC_MEAN: string;
  currenT_STD_VARIATION: string;
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
