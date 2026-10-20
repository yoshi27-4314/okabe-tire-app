// ============================================================
// common.js — 共通関数
// ============================================================

// --- トグルボタン（ラジオ式） ---
function toggleCheck(el) {
  if (el.classList.contains('checked')) {
    el.classList.remove('checked');
  } else {
    var siblings = el.parentNode.querySelectorAll('.toggle-btn');
    for (var i = 0; i < siblings.length; i++) siblings[i].classList.remove('checked');
    el.classList.add('checked');
  }
}

function getToggleValue(groupId) {
  var group = document.getElementById(groupId);
  if (!group) return '';
  var checked = group.querySelector('.toggle-btn.checked');
  return checked ? (checked.dataset.value || checked.textContent.trim()) : '';
}

// --- 画面遷移 ---
function goHome() { location.href = 'index.html'; }

function navigateTo(page, params) {
  var url = page;
  if (params) {
    var q = Object.keys(params).map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
    }).join('&');
    url += '?' + q;
  }
  location.href = url;
}

function getParam(name) {
  var url = new URLSearchParams(location.search);
  return url.get(name) || '';
}

// --- 画面切り替え（SPA内） ---
function showScr(id) {
  var s = document.querySelectorAll('.screen');
  for (var i = 0; i < s.length; i++) s[i].classList.remove('active');
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

// --- 日時フォーマット ---
function formatDateTime(v) {
  if (!v) return '';
  var d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.getFullYear() + '/' + p(d.getMonth() + 1) + '/' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function formatDate(v) {
  if (!v) return '';
  var d = new Date(v);
  if (isNaN(d.getTime())) return String(v);
  return d.getFullYear() + '/' + p(d.getMonth() + 1) + '/' + p(d.getDate());
}

function p(n) { return String(n).padStart(2, '0'); }

// --- HTMLエスケープ ---
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// --- トースト通知 ---
function showSuccess(msg) { showToast(msg, 'success'); }
function showError(msg) { showToast(msg, 'error'); }

function showToast(msg, type) {
  var el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = 'toast ' + type + ' show';
  setTimeout(function() { el.classList.remove('show'); }, 2500);
}

// --- ローディング ---
function startLoading(btn) {
  if (!btn) return;
  btn.dataset.originalText = btn.textContent;
  btn.textContent = '処理中...';
  btn.classList.add('loading');
}

function stopLoading(btn) {
  if (!btn) return;
  btn.textContent = btn.dataset.originalText || '';
  btn.classList.remove('loading');
}

// --- API結果のエラーハンドリング ---
function handleAPIError(result) {
  if (!result) { showError('通信エラーです'); return true; }
  if (!result.ok) {
    if (result.code === 'SESSION_EXPIRED' || result.code === 'NO_SESSION' || result.code === 'INVALID_SESSION' || result.code === 'STAFF_DISABLED') {
      showError('セッションが切れました。再ログインしてください');
      localStorage.clear();
      setTimeout(function() { location.href = 'index.html'; }, 1500);
      return true;
    }
    showError(result.message || 'エラーが発生しました');
    return true;
  }
  return false;
}

// --- 確認ダイアログ ---
function confirmAction(msg) { return confirm(msg); }

// --- 強制リロード ---
function forceReload() { location.reload(true); }

// --- 画像圧縮（傷写真保存用: 高品質） ---
function compressImage(dataUrl) {
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var w = img.width, h = img.height;
      var maxW = 2048;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      if (h > maxW) { w = Math.round(w * maxW / h); h = maxW; }
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      var quality = 0.92;
      var result = canvas.toDataURL('image/jpeg', quality);
      while (result.length > 1400000 && quality > 0.5) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(result);
    };
    img.src = dataUrl;
  });
}

// --- 画像圧縮（OCR用: 精度を保ちつつ軽量化） ---
function compressImageForOcr(dataUrl) {
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var w = img.width, h = img.height;
      var maxW = 1600;
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
      if (h > maxW) { w = Math.round(w * maxW / h); h = maxW; }
      var canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      var quality = 0.85;
      var result = canvas.toDataURL('image/jpeg', quality);
      while (result.length > 1000000 && quality > 0.5) {
        quality -= 0.1;
        result = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(result);
    };
    img.src = dataUrl;
  });
}

// --- 写真拡大表示（専用ページでピンチズーム可能） ---
function showPhotoModal(src) {
  var img = new Image();
  img.onload = function() {
    var w = img.width, h = img.height;
    var maxW = 1600;
    if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
    if (h > maxW) { w = Math.round(w * maxW / h); h = maxW; }
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    var compressed = canvas.toDataURL('image/jpeg', 0.85);
    try {
      sessionStorage.clear();
      sessionStorage.setItem('photoSrc', compressed);
      location.href = 'photo_viewer.html';
    } catch (e) {
      alert('画像の表示に失敗しました');
    }
  };
  img.src = src;
}

// --- ブラウザバック時の未完了伝票取消（sendBeacon） ---
function registerBeaconCancel(actionName, paramsFunc) {
  window.addEventListener('beforeunload', function() {
    var params = paramsFunc();
    if (!params) return;
    params.action = actionName;
    params.sessionId = typeof getSessionId === 'function' ? getSessionId() : '';
    navigator.sendBeacon(
      typeof API_URL !== 'undefined' ? API_URL : '',
      JSON.stringify(params)
    );
  });
}
