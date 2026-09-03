import React from 'react';

/**
 * Official YouTube Icon Component
 * Compliant with YouTube API Services Branding Guidelines (Policy III.F.2a-b).
 * 
 * - Enforces minimum 20dp/20px sizing constraint.
 * - Standard official Red (#FF0000) mark with equilateral white (#FFFFFF) play triangle.
 * - Prevents distortion, skewing, or non-standard rendering.
 */
const YouTubeIcon = ({ size = 20, width = null, height = null, className = '', monochrome = null, style = {}, ...props }) => {
  // Policy III.F.2a-b: The YouTube icon and logo height should NEVER be smaller than 20dp/20px.
  // The path has an aspect ratio of 24 : 16.91 (~1.419).
  // By setting viewBox="0 3.545 24 16.91", the path fills 100% of the SVG height with zero padding.
  const finalHeight = Math.max(Number(height || size) || 20, 20);
  const finalWidth = width ? Math.max(Number(width) || 28, 28) : Math.round(finalHeight * (24 / 16.91));
  const markFill = monochrome ? monochrome : '#FF0000';
  const triangleFill = monochrome ? (monochrome === 'white' || monochrome === '#fff' || monochrome === '#ffffff' ? 'rgba(0,0,0,0.5)' : '#FFFFFF') : '#FFFFFF';

  return (
    <svg
      width={finalWidth}
      height={finalHeight}
      viewBox="0 3.545 24 16.91"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 inline-block align-middle ${className}`}
      style={{ minHeight: '20px', ...style }}
      aria-label="YouTube"
      role="img"
      {...props}
    >
      <path
        fill={markFill}
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path
        fill={triangleFill}
        d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      />
    </svg>
  );
};

export default YouTubeIcon;
