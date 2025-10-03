#!/bin/bash

# 出力ファイル名
OUTPUT="extensions.zip"

# 既存のzipファイルがあれば削除
if [ -f "$OUTPUT" ]; then
  rm "$OUTPUT"
  echo "既存の $OUTPUT を削除しました"
fi

# 必要なファイルのみをzip化
zip -r "$OUTPUT" \
  manifest.json \
  popup.html \
  popup.js \
  content.js \
  README.md \
  -x "*.DS_Store" "*.git*" "*.crx" "*.sh" "*.zip"

echo ""
echo "✓ $OUTPUT を作成しました"
ls -lh "$OUTPUT"

