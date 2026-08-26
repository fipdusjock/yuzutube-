function mediaProxyUrl(videoId, formatId) {
  return `/media/${encodeURIComponent(videoId)}?format_id=${encodeURIComponent(formatId)}`;
}

function renderNocookieEmbed(wrap, videoId) {
  wrap.innerHTML = `
    <div class="nocookie-player">
      <iframe
        src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen></iframe>
    </div>`;
}

function attachHlsSource(videoEl, hlsUrl) {
  if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
    videoEl.src = hlsUrl;
    return;
  }
  if (window.Hls && window.Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(hlsUrl);
    hls.attachMedia(videoEl);
  }
}

function renderPlayer(wrap, stream, info) {
  const videoId = stream.video_id;
  const isLive = !!(info.is_live || stream.is_live || info.live_status === "is_live");
  const streams = (stream.streams || []).map(s => {
    // バックエンドが自動生成する「合成ストリーム」(format_idが"muxed-"で始まる)は、
    // urlがバックエンド専用の相対パス(/api/muxed-stream/...)になっているため、
    // フロントエンド自身の中継エンドポイント(/media-muxed/...)を指すよう書き換える。
    if (s.url && s.format_id && s.format_id.startsWith("muxed-") && s.url.startsWith("/api/muxed-stream/")) {
      const qIndex = s.url.indexOf("?");
      const query = qIndex >= 0 ? s.url.slice(qIndex) : "";
      return { ...s, url: `/media-muxed/${encodeURIComponent(videoId)}${query}` };
    }
    return s;
  });
  const combined = streams.filter(s => s.url && s.vcodec && s.vcodec !== "none" && s.acodec && s.acodec !== "none");
  const videoOnly = streams.filter(s => s.url && s.vcodec && s.vcodec !== "none" && (!s.acodec || s.acodec === "none"));
  const audioOnly = streams.filter(s => s.url && (!s.vcodec || s.vcodec === "none") && s.acodec && s.acodec !== "none");
  const hlsUrl = stream.hls_url || null;
  const byHeight = new Map();
  combined.forEach(s => {
    const h = s.height || 0;
    const existing = byHeight.get(h);
    if (!existing || (s.tbr || 0) > (existing.tbr || 0)) byHeight.set(h, { ...s, needsAudioSync: false });
  });
  videoOnly.forEach(s => {
    const h = s.height || 0;
    if (!byHeight.has(h)) byHeight.set(h, { ...s, needsAudioSync: true });
  });
  const qualities = Array.from(byHeight.values()).sort((a, b) => (b.height || 0) - (a.height || 0));
  const bestAudio = audioOnly.slice().sort((a, b) => (b.abr || b.tbr || 0) - (a.abr || a.tbr || 0))[0] || null;
  const subtitleOptions = [
    ...(info.subtitles_languages || []).map(l => ({ lang: l, auto: false, label: l })),
    ...(info.automatic_captions_languages || []).map(l => ({ lang: l, auto: true, label: `${l} (自動生成)` })),
  ];

  if (!qualities.length && !hlsUrl) {
    wrap.innerHTML = '<div class="player-fallback">再生可能なフォーマットが見つかりませんでした。<br>(映像+音声が一体になったフォーマットが無い動画の可能性があります)</div>';
    return;
  }

  const defaultQuality = qualities.find(q => q.format_id === "18") || qualities[0] || null;
  const posterAttr = info.thumbnail ? ` poster="${escapeHtml(info.thumbnail)}"` : "";
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const qualityMenuHTML = qualities.map(q => {
    const label = q.height ? `${q.height}p${q.fps && q.fps > 30 ? q.fps : ""}` : (q.format_note || q.format_id || "?");
    const isDefault = defaultQuality && q.format_id === defaultQuality.format_id;
    return `<button type="button" class="settings-row settings-option" data-quality="${escapeHtml(q.format_id)}" data-selected="${isDefault ? "1" : "0"}"><span class="settings-check">${isDefault ? icon("check") : ""}</span><span>${escapeHtml(label)}${q.format_id === "18" ? " (標準)" : ""}</span></button>`;
  }).join("");

  const speedMenuHTML = speedOptions.map(s => {
    const label = s === 1 ? "標準" : `${s}`;
    return `<button type="button" class="settings-row settings-option" data-speed="${s}" data-selected="${s === 1 ? "1" : "0"}"><span class="settings-check">${s === 1 ? icon("check") : ""}</span><span>${label}</span></button>`;
  }).join("");

  const subtitleMenuHTML = subtitleOptions.length ? [
    `<button type="button" class="settings-row settings-option" data-sub="off" data-selected="1"><span class="settings-check">${icon("check")}</span><span>オフ</span></button>`,
    ...subtitleOptions.map((s, i) => `<button type="button" class="settings-row settings-option" data-sub="${i}" data-selected="0"><span class="settings-check"></span><span>${escapeHtml(s.label)}</span></button>`),
  ].join("") : "";

  wrap.innerHTML = `
    <div class="custom-player" id="customPlayer">
      <video id="player" playsinline${posterAttr}></video>
      <div class="player-spinner" id="playerSpinner"><div class="spinner-circle"></div></div>
      <div class="speed-indicator" id="speedIndicator">${icon("play")}<span>2倍速で再生中</span></div>
      <div class="seek-tap-zone seek-tap-zone-left" id="seekTapLeft">
        <div class="seek-tap-ring"><span class="seek-tap-arrows">${icon("chevronRight")}${icon("chevronRight")}</span><span class="seek-tap-label">10 秒</span></div>
      </div>
      <div class="seek-tap-zone seek-tap-zone-right" id="seekTapRight">
        <div class="seek-tap-ring"><span class="seek-tap-arrows">${icon("chevronRight")}${icon("chevronRight")}</span><span class="seek-tap-label">10 秒</span></div>
      </div>
      <div class="player-controls">
        <input type="range" class="seek-bar" id="seekBar" min="0" max="100" value="0" step="0.1">
        <div class="controls-row">
          <button class="ctrl-btn" id="playPauseBtn" aria-label="再生">${icon("play")}</button>
          <div class="time-display"><span id="curTime">0:00</span>&nbsp;/&nbsp;<span id="durTime">0:00</span></div>
          <div class="spacer"></div>
          <button class="ctrl-btn" id="muteBtn" aria-label="ミュート切替">${icon("volume")}</button>
          <input type="range" class="volume-bar" id="volumeBar" min="0" max="100" value="100" aria-label="音量">
          <button class="ctrl-btn" id="settingsBtn" aria-label="設定">${icon("gear")}</button>
          <button class="ctrl-btn" id="fullscreenBtn" aria-label="全画面表示">${icon("fullscreen")}</button>
        </div>
      </div>

      <div class="settings-menu" id="settingsMenu" hidden>
        <div class="settings-panel" data-panel="main">
          ${qualities.length >= 1 ? `<button type="button" class="settings-row" data-open="quality"><span>画質</span><span class="settings-row-right"><span class="settings-row-value" id="qualityValueLabel">${escapeHtml(defaultQuality ? (defaultQuality.height ? defaultQuality.height + "p" : "?") : "?")}</span>${icon("chevronRight")}</span></button>` : ""}
          <button type="button" class="settings-row" data-open="speed"><span>再生速度</span><span class="settings-row-right"><span class="settings-row-value" id="speedValueLabel">標準</span>${icon("chevronRight")}</span></button>
          ${subtitleOptions.length ? `<button type="button" class="settings-row" data-open="subtitles"><span>字幕</span><span class="settings-row-right"><span class="settings-row-value" id="subtitleValueLabel">オフ</span>${icon("chevronRight")}</span></button>` : ""}
          <button type="button" class="settings-row" data-open="info"><span>動画情報</span><span class="settings-row-right">${icon("chevronRight")}</span></button>
          <button type="button" class="settings-row" id="loopToggleBtn"><span>ループ再生</span><span class="settings-row-right"><span class="settings-row-value" id="loopValueLabel">オフ</span></span></button>
          <a class="settings-row" id="downloadLink" href="${mediaProxyUrl(videoId, (defaultQuality || {}).format_id || "18")}&download=1" download><span>ダウンロード</span></a>
        </div>
        <div class="settings-panel" data-panel="quality" hidden>
          <button type="button" class="settings-back">${icon("back")}<span>画質</span></button>
          ${qualityMenuHTML}
        </div>
        <div class="settings-panel" data-panel="speed" hidden>
          <button type="button" class="settings-back">${icon("back")}<span>再生速度</span></button>
          ${speedMenuHTML}
        </div>
        <div class="settings-panel" data-panel="subtitles" hidden>
          <button type="button" class="settings-back">${icon("back")}<span>字幕</span></button>
          ${subtitleMenuHTML}
        </div>
        <div class="settings-panel" data-panel="info" hidden>
          <button type="button" class="settings-back">${icon("back")}<span>動画情報</span></button>
          <div class="settings-info-box" id="videoInfoPanel">読み込み中...</div>
        </div>
      </div>
    </div>`;

  const videoEl = document.getElementById("player");
  const playerRoot = document.getElementById("customPlayer");
  const syncState = { audioEl: null, intervalId: null };

  function stopAudioSync() {
    if (syncState.intervalId) {
      clearInterval(syncState.intervalId);
      syncState.intervalId = null;
    }
    if (syncState.audioEl) {
      syncState.audioEl.pause();
      syncState.audioEl.remove();
      syncState.audioEl = null;
    }
  }

  function attachWithFallback(el, directUrl, formatId) {
    el.src = directUrl || mediaProxyUrl(videoId, formatId);
  }

  function startAudioSync(audioQuality) {
    stopAudioSync();
    if (!audioQuality) return;
    const audioEl = document.createElement("audio");
    audioEl.preload = "auto";
    audioEl.style.display = "none";
    audioEl.volume = videoEl.volume;
    audioEl.muted = videoEl.muted;
    playerRoot.appendChild(audioEl);
    syncState.audioEl = audioEl;
    attachWithFallback(audioEl, audioQuality.url, audioQuality.format_id);
    const resync = () => {
      if (!syncState.audioEl) return;
      const audioEl = syncState.audioEl;
      // 映像・音声のどちらかがまだバッファリング中(ネットワーク待ち)の時にドリフト
      // 補正をかけると誤検知の原因になるため、再生継続可能な状態になるまで補正を休む。
      if (videoEl.readyState < 3 || audioEl.readyState < 3) return;
      const drift = videoEl.currentTime - audioEl.currentTime;
      const absDrift = Math.abs(drift);
      if (absDrift > 2) {
        // 大きくズレた場合のみシーク(音切れを伴うため頻発させない)
        audioEl.currentTime = videoEl.currentTime;
        audioEl.playbackRate = 1;
      } else if (absDrift > 0.3) {
        // 小さなズレはplaybackRateの微調整で滑らかに追従させる
        audioEl.playbackRate = drift > 0 ? 1.03 : 0.97;
      } else {
        audioEl.playbackRate = 1;
      }
    };
    syncState.intervalId = setInterval(resync, 1000);
  }

  function loadSource(quality, resumePlayback) {
    stopAudioSync();
    const wasPlaying = resumePlayback && !videoEl.paused;
    // resumePlayback=true(画質切り替え時)は今見ていた位置を保つ。
    // resumePlayback=false(最初の読み込み時)はライブ配信でなければ、保存済みの
    // 再生位置があればそこから再開する。
    const savedProgress = (!resumePlayback && !isLive) ? getWatchProgress(videoId) : null;
    const resumeTime = resumePlayback ? videoEl.currentTime : (savedProgress || 0);
    attachWithFallback(videoEl, quality.url, quality.format_id);
    if (quality.needsAudioSync && bestAudio) startAudioSync(bestAudio);
    const onMeta = () => {
      if (resumePlayback || savedProgress) videoEl.currentTime = resumeTime;
      if (wasPlaying) {
        videoEl.play().catch(() => {});
        if (syncState.audioEl) syncState.audioEl.play().catch(() => {});
      }
      videoEl.removeEventListener("loadedmetadata", onMeta);
    };
    videoEl.addEventListener("loadedmetadata", onMeta);
  }

  if (defaultQuality) {
    loadSource(defaultQuality, false);
  } else if (hlsUrl) {
    attachHlsSource(videoEl, hlsUrl);
  }
  wireCustomPlayerControls(videoEl, playerRoot, syncState, videoId, isLive);

  // ---------- 歯車メニュー ----------
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsMenu = document.getElementById("settingsMenu");
  const qualityValueLabel = document.getElementById("qualityValueLabel");
  const speedValueLabel = document.getElementById("speedValueLabel");
  const subtitleValueLabel = document.getElementById("subtitleValueLabel");
  const downloadLink = document.getElementById("downloadLink");
  let currentTrackEl = null;
  let currentFormatId = defaultQuality ? defaultQuality.format_id : null;

  // iOS Safariは<a download>属性をほぼ無視するため、fetchでBlob取得してから保存させる。
  if (downloadLink) {
    downloadLink.addEventListener("click", (e) => {
      e.preventDefault();
      const url = downloadLink.href;
      const originalText = downloadLink.textContent;
      downloadLink.textContent = "ダウンロード準備中…";
      downloadLink.style.pointerEvents = "none";
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const contentDisposition = res.headers.get("Content-Disposition") || "";
          const match = contentDisposition.match(/filename="?([^";]+)"?/);
          const filename = match ? match[1] : `${videoId}.mp4`;
          return res.blob().then((blob) => ({ blob, filename }));
        })
        .then(({ blob, filename }) => {
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        })
        .catch(() => {
          window.open(url, "_blank");
        })
        .finally(() => {
          downloadLink.textContent = originalText;
          downloadLink.style.pointerEvents = "";
        });
    });
  }

  function showPanel(name) {
    settingsMenu.querySelectorAll(".settings-panel").forEach(p => {
      p.hidden = p.dataset.panel !== name;
    });
  }

  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = settingsMenu.hidden;
      settingsMenu.hidden = !willOpen;
      if (willOpen) showPanel("main");
    });
    document.addEventListener("click", (e) => {
      if (!settingsMenu.hidden && !settingsMenu.contains(e.target) && e.target !== settingsBtn) {
        settingsMenu.hidden = true;
      }
    });
    settingsMenu.querySelectorAll("[data-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const panel = btn.dataset.open;
        showPanel(panel);
        if (panel === "info") renderVideoInfoPanel();
      });
    });
    settingsMenu.querySelectorAll(".settings-back").forEach(btn => {
      btn.addEventListener("click", () => showPanel("main"));
    });
  }

  function renderVideoInfoPanel() {
    const box = document.getElementById("videoInfoPanel");
    if (!box) return;
    const current = qualities.find(q => q.format_id === currentFormatId) || defaultQuality;
    if (!current) {
      box.textContent = "情報を取得できませんでした。";
      return;
    }
    const rows = [
      ["画質", current.height ? `${current.width || "?"}x${current.height}` : "-"],
      ["フレームレート", current.fps ? `${current.fps} fps` : "-"],
      ["コーデック", [current.vcodec, current.acodec].filter(v => v && v !== "none").join(" / ") || "-"],
      ["ビットレート", current.tbr ? `${Math.round(current.tbr)} kbps` : "-"],
      ["フォーマットID", current.format_id || "-"],
    ];
    box.innerHTML = rows.map(([k, v]) => `<div class="settings-info-row"><span>${escapeHtml(k)}</span><span>${escapeHtml(String(v))}</span></div>`).join("");
  }

  settingsMenu.querySelectorAll("[data-quality]").forEach(btn => {
    btn.addEventListener("click", () => {
      const chosen = qualities.find(q => q.format_id === btn.dataset.quality);
      if (!chosen) return;
      currentFormatId = chosen.format_id;
      loadSource(chosen, true);
      settingsMenu.querySelectorAll("[data-quality]").forEach(b => {
        const selected = b === btn;
        b.dataset.selected = selected ? "1" : "0";
        b.querySelector(".settings-check").innerHTML = selected ? icon("check") : "";
      });
      if (qualityValueLabel) qualityValueLabel.textContent = chosen.height ? `${chosen.height}p` : (chosen.format_note || "?");
      if (downloadLink) downloadLink.href = `${mediaProxyUrl(videoId, currentFormatId)}&download=1`;
      showPanel("main");
    });
  });

  settingsMenu.querySelectorAll("[data-speed]").forEach(btn => {
    btn.addEventListener("click", () => {
      const speed = parseFloat(btn.dataset.speed);
      videoEl.playbackRate = speed;
      if (syncState.audioEl) syncState.audioEl.playbackRate = speed;
      settingsMenu.querySelectorAll("[data-speed]").forEach(b => {
        const selected = b === btn;
        b.dataset.selected = selected ? "1" : "0";
        b.querySelector(".settings-check").innerHTML = selected ? icon("check") : "";
      });
      if (speedValueLabel) speedValueLabel.textContent = speed === 1 ? "標準" : String(speed);
      showPanel("main");
    });
  });

  settingsMenu.querySelectorAll("[data-sub]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (currentTrackEl) {
        currentTrackEl.remove();
        currentTrackEl = null;
      }
      settingsMenu.querySelectorAll("[data-sub]").forEach(b => {
        b.dataset.selected = "0";
        b.querySelector(".settings-check").innerHTML = "";
      });
      if (btn.dataset.sub === "off") {
        btn.dataset.selected = "1";
        btn.querySelector(".settings-check").innerHTML = icon("check");
        if (subtitleValueLabel) subtitleValueLabel.textContent = "オフ";
        showPanel("main");
        return;
      }
      const chosen = subtitleOptions[Number(btn.dataset.sub)];
      if (!chosen) return;
      try {
        const res = await fetch(`/proxy/subtitles/${encodeURIComponent(videoId)}?lang=${encodeURIComponent(chosen.lang)}&auto=${chosen.auto ? 1 : 0}`);
        if (!res.ok) throw new Error("字幕の取得に失敗しました");
        const vttText = await res.text();
        const blobUrl = URL.createObjectURL(new Blob([vttText], { type: "text/vtt" }));
        const track = document.createElement("track");
        track.kind = "subtitles";
        track.label = chosen.label;
        track.srclang = chosen.lang;
        track.src = blobUrl;
        track.default = true;
        videoEl.appendChild(track);
        currentTrackEl = track;
        setTimeout(() => {
          if (videoEl.textTracks && videoEl.textTracks.length) {
            videoEl.textTracks[videoEl.textTracks.length - 1].mode = "showing";
          }
        }, 100);
        btn.dataset.selected = "1";
        btn.querySelector(".settings-check").innerHTML = icon("check");
        if (subtitleValueLabel) subtitleValueLabel.textContent = chosen.label;
        showPanel("main");
      } catch (e) {
        // 失敗時はオフのままにしておく
      }
    });
  });

  // ---------- 長押しで2倍速(YouTubeモバイルと同じ挙動) ----------
  const speedIndicator = document.getElementById("speedIndicator");
  let longPressTimer = null;
  let longPressActive = false;
  let normalSpeedBeforeHold = 1;
  let touchStartY = 0;

  function startLongPress(e) {
    if (e.type === "touchstart") touchStartY = e.touches[0].clientY;
    longPressTimer = setTimeout(() => {
      longPressActive = true;
      normalSpeedBeforeHold = videoEl.playbackRate || 1;
      videoEl.playbackRate = 2;
      if (syncState.audioEl) syncState.audioEl.playbackRate = 2;
      if (speedIndicator) speedIndicator.classList.add("show");
    }, 450);
  }
  function endLongPress() {
    clearTimeout(longPressTimer);
    if (longPressActive) {
      videoEl.playbackRate = normalSpeedBeforeHold;
      if (syncState.audioEl) syncState.audioEl.playbackRate = normalSpeedBeforeHold;
      if (speedIndicator) speedIndicator.classList.remove("show");
      longPressActive = false;
      // 長押し終了直後にclickイベントが続けて発火することがあるので、
      // 短い間だけ再生/停止・スキップの誤発火を抑制するフラグを立てる。
      syncState.suppressNextClick = true;
      setTimeout(() => { syncState.suppressNextClick = false; }, 400);
    }
  }
  // ここでpreventDefault()すると、その後のclickイベント(再生/停止・ダブルタップ判定)が
  // スマホで発火しなくなるため呼ばない(選択モード対策はCSS側で行っている)。
  videoEl.addEventListener("touchstart", (e) => { startLongPress(e); }, { passive: true });
  videoEl.addEventListener("touchmove", (e) => {
    if (Math.abs(e.touches[0].clientY - touchStartY) > 10) endLongPress();
  }, { passive: true });
  videoEl.addEventListener("touchend", endLongPress);
  videoEl.addEventListener("touchcancel", endLongPress);
  videoEl.addEventListener("contextmenu", (e) => e.preventDefault());
  videoEl.addEventListener("mousedown", startLongPress);
  videoEl.addEventListener("mouseup", endLongPress);
  videoEl.addEventListener("mouseleave", endLongPress);
}

