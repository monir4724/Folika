const STORAGE_KEY = 'agri_api_base_url';

export interface ApiRequestResult<T> {
  data: T | null;
  source: 'live' | 'fallback';
  message?: string;
}

export const getApiBaseUrl = (): string => {
  const meta = import.meta as any;

  if (typeof window === 'undefined') {
    return meta.env?.VITE_API_BASE_URL || '';
  }

  return localStorage.getItem(STORAGE_KEY) || meta.env?.VITE_API_BASE_URL || '';
};

export const setApiBaseUrl = (value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, value);
  }
};

const getAuthHeaders = (): HeadersInit => {
  const meta = import.meta as any;
  const apiKey = meta.env?.VITE_API_KEY || '';
  return apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
};

export const requestApi = async <T>(path: string, fallback: T): Promise<ApiRequestResult<T>> => {
  const baseUrl = getApiBaseUrl().trim();

  if (!baseUrl) {
    return { data: fallback, source: 'fallback', message: 'No live API base configured yet.' };
  }

  try {
    const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      return { data: fallback, source: 'fallback', message: `API returned ${response.status}` };
    }

    const payload = await response.json();
    const data = payload?.data ?? payload;
    return { data, source: 'live' };
  } catch (error) {
    console.warn('Live API request failed, using fallback data.', error);
    return { data: fallback, source: 'fallback', message: 'Live API request failed.' };
  }
};

export const getWeatherApiInsight = async (params: { district?: string; lang?: 'bn' | 'en' }) => {
  const fallback = {
    summary: params.lang === 'en'
      ? 'Local weather guidance is active for now.'
      : 'এখন স্থানীয় আবহাওয়া ভিত্তিক পরামর্শ ব্যবহৃত হচ্ছে।',
    risk: params.lang === 'en' ? 'Monitor field conditions' : 'ক্ষেতের অবস্থা পর্যবেক্ষণ করুন',
  };

  return requestApi<{ summary: string; risk: string }>(
    `/weather?district=${encodeURIComponent(params.district || 'Pabna')}&lang=${params.lang || 'bn'}`,
    fallback,
  );
};

export const getMarketApiInsight = async (params: { crop?: string; lang?: 'bn' | 'en' }) => {
  const fallback = {
    title: params.lang === 'en' ? 'Market is steady' : 'বাজার এখন স্থিতিশীল',
    body: params.lang === 'en'
      ? 'Your local market insight is ready for review.'
      : 'আপনার স্থানীয় বাজার বিশ্লেষণ এখন প্রস্তুত।',
  };

  return requestApi<{ title: string; body: string }>(
    `/market?crop=${encodeURIComponent(params.crop || 'Aman Rice')}&lang=${params.lang || 'bn'}`,
    fallback,
  );
};
