
// const DEFAULT_PROMPT = '请将以下中文翻译成英文，保持原意准确，语言流畅自然。';
// const DEFAULT_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
// const DEFAULT_MODEL_NAME = 'doubao-seed-1-6-250615';


// 监听来自content.js的翻译请求
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translate') {
        handleTranslationRequest(request, sendResponse);
        // 保持消息通道开放以支持异步响应
        return true;
    }
});

// 处理翻译请求
async function handleTranslationRequest(request, sendResponse) {
    try {
        // 从storage获取API密钥和自定义提示词
        const { apiKey, apiUrl, modelName, customPrompt } = await new Promise(resolve => {
            chrome.storage.sync.get(['apiKey', 'apiUrl', 'modelName', 'customPrompt'], resolve);
        });

        // 验证API密钥
        if (!apiKey) {
            sendResponse({ error: 'API密钥未配置，请在插件设置中填写' });
            return;
        }

        // 调用翻译函数
        const result = await translateText(
            request.text,
            customPrompt,
            apiKey,
            apiUrl,
            modelName
        );

        sendResponse({ result });
    } catch (error) {
        sendResponse({ error: error.message });
    }
}

// 调用AI API进行翻译
async function translateText(text, prompt, apiKey, apiUrl , modelName ) {
    // 构建API请求参数
    const requestData = {
        model: modelName,
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: text }
        ],
        thinking: {
            "type": "disabled"

        },
        temperature: 0.2,
        max_tokens: 1000
    };

    // 发送请求到OpenAI API
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestData)
    });

    // 处理API响应
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
            `API请求失败: ${response.statusText}${
                errorData.error?.message ? ` - ${errorData.error.message}` : ''
            }`
        );
    }

    const data = await response.json();

    // 提取翻译结果
    if (!data.choices || data.choices.length === 0) {
        throw new Error('未获取到翻译结果');
    }

    return data.choices[0].message.content.trim();
}

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'translate-selection',
        title: '划词翻译',
        contexts: ['selection']
    });
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'translate-selection' && info.selectionText) {
        // 向content.js发送消息触发翻译
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (selectedText) => {
                // 查找页面中的翻译按钮并模拟点击
                const event = new CustomEvent('translate-selection', {
                    detail: { text: selectedText }
                });
                document.dispatchEvent(event);
            },
            args: [info.selectionText]
        });
    }
});