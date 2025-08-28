// 全局变量存储翻译面板和按钮元素
let translateButton = null;
let translationPanel = null;

// 创建翻译按钮元素
function createTranslateButton() {
    if (translateButton) return translateButton;

    translateButton = document.createElement('div');
    translateButton.id = 'translate-selection-btn';
    translateButton.textContent = '开始翻译';
    translateButton.style.position = 'absolute';
    translateButton.style.zIndex = '9999';
    translateButton.style.backgroundColor = '#4285f4';
    translateButton.style.color = 'white';
    translateButton.style.border = 'none';
    translateButton.style.borderRadius = '4px';
    translateButton.style.padding = '4px 8px';
    translateButton.style.fontSize = '12px';
    translateButton.style.cursor = 'pointer';
    translateButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    translateButton.style.transition = 'opacity 0.3s';

    // 添加点击事件
    translateButton.addEventListener('click', startTranslation);

    return translateButton;
}

// 创建翻译结果面板
function createTranslationPanel() {
    if (translationPanel) return translationPanel;

    translationPanel = document.createElement('div');
    translationPanel.id = 'translation-result-panel';
    translationPanel.style.position = 'absolute';
    translationPanel.style.zIndex = '9999';
    translationPanel.style.backgroundColor = 'white';
    translationPanel.style.borderRadius = '8px';
    translationPanel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    translationPanel.style.padding = '12px';
    translationPanel.style.maxWidth = '300px';
    translationPanel.style.fontSize = '14px';
    translationPanel.style.display = 'none';

    // 添加关闭按钮
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '8px';
    closeBtn.style.right = '8px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.color = '#666';
    closeBtn.addEventListener('click', () => {
        translationPanel.style.display = 'none';
        if (translateButton) {
            // 恢复按钮状态
            translateButton.disabled = false;
            translateButton.style.opacity = '1';
            // 如果没有选中文本则隐藏按钮
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            if (!selectedText) {
                translateButton.style.display = 'none';
            }
        }
    });
    translationPanel.appendChild(closeBtn);

    // 添加原文和译文容器
    const originalText = document.createElement('div');
    originalText.id = 'original-text';
    originalText.style.marginBottom = '8px';
    originalText.style.paddingBottom = '8px';
    originalText.style.borderBottom = '1px solid #eee';
    originalText.style.fontWeight = 'bold';
    translationPanel.appendChild(originalText);

    const translatedText = document.createElement('div');
    translatedText.id = 'translated-text';
    translationPanel.appendChild(translatedText);

    // 添加复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.id = 'copy-translation-btn';
    copyBtn.textContent = '复制译文';
    copyBtn.style.marginTop = '10px';
    copyBtn.style.padding = '4px 8px';
    copyBtn.style.backgroundColor = '#f0f0f0';
    copyBtn.style.border = '1px solid #ddd';
    copyBtn.style.borderRadius = '4px';
    copyBtn.style.cursor = 'pointer';
    copyBtn.style.fontSize = '12px';
    copyBtn.addEventListener('click', () => {
        const textToCopy = translatedText.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('复制失败: ', err);
        });
    });
    translationPanel.appendChild(copyBtn);

    return translationPanel;
}

// 显示翻译按钮
function showTranslateButton(selection) {
    const button = createTranslateButton();
    const panel = createTranslationPanel();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // 定位按钮在选中文本右侧
    button.style.left = `${window.scrollX + rect.right + 5}px`;
    button.style.top = `${window.scrollY + rect.top}px`;
    button.style.display = 'block';
    // 提取并存储选中文本到按钮数据集
    const selectedText = selection.toString().trim();
    button.dataset.selectedText = selectedText;
    // 保存文本位置信息到按钮数据属性
    button.dataset.textRect = JSON.stringify({
        left: window.scrollX + rect.left,
        top: window.scrollY + rect.top,
        right: window.scrollX + rect.right,
        bottom: window.scrollY + rect.bottom
    });

    // 隐藏之前的结果面板
    panel.style.display = 'none';

    // 添加到页面
    if (!document.body.contains(button)) {
        document.body.appendChild(button);
    }
    if (!document.body.contains(panel)) {
        document.body.appendChild(panel);
    }
}

// 隐藏翻译按钮
function hideTranslateButton() {
    if (translateButton) {
        translateButton.style.display = 'none';
    }
    if (translationPanel) {
        translationPanel.style.display = 'none';
    }
}

// 开始翻译流程
async function startTranslation() {
    if (!translateButton || !translationPanel) return;

    // 使用按钮存储的选中文本
    const selectedText = translateButton.dataset.selectedText;
    if (!selectedText) return;

    // 显示"翻译中"状态
    translationPanel.querySelector('#original-text').textContent = selectedText;
    translationPanel.querySelector('#translated-text').textContent = '翻译中...';

    // 定位结果面板
    // 使用保存的文本位置信息定位面板
    const textRect = JSON.parse(translateButton.dataset.textRect);
    translationPanel.style.left = `${textRect.left}px`;
    translationPanel.style.top = `${textRect.bottom + 5}px`;
    translationPanel.style.display = 'block';
    // 禁用按钮而非隐藏
    translateButton.disabled = true;
    translateButton.style.opacity = '0.7';

    try {
        // 从storage获取配置
        const { apiKey, customPrompt } = await new Promise(resolve => {
            chrome.storage.sync.get(['apiKey', 'customPrompt'], resolve);
        });

        // 向background发送翻译请求
        chrome.runtime.sendMessage({
            action: 'translate',
            text: selectedText,
            prompt: customPrompt || '请将以下中文翻译成英文，保持原意准确，语言流畅自然。'
        }, (response) => {
            if (chrome.runtime.lastError) {
                translationPanel.querySelector('#translated-text').textContent = `错误: ${chrome.runtime.lastError.message}`;
                return;
            }

            if (response.error) {
                translationPanel.querySelector('#translated-text').textContent = `翻译失败: ${response.error}`;
            } else if (response.result) {
                translationPanel.querySelector('#translated-text').textContent = response.result;
            } else {
                translationPanel.querySelector('#translated-text').textContent = '未获取到翻译结果';
            }
        });
    } catch (error) {
        translationPanel.querySelector('#translated-text').textContent = `发生错误: ${error.message}`;
    }
}

// 监听文本选择事件
document.addEventListener('mouseup', function(e) {
    // 忽略输入框内的选择
    const activeElement = document.activeElement;
    if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
        hideTranslateButton();
        return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // 如果选中文本不为空且长度适中
    if (selectedText && selectedText.length > 0 && selectedText.length < 500) {
        showTranslateButton(selection);
    } else {
        // 面板显示时不隐藏按钮
        if (!translationPanel || translationPanel.style.display === 'none') {
            hideTranslateButton();
        }
    }
});

// 点击页面其他地方隐藏按钮
document.addEventListener('mousedown', function(e) {
    if (translateButton && !translateButton.contains(e.target) &&
        translationPanel && !translationPanel.contains(e.target)) {
        hideTranslateButton();
    }
});