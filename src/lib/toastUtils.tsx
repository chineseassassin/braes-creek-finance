import toast from 'react-hot-toast';

interface UndoOptions {
  message: string;
  onUndo: () => void;
  duration?: number;
}

/**
 * Displays a toast with an "Undo" button. 
 * If the user clicks Undo within the duration, it fires the onUndo callback.
 */
export const toastWithUndo = ({ message, onUndo, duration = 5000 }: UndoOptions) => {
  toast(
    (t) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#fff' }}>
          {message}
        </span>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onUndo();
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            padding: '4px 10px',
            color: '#39C86A',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          UNDO
        </button>
      </div>
    ),
    {
      duration,
      style: {
        background: '#222',
        border: '1px solid #333',
        padding: '12px 16px',
        color: '#fff',
        minWidth: '300px'
      },
    }
  );
};
