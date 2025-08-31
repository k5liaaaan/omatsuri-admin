import React from 'react';

const SimpleFestivalForm: React.FC = () => {
  console.log('SimpleFestivalFormコンポーネントがレンダリングされました');
  
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
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '1rem' }}>
          シンプルお祭り登録ページ
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          このページが表示されれば、FestivalFormコンポーネントは正常に動作します。
        </p>
        <div style={{ 
          backgroundColor: '#e8f4fd', 
          padding: '1rem', 
          borderRadius: '4px',
          border: '1px solid #bee5eb',
          marginBottom: '2rem'
        }}>
          <p><strong>デバッグ情報:</strong></p>
          <p>現在のURL: {window.location.href}</p>
          <p>コンポーネント: SimpleFestivalForm</p>
          <p>レンダリング時刻: {new Date().toLocaleString('ja-JP')}</p>
        </div>
        <button 
          onClick={() => window.history.back()}
          style={{ 
            padding: '0.75rem 1.5rem', 
            border: 'none', 
            borderRadius: '4px', 
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          戻る
        </button>
      </div>
    </div>
  );
};

export default SimpleFestivalForm;
