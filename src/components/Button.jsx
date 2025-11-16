export default function Button({ children, kind='primary', className='', ...props }) {
    // kind: 'primary' (bright), 'ghost' (outlined), 'accent' (gold; optional)
    const kindClass =
      kind === 'primary' ? 'btn-primary' :
      kind === 'ghost'   ? 'btn-ghost'   :
      kind === 'accent'  ? 'btn-accent'  : '';
    return (
      <button className={`btn ${kindClass} ${className}`} {...props}>
        {children}
      </button>
    );
  }
  