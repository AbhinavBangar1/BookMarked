import './BookCard.css';

function BookCardSkeleton() {
  return (
    <div className="book-card">
      <div className="cover-wrapper skeleton-cover">
        <div className="skeleton-shimmer" />

        <div className="cover-info">
          <div className="skeleton-title" />
        </div>
      </div>
    </div>
  );
}

export default BookCardSkeleton;