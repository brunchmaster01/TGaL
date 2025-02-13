let map;
let marker;
const targetLocation = { lat: 37.483393, lng: 126.729683 }; // 목표 위치
const radius = 1000; // 목표 반경 (미터 단위)

// 오디오 객체 생성 (자동 재생을 위한 준비)
const audio = new Audio('/sounds/happy_home.mp3'); // 경로에 맞게 수정
let audioPlayed = false; // 중복 재생 방지

audio.loop = false; // 반복 여부 (원하면 true)

// 거리 계산 함수 (Haversine 공식)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 결과: 두 지점 사이 거리 (미터 단위)
}

// 지도 초기화 및 현재 위치 표시
function initMap() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }


    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15
    });

    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const userLocation = { lat: latitude, lng: longitude };

            // 지도 중심을 업데이트
            map.setCenter(userLocation);

            if (!marker) {
                marker = new google.maps.Marker({
                    position: userLocation,
                    map,
                    title: "현재 위치",
                });
            } else {
                marker.setPosition(userLocation);
            }
        },
        (error) => {
            console.error("위치 오류:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000
        }
    );
}

// 실시간 위치 추적 및 이벤트 감지
function trackLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.watchPosition(position => {
            const { latitude, longitude } = position.coords;
            const userLocation = { lat: latitude, lng: longitude };

            console.log(`위치 업데이트: 위도 ${latitude}, 경도 ${longitude}`);

            // 지도 업데이트
            if (map && marker) {
                map.setCenter(userLocation);
                marker.setPosition(userLocation);
            }

            // 목표 위치와 현재 위치 거리 계산
            const distance = getDistance(latitude, longitude, targetLocation.lat, targetLocation.lng);
            console.log(`목표 위치까지 거리: ${distance.toFixed(2)}m`);

            // 목표 반경 이내 도달 시 알림 음악 재생
            if (distance <= radius && !audioPlayed) {
                playAudio(); // 자동 재생
                audioPlayed = true; // 중복 재생 방지
            }

        }, error => {
            console.error('위치 추적 오류:', error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
        });
    } else {
        console.error('Geolocation이 지원되지 않습니다.');
    }
}

// mp3 자동 재생 함수
function playAudio() {
    const audio = document.getElementById('alertSound');
    if (audio) {
        audio.play().catch(error => console.error('오디오 재생 오류:', error));
    }
}

// HTML 문서가 로드되면 위치 추적 시작
document.addEventListener("DOMContentLoaded", () => {
    trackLocation();
});
