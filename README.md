# Chrome 翻译插件

一个基于AI模型的Chrome浏览器划词翻译插件，支持使用方舟平台API进行文本翻译。

## 功能特点

- ✨ 划词翻译：选中网页上的任意文本，右键选择"划词翻译"即可获取翻译结果
- 🎨 自定义提示词：支持在插件设置中自定义翻译提示词
- 🔧 灵活配置：可配置API密钥、API地址和模型名称
- 🚀 高效响应：优化的请求处理流程，提供快速翻译体验

## 安装说明

### 开发模式安装

1. 克隆或下载本项目到本地
2. 打开Chrome浏览器，进入`chrome://extensions/`页面
3. 开启页面右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"，选择本项目的文件夹
5. 插件安装完成，图标将显示在浏览器工具栏中

## 使用方法

1. **配置插件**：
   - 点击浏览器工具栏中的插件图标
   - 选择"选项"进入设置页面
   - 填写API密钥、API地址、模型名称和自定义提示词
   - 保存设置

2. **划词翻译**：
   - 在任意网页上选中需要翻译的文本
   - 右键点击选中的文本
   - 选择"划词翻译"选项
   - 等待片刻，翻译结果将显示在弹出的面板中

## 配置说明

在插件设置页面，您需要配置以下参数：

- **API密钥**：您在方舟平台申请的API密钥
- **API地址**：方舟平台的API接口地址，默认为`https://ark.cn-beijing.volces.com/api/v3/chat/completions`
- **模型名称**：使用的AI模型名称，例如`doubao-seed-1.6-250615`
- **自定义提示词**：用于指导模型进行翻译的提示词

## 项目结构

```
├── background.js     # 背景脚本，处理翻译请求和右键菜单
├── content.js        # 内容脚本，处理页面交互
├── content.css       # 样式文件，定义翻译面板样式
├── manifest.json     # 插件配置文件
├── options.html      # 设置页面HTML
├── options.js        # 设置页面JavaScript
├── popup.html        # 弹出页面
└── icons/            # 插件图标
    ├── icon128.svg
    ├── icon16.svg
    └── icon48.svg
```

## 核心功能说明

### 翻译流程

1. 用户在页面上选中文本并点击右键菜单中的"划词翻译"
2. content.js 捕获选中的文本并发送消息到 background.js
3. background.js 从存储中获取配置信息
4. 调用方舟平台API进行翻译
5. 将翻译结果返回给 content.js 显示给用户

### API 请求格式

插件使用的API请求格式如下：

```javascript
{
    model: modelName,
    messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text }
    ],
    thinking: {
        "type": "disabled" // 禁用深度思考能力
    },
    temperature: 0.2,
    max_tokens: 1000
}
```

## 开发说明

如果您想参与本项目的开发，可以按照以下步骤进行：

1. 修改代码后，在`chrome://extensions/`页面点击"重新加载"按钮更新插件
2. 使用Chrome开发者工具调试content.js（在页面上右键"检查"）
3. 调试background.js可以通过扩展程序页面的"背景页"链接打开开发者工具

## 注意事项

- 使用前请确保您已获得有效的方舟平台API密钥
- 翻译质量取决于您配置的模型和提示词
- 大量使用可能会产生API费用，请留意您的API使用情况

## 许可证

本项目采用MIT许可证。