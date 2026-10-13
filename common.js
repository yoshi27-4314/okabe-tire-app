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
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    if (result.code === 'SESSION_EXPIRED') {
      showError('セッションが切れました。再ログインしてください');
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
