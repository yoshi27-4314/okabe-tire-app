// ============================================================
// api.js — GAS doPost との通信層
// ============================================================
// すべての画面がこのファイルを通してGASと通信する。
// fetch() + doPost で通信し、google.script.run は使わない。
//
// 使い方:
//   var result = await callAPI('customer_search', { query: '田中' });
//   if (result.ok) { ... result.data ... }
//   else { showError(result.message); }
// ============================================================

// GAS ウェブアプリの URL（デプロイ後に設定する）
var API_URL = 'https://adlrohlfjtmxfxtptfgi.supabase.co/functions/v1/api';

// --- セッション管理 ---

function getSessionId() {
  return sessionStorage.getItem('sessionId') || '';
}

function setSession(sessionId, staffId, staffName, branchCode) {
  sessionStorage.setItem('sessionId', sessionId);
  sessionStorage.setItem('staffId', staffId);
  sessionStorage.setItem('staffName', staffName);
  sessionStorage.setItem('branchCode', branchCode);
}

function clearSession() {
  sessionStorage.removeItem('sessionId');
  sessionStorage.removeItem('staffId');
  sessionStorage.removeItem('staffName');
  sessionStorage.removeItem('branchCode');
}

function getStaffName() {
  return sessionStorage.getItem('staffName') || '';
}

function getStaffId() {
  return sessionStorage.getItem('staffId') || '';
}

// ログインしていなければログイン画面に飛ばす
function requireLogin() {
  if (!getSessionId()) {
    location.href = 'index.html';
    return false;
  }
  return true;
}

// --- API 通信 ---

/**
 * GAS doPost にリクエストを送る。
 * ログイン・ログアウト以外は sessionId を自動で付ける。
 *
 * @param {string} action - アクション名（router.gs のルーティング表に対応）
 * @param {Object} params - 送るデータ
 * @return {Object} { ok: true, data: ... } または { ok: false, code: '...', message: '...' }
 */
async function callAPI(action, params) {
  if (!API_URL) {
    showError('API_URL が設定されていません');
    return { ok: false, code: 'NO_URL', message: 'API_URL が未設定です' };
  }

  // セッションIDを自動で付ける（ログイン・ログアウト以外）
  var body = Object.assign({}, params || {});
  body.action = action;
  var noSession = ['login', 'logout', 'setInitialPassword'];
  if (noSession.indexOf(action) < 0) {
    body.sessionId = getSessionId();
  }

  try {
    var response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'follow'
    });

    if (!response.ok) {
      return {
        ok: false,
        code: 'HTTP_ERROR',
        message: '通信エラーが発生しました（' + response.status + '）'
      };
    }

    var text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return {
        ok: false,
        code: 'PARSE_ERROR',
        message: 'サーバーからの応答を読み取れませんでした'
      };
    }
  } catch (e) {
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: '通信できませんでした。ネットワークを確認してください'
    };
  }
}

// --- 二重送信防止キーの生成 ---

function generateIdempotencyKey() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// --- エラー表示 ---

/**
 * 画面上部にエラーメッセージをトースト表示する。
 * 5秒後に自動で消える。
 */
function showError(message) {
  removeToast_();
  var toast = document.createElement('div');
  toast.id = 'api-toast';
  toast.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);'
    + 'max-width:90%;padding:12px 20px;background:#C41E3A;color:#fff;'
    + 'border-radius:10px;font-size:14px;font-weight:600;z-index:9999;'
    + 'box-shadow:0 4px 12px rgba(0,0,0,0.3);text-align:center;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function() { removeToast_(); }, 5000);
}

/**
 * 成功メッセージを表示する。3秒後に消える。
 */
function showSuccess(message) {
  removeToast_();
  var toast = document.createElement('div');
  toast.id = 'api-toast';
  toast.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);'
    + 'max-width:90%;padding:12px 20px;background:#006B3F;color:#fff;'
    + 'border-radius:10px;font-size:14px;font-weight:600;z-index:9999;'
    + 'box-shadow:0 4px 12px rgba(0,0,0,0.3);text-align:center;';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function() { removeToast_(); }, 3000);
}

function removeToast_() {
  var old = document.getElementById('api-toast');
  if (old) old.remove();
}

// --- ローディング ---

/**
 * ボタンをローディング状態にする。
 * 元のテキストを保持し、「処理中...」に変える。ボタンを無効化する。
 */
function startLoading(button) {
  if (!button) return;
  button.dataset.originalText = button.textContent;
  button.textContent = '処理中...';
  button.disabled = true;
  button.style.opacity = '0.6';
}

/**
 * ボタンを元に戻す。
 */
function stopLoading(button) {
  if (!button) return;
  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
  button.style.opacity = '1';
}

// --- セッション切れの処理 ---

/**
 * API の応答がセッション切れなら、ログイン画面に飛ばす。
 * 他のエラーならエラー表示する。
 * 成功なら null を返す。
 */
function handleAPIError(result) {
  if (!result.ok) {
    var sessionErrors = [
      'INVALID_SESSION', 'SESSION_EXPIRED',
      'STAFF_UPDATED', 'STAFF_DISABLED'
    ];
    if (sessionErrors.indexOf(result.code) >= 0) {
      clearSession();
      showError(result.message + '（ログイン画面に戻ります）');
      setTimeout(function() { location.href = 'index.html'; }, 2000);
      return result;
    }
    showError(result.message || 'エラーが発生しました');
    return result;
  }
  return null;
}

// --- URL パラメータ ---

function getParam(name) {
  var params = new URLSearchParams(location.search);
  return params.get(name) || '';
}
