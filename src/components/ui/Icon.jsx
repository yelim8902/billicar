import React from 'react';

// 토스형 UI를 위한 심플 라인 아이콘 세트 (emoji 대체)
const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ children, size, ...rest }) {
  return (
    <svg {...base} width={size || base.width} height={size || base.height} {...rest}>
      {children}
    </svg>
  );
}

export const IconHome = (p) => (
  <Svg {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" /></Svg>
);

export const IconCalendar = (p) => (
  <Svg {...p}><rect x="3.5" y="5" width="17" height="16" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></Svg>
);

export const IconKey = (p) => (
  <Svg {...p}><circle cx="8" cy="15" r="4" /><path d="M11 12l8-8M16.5 6.5 19 4M14 9l2 2" /></Svg>
);

export const IconCar = (p) => (
  <Svg {...p}><path d="M4 16v-3.2a2 2 0 0 1 .34-1.12L6.2 8.9A3 3 0 0 1 8.7 7.5h6.6a3 3 0 0 1 2.5 1.4l1.86 2.78c.24.34.34.75.34 1.16V16" /><path d="M3.5 16h17v2.4a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-1V17H6.7v1.4a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1V16Z" /><circle cx="7.5" cy="16" r="1.4" /><circle cx="16.5" cy="16" r="1.4" /></Svg>
);

export const IconDocument = (p) => (
  <Svg {...p}><path d="M7 3.5h7l4 4V20H7a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" /><path d="M14 3.5V8h4M8.5 12h6M8.5 15.5h4.5" /></Svg>
);

export const IconChart = (p) => (
  <Svg {...p}><path d="M4 20V10M12 20V4M20 20v-7" /><path d="M3 20h18" /></Svg>
);

export const IconWallet = (p) => (
  <Svg {...p}><rect x="3.5" y="6" width="17" height="13" rx="3" /><path d="M3.5 10h17" /><circle cx="16.5" cy="14" r="1.1" fill="currentColor" stroke="none" /></Svg>
);

export const IconSearch = (p) => (
  <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-3.6-3.6" /></Svg>
);

export const IconMapPin = (p) => (
  <Svg {...p}><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.3" /></Svg>
);

export const IconShield = (p) => (
  <Svg {...p}><path d="M12 3.5 5 6v5.5c0 4.6 3 7.6 7 9 4-1.4 7-4.4 7-9V6l-7-2.5Z" /></Svg>
);

export const IconChevronRight = (p) => (
  <Svg {...p}><path d="m9 6 6 6-6 6" /></Svg>
);

export const IconChevronLeft = (p) => (
  <Svg {...p}><path d="m15 6-6 6 6 6" /></Svg>
);

export const IconChevronUp = (p) => (
  <Svg {...p}><path d="m6 15 6-6 6 6" /></Svg>
);

export const IconChevronDown = (p) => (
  <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
);

export const IconClose = (p) => (
  <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
);

export const IconCheck = (p) => (
  <Svg {...p}><path d="m5 13 4 4L19 7" /></Svg>
);

export const IconAlert = (p) => (
  <Svg {...p}><path d="M12 9v4.5" /><circle cx="12" cy="16.2" r="0.2" fill="currentColor" /><path d="M10.6 4.4a1.6 1.6 0 0 1 2.8 0l7.6 13.3a1.6 1.6 0 0 1-1.4 2.4H4.4a1.6 1.6 0 0 1-1.4-2.4Z" /></Svg>
);

export const IconClock = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>
);

export const IconLogout = (p) => (
  <Svg {...p}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M14 15l4-3-4-3M18 12H9" /></Svg>
);

export const IconBolt = (p) => (
  <Svg {...p}><path d="M12.5 3 5 13.5h5.5L11 21l7.5-10.5H13L12.5 3Z" /></Svg>
);
