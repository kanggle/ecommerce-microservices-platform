import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>상품을 찾을 수 없습니다</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        요청하신 상품이 존재하지 않거나 삭제되었습니다.
      </p>
      <Link
        href="/products"
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#333',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        상품 목록으로 돌아가기
      </Link>
    </div>
  );
}
