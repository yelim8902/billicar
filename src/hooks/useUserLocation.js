import { useEffect, useState } from 'react';

// 브라우저 위치 권한을 요청해 [위도, 경도]를 반환. 거부/미지원 시 error만 채워짐
// (호출한 쪽에서 error가 있으면 거리 표시를 생략하거나 기본 정렬로 보여주면 됨)
export function useUserLocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('이 기기에서는 위치를 사용할 수 없어요.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition([coords.latitude, coords.longitude]);
        setLoading(false);
      },
      () => {
        setError('위치 권한을 허용하면 가까운 차량순으로 볼 수 있어요.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return { position, error, loading };
}
