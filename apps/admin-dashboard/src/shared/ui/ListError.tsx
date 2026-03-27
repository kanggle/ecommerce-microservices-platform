interface ListErrorProps {
  message: string;
  onRetry: () => void;
}

export function ListError({ message, onRetry }: ListErrorProps) {
  return (
    <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'red' }}>{message}</p>
      <button onClick={onRetry} style={{ marginTop: '1rem' }}>
        다시 시도
      </button>
    </div>
  );
}
