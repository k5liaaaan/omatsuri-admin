import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Prefecture {
  id: number;
  name: string;
}

interface Municipality {
  id: number;
  name: string;
  prefectureId: number;
}

interface FestivalFormData {
  name: string;
  municipalityId: number;
  address: string;
  content: string;
  foodStalls: string;
  sponsors: string;
  isVisible: boolean;
  schedules: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

interface FestivalFormProps {
  festivalId?: number; // 編集モードの場合のお祭りID
  initialData?: FestivalFormData; // 編集モードの場合の初期データ
  isEditMode?: boolean; // 編集モードかどうか
}

const FestivalForm: React.FC<FestivalFormProps> = ({ 
  festivalId, 
  initialData, 
  isEditMode = false 
}) => {
  console.log('FestivalFormコンポーネントがレンダリングされました');
  
  try {
    const navigate = useNavigate();
    console.log('useNavigate取得成功');
    
    const { user } = useAuth();
    console.log('useAuth取得成功、ユーザー:', user);
    
         const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
     const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
     const [selectedPrefectureId, setSelectedPrefectureId] = useState<number>(0);
     console.log('prefectures初期値:', prefectures);
     console.log('municipalities初期値:', municipalities);
     console.log('selectedPrefectureId初期値:', selectedPrefectureId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const errorRef = React.useRef<HTMLDivElement>(null);

         const [formData, setFormData] = useState<FestivalFormData>(
       initialData || {
         name: '',
         municipalityId: 0,
         address: '',
         content: '',
         foodStalls: '',
         sponsors: '',
         isVisible: true,
         schedules: [{
           date: '',
           startTime: '',
           endTime: ''
         }]
       }
     );

    console.log('state初期化完了');

    // 編集モードの場合の初期データ設定
    useEffect(() => {
      if (isEditMode && initialData) {
        console.log('編集モード: 初期データを設定', initialData);
        setFormData(prev => ({
          ...prev,
          ...initialData,
          isVisible: typeof initialData.isVisible === 'boolean' ? initialData.isVisible : true
        }));
        
        // 市区町村から都道府県を特定
        if (initialData.municipalityId) {
          fetchMunicipalityPrefecture(initialData.municipalityId);
        }
      }
    }, [isEditMode, initialData]);

    // 市区町村から都道府県を取得する関数
    const fetchMunicipalityPrefecture = async (municipalityId: number) => {
      try {
        console.log('市区町村から都道府県を取得中:', municipalityId);
        const response = await fetch(`http://localhost:3001/api/region/municipalities/${municipalityId}`);
        if (response.ok) {
          const result = await response.json();
          console.log('取得した市区町村データ:', result);
          
          // APIレスポンス形式に合わせて処理
          const municipality = result.data || result;
          if (municipality && municipality.prefectureId) {
            setSelectedPrefectureId(municipality.prefectureId);
            console.log('都道府県IDを設定:', municipality.prefectureId);
            
            // 都道府県が設定されたら市区町村一覧を取得
            fetchMunicipalities(municipality.prefectureId);
          }
        } else {
          console.error('市区町村データの取得に失敗');
        }
      } catch (error) {
        console.error('市区町村データの取得エラー:', error);
      }
    };

        // 都道府県一覧を取得
    useEffect(() => {
      console.log('都道府県取得useEffect実行開始');
      const fetchPrefectures = async () => {
        try {
          console.log('都道府県データを取得中...');
          const response = await fetch('http://localhost:3001/api/region/prefectures');
          console.log('都道府県APIレスポンス:', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('取得した都道府県データ:', data);
            
            if (Array.isArray(data)) {
              setPrefectures(data);
            } else if (data && Array.isArray(data.prefectures)) {
              setPrefectures(data.prefectures);
            } else if (data && Array.isArray(data.data)) {
              setPrefectures(data.data);
            } else {
              console.error('予期しない都道府県データ形式:', data);
              setPrefectures([]);
              setError('都道府県データの形式が正しくありません');
            }
          } else {
            console.error('都道府県取得エラー:', response.status);
            setPrefectures([]);
            setError('都道府県の取得に失敗しました');
          }
        } catch (error) {
          console.error('都道府県取得エラー:', error);
          setPrefectures([]);
          setError('都道府県の取得に失敗しました');
        }
      };
      fetchPrefectures();
    }, []);

    // 市区町村一覧を取得する関数
    const fetchMunicipalities = async (prefectureId: number) => {
      try {
        console.log('市区町村データを取得中...', prefectureId);
        const response = await fetch(`http://localhost:3001/api/region/prefectures/${prefectureId}/municipalities`);
        console.log('市区町村APIレスポンス:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('取得した市区町村データ:', data);
          
          if (Array.isArray(data)) {
            setMunicipalities(data);
          } else if (data && Array.isArray(data.municipalities)) {
            setMunicipalities(data.municipalities);
          } else if (data && Array.isArray(data.data)) {
            setMunicipalities(data.data);
          } else {
            console.error('予期しない市区町村データ形式:', data);
            setMunicipalities([]);
            setError('市区町村データの形式が正しくありません');
          }
        } else {
          console.error('市区町村取得エラー:', response.status);
          setMunicipalities([]);
          setError('市区町村の取得に失敗しました');
        }
      } catch (error) {
        console.error('市区町村取得エラー:', error);
        setMunicipalities([]);
        setError('市区町村の取得に失敗しました');
      }
    };

    // 選択された都道府県の市区町村一覧を取得
    useEffect(() => {
      if (selectedPrefectureId > 0) {
        console.log('市区町村取得useEffect実行開始、都道府県ID:', selectedPrefectureId);
        fetchMunicipalities(selectedPrefectureId);
      }
    }, [selectedPrefectureId]);

    // エラー発生時に自動的にエラーメッセージまでスクロール
    useEffect(() => {
      if (error && errorRef.current) {
        errorRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, [error]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === 'isVisible') {
        setFormData(prev => ({
          ...prev,
          isVisible: value === 'true'
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    };
    const handleVisibilityToggle = (value: boolean) => {
      setFormData(prev => ({
        ...prev,
        isVisible: value
      }));
    };


    // 都道府県選択時の処理
    const handlePrefectureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const prefectureId = parseInt(e.target.value);
      setSelectedPrefectureId(prefectureId);
      setFormData(prev => ({
        ...prev,
        municipalityId: 0 // 市区町村をリセット
      }));
    };

    // モーダルを閉じてお祭り一覧ページに遷移
    const handleModalClose = () => {
      setShowSuccessModal(false);
      navigate('/festivals');
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setSuccess('');

      // 基本項目のバリデーション
      if (!formData.name.trim()) {
        setError('お祭り名は必須です');
        setLoading(false);
        return;
      }

      if (!formData.municipalityId) {
        setError('市区町村を選択してください');
        setLoading(false);
        return;
      }

      if (!formData.address.trim()) {
        setError('詳細住所は必須です');
        setLoading(false);
        return;
      }

      if (!formData.content.trim()) {
        setError('お祭りの内容は必須です');
        setLoading(false);
        return;
      }

      // 日程のバリデーション
      if (formData.schedules.length === 0) {
        setError('少なくとも1つの日程を設定してください');
        setLoading(false);
        return;
      }

      // 各日程の必須項目チェック
      for (let i = 0; i < formData.schedules.length; i++) {
        const schedule = formData.schedules[i];
        if (!schedule.date || !schedule.startTime || !schedule.endTime) {
          setError(`日程 ${i + 1} の開催日、開始時間、終了時間は必須です`);
          setLoading(false);
          return;
        }

        // 時間の妥当性チェック
        if (schedule.startTime >= schedule.endTime) {
          setError(`日程 ${i + 1} の開始時間は終了時間より前である必要があります`);
          setLoading(false);
          return;
        }
      }

      try {
        const token = localStorage.getItem('token');
        console.log('送信するトークン:', token);
        console.log('送信するデータ:', formData);
        
        const url = isEditMode 
          ? `http://localhost:3001/api/festivals/${festivalId}`
          : 'http://localhost:3001/api/festivals';
        
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          setShowSuccessModal(true);
          setSuccess(isEditMode ? 'お祭りの更新が完了しました！' : 'お祭りの登録が完了しました！');
        } else {
          const errorData = await response.json();
          setError(errorData.error || (isEditMode ? 'お祭りの更新に失敗しました' : 'お祭りの登録に失敗しました'));
        }
      } catch (error) {
        setError(isEditMode ? 'お祭りの更新に失敗しました' : 'お祭りの登録に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    const handleCancel = () => {
      if (isEditMode && festivalId) {
        // 編集モードの場合はお祭り詳細ページに戻る
        navigate(`/festivals/${festivalId}`);
      } else {
        // 新規登録モードの場合はダッシュボードに戻る
        navigate('/dashboard');
      }
    };

    // 日程を追加
    const addSchedule = () => {
      setFormData(prev => ({
        ...prev,
        schedules: [...prev.schedules, {
          date: '',
          startTime: '',
          endTime: ''
        }]
      }));
    };

    // 日程を削除
    const removeSchedule = (index: number) => {
      setFormData(prev => ({
        ...prev,
        schedules: prev.schedules.filter((_, i) => i !== index)
      }));
    };

    // 日程の変更を処理
    const handleScheduleChange = (index: number, field: 'date' | 'startTime' | 'endTime', value: string) => {
      setFormData(prev => ({
        ...prev,
        schedules: prev.schedules.map((schedule, i) => 
          i === index ? { ...schedule, [field]: value } : schedule
        )
      }));
    };

    console.log('レンダリング開始');

    // シンプルなテスト表示
    return (
      <div style={{ 
        padding: '2rem', 
        backgroundColor: '#f0f0f0', 
        minHeight: '100vh'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h1 style={{ color: '#333', marginBottom: '1rem' }}>
            {isEditMode ? 'お祭り編集ページ' : 'お祭り登録ページ'}
          </h1>
          
          {/* デバッグ情報 */}
          <div style={{ 
            backgroundColor: '#e8f4fd', 
            padding: '1rem', 
            marginBottom: '1rem', 
            borderRadius: '4px',
            border: '1px solid #bee5eb'
          }}>
            <p><strong>デバッグ情報:</strong></p>
            <p>ユーザー: {user?.username || '未ログイン'}</p>
            <p>都道府県数: {Array.isArray(prefectures) ? prefectures.length : '配列ではありません'}</p>
            <p>選択された都道府県ID: {selectedPrefectureId}</p>
            <p>市区町村数: {Array.isArray(municipalities) ? municipalities.length : '配列ではありません'}</p>
            <p>エラー: {error || 'なし'}</p>
            <p>ローディング: {loading ? 'はい' : 'いいえ'}</p>
            <p>現在のURL: {window.location.href}</p>
            <p>コンポーネント: FestivalForm</p>
            <p>レンダリング時刻: {new Date().toLocaleString('ja-JP')}</p>
            <p>日程数: {formData.schedules.length}</p>
            <p>日程詳細: {JSON.stringify(formData.schedules)}</p>
          </div>


          {success && (
            <div style={{ 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              padding: '1rem', 
              marginBottom: '1rem', 
              borderRadius: '4px',
              border: '1px solid #c3e6cb'
            }}>
              {success}
            </div>
          )}

                     <form onSubmit={handleSubmit}>
             {/* 開催日程 */}
             <div style={{ marginBottom: '2rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                   開催日程 <span style={{ color: 'red' }}>*</span>
                 </label>
                 <button
                   type="button"
                   onClick={addSchedule}
                   style={{ 
                     padding: '0.5rem 1rem', 
                     border: '1px solid #007bff', 
                     borderRadius: '4px', 
                     backgroundColor: '#007bff',
                     color: 'white',
                     cursor: 'pointer',
                     fontSize: '0.9rem'
                   }}
                 >
                   + 日程を追加
                 </button>
               </div>

               {formData.schedules.length === 0 ? (
                 <div style={{ 
                   padding: '1rem', 
                   backgroundColor: '#f8f9fa', 
                   borderRadius: '4px',
                   border: '1px solid #dee2e6',
                   textAlign: 'center',
                   color: '#6c757d'
                 }}>
                   日程を追加してください
                 </div>
               ) : (
                 formData.schedules.map((schedule, index) => (
                   <div key={index} style={{ 
                     marginBottom: '1rem', 
                     padding: '1rem', 
                     border: '1px solid #ddd', 
                     borderRadius: '4px',
                     backgroundColor: '#f8f9fa'
                   }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <h4 style={{ margin: 0, color: '#333' }}>日程 {index + 1}</h4>
                       {formData.schedules.length > 1 && (
                         <button
                           type="button"
                           onClick={() => removeSchedule(index)}
                           style={{ 
                             padding: '0.25rem 0.5rem', 
                             border: '1px solid #dc3545', 
                             borderRadius: '4px', 
                             backgroundColor: '#dc3545',
                             color: 'white',
                             cursor: 'pointer',
                             fontSize: '0.8rem'
                           }}
                         >
                           削除
                         </button>
                       )}
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                       <div>
                         <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                           開催日 <span style={{ color: 'red' }}>*</span>
                         </label>
                         <input
                           type="date"
                           value={schedule.date}
                           onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                           required
                           style={{ 
                             width: '100%', 
                             padding: '0.5rem', 
                             border: '1px solid #ddd', 
                             borderRadius: '4px' 
                           }}
                         />
                       </div>

                       <div>
                         <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                           開始時間 <span style={{ color: 'red' }}>*</span>
                         </label>
                         <input
                           type="time"
                           value={schedule.startTime}
                           onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                           required
                           style={{ 
                             width: '100%', 
                             padding: '0.5rem', 
                             border: '1px solid #ddd', 
                             borderRadius: '4px' 
                           }}
                         />
                       </div>

                       <div>
                         <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                           終了時間 <span style={{ color: 'red' }}>*</span>
                         </label>
                         <input
                           type="time"
                           value={schedule.endTime}
                           onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                           required
                           style={{ 
                             width: '100%', 
                             padding: '0.5rem', 
                             border: '1px solid #ddd', 
                             borderRadius: '4px' 
                           }}
                         />
                       </div>
                     </div>
                   </div>
                 ))
               )}
             </div>

                         {/* 都道府県選択 */}
             <div style={{ marginBottom: '1rem' }}>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                 都道府県 <span style={{ color: 'red' }}>*</span>
               </label>
               <select
                 name="prefectureId"
                 value={selectedPrefectureId}
                 onChange={handlePrefectureChange}
                 required
                 style={{ 
                   width: '100%', 
                   padding: '0.5rem', 
                   border: '1px solid #ddd', 
                   borderRadius: '4px' 
                 }}
               >
                 <option value="">都道府県を選択してください</option>
                 {Array.isArray(prefectures) && prefectures.map((prefecture) => (
                   <option key={prefecture.id} value={prefecture.id}>
                     {prefecture.name}
                   </option>
                 ))}
               </select>
             </div>

             {/* 市区町村選択 */}
             <div style={{ marginBottom: '1rem' }}>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                 市区町村 <span style={{ color: 'red' }}>*</span>
               </label>
               <select
                 name="municipalityId"
                 value={formData.municipalityId}
                 onChange={handleInputChange}
                 required
                 disabled={selectedPrefectureId === 0}
                 style={{ 
                   width: '100%', 
                   padding: '0.5rem', 
                   border: '1px solid #ddd', 
                   borderRadius: '4px',
                   backgroundColor: selectedPrefectureId === 0 ? '#f8f9fa' : 'white'
                 }}
               >
                 <option value="">
                   {selectedPrefectureId === 0 ? '都道府県を先に選択してください' : '市区町村を選択してください'}
                 </option>
                 {Array.isArray(municipalities) && municipalities.map((municipality) => (
                   <option key={municipality.id} value={municipality.id}>
                     {municipality.name}
                   </option>
                 ))}
               </select>
             </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                詳細住所 <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="例：千葉市中央区富士見1-1-1"
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                お祭り名 <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="例：千葉まつり"
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                お祭りの内容 <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                placeholder="お祭りの詳細な内容を記載してください"
                rows={4}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                出店情報
              </label>
              <textarea
                name="foodStalls"
                value={formData.foodStalls}
                onChange={handleInputChange}
                placeholder="出店の種類や数などを記載してください"
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                協賛（スポンサー）情報
              </label>
              <textarea
                name="sponsors"
                value={formData.sponsors}
                onChange={handleInputChange}
                placeholder="協賛企業やスポンサー情報を記載してください"
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ 
              marginBottom: '2rem',
              padding: '1rem',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa'
            }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                公開設定
              </label>
              <p style={{ 
                marginBottom: '1rem', 
                color: '#555', 
                fontSize: '0.9rem' 
              }}>
                非公開にすると、一般ユーザーの公開一覧には表示されません。後から公開設定を変更できます。
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.5rem 1rem', 
                  border: formData.isVisible ? '2px solid #007bff' : '1px solid #ced4da',
                  borderRadius: '4px',
                  backgroundColor: formData.isVisible ? '#e7f1ff' : 'white',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.isVisible}
                    onChange={() => handleVisibilityToggle(true)}
                  />
                  公開
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.5rem 1rem', 
                  border: !formData.isVisible ? '2px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '4px',
                  backgroundColor: !formData.isVisible ? '#fdebea' : 'white',
                  cursor: 'pointer'
                }}>
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={!formData.isVisible}
                    onChange={() => handleVisibilityToggle(false)}
                  />
                  非公開
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer'
                }}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  border: 'none', 
                  borderRadius: '4px', 
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                {loading ? '登録中...' : '登録する'}
              </button>
            </div>

            {/* エラーメッセージ表示 */}
            {error && (
              <div 
                ref={errorRef}
                style={{ 
                  backgroundColor: '#f8d7da', 
                  color: '#721c24', 
                  padding: '1rem', 
                  marginTop: '1rem', 
                  borderRadius: '4px',
                  border: '1px solid #f5c6cb',
                  textAlign: 'center'
                }}
              >
                <strong>⚠️ エラー</strong><br />
                {error}
              </div>
            )}
          </form>
        </div>

        {/* 成功モーダル */}
        {showSuccessModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              maxWidth: '400px',
              width: '90%',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '3rem',
                color: '#28a745',
                marginBottom: '1rem'
              }}>
                ✅
              </div>
              <h2 style={{
                color: '#333',
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                登録完了！
              </h2>
              <p style={{
                color: '#666',
                marginBottom: '2rem',
                lineHeight: '1.5'
              }}>
                お祭りの登録が正常に完了しました。<br />
                お祭り一覧ページに移動します。
              </p>
              <button
                onClick={handleModalClose}
                style={{
                  padding: '0.75rem 2rem',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold'
                }}
              >
                お祭り一覧を見る
              </button>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('FestivalFormコンポーネントでエラーが発生しました:', error);
    return (
      <div style={{ 
        padding: '2rem', 
        backgroundColor: '#f8d7da', 
        color: '#721c24',
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
          <h1 style={{ color: '#721c24', marginBottom: '1rem' }}>
            エラーが発生しました
          </h1>
          <p style={{ color: '#721c24', marginBottom: '2rem' }}>
            FestivalFormコンポーネントでエラーが発生しました。
          </p>
          <div style={{ 
            backgroundColor: '#f8d7da', 
            padding: '1rem', 
            borderRadius: '4px',
            border: '1px solid #f5c6cb',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <p><strong>エラー詳細:</strong></p>
            <p>{error instanceof Error ? error.message : String(error)}</p>
            <p>現在のURL: {window.location.href}</p>
            <p>エラー時刻: {new Date().toLocaleString('ja-JP')}</p>
          </div>
          <button 
            onClick={() => window.history.back()}
            style={{ 
              padding: '0.75rem 1.5rem', 
              border: 'none', 
              borderRadius: '4px', 
              backgroundColor: '#721c24',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            戻る
          </button>
        </div>
      </div>
    );
  }
};

export default FestivalForm;
