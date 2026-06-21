export const ProgressBar = ({ value, className = '' }: { value: number; className?: string }) => (
  <div className={`progress-row ${className}`.trim()}>
    <div><i style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} /></div>
  </div>
);
