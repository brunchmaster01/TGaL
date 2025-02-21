let map;
let marker;
let currentAudio = null; // 현재 재생 중인 오디오 저장
let audioQueue = []; // 오디오 재생 대기

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
    { lat: 37.504527, lng: 126.749448, radius: 1000, audioSrc: "/sounds/alarm01.mp3", played: false } 
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
window.initMap = function () { 
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.504540, lng: 126.749397 }, // 초기 중심 좌표 설정
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

            // 거리순 정렬 (반경이 작은 위치 먼저)
            const sortedTargets = [...targets].sort((a, b) => a.radius - b.radius);

            // 각 목표 지점과의 거리 계산
            sortedTargets.forEach(target => {
                const distance = getDistance(latitude, longitude, target.lat, target.lng);
                console.log(`목표 위치 (${target.audioSrc}) 까지 거리: ${distance.toFixed(2)}m, 반경: ${target.radius}m`);

                if (distance <= target.radius && !target.played) {
                    enqueueAudio(target.audioSrc);
                    target.played = true; // 중복 재생 방지
                }
            });

            // 큐에서 오디오 실행
            playNextAudio();
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
};

// 오디오 재생 대기열에 추가
function enqueueAudio(src) {
    audioQueue.push(src);
}

// 오디오 순차적으로 실행
function playNextAudio() {
    if (currentAudio || audioQueue.length === 0) return; // 현재 재생 중이면 대기

    const nextAudioSrc = audioQueue.shift(); // 큐에서 다음 오디오 가져오기
    currentAudio = new Audio(nextAudioSrc);

    currentAudio.play().then(() => {
        console.log(`오디오 재생 시작: ${nextAudioSrc}`);
    }).catch(error => console.error('오디오 재생 오류:', error));

    // 오디오 종료 시 다음 오디오 재생
    currentAudio.onended = () => {
        console.log(`오디오 재생 완료: ${nextAudioSrc}`);
        currentAudio = null;
        playNextAudio(); // 다음 오디오 실행
    };
}

// HTML 문서가 로드되면 Google Maps API가 실행될 준비 완료
document.addEventListener("DOMContentLoaded", () => {
    if (typeof google !== "undefined" && typeof google.maps !== "undefined") {
        initMap();
    } else {
        console.error("Google Maps API가 로드되지 않았습니다.");
    }
});
