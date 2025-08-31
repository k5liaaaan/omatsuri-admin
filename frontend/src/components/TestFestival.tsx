import React from 'react';

const TestFestival: React.FC = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>
          お祭り登録テストページ
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          このページが表示されれば、ルーティングは正常に動作しています。
        </p>
        <div style={{ 
          backgroundColor: '#e8f4fd', 
          padding: '1rem', 
          borderRadius: '4px',
          border: '1px solid #bee5eb'
        }}>
          <p><strong>デバッグ情報:</strong></p>
          <p>現在のURL: {window.location.href}</p>
          <p>コンポーネント: TestFestival</p>
          <p>レンダリング時刻: {new Date().toLocaleString('ja-JP')}</p>
        </div>
      </div>
    </div>
  );
};

export default TestFestival;
