import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RegionMaster from './RegionMaster';
import MunicipalityList from './MunicipalityList';
import MunicipalityForm from './MunicipalityForm';

interface Prefecture {
  id: number;
  code: string;
  name: string;
}

const RegionMasterContainer: React.FC = () => {
  const { prefectureId, municipalityId } = useParams<{ 
    prefectureId: string; 
    municipalityId?: string; 
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  // デバッグ用ログ
  console.log('RegionMasterContainer params:', { prefectureId, municipalityId });
  console.log('Current location:', location.pathname);

  const handlePrefectureClick = (prefecture: Prefecture) => {
    navigate(`/region/${prefecture.id}`);
  };

  const handleBackToPrefectures = () => {
    navigate('/region');
  };

  // 市区町村登録・編集画面の場合
  if (prefectureId && municipalityId) {
    // 編集画面の場合
    const isEdit = true;
    const actualMunicipalityId = parseInt(municipalityId);
    
    return (
      <MunicipalityForm
        prefectureId={parseInt(prefectureId)}
        prefectureName="" // 後で動的に取得
        municipalityId={actualMunicipalityId}
      />
    );
  }

  // 市区町村新規登録画面の場合
  if (prefectureId && location.pathname.includes('/municipalities/new')) {
    return (
      <MunicipalityForm
        prefectureId={parseInt(prefectureId)}
        prefectureName="" // 後で動的に取得
        municipalityId={undefined}
      />
    );
  }

  // 都道府県IDが指定されている場合は市区町村一覧を表示
  if (prefectureId) {
    return (
      <MunicipalityList
        prefectureId={parseInt(prefectureId)}
        onBack={handleBackToPrefectures}
      />
    );
  }

  // 都道府県一覧を表示
  return (
    <RegionMaster onPrefectureClick={handlePrefectureClick} />
  );
};

export default RegionMasterContainer;
