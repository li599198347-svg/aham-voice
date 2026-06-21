// Skeleton scaffold for initial page load, composed from the official
// `.skeleton` shimmer primitive. Mimics a title + subtitle + a few rows.
export function PageLoading() {
  return (
    <div className="skeleton-block" aria-busy="true" aria-live="polite">
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--sub" />
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text" />
    </div>
  );
}
