export interface ShortUrl {
  id: number;
  short_code: string;
  short_url: string;
  original_url: string;
  title: string | null;
  created_at: string;
  expires_at: string | null;
  click_count: number;
}

export interface ClickPoint {
  date: string;
  count: number;
}

export interface CountEntry {
  label: string;
  count: number;
}

export interface RecentClick {
  id: number;
  clicked_at: string;
  referrer: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  country: string | null;
  city: string | null;
}

export interface UrlAnalytics {
  short_code: string;
  original_url: string;
  total_clicks: number;
  clicks_over_time: ClickPoint[];
  top_referrers: CountEntry[];
  top_countries: CountEntry[];
  top_browsers: CountEntry[];
  top_devices: CountEntry[];
  recent_clicks: RecentClick[];
}

export interface DashboardSummary {
  total_urls: number;
  total_clicks: number;
  clicks_over_time: ClickPoint[];
}
