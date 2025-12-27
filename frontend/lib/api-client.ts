const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

const MOCK_STATIONS = [
  {
    id: 1,
    organization_code: "ODPT.Operator:JR-East",
    line_name: "山手線",
    name: "東京",
    prefecture_code: 13,
    location: "POINT(139.767125 35.681236)",
    distance: 500,
    total_score: 95,
    address: "東京都千代田区丸の内一丁目",
  },
  {
    id: 2,
    organization_code: "ODPT.Operator:TokyoMetro",
    line_name: "丸ノ内線",
    name: "大手町",
    prefecture_code: 13,
    location: "POINT(139.762886 35.684523)",
    distance: 800,
    total_score: 88,
    address: "東京都千代田区大手町",
  },
  {
    id: 3,
    organization_code: "ODPT.Operator:JR-East",
    line_name: "中央線",
    name: "神田",
    prefecture_code: 13,
    location: "POINT(139.770641 35.69169)",
    distance: 1200,
    total_score: 82,
    address: "東京都千代田区鍛冶町",
  },
];

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("/")
    ? endpoint
    : `${API_BASE_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, response.statusText, error);
    }

    return response.json();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`API Error (${url}):`, error);
      console.info(
        "⚠️ Falling back to MOCK DATA due to API connection failure."
      );

      if (
        endpoint.includes("stations/search") ||
        endpoint.includes("stations/nearby")
      ) {
        return MOCK_STATIONS as unknown as T;
      }
    }
    throw error;
  }
}

export { fetchApi, ApiError };
