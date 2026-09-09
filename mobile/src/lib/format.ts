// This file deliberately avoids relying on Intl.* APIs beyond the most
// basic ones. Hermes' Intl support varies by platform and Expo Go build —
// Intl.RelativeTimeFormat threw "undefined cannot be used as a
// constructor" on a real device while working fine in the web preview,
// even though Intl.NumberFormat worked in both. Rather than gamble on
// which Intl formatters a given device happens to ship, the date/relative-
// time helpers here are hand-rolled, and the one Intl call we do keep has
// a manual fallback.

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatExactNumber(value: number): string {
  try {
    return new Intl.NumberFormat('en-US').format(value);
  } catch {
    // Manual thousands separator, in case Intl.NumberFormat itself is
    // ever unavailable on some device/build.
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${hours}:${minutes} ${meridiem}`;
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];

  for (const [unit, secondsInUnit] of units) {
    const value = Math.floor(seconds / secondsInUnit);
    if (value >= 1) {
      return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}

export function truncateUrl(url: string, maxLength = 40): string {
  if (url.length <= maxLength) return url;
  return `${url.slice(0, maxLength - 1)}…`;
}

export function referrerLabel(referrer: string | null): string {
  if (!referrer) return 'Direct';
  try {
    return new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return referrer;
  }
}

export function locationLabel(click: { city: string | null; country: string | null }): string {
  const hasRealCity = click.city && click.city !== 'Unknown' && click.city !== 'Local';
  if (hasRealCity) return `${click.city}, ${click.country}`;
  return click.country || 'Unknown';
}
