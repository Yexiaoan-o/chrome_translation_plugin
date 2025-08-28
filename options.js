// 从storage加载保存的设置
function loadSettings() {
    chrome.storage.sync.get(['apiKey', 'apiUrl', 'modelName', 'customPrompt'], (items) => {
        if (items.apiKey) {
            document.getElementById('apiKey').value = items.apiKey;
        }
        if (items.apiUrl) {
            document.getElementById('apiUrl').value = items.apiUrl;
        }
        if (items.modelName) {
            document.getElementById('modelName').value = items.modelName;
        }
        if (items.customPrompt) {
            document.getElementById('customPrompt').value = items.customPrompt;
        }
    });
}

// 保存设置到storage
function saveSettings() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const apiUrl = document.getElementById('apiUrl').value.trim();
    const modelName = document.getElementById('modelName').value.trim();
    const customPrompt = document.getElementById('customPrompt').value.trim();
    const statusMessage = document.getElementById('statusMessage');

    chrome.storage.sync.set({
        apiKey: apiKey,
        apiUrl: apiUrl,
        modelName: modelName,
        customPrompt: customPrompt
    }, () => {
        // 显示保存成功消息
        statusMessage.textContent = '设置已保存';
        statusMessage.className = 'status-message success';

        // 3秒后隐藏消息
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    });
}

// 页面加载时加载设置
document.addEventListener('DOMContentLoaded', loadSettings);

// 保存按钮点击事件
document.getElementById('saveSettings').addEventListener('click', saveSettings);

// 支持按Enter键保存设置
document.getElementById('apiKey').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveSettings();
});

document.getElementById('customPrompt').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        saveSettings();
    }
});