function wireCustomPlayerControls(videoEl, playerRoot, syncState, currentVideoId, isLive) {
  // ループ再生は他の処理でエラーが起きても巻き込まれないよう、最初に配線しておく。
  const LOOP_KEY = "tubely_loop_enabled";
  const loopToggleBtn = playerRoot.querySelector("#loopToggleBtn");
  const loopValueLabel = playerRoot.querySelector("#loopValueLabel");
  let loopEnabled = localStorage.getItem(LOOP_KEY) === "1";
  function applyLoopState() {
    videoEl.loop = loopEnabled;
    if (syncState.audioEl) syncState.audioEl.loop = loopEnabled;
    if (loopValueLabel) loopValueLabel.textContent = loopEnabled ? "オン" : "オフ";
  }
  applyLoopState();
  if (loopToggleBtn) {
    loopToggleBtn.addEventListener("click", () => {
      loopEnabled = !loopEnabled;
      localStorage.setItem(LOOP_KEY, loopEnabled ? "1" : "0");
      applyLoopState();
    });
  }

  const playBtn = playerRoot.querySelector("#playPauseBtn");
  const seekBar = playerRoot.querySelector("#seekBar");
  const curTimeEl = playerRoot.querySelector("#curTime");
  const durTimeEl = playerRoot.querySelector("#durTime");
  const muteBtn = playerRoot.querySelector("#muteBtn");
  const volumeBar = playerRoot.querySelector("#volumeBar");
  const fullscreenBtn = playerRoot.querySelector("#fullscreenBtn");
  const spinner = playerRoot.querySelector("#playerSpinner");
  const showSpinner = () => spinner && spinner.classList.add("show");
  const hideSpinner = () => spinner && spinner.classList.remove("show");
  showSpinner();
  videoEl.addEventListener("waiting", showSpinner);
  videoEl.addEventListener("loadstart", showSpinner);
  videoEl.addEventListener("canplay", hideSpinner);
  videoEl.addEventListener("playing", hideSpinner);
  videoEl.addEventListener("error", hideSpinner);

  let seeking = false;
  function updateSeekBarFill(pct) {
    seekBar.style.background = `linear-gradient(to right, #ff0033 0%, #ff0033 ${pct}%, rgba(255,255,255,0.3) ${pct}%, rgba(255,255,255,0.3) 100%)`;
  }
  updateSeekBarFill(isLive ? 100 : 0);
  if (isLive) seekBar.value = 100;

  function togglePlay() {
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
      if (syncState.audioEl) syncState.audioEl.play().catch(() => {});
    } else {
      videoEl.pause();
      if (syncState.audioEl) syncState.audioEl.pause();
    }
  }
  playBtn.addEventListener("click", togglePlay);
  videoEl.addEventListener("click", (e) => {
    if (syncState.suppressNextClick) return;
    if (handleVideoClickForSkip(e)) return;
    togglePlay();
  });
  videoEl.addEventListener("play", () => { playBtn.innerHTML = icon("pause"); });
  videoEl.addEventListener("pause", () => { playBtn.innerHTML = icon("play"); });
  videoEl.addEventListener("pause", () => {
    if (!isLive) saveWatchProgress(currentVideoId, videoEl.currentTime, videoEl.duration);
  });
  videoEl.addEventListener("ended", () => {
    if (!isLive) saveWatchProgress(currentVideoId, 0, 0);
  });
  window.addEventListener("pagehide", () => {
    if (!isLive) saveWatchProgress(currentVideoId, videoEl.currentTime, videoEl.duration);
  });

  let lastProgressSaveAt = 0;
  videoEl.addEventListener("timeupdate", () => {
    curTimeEl.textContent = formatPlayerTime(videoEl.currentTime);
    if (isLive) {
      // ライブ配信は「今どこまで見たか」ではなく「配信の最新地点にいるか」を示すのが
      // 本家YouTubeの見た目(赤いバーは常にマックス)。
      if (!seeking) {
        seekBar.value = 100;
        updateSeekBarFill(100);
      }
      return;
    }
    if (!seeking && videoEl.duration) {
      const pct = videoEl.currentTime / videoEl.duration * 100;
      seekBar.value = pct;
      updateSeekBarFill(pct);
    }
    // 進捗保存はtimeupdateの発火頻度そのままだと無駄が多いので5秒に1回程度に間引く
    const now = Date.now();
    if (now - lastProgressSaveAt > 5000) {
      lastProgressSaveAt = now;
      saveWatchProgress(currentVideoId, videoEl.currentTime, videoEl.duration);
    }
  });
  videoEl.addEventListener("loadedmetadata", () => {
    durTimeEl.textContent = formatPlayerTime(videoEl.duration);
  });
  seekBar.addEventListener("input", () => {
    seeking = true;
    updateSeekBarFill(seekBar.value);
    if (videoEl.duration) curTimeEl.textContent = formatPlayerTime(seekBar.value / 100 * videoEl.duration);
  });
  seekBar.addEventListener("change", () => {
    if (videoEl.duration) {
      const t = seekBar.value / 100 * videoEl.duration;
      videoEl.currentTime = t;
      if (syncState.audioEl) syncState.audioEl.currentTime = t;
    }
    seeking = false;
  });

  function updateVolumeIcon() {
    muteBtn.innerHTML = videoEl.muted || videoEl.volume === 0 ? icon("volumeMute") : icon("volume");
  }
  volumeBar.addEventListener("input", () => {
    videoEl.volume = volumeBar.value / 100;
    videoEl.muted = videoEl.volume === 0;
    if (syncState.audioEl) {
      syncState.audioEl.volume = videoEl.volume;
      syncState.audioEl.muted = videoEl.muted;
    }
    updateVolumeIcon();
  });
  muteBtn.addEventListener("click", () => {
    videoEl.muted = !videoEl.muted;
    if (!videoEl.muted && videoEl.volume === 0) {
      videoEl.volume = 1;
      volumeBar.value = 100;
    }
    if (syncState.audioEl) {
      syncState.audioEl.muted = videoEl.muted;
      syncState.audioEl.volume = videoEl.volume;
    }
    updateVolumeIcon();
  });
  fullscreenBtn.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    if (playerRoot.requestFullscreen) {
      playerRoot.requestFullscreen().catch(() => {
        if (videoEl.webkitEnterFullscreen) videoEl.webkitEnterFullscreen();
      });
    } else if (videoEl.webkitEnterFullscreen) {
      videoEl.webkitEnterFullscreen();
    }
  });

  // ---------- 一定時間操作が無いとコントロールを隠す(YouTubeと同じ挙動) ----------
  const settingsMenuEl = playerRoot.querySelector("#settingsMenu");
  let idleTimer = null;
  function showControls() {
    playerRoot.classList.remove("controls-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (videoEl.paused) return;
      if (settingsMenuEl && !settingsMenuEl.hidden) return;
      playerRoot.classList.add("controls-idle");
    }, 2800);
  }
  ["mousemove", "mousedown", "touchstart", "keydown"].forEach((ev) => {
    playerRoot.addEventListener(ev, showControls, { passive: true });
  });
  videoEl.addEventListener("pause", () => {
    clearTimeout(idleTimer);
    playerRoot.classList.remove("controls-idle");
  });

  // ---------- 10秒スキップ(左右ダブルタップ、YouTube同様の挙動) ----------
  const tapLeft = playerRoot.querySelector("#seekTapLeft");
  const tapRight = playerRoot.querySelector("#seekTapRight");
  const SKIP_SECONDS = 10;
  const DOUBLE_TAP_WINDOW_MS = 350;
  let lastTapTime = 0;
  let lastTapSide = null;
  let skipHideTimer = null;

  function performSkip(zoneEl, seconds) {
    const newTime = Math.max(0, Math.min(videoEl.duration || Infinity, videoEl.currentTime + seconds));
    videoEl.currentTime = newTime;
    if (syncState.audioEl) syncState.audioEl.currentTime = newTime;
    zoneEl.classList.add("show");
    clearTimeout(skipHideTimer);
    skipHideTimer = setTimeout(() => zoneEl.classList.remove("show"), 550);
  }

  function handleVideoClickForSkip(e) {
    const rect = playerRoot.getBoundingClientRect();
    const isRightSide = (e.clientX - rect.left) > rect.width / 2;
    const side = isRightSide ? "right" : "left";
    const now = Date.now();
    if (lastTapSide === side && now - lastTapTime < DOUBLE_TAP_WINDOW_MS) {
      performSkip(isRightSide ? tapRight : tapLeft, isRightSide ? SKIP_SECONDS : -SKIP_SECONDS);
      lastTapTime = 0;
      lastTapSide = null;
      return true;
    }
    lastTapTime = now;
    lastTapSide = side;
    return false;
  }

  videoEl.addEventListener("play", showControls);
  showControls();
}
