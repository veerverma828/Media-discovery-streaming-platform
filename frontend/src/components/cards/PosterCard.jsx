import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Star } from "lucide-react";
import { getMovieProgress } from "../../trackers/progressTracker.js";
import { useSettingsContext } from "../../context/SettingsContext.jsx";

function PosterCard({ item, type, rank }) {
  const navigate = useNavigate();
  const { syncMode } = useSettingsContext();
  const [imageError, setImageError] = useState(false);
  const mediaType = type || item.type || "movie";
  const progress = mediaType === "movie" ? getMovieProgress(item.id) : null;
  const year = item.releaseInfo || item.year;

  // Determine progress bar color based on sync mode
  const getProgressColor = (percentage) => {
    if (percentage > 90) return "#34c77b"; // Green for completed
    return syncMode === "trakt" ? "#e50914" : "#f5f5f5"; // Red for Trakt, white for local
  };

  return (
    <div
      className="poster-card"
      tabIndex="0"
      role="button"
      aria-label={item.name}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.click();
      }}
      onClick={() => {
        if (mediaType === "movie") {
          navigate(`/movie/${item.id}`, { state: { item } });
        } else {
          navigate(`/series/${item.id}`, { state: { item } });
        }
      }}
    >
      <div className="poster-img-container">
        {(!item.poster || imageError) ? (
          <div className="poster-placeholder">
            <Film size={32} className="text-text-muted" />
            <div className="poster-placeholder-text">{item.name}</div>
          </div>
        ) : (
          <img
            src={item.poster}
            alt={item.name}
            onError={() => setImageError(true)}
            loading="lazy"
            decoding="async"
            draggable="false"
          />
        )}
        {progress && progress.percentage > 0 && (
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${Math.max(progress.percentage || 0, 3)}%`,
                backgroundColor: getProgressColor(progress.percentage || 0),
              }}
            ></div>
          </div>
        )}

        {/* Info slides up on hover/focus for mouse users (CSS-gated via
            @media hover:hover). Touch and TV keep the title under the poster. */}
        <div className="poster-info" aria-hidden="true">
          <span className="poster-info-title">{item.name}</span>
          <span className="poster-info-meta">
            {item.imdbRating && (
              <span className="poster-info-rating">
                <Star size={12} fill="currentColor" />
                {item.imdbRating}
              </span>
            )}
            {year && <span>{year}</span>}
          </span>
        </div>

        {rank && <div className="poster-rank-badge" aria-hidden="true">{rank}</div>}
      </div>
      <p>{item.name}</p>
      <small>{[item.type, year].filter(Boolean).join(" · ")}</small>
    </div>
  );
}

export default memo(PosterCard);
