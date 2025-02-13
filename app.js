let map;
let marker;

// 목표 위치 10개 및 각 위치별 반경, 음원 파일 설정
const targets = [
    { lat: 36.258445, lng: 136.906819, radius: 1500, audioSrc: "/sounds/alarm01.mp3", played: false },
    { lat: 36.263054, lng: 136.908559, radius: 40, audioSrc: "/sounds/alarm02.mp3", played: false },
    { lat: 36.261970, lng: 136.906830, radius: 40, audioSrc: "/sounds/alarm03.mp3", played: false },
    { lat: 36.260297, lng: 136.907088, radius: 100, audioSrc: "/sounds/alarm04.mp3", played: false },
    { lat: 36.257397, lng: 136.907612, radius: 40, audioSrc: "/sounds/alarm05.mp3", played: false },
    { lat: 36.256108, lng: 136.906638, radius: 40, audioSrc: "/sounds/alarm06.mp3", played: false },
    { lat: 36.255235, lng: 136.902372, radius: 40, audioSrc: "/sounds/alarm07.mp3", played: false },
    { lat: 36.257852, lng: 136.906190, radius: 200, audioSrc: "/sounds/alarm08.mp3", played: false },
    { lat: 37.504527, lng: 126.749448, radius: 2000, audioSrc: "/sounds/alarm01.mp3", played: false } 
];

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

            // 지도 중심 업데이트
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

            // 각 목표 지점과의 거리 계산
            targets.forEach(target => {
                const distance = getDistance(latitude, longitude, target.lat, target.lng);
                console.log(`목표 위치 (${target.audioSrc}) 까지 거리: ${distance.toFixed(2)}m, 반경: ${target.radius}m`);

                if (distance <= target.radius && !target.played) {
                    playAudio(target.audioSrc);
                    target.played = true; // 중복 재생 방지
                }
            });
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

// mp3 자동 재생 함수
function playAudio(src) {
    const audio = new Audio(src);
    audio.play().catch(error => console.error('오디오 재생 오류:', error));
}

// HTML 문서가 로드되면 위치 추적 시작
document.addEventListener("DOMContentLoaded", () => {
    initMap();
});
