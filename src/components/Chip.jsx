export default function Chip({ children, active=false, onClick }) {
    return (
      <button
        type="button"
        className={`chip ${active ? 'active' : ''}`}
        aria-pressed={active}
        onClick={onClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }
        }}
      >
        {children}
      </button>
    );
  }
  