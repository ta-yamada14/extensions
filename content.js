(function() {
  // URLにgmo-officeが含まれていない場合は何もしない
  if (!window.location.href.includes('gmo-office')) {
    return;
  }

  console.log('拡張機能が動作中');

  let isProcessing = false;

  function highlightText() {
    if (isProcessing) {
      console.log('処理中のためスキップ');
      return;
    }
    
    isProcessing = true;
    console.log('テキストをハイライト開始');
    
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
            if (node.textContent.includes('個人顧客') || node.textContent.includes('2')) {
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

      console.log('処理対象ノード数:', nodesToProcess.length);

      // 収集したノードを処理
      nodesToProcess.forEach(textNode => {
        const parent = textNode.parentElement;
        if (!parent || parent.hasAttribute('data-highlighted')) return;

        const text = textNode.textContent;
        const newHTML = text
          .replace(/個人顧客/g, '<span style="color: red; font-weight: normal;" data-highlighted="true">個人顧客</span>')
          .replace(/2/g, '<span style="color: red; font-weight: normal;" data-highlighted="true">2</span>');

        if (newHTML !== text) {
          const wrapper = document.createElement('span');
          wrapper.setAttribute('data-highlighted', 'true');
          wrapper.innerHTML = newHTML;
          parent.replaceChild(wrapper, textNode);
        }
      });

      console.log('ハイライト完了');
    } catch (e) {
      console.error('エラー:', e);
    } finally {
      isProcessing = false;
    }
  }

  // 初回実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(highlightText, 500);
    });
  } else {
    setTimeout(highlightText, 500);
  }

  // React Adminの遅延レンダリング対応
  setTimeout(highlightText, 2000);
  setTimeout(highlightText, 4000);

  // MutationObserver（デバウンス付き）
  let observerTimeout;
  const observer = new MutationObserver(() => {
    clearTimeout(observerTimeout);
    observerTimeout = setTimeout(() => {
      if (!isProcessing) {
        highlightText();
      }
    }, 1000);
  });

  // 監視開始
  setTimeout(() => {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      console.log('MutationObserver開始');
    }
  }, 1000);
})();
