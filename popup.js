// デフォルト設定
const DEFAULT_SETTINGS = {
  targetWords: ['個人顧客', '2'],
  highlightColor: 'red',
  useBold: true,
  requiredUrl: 'gmo-office.com/?#/searchCustome'
};

// 設定を読み込んで表示
chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
  document.getElementById('targetWords').value = settings.targetWords.join('\n');
  document.getElementById('highlightColor').value = settings.highlightColor;
  document.getElementById('useBold').checked = settings.useBold;
  document.getElementById('requiredUrl').value = settings.requiredUrl;
});

// 保存ボタン
document.getElementById('save').addEventListener('click', () => {
  const targetWords = document.getElementById('targetWords').value
    .split('\n')
    .map(word => word.trim())
    .filter(word => word.length > 0);
  
  const settings = {
    targetWords: targetWords,
    highlightColor: document.getElementById('highlightColor').value || 'red',
    useBold: document.getElementById('useBold').checked,
    requiredUrl: document.getElementById('requiredUrl').value
  };

  chrome.storage.sync.set(settings, () => {
    // 成功メッセージを表示
    const successMsg = document.getElementById('successMsg');
    successMsg.style.display = 'block';
    setTimeout(() => {
      successMsg.style.display = 'none';
    }, 2000);

    // 全てのタブに設定変更を通知
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { type: 'settingsUpdated' }, () => {
          // エラーは無視（content scriptが動いていないタブもあるため）
          if (chrome.runtime.lastError) {
            // ignore
          }
        });
      });
    });
  });
});

