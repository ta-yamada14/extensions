/****************************************************
 * 設定はポップアップUIから変更できます
 * 拡張機能のアイコンをクリックして設定してください
 ****************************************************/

// デフォルト設定
const DEFAULT_SETTINGS = {
  targetWords: ['個人顧客', '2'],
  highlightColor: 'red',
  useBold: true,
  requiredUrls: ['gmo-office.com/?#/searchCustome'],
  urlMatchType: 'OR'
};

(function() {
  let SETTINGS = null;

  // 設定を読み込んでハイライト実行
  function loadSettingsAndHighlight() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (settings) => {
      // URLチェック
      if (settings.requiredUrls && settings.requiredUrls.length > 0) {
        const currentUrl = window.location.href;
        const matchType = settings.urlMatchType || 'OR';
        
        if (matchType === 'AND') {
          // AND条件：全てのURLが含まれている必要がある
          const allMatch = settings.requiredUrls.every(url => currentUrl.includes(url));
          if (!allMatch) return;
        } else {
          // OR条件：いずれかのURLが含まれている必要がある
          const anyMatch = settings.requiredUrls.some(url => currentUrl.includes(url));
          if (!anyMatch) return;
        }
      }
      
      // 対象文字列が空でない場合のみ設定を保存
      if (settings.targetWords && settings.targetWords.length > 0) {
        SETTINGS = settings;
        initHighlight();
      }
    });
  }

  function initHighlight() {
    if (!SETTINGS) return;

    let isProcessing = false;
    const TARGET_WORDS = SETTINGS.targetWords;
    const HIGHLIGHT_COLOR = SETTINGS.highlightColor;
    const USE_BOLD = SETTINGS.useBold;

    function highlightText() {
      if (isProcessing) {
        return;
      }
      
      isProcessing = true;
      
      try {
        // TreeWalkerで全テキストノードを取得
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              // スクリプトやスタイルは除外
              if (node.parentElement && 
                  (node.parentElement.tagName === 'SCRIPT' || 
                   node.parentElement.tagName === 'STYLE' ||
                   node.parentElement.hasAttribute('data-highlighted'))) {
                return NodeFilter.FILTER_REJECT;
              }
              // 対象の文字が含まれているか
              const hasTarget = TARGET_WORDS.some(word => node.textContent.includes(word));
              if (hasTarget) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_REJECT;
            }
          }
        );

        const nodesToProcess = [];
        let node;
        while (node = walker.nextNode()) {
          nodesToProcess.push(node);
        }

        // 収集したノードを処理
        nodesToProcess.forEach(textNode => {
          const parent = textNode.parentElement;
          if (!parent || parent.hasAttribute('data-highlighted')) return;

          let text = textNode.textContent;
          
          // 各対象文字列をハイライト
          const fontWeight = USE_BOLD ? 'bold' : 'normal';
          TARGET_WORDS.forEach(word => {
            const regex = new RegExp(word, 'g');
            text = text.replace(regex, `<span style="color: ${HIGHLIGHT_COLOR}; font-weight: ${fontWeight};" data-highlighted="true">${word}</span>`);
          });

          if (text !== textNode.textContent) {
            const wrapper = document.createElement('span');
            wrapper.setAttribute('data-highlighted', 'true');
            wrapper.innerHTML = text;
            parent.replaceChild(wrapper, textNode);
          }
        });

      } catch (e) {
        // エラーは無視
      } finally {
        isProcessing = false;
      }
    }

    // 初回実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(highlightText, 100);
      });
    } else {
      setTimeout(highlightText, 100);
    }

    // React Adminの遅延レンダリング対応
    setTimeout(highlightText, 200);
    setTimeout(highlightText, 500);
    setTimeout(highlightText, 1000);

    // MutationObserver（デバウンス付き）
    let observerTimeout;
    const observer = new MutationObserver(() => {
      clearTimeout(observerTimeout);
      observerTimeout = setTimeout(() => {
        if (!isProcessing) {
          highlightText();
        }
      }, 500);
    });

    // 監視開始
    setTimeout(() => {
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }, 500);
  }

  // 設定変更メッセージを受信
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsUpdated') {
      // ページをリロード
      location.reload();
    }
  });

  // 設定を読み込んで開始
  loadSettingsAndHighlight();
})();
