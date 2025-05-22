// GSTzen API integration
const GSTZEN_API_URL = 'https://gstzen-api.in/v1';
const GSTZEN_API_KEY = process.env.EXPO_PUBLIC_GSTZEN_API_KEY;

interface GSTVerificationResponse {
  valid: boolean;
  business_name?: string;
  business_address?: string;
  registration_date?: string;
  error?: string;
}

export async function verifyGST(gstNumber: string): Promise<GSTVerificationResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${GSTZEN_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GSTZEN_API_KEY}`,
        'X-API-KEY': GSTZEN_API_KEY || '',
      },
      body: JSON.stringify({ gst_number: gstNumber }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      valid: true,
      business_name: data.business_name,
      business_address: data.business_address,
      registration_date: data.registration_date,
    };
  } catch (error) {
    console.error('GST verification error:', error);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          valid: false,
          error: 'Request timed out. Please try again.',
        };
      }
      return {
        valid: false,
        error: error.message || 'GST verification failed',
      };
    }

    return {
      valid: false,
      error: 'GST verification failed. Please try again later.',
    };
  }
}