import { useEffect } from "react";
import { CloseIcon } from "./Icons";

const TrailerModal = ({ videoKey, title, onClose }) => {
  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} trailer`}
      onClick={onClose}
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close trailer" autoFocus>
          <CloseIcon />
        </button>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
          title={`${title} trailer`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default TrailerModal;
