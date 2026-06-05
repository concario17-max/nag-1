// --- 오디오 플레이어 로직 ---
let updateInterval = null;

export function initAudioPlayer(sutraId) {
    const player = document.getElementById(`audio-player-${sutraId}`);
    const audio = document.getElementById(`audio-${sutraId}`);
    const playPauseBtn = document.getElementById(`play-pause-btn-${sutraId}`);
    const seekSlider = document.getElementById(`seek-slider-${sutraId}`);
    const progressBar = document.getElementById(`progress-bar-${sutraId}`);
    const currentTimeEl = document.getElementById(`current-time-${sutraId}`);
    const durationEl = document.getElementById(`duration-${sutraId}`);

    if (!player || !audio) return;

    setupAudioEvents(audio, { playPauseBtn, seekSlider, progressBar, currentTimeEl, durationEl, sutraId });
}

function setupAudioEvents(audio, els) {
    const { playPauseBtn, seekSlider, progressBar, currentTimeEl, durationEl, sutraId } = els;

    playPauseBtn.addEventListener('click', () => togglePlayPause(audio, playPauseBtn, sutraId));
    seekSlider.addEventListener('input', () => handleSeek(audio, seekSlider));
    audio.addEventListener('timeupdate', () => handleTimeUpdate(audio, { seekSlider, progressBar, currentTimeEl, durationEl }));
    audio.addEventListener('ended', () => handleAudioEnded(audio, { playPauseBtn, seekSlider, progressBar, currentTimeEl }));
}

function togglePlayPause(audio, btn, sutraId) {
    if (audio.paused || audio.ended) {
        if (audio.ended) audio.currentTime = 0;
        // play() 실패를 무시함 (예: 요소가 없거나 정책적 차단)
        audio.play().catch(() => { });
        updatePlayButton(btn, true);
        startProgressLoop(sutraId);
    } else {
        audio.pause();
        updatePlayButton(btn, false);
        stopProgressLoop();
    }
}

function handleSeek(audio, seekSlider) {
    const seekTime = (audio.duration / 100) * seekSlider.value;
    audio.currentTime = seekTime;
}

function handleTimeUpdate(audio, els) {
    const { seekSlider, progressBar, currentTimeEl, durationEl } = els;
    const progress = (audio.currentTime / audio.duration) * 100;

    seekSlider.value = progress;
    progressBar.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration || 0);
}

function handleAudioEnded(audio, els) {
    const { playPauseBtn, seekSlider, progressBar, currentTimeEl } = els;
    updatePlayButton(playPauseBtn, false);
    stopProgressLoop();
    seekSlider.value = 0;
    progressBar.style.width = '0%';
    currentTimeEl.textContent = "0:00";
    audio.currentTime = 0; // 명시적 초기화
}

function updatePlayButton(btn, isPlaying) {
    btn.innerHTML = isPlaying
        ? '<span class="material-symbols-outlined text-[24px]">pause</span>'
        : '<span class="material-symbols-outlined text-[24px]">play_arrow</span>';
}

function startProgressLoop(sutraId) {
    if (updateInterval) clearInterval(updateInterval);
    // 향후 'timeupdate'보다 부드러운 UI 갱신이 필요할 경우 추가함
}

function stopProgressLoop() {
    if (updateInterval) clearInterval(updateInterval);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function playAudio(id) {
    const audio = document.getElementById(`audio-${id}`);
    if (audio) {
        audio.play().catch(() => { });
    }
}
