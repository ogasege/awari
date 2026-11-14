/**
 * An image that never shows the browser's broken-image icon (26-final-review, finding F-001). If the picture cannot
 * load, for example a library picture not yet saved while offline, a paper placeholder of the same size takes its
 * place with one plain line. `onFail` lets a parent say something once for the whole strip.
 */
import { useState, type ImgHTMLAttributes } from 'react';
import './safeimg.css';

export interface SafeImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  onFail?: () => void;
}

export function SafeImg({ onFail, onError, className, style, src, alt, width, height, ...rest }: SafeImgProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  // A failure is remembered per source, so a new source is tried afresh without an effect.
  if (failedSrc === src) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    return (
      <span
        role="img"
        aria-label={`${alt} (picture not available${offline ? ' without a connection' : ''})`}
        className={`pic-missing ${className ?? ''}`}
        style={{ ...style, aspectRatio: style?.aspectRatio ?? (width && height ? `${width} / ${height}` : undefined) }}
      >
        <span className="pic-missing__text hand" aria-hidden="true">
          {offline ? 'Needs a connection' : 'Picture not available'}
        </span>
      </span>
    );
  }
  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={(e) => {
        setFailedSrc(src);
        onFail?.();
        onError?.(e);
      }}
    />
  );
}
