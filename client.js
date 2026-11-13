window.__ModuleLoader__.load({
  id: 'dsh-fps-workbench',
  factory(require) {
    try {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;
    const NS = 'claudeWorkbench';
    const CONTEXT_TAB = '@local/claude-code-workbench/context';
    const RIGHT_SIDEBAR_MIN_WIDTH = 300;
    const NATIVE_INPUT_ACTIVITY = 'conversation.input.activity';
    const WORKBENCH_VOICE_SLOT = 'workbench.composer.voice';
    const BRAND_VIEW_BOX = '8.5 8.5 47 47';
    const BRAND_RAY = 'M31.1 6Q32 4.3 32.9 6L39.1 18.1Q40.5 21 37.7 23L32 26.3 26.3 23Q23.5 21 24.9 18.1Z';
    const BRAND_RAYS = [135, 225, 315, 45].map((angle) => ({
      d: BRAND_RAY,
      transform: `rotate(${angle} 32 32)`,
    }));
    const BRAND_COLORS = {
      light: ['#bb6349', '#9f452e'],
      dark: ['#f5b59a', '#e98e70'],
    };
    const THEME_TOKENS = {
      '--dsw-alias-bg-base': { light: '#ffffff', dark: '#1f1f1f' },
      '--dsw-alias-bg-layer-1': { light: '#ffffff', dark: '#232323' },
      '--dsw-alias-bg-layer-2': { light: '#f4f4f4', dark: '#2a2a2a' },
      '--dsw-alias-bg-overlay': { light: '#ffffff', dark: '#242424' },
      '--dsw-alias-markdown-code-block': { light: '#f6f6f6', dark: '#1b1b1c' },
      '--dsw-alias-border-l1': { light: '#e5e5e5', dark: 'rgba(255, 255, 255, 0.08)' },
      '--dsw-alias-border-l2': { light: '#dddddd', dark: 'rgba(255, 255, 255, 0.14)' },
      '--dsw-alias-brand-primary': { light: '#a4482e', dark: '#d97757' },
      '--dsw-alias-label-primary': { light: '#191919', dark: '#f0eee9' },
      '--dsw-alias-label-secondary': { light: '#5e5e5e', dark: '#b8b5b0' },
      '--dsw-alias-label-tertiary': { light: '#666666', dark: '#adb2b8' },
      '--dsw-alias-label-caption': { light: '#6e6e6e', dark: '#81858c' },
      '--dsw-alias-state-error-primary': { light: '#ac463e', dark: '#e68575' },
      '--dsw-alias-state-idle-primary': { light: '#6e6e6e', dark: '#8c8983' },
      '--dsw-alias-state-success-primary': { light: '#3c704d', dark: '#86b38e' },
      '--dsw-alias-state-warn-primary': { light: '#8b5b15', dark: '#d6a35c' },
      '--dsw-specific-bubble': { light: '#f3f3f3', dark: '#2c2c2e' },
      '--dsw-specific-sidebar-fill': { light: '#ececec', dark: '#1b1b1b' },
    };
    const ignoreVoiceActivity = () => {};
    const runtime = {
      ctx: undefined, workspace: undefined, sessions: undefined,
      permissionPresets: undefined, shortcuts: undefined, workspaces: undefined, fileUploads: undefined,
      commandsRemote: undefined, modelDirectories: undefined, t: undefined,
      fileReferences: undefined, sessionReferences: undefined, composerSettings: undefined,
      contextAutoOpened: false,
    };

    function reportDiagnostic(message) {
      console.error(`[claude-workbench] ${message}`);
      runtimeFailure = true;
      compatibilityChanged();
    }

    const en = {
      draft_loading: "Restoring attachments…",
      draft_saving: "Saving attachments on this device…",
      draft_saved: "Attachments saved on this device · kept for 30 days",
      draft_error: "Attachments could not be saved or restored. Keep this window open and retry.",
      draft_memory: "Attachments are available in this window only.",
      tasksTitle: "Task status",
      tasksPlan: "Plan",
      tasksNoPlan: "No plan has been recorded in this session.",
      tasksBackground: "Background tasks",
      tasksEmpty: "No background tasks are reported by DSH.",
      tasksUnavailable: "Background task status is unavailable. Use the native session header.",
      tasksSettled: "Finished",
      tasksNative: "Open native details and controls",
      task_running: "Running",
      task_stopping: "Stopping",
      task_completed: "Completed",
      task_failed: "Failed",
      task_killed: "Stopped",
      task_pending: "Pending",
      task_in_progress: "In progress",
      task_unknown: "Unknown",
      compatTitle: "Compatibility check",
      compatIntro: "Checks the interfaces available in this client. This does not test a model or execute tools. Missing optional components keep their native entry points.",
      compatComposer: "Conversation composer",
      compatFiles: "File attachments and metadata",
      compatPreview: "Native file preview",
      compatJobs: "Native background tasks",
      compatStorage: "Attachment persistence",
      compatReady: "Available",
      compatUnavailable: "Unavailable / native fallback",
      compatRefresh: "Check again",
      compatCopy: "Copy diagnostic summary",
      compatCopied: "Copied",
      compatRuntimeFailure: "A component error was observed. A failed FPS composer falls back to DSH’s native input.",

      greetingMorning: 'Good morning',
      greetingAfternoon: 'Good afternoon',
      greetingEvening: 'Good evening',
      greetingWithName: '{greeting}, {name}',
      conversations: 'Conversations',
      sessionHistory: 'Conversation history',
      sessionBack: 'Go back to the previous conversation',
      sessionForward: 'Go forward to the next conversation',
      newChat: 'New chat',
      searchChats: 'Search conversations',
      expandSearch: 'Expand the sidebar to search',
      noChats: 'No conversations yet',
      noResults: 'No matching conversations',
      untitled: 'Untitled',
      you: 'You',
      assistant: 'Assistant',
      reasoning: 'Reasoning',
      attachment: 'Attachment',
      image: 'Image',
      inputPlaceholder: 'Write a message…',
      inputDisabled: 'Select a conversation to start writing',
      send: 'Send',
      queue: 'Queue message',
      stop: 'Stop',
      sending: 'Sending…',
      chooseWorkspace: 'Choose a workspace',
      sendFailed: 'Message was not sent. Your draft has been kept.',
      stopFailed: 'Could not stop this turn.',
      sessionNotReady: 'Session is not ready',
      noText: 'No text content',
      otherContent: 'Unsupported content block',
      stopped: 'Stopped',
      attachImage: 'Attach image',
      removeImage: 'Remove image',
      imageTooLarge: 'Each image must be 8 MB or smaller.',
      imageReadFailed: 'The image could not be read.',
      imageRecognizing: 'Reading the images…',
      imageRecognitionFailed: 'Could not read the images.',
      imageRecognitionContext: 'Image observations for reference only',
      imageOnlyRequest: 'Please describe the attached images.',
      attachFiles: 'Attach files',
      removeFile: 'Remove file',
      fileTooLarge: 'Each file must be 20 MB or smaller.',
      fileTooMany: 'At most 6 files can be attached.',
      fileReadFailed: 'A file could not be read.',
      fileUploadFailed: 'A file could not be uploaded.',
      composerHint: 'Enter to send · Shift+Enter newline · / commands · @ references',
      busySendHint: 'Primary modifier + Enter uses the other delivery mode',
      selectModel: 'Select model',
      modelLoading: 'Loading models…',
      modelSearch: 'Search models',
      modelMore: 'More models',
      modelBack: 'Back',
      noModels: 'No models available',
      modelLoadFailed: 'Could not load models',
      modelSelectFailed: 'Could not switch model',
      effortLabel: 'Reasoning effort',
      effortDefault: 'Default',
      effortSelectFailed: 'Could not switch reasoning effort',
      commandNotFound: 'This command is not available in the custom composer.',
      commandLoading: 'Loading commands…',
      commandNoMatch: 'No matching commands',
      commandLoadFailed: 'Could not load commands',
      commandsUnavailable: 'Command catalog is unavailable',
      contextTitle: 'Context',
      contextEnvironment: 'Environment',
      contextModel: 'Model',
      contextProvider: 'Provider',
      contextUsage: 'Context usage',
      contextTokens: 'Tokens',
      contextTurns: 'Turns',
      contextSteps: 'Steps',
      contextSystemPrompt: 'System prompt',
      contextTools: 'Tools',
      contextMessages: 'Messages',
      contextFree: 'Free space',
      contextUsed: 'Used',
      contextEstimate: 'Context composition is estimated.',
      contextEmpty: 'Context data appears after the first model request.',
      usageTitle: 'Usage',
      usageDetails: 'View context',
      usageBalance: 'API balance',
      usageDreaminaName: 'Dreamina',
      usageDreaminaBalance: 'Credit balance',
      usageKeySpent: 'Key spend',
      usageKeyRemaining: 'Key spending limit remaining',
      usageOrganizationSpend: 'Org spend · 7 days',
      usageOrganizationTokens: 'Org tokens · 7 days',
      usageDreaminaReset: 'Estimated subscription credit reset',
      usageExtraBalance: 'Extra usage balance',
      usageFiveHours: '5-hour limit',
      usageSevenDays: '7-day limit',
      usageMonthTotal: 'Monthly shared quota',
      usageCreditsRemaining: '{amount} credits left',
      usageReset: 'Resets',
      usageTotal: 'Total tokens',
      usageInput: 'Uncached input',
      usageOutput: 'Output',
      usageCacheRead: 'Cache read',
      usageCacheWrite: 'Cache write',
      usageEmpty: 'Usage appears when the provider reports tokens.',
      contextSession: 'Session',
      contextWorkspace: 'Workspace',
      contextStatus: 'Status',
      contextRunning: 'Running',
      contextIdle: 'Idle',
      contextQueued: 'Queued',
      contextSessionId: 'Session ID',
      contextOutputs: 'Outputs',
      contextOutputsLoading: 'Checking output files…',
      contextOutputsEmpty: 'No files produced in this session yet.',
      contextOutputOpenFailed: 'Could not open the file preview.',
      contextOpen: 'Open session context',
      headerFiles: 'Files',
      headerTerminal: 'Terminal',
      headerBrowser: 'Browser',
      addMenuTitle: 'Add',
      addImage: 'Image',
      addFiles: 'Files',
      addCommands: 'Commands',
      addContext: 'Session context',
      addPlugins: 'Plugins',
      workspaceLabel: 'Workspace',
      workspaceChange: 'Choose folder…',
      workspaceOpenFailed: 'Could not open that folder',
      mentionTitle: 'Files and sessions',
      mentionLoading: 'Looking up references…',
      mentionNoMatch: 'No matching references',
      mentionUnavailable: 'References are unavailable',
      steer: 'Send to the current turn',
      archivedChats: 'Archived sessions',
      actionUnarchive: 'Restore session',
      collapseSidebar: 'Collapse sidebar',
      expandSidebar: 'Expand sidebar',
      moreMenu: 'More',
      menuPlugins: 'Plugins',
      menuAutomations: 'Automation tasks',
      menuFiles: 'Workspace files',
      menuSettings: 'Settings',
      localWorkspace: 'Local workspace',
      sessionActions: 'Session actions',
      actionRename: 'Rename',
      actionFork: 'Fork',
      actionPin: 'Pin',
      actionUnpin: 'Unpin',
      actionArchive: 'Archive',
      renameTitle: 'Rename session',
      renameSave: 'Save',
      archiveConfirm: 'Archive this session?',
      sessionActionFailed: 'Session action failed',
      toolPreparing: 'Preparing…',
      toolRunning: 'Running',
      toolDone: 'Done',
      toolFailed: 'Failed',
      toolDetails: 'View details',
      workReadOne: 'Read 1 file',
      workReadMany: 'Read {count} files',
      workCommandOne: 'Ran 1 command',
      workCommandMany: 'Ran {count} commands',
      workChanged: 'Changed {files}',
      workFailed: '{count} failed',
      toolApplyPatch: 'Edit files',
      toolBash: 'Run command',
      toolRead: 'Read file',
      toolWrite: 'Write file',
      toolGrep: 'Search',
      toolGlob: 'Find files',
      toolWebSearch: 'Search the web',
      toolWebFetch: 'Read page',
      permissionTitle: 'Permissions',
      permissionReadOnly: 'Read only',
      permissionWorkspaceWrite: 'Workspace write',
      permissionFullAccess: 'Full access',
      permissionAuto: 'Auto review',
      permissionCustom: 'Custom',
      permissionLoadFailed: 'Could not load permission presets',
      permissionSwitchFailed: 'Could not switch permission mode',
      permissionConfirmFull: 'Enable full access? This reduces approval safeguards for this session.',
      permissionConfirmAuto: 'Enable Auto review? A separate reviewer will decide some tool approvals.',
      permissionCancel: 'Cancel',
      permissionEnable: 'Enable',
    };
    const zh = {
      draft_loading: "正在恢复附件…",
      draft_saving: "正在将附件保存到本机…",
      draft_saved: "附件已保存到本机 · 保留 30 天",
      draft_error: "附件保存或恢复失败，请保留当前窗口并重试。",
      draft_memory: "附件仅保留在当前窗口。",
      tasksTitle: "任务状态",
      tasksPlan: "计划步骤",
      tasksNoPlan: "当前会话尚未记录计划步骤。",
      tasksBackground: "后台任务",
      tasksEmpty: "DSH 暂未报告后台任务。",
      tasksUnavailable: "暂时无法读取后台任务，请使用会话顶栏的原生入口。",
      tasksSettled: "已结束",
      tasksNative: "打开原生详情与操作",
      task_running: "运行中",
      task_stopping: "正在停止",
      task_completed: "已完成",
      task_failed: "失败",
      task_killed: "已停止",
      task_pending: "待处理",
      task_in_progress: "进行中",
      task_unknown: "未知",
      compatTitle: "兼容性自检",
      compatIntro: "检查当前客户端可用接口，不调用模型或执行工具。可选组件缺失时保留 DSH 原生入口。",
      compatComposer: "会话输入框",
      compatFiles: "文件附件与信息",
      compatPreview: "原生文件预览",
      compatJobs: "原生后台任务",
      compatStorage: "附件持久化",
      compatReady: "可用",
      compatUnavailable: "不可用 / 使用原生入口",
      compatRefresh: "重新检查",
      compatCopy: "复制诊断摘要",
      compatCopied: "已复制",
      compatRuntimeFailure: "检测到组件异常。FPS 输入框渲染失败时会回退到 DSH 原生输入框。",

      greetingMorning: '早上好',
      greetingAfternoon: '下午好',
      greetingEvening: '晚上好',
      greetingWithName: '{greeting}，{name}',
      conversations: '会话',
      sessionHistory: '会话访问历史',
      sessionBack: '后退到上一个会话',
      sessionForward: '前进到下一个会话',
      newChat: '新会话',
      searchChats: '搜索会话',
      expandSearch: '展开侧栏以搜索',
      noChats: '还没有会话',
      noResults: '没有匹配的会话',
      untitled: '未命名',
      you: '你',
      assistant: '助手',
      reasoning: '思考过程',
      attachment: '附件',
      image: '图片',
      inputPlaceholder: '输入消息…',
      inputDisabled: '选择一个会话后开始输入',
      send: '发送',
      queue: '排队发送',
      stop: '停止',
      sending: '发送中…',
      chooseWorkspace: '选择工作区',
      sendFailed: '消息未发送，草稿已保留。',
      stopFailed: '无法停止当前回合。',
      sessionNotReady: '会话尚未就绪',
      noText: '没有文本内容',
      otherContent: '不支持的内容块',
      stopped: '已停止',
      attachImage: '添加图片',
      removeImage: '移除图片',
      imageTooLarge: '每张图片不能超过 8 MB。',
      imageReadFailed: '无法读取这张图片。',
      imageRecognizing: '正在识图…',
      imageRecognitionFailed: '未能识别图片。',
      imageRecognitionContext: '图片观察结果，仅供参考',
      imageOnlyRequest: '请描述附件中的图片。',
      attachFiles: '添加文件',
      removeFile: '移除文件',
      fileTooLarge: '每个文件不能超过 20 MB。',
      fileTooMany: '最多附加 6 个文件。',
      fileReadFailed: '文件读取失败。',
      fileUploadFailed: '文件上传失败。',
      composerHint: 'Enter 发送 · Shift+Enter 换行 · / 命令 · @ 引用',
      busySendHint: '⌘/Ctrl + Enter 使用另一种发送方式',
      selectModel: '选择模型',
      modelLoading: '正在加载模型…',
      modelSearch: '搜索模型',
      modelMore: '更多模型',
      modelBack: '返回',
      noModels: '没有可用模型',
      modelLoadFailed: '无法加载模型列表',
      modelSelectFailed: '无法切换模型',
      effortLabel: '思考强度',
      effortDefault: '默认',
      effortSelectFailed: '无法切换思考强度',
      commandNotFound: '当前输入区无法执行这个命令。',
      commandLoading: '正在加载命令…',
      commandNoMatch: '没有匹配的命令',
      commandLoadFailed: '无法加载命令目录',
      commandsUnavailable: '命令目录不可用',
      contextTitle: '上下文',
      contextEnvironment: '环境',
      contextModel: '模型',
      contextProvider: '供应商',
      contextUsage: '上下文占用',
      contextTokens: 'Token',
      contextTurns: '回合',
      contextSteps: '步骤',
      contextSystemPrompt: '系统提示',
      contextTools: '工具',
      contextMessages: '消息',
      contextFree: '可用空间',
      contextUsed: '已使用',
      contextEstimate: '上下文构成为估算值。',
      contextEmpty: '首次请求模型后显示上下文数据。',
      usageTitle: '用量',
      usageDetails: '查看上下文',
      usageBalance: 'API 余额',
      usageDreaminaName: '即梦',
      usageDreaminaBalance: '积分余额',
      usageKeySpent: 'Key 已用金额',
      usageKeyRemaining: 'Key 剩余支出额度',
      usageOrganizationSpend: '组织花费 · 近 7 天',
      usageOrganizationTokens: '组织 Token · 近 7 天',
      usageDreaminaReset: '订阅积分重置（推算）',
      usageExtraBalance: '加量余额',
      usageFiveHours: '5 小时限额',
      usageSevenDays: '7 天限额',
      usageMonthTotal: '每月共享额度',
      usageCreditsRemaining: '剩余 {amount} 积分',
      usageReset: '重置',
      usageTotal: '累计 Token',
      usageInput: '未缓存输入',
      usageOutput: '输出',
      usageCacheRead: '缓存读取',
      usageCacheWrite: '缓存写入',
      usageEmpty: '供应商回报 Token 后显示用量。',
      contextSession: '会话',
      contextWorkspace: '工作区',
      contextStatus: '状态',
      contextRunning: '运行中',
      contextIdle: '空闲',
      contextQueued: '排队中',
      contextSessionId: '会话 ID',
      contextOutputs: '输出内容',
      contextOutputsLoading: '正在检查输出文件…',
      contextOutputsEmpty: '当前会话暂无输出文件。',
      contextOutputOpenFailed: '无法打开文件预览。',
      contextOpen: '打开会话上下文',
      headerFiles: '文件',
      headerTerminal: '终端',
      headerBrowser: '浏览器',
      addMenuTitle: '添加',
      addImage: '图片',
      addFiles: '文件',
      addCommands: '命令',
      addContext: '会话上下文',
      addPlugins: '插件',
      workspaceLabel: '工作区',
      workspaceChange: '选择文件夹…',
      workspaceOpenFailed: '无法打开该文件夹',
      mentionTitle: '文件与会话',
      mentionLoading: '正在查找引用…',
      mentionNoMatch: '没有匹配的引用',
      mentionUnavailable: '引用暂不可用',
      steer: '追加到当前轮',
      archivedChats: '已归档会话',
      actionUnarchive: '恢复会话',
      collapseSidebar: '收起侧栏',
      expandSidebar: '展开侧栏',
      moreMenu: '更多',
      menuPlugins: '插件',
      menuAutomations: '自动化任务',
      menuFiles: '工作区文件',
      menuSettings: '设置',
      localWorkspace: '本地工作区',
      sessionActions: '会话操作',
      actionRename: '重命名',
      actionFork: '分叉',
      actionPin: '置顶',
      actionUnpin: '取消置顶',
      actionArchive: '归档',
      renameTitle: '重命名会话',
      renameSave: '保存',
      archiveConfirm: '归档这个会话？',
      sessionActionFailed: '会话操作失败',
      toolPreparing: '准备中…',
      toolRunning: '运行中',
      toolDone: '已完成',
      toolFailed: '失败',
      toolDetails: '查看详情',
      workReadOne: '读取了 1 个文件',
      workReadMany: '读取了 {count} 个文件',
      workCommandOne: '运行了 1 条命令',
      workCommandMany: '运行了 {count} 条命令',
      workChanged: '改动了 {files}',
      workFailed: '{count} 次失败',
      toolApplyPatch: '编辑文件',
      toolBash: '运行命令',
      toolRead: '读取文件',
      toolWrite: '写入文件',
      toolGrep: '搜索',
      toolGlob: '查找文件',
      toolWebSearch: '搜索网页',
      toolWebFetch: '读取网页',
      permissionTitle: '权限',
      permissionReadOnly: '仅可查看',
      permissionWorkspaceWrite: '工作区内修改',
      permissionFullAccess: '完全权限',
      permissionAuto: '自动审查',
      permissionCustom: '自定义',
      permissionLoadFailed: '无法加载权限预设',
      permissionSwitchFailed: '无法切换权限模式',
      permissionConfirmFull: '启用完全权限？本会话的审批保护会减少。',
      permissionConfirmAuto: '启用自动审查？部分工具审批将由独立审查器决定。',
      permissionCancel: '取消',
      permissionEnable: '启用',
    };

    Object.assign(en, {
      imageSettings: 'Image generation',
      imageSettingsIntro: 'Optional text-to-image tools for this DSH installation. Cloud providers receive the image prompt. Turn on the ones you want to use.',
      imageSettingsLoad: 'Loading image providers…', imageSettingsError: 'Could not update image settings.',
      imageSettingsReadError: 'Could not load image settings. If you just updated FPS, restart DSH.',
      imageSettingsUnavailable: 'Image tools are not available on this DSH host.',
      imageZ: 'No key required. Good for quick concepts and illustration. Shared Hugging Face capacity (typically 2 minutes of GPU time per day for anonymous users); waits and availability vary.',
      imageCog: 'Requires a Zhipu API key with access to the free CogView-3-Flash model. Best for drafts and Chinese prompts. Rate limits depend on the account.',
      imagePoll: 'Requires a Pollinations key and positive Pollen balance. FPS only uses a verified zero-price community model (SDXL Lightning). Good for quick drafts; the service may log prompts and images.',
      imageComfy: 'Runs on this computer through official Comfy MCP. The bundled starter workflow makes 512-class SD 1.5 images for drafts. A modern GPU is recommended; CPU generation can take several minutes.',
      imageComfyRequirements: 'Apple Silicon macOS 14+, Windows x64 or Linux x64 (glibc 2.28+). Requires Python 3.11–3.13 with pip and venv, Git, 8 GB RAM, 16 GiB free disk, and internet for the initial download.',
      imageKey: 'API key', imageSaveKey: 'Save key', imageRemoveKey: 'Remove saved key', imageKeyConfigured: 'Key configured',
      imageKeyMissing: 'Key required', imageKeyUnavailable: 'Configure the key on the DSH host.',
      imageInstall: 'Download and install', imageCancel: 'Cancel download', imageRetry: 'Retry installation',
      imageReady: 'Ready to generate', imageMissing: 'Setup required', imageUnsupported: 'Automatic setup is unavailable on this computer.',
      imageInstallError: 'Setup did not finish.', imageInstalling: 'Installing…',
      imageStage_checking: 'Checking requirements…', imageStage_environment: 'Preparing Python…',
      imageStage_comfyui: 'Downloading ComfyUI…', imageStage_dependencies: 'Installing ComfyUI and official Comfy MCP…',
      imageStage_model: 'Downloading the image model…', imageStage_verifying: 'Verifying the installation…',
    });
    Object.assign(zh, {
      imageSettings: '图片生成',
      imageSettingsIntro: '可为此 DSH 安装启用文生图工具。云端服务会收到生图提示词，请按需开启。',
      imageSettingsLoad: '正在读取生图设置…', imageSettingsError: '无法更新生图设置。',
      imageSettingsReadError: '无法读取图片生成设置。如果刚更新 FPS，请重启 DSH。',
      imageSettingsUnavailable: '此 DSH 主机暂不支持生图工具。',
      imageZ: '无需 Key，适合快速做概念图和插画。使用 Hugging Face 共享算力，匿名用户通常每天有 2 分钟 GPU 时间，可能排队或暂时不可用。',
      imageCog: '需要可访问免费 CogView-3-Flash 模型的智谱 API Key，适合初稿和中文提示词。速率限制以账号为准。',
      imagePoll: '需要 Pollinations Key 和正的 Pollen 余额。FPS 只调用经核验为零价的社区模型 SDXL Lightning，适合快速出草图。服务可能记录提示词和图片。',
      imageComfy: '通过官方 Comfy MCP 在本机生图。初始工作流使用 SD 1.5，输出约 512 像素级别的草图。建议使用现代 GPU，仅用 CPU 可能需要数分钟。',
      imageComfyRequirements: '支持 Apple 芯片 Mac（macOS 14+）、Windows x64 或 Linux x64（glibc 2.28+）。需要 Python 3.11–3.13（含 pip 和 venv）、Git、8 GB 内存、16 GiB 可用磁盘，以及首次下载所需的网络。',
      imageKey: 'API Key', imageSaveKey: '保存 Key', imageRemoveKey: '移除已保存的 Key', imageKeyConfigured: '已配置 Key',
      imageKeyMissing: '需要配置 Key', imageKeyUnavailable: '请在 DSH 主机上配置 Key。',
      imageInstall: '下载并安装', imageCancel: '取消下载', imageRetry: '重试安装',
      imageReady: '可以生图', imageMissing: '待安装', imageUnsupported: '此电脑不支持自动安装。',
      imageInstallError: '安装未完成。', imageInstalling: '正在安装…',
      imageStage_checking: '正在检查运行要求…', imageStage_environment: '正在准备 Python…',
      imageStage_comfyui: '正在下载 ComfyUI…', imageStage_dependencies: '正在安装 ComfyUI 和官方 Comfy MCP…',
      imageStage_model: '正在下载生图模型…', imageStage_verifying: '正在验证安装…',
    });

    function brandImage(animated, colors) {
      const motion = animated ? `<style>
        path { animation: pulse 1.6s ease-in-out infinite both; }
        path:nth-child(2) { animation-delay: -1.2s; }
        path:nth-child(3) { animation-delay: -0.8s; }
        path:nth-child(4) { animation-delay: -0.4s; }
        @keyframes pulse { 0%, 100% { opacity: 0.34; } 36% { opacity: 1; } }
      </style>` : '';
      const rays = BRAND_RAYS.map(({ d, transform }, index) =>
        `<path d="${d}" fill="${colors[index % 2]}" transform="${transform}"/>`).join('');
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BRAND_VIEW_BOX}">${motion}${rays}</svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    const CSS = `
      .cw-draft-status { padding: 3px 12px 8px; color: var(--cw-text-muted); font-size: 11px; }
      .cw-draft-status button, .cw-compatibility button { border: 1px solid var(--cw-border); border-radius: 6px; padding: 4px 8px; margin: 5px; background: transparent; color: inherit; cursor: pointer; }
      .cw-compatibility { padding: 12px 0 20px; margin-bottom: 20px; border-bottom: 1px solid var(--cw-border); font-size: 12px; }
      .cw-compatibility summary { font-size: 14px; cursor: pointer; }
      .cw-long-tasks h3 { font-size: 12px; font-weight: 500; color: var(--cw-text-secondary); margin: 16px 0 8px; }
      .cw-long-tasks summary { cursor: pointer; font-size: 12px; color: var(--cw-text-secondary); padding: 6px 0; }
      .cw-task-list, .cw-task-plan { list-style: none; padding: 0; margin: 4px 0; }
      .cw-task-row, .cw-task-plan li { display: flex; gap: 9px; padding: 7px 0; font-size: 12px; }
      .cw-task-dot { flex: 0 0 12px; width: 12px; height: 12px; margin-top: 2px; border: 1px solid currentColor; border-radius: 50%; color: var(--cw-text-muted); font-size: 9px; line-height: 11px; text-align: center; }
      [data-status="pending"] > .cw-task-dot { border-style: dashed; }
      [data-status="running"] > .cw-task-dot, [data-status="in_progress"] > .cw-task-dot { color: var(--cw-accent); border-width: 2px; }
      [data-status="failed"] > .cw-task-dot { color: var(--cw-danger); }
      .cw-task-row[data-status="completed"], .cw-task-plan li[data-status="completed"] { color: var(--cw-text-muted); }
      .cw-task-main { display: flex; flex: 1; flex-direction: column; gap: 3px; min-width: 0; }
      .cw-task-main > span, .cw-task-main small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .cw-task-main small, .cw-native-jobs > small { color: var(--cw-text-muted); font-size: 11px; }
      .cw-native-jobs { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 9px; }

      .cw-image-settings { padding: 4px 0 16px; color: var(--dsw-alias-label-primary); }
      .cw-image-settings h2 { margin: 0 0 5px; font-size: 15px; font-weight: 600; }
      .cw-image-settings p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.55; }
      .cw-image-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 8px 20px;
        padding: 14px 0; border-bottom: 1px solid var(--dsw-alias-border-l1); }
      .cw-image-row strong { display: block; margin-bottom: 3px; font-size: 14px; font-weight: 600; }
      .cw-image-switch { width: 36px; height: 21px; margin-top: 1px; padding: 2px; border: 0; border-radius: 20px;
        background: var(--dsw-alias-border-l2); cursor: pointer; }
      .cw-image-switch::before { content: ''; display: block; width: 17px; height: 17px; border-radius: 100%;
        background: var(--dsw-alias-label-caption); }
      .cw-image-switch[aria-checked='true'] { background: var(--dsw-alias-brand-primary); }
      .cw-image-switch[aria-checked='true']::before { margin-left: auto; background: white; }
      .cw-image-actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 9px; }
      .cw-image-actions p { flex-basis: 100%; }
      .cw-image-actions button, .cw-image-actions input { min-height: 30px; padding: 4px 9px;
        border: 1px solid var(--dsw-alias-border-l2); border-radius: 7px; color: inherit;
        background: var(--dsw-alias-bg-layer-2); font: inherit; font-size: 13px; }
      .cw-image-actions button:not(:disabled) { cursor: pointer; }
      .cw-image-actions input { width: min(100%, 235px); }
      .cw-image-actions button:disabled, .cw-image-switch:disabled { opacity: .55; }
      .cw-image-settings .cw-image-error { margin: 6px 0 0; color: var(--dsw-alias-state-error-primary); }
      html[data-workbench-theme] body {
        --cw-bg: var(--dsw-alias-bg-base);
        --cw-surface: var(--dsw-alias-bg-layer-1);
        --cw-text: var(--dsw-alias-label-primary);
        --cw-text-secondary: var(--dsw-alias-label-secondary);
        --cw-text-muted: var(--dsw-alias-state-idle-primary);
        --cw-border: var(--dsw-alias-border-l1);
        --cw-border-strong: var(--dsw-alias-border-l2);
        --cw-accent: var(--dsw-alias-brand-primary);
        --cw-danger: var(--dsw-alias-state-error-primary);
        --cw-surface-hover: #f0f0f0;
        --cw-user: var(--dsw-specific-bubble);
        --cw-code: #f6f6f6;
        --cw-accent-hover: #8c3924;
        --cw-on-accent: #fffaf6;
        --cw-sidebar-fill: #ececec;
        --cw-sidebar-hover: #e1e1e1;
        --cw-sidebar-selected: #d4d4d4;
        --cw-new-session: transparent;
        --cw-new-session-hover: var(--cw-sidebar-hover);
        --cw-sidebar-muted: #5e5e5e;
        --cw-panel: #ffffff;
        --cw-panel-layer: #fafafa;
        --cw-panel-hover: #f2f2f2;
        --cw-panel-selected: #e5e5e5;
        --cw-context-active: var(--cw-panel-selected);
        --cw-tabs-bg: #f1f1f1;
        --cw-tabs-hover: #e9e9e9;
        --cw-tabs-active: #ffffff;
        --cw-tabs-text: #5e5e5e;
        --cw-popover: #ffffff;
        --cw-shadow: rgba(0, 0, 0, 0.13);
        --cw-metric-track: #ededed;
        --cw-metric-ring: #858585;
        --cw-metric-blue: #2875bc;
        --cw-metric-orange: #b65d35;
        --cw-metric-gold: #8b5b15;
        --cw-metric-teal: #25816c;
        --cw-metric-free: #a2a2a2;
        --cw-brand-ray: ${BRAND_COLORS.light[0]};
        --cw-brand-ray-shade: ${BRAND_COLORS.light[1]};
        --cw-thinking-icon: ${brandImage(false, BRAND_COLORS.light)};
        --cw-thinking-icon-animated: ${brandImage(true, BRAND_COLORS.light)};
      }
      html[data-workbench-theme] body[data-ds-dark-theme] {
        --cw-surface-hover: #2d2d2d;
        --cw-code: #161616;
        --cw-accent-hover: #e48868;
        --cw-on-accent: #2b1b15;
        --cw-sidebar-fill: #272423;
        --cw-sidebar-hover: #383432;
        --cw-sidebar-selected: #423d3a;
        --cw-new-session: var(--cw-sidebar-selected);
        --cw-new-session-hover: #504946;
        --cw-sidebar-muted: #aaa39e;
        --cw-panel: #1b1b1b;
        --cw-panel-layer: #202020;
        --cw-panel-hover: #2d2c2b;
        --cw-panel-selected: #323130;
        --cw-context-active: var(--cw-tabs-active);
        --cw-tabs-bg: #292725;
        --cw-tabs-hover: #34312f;
        --cw-tabs-active: #403b38;
        --cw-tabs-text: #b4aca5;
        --cw-popover: #2b2a29;
        --cw-shadow: rgba(0, 0, 0, 0.42);
        --cw-metric-track: #343331;
        --cw-metric-ring: #55524f;
        --cw-metric-blue: #5c9ddd;
        --cw-metric-orange: #dc865e;
        --cw-metric-gold: #cfa24f;
        --cw-metric-teal: #5eac97;
        --cw-metric-free: #464441;
        --cw-brand-ray: ${BRAND_COLORS.dark[0]};
        --cw-brand-ray-shade: ${BRAND_COLORS.dark[1]};
        --cw-thinking-icon: ${brandImage(false, BRAND_COLORS.dark)};
        --cw-thinking-icon-animated: ${brandImage(true, BRAND_COLORS.dark)};
      }

      /* Native settings uses its own control and navigation surface tokens. */
      html[data-workbench-theme] body:not([data-ds-dark-theme]) [data-shortcut-modal="settings"] {
        --dsw-alias-bg-layer-2: var(--cw-popover);
        --dsw-alias-bg-module-platform: #f4f4f4;
        --dsw-specific-sidebar-nav-item-active: #e9e9e9;
        --dsw-alias-interactive-bg-hover: #f0f0f0;
        --dsw-alias-interactive-bg-hover-solid: #f0f0f0;
        --dsw-alias-interactive-bg-active: #e5e5e5;
        --dsw-alias-border-l4: var(--cw-border-strong);
      }
      html[data-workbench-theme] body:not([data-ds-dark-theme]) [data-shortcut-modal="settings"]
        button[class*="_themeCube"][aria-pressed="true"] {
        background: #eeeeee;
        border-color: #bcbcbc;
      }
      html[data-workbench-theme] body:not([data-ds-dark-theme]):has([data-shortcut-modal="settings"])
        > [role="menu"][data-menu-material] {
        --dsw-menu-surface-fill: var(--cw-popover);
        --dsw-menu-backdrop-filter: none;
        --dsw-alias-interactive-bg-hover: #f0f0f0;
      }

      .cw-root {
        color: var(--cw-text);
        font-family: var(--dsw-font-family, "Avenir Next", "Segoe UI", sans-serif);
        font-size: var(--dsh-content-font-size, 14px);
        box-sizing: border-box;
      }
      .cw-root *, .cw-root *::before, .cw-root *::after { box-sizing: border-box; }
      .cw-root button, .cw-root input, .cw-root textarea { font: inherit; }
      .cw-root button { color: inherit; }
      .cw-root button:focus-visible, .cw-root input:focus-visible,
      .cw-root textarea:focus-visible, .cw-root summary:focus-visible {
        outline: 2px solid var(--cw-accent);
        outline-offset: 2px;
      }
      .cw-icon { width: 16px; height: 16px; flex: 0 0 auto; display: block; }
      .cw-icon-button {
        width: 30px; height: 30px; padding: 0; border: 0; border-radius: 8px;
        background: transparent; display: inline-flex; align-items: center;
        justify-content: center; cursor: pointer;
      }
      .cw-icon-button:hover { background: var(--cw-surface-hover); }
      .cw-icon-button:disabled { opacity: 0.4; cursor: default; }

      /* DSH's sidebar, workspace and account component classes. Keep their layout and controls mounted. */
      html[data-workbench-theme] .kB3qhq_root {
        --cw-sidebar-font: 13px;
        --dsw-alias-interactive-bg-hover: var(--cw-sidebar-hover);
        --dsh-sidebar-inline-padding: 8px;
        --dsh-sidebar-row-padding: 10px;
        --dsh-sidebar-label-gap: 8px;
        --dsh-sidebar-paint-inset: 1px;
        background: var(--cw-sidebar-fill);
        font-size: var(--cw-sidebar-font);
      }
      html[data-workbench-theme] .kB3qhq_logoRow > .kB3qhq_brand,
      html[data-workbench-theme] .kB3qhq_topStrip + .kB3qhq_logoRow,
      html[data-workbench-theme] .kB3qhq_root .kB3qhq_railMark {
        display: none;
      }
      html[data-workbench-theme] .kB3qhq_collapsed .kB3qhq_toggle .kB3qhq_panelIcon {
        display: inline;
      }
      html[data-workbench-theme] .kB3qhq_root > .kB3qhq_topStrip {
        height: 44px;
      }
      .cw-session-history {
        display: inline-flex; align-items: center; gap: 2px; flex: none;
        margin-inline-start: 4px; -webkit-app-region: no-drag;
      }
      .kB3qhq_collapsed .cw-session-history { display: none; }
      .cw-session-history .cw-icon-button {
        width: 28px; height: 28px; color: var(--dsw-alias-label-primary);
      }
      .cw-session-history .cw-icon-button:not(:disabled):hover {
        background: var(--dsw-alias-interactive-bg-hover);
      }
      .cw-session-history .cw-icon-button:disabled { background: transparent; }
      .cw-session-history .cw-icon-button:focus-visible {
        outline: 2px solid var(--cw-accent); outline-offset: -2px;
      }
      /* The native hero mark slot lives beside the built-in headline. */
      html[data-workbench-theme] ._8tPydW_headline:has(.cw-hero-greeting) > ._8tPydW_titleGroup {
        display: none;
      }
      html[data-workbench-theme] ._8tPydW_fishHitbox:has(.cw-hero-greeting) {
        max-inline-size: 100%;
      }
      .cw-hero-greeting {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        min-inline-size: 0;
        padding-block: 0 10px;
        color: var(--dsw-alias-label-primary);
        font-family: Georgia, "Songti SC", "Noto Serif CJK SC", serif;
        font-size: clamp(25px, 4vw, 36px);
        font-weight: 400;
        line-height: 1.25;
        text-align: center;
        overflow-wrap: anywhere;
      }
      .cw-hero-greeting svg { inline-size: 1.08em; block-size: 1.08em; flex: none; }

      /* Keep the native running-status row, elapsed time and announcements. */
      @media (forced-colors: none) {
        html[data-workbench-theme] [data-chat-running] {
          --dsw-alias-label-deep-diving: var(--cw-sidebar-muted);
          --dsw-alias-label-deep-diving-shimmer: var(--cw-text);
        }
        html[data-workbench-theme] [data-chat-running] .tnXGgG_runningIcon {
          width: calc(17px + var(--dsh-content-font-delta, 0px));
          height: calc(17px + var(--dsh-content-font-delta, 0px));
          background: var(--cw-thinking-icon) center / contain no-repeat;
        }
        html[data-workbench-theme] [data-chat-running] .tnXGgG_runningIcon > * { display: none; }
      }
      @media (forced-colors: none) and (prefers-reduced-motion: no-preference) {
        html[data-workbench-theme] [data-chat-running]:not([data-holding]) .tnXGgG_runningIcon {
          background-image: var(--cw-thinking-icon-animated);
        }
      }
      html[data-workbench-theme] .kB3qhq_root:not(.kB3qhq_collapsed) .kB3qhq_newSession {
        height: 34px;
        margin: 0 1px 3px;
        padding: 5px 10px;
        border: 0;
        border-radius: 8px;
        background: var(--cw-new-session);
        justify-content: flex-start;
        font-size: var(--cw-sidebar-font);
      }
      html[data-workbench-theme] .kB3qhq_root:not(.kB3qhq_collapsed) .kB3qhq_newSession:hover {
        background: var(--cw-new-session-hover);
      }
      html[data-workbench-theme] .kB3qhq_root .kB3qhq_newSessionContent {
        width: auto;
        gap: 8px;
      }
      html[data-workbench-theme] .kB3qhq_root:not(.kB3qhq_collapsed) .kB3qhq_newSessionContent {
        justify-content: flex-start;
      }
      html[data-workbench-theme] .kB3qhq_root:not(.kB3qhq_collapsed) .kB3qhq_panelList {
        gap: 1px;
        margin: 2px 0 2px;
      }
      html[data-workbench-theme] .kB3qhq_root:not(.kB3qhq_collapsed) .kB3qhq_panelRow {
        min-height: 31px;
        border-radius: 7px;
        padding-block: 4px;
      }
      html[data-workbench-theme] .kB3qhq_root .Kjh-qa_root:not(.Kjh-qa_rail) .Kjh-qa_sectionHeader {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas: "search search" "label actions";
        grid-template-rows: 31px 27px;
        align-items: center;
        height: auto;
        margin: 0 0 3px;
        padding: 0 1px;
        gap: 12px 6px;
      }
      html[data-workbench-theme] .kB3qhq_root .Kjh-qa_root:not(.Kjh-qa_rail) .Kjh-qa_sectionHeader:has(.Kjh-qa_searchExpanded) {
        grid-template-rows: 31px 0;
        row-gap: 0;
        margin-bottom: 7px;
      }
      html[data-workbench-theme] .kB3qhq_root .Kjh-qa_sectionLabel {
        grid-area: label;
        margin-left: 9px;
        max-width: none;
        color: var(--cw-sidebar-muted);
        font-size: 11px;
        font-weight: 500;
      }
      html[data-workbench-theme] .kB3qhq_root .Kjh-qa_headerActions { grid-area: actions; }
      html[data-workbench-theme] .kB3qhq_root .Kjh-qa_searchSlot {
        grid-area: search;
        max-width: none;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      html[data-workbench-theme] .kB3qhq_root .Kjh-qa_searchSlot .Kjh-qa_search {
        height: 31px;
        border-radius: 7px;
      }
      html[data-workbench-theme] .kB3qhq_root .Kjh-qa_searchSlot .Kjh-qa_search:not(.Kjh-qa_searchExpanded) .Kjh-qa_searchButton {
        width: 100%; height: 100%; justify-content: flex-start; gap: 8px;
        padding-inline: 9px;
        color: var(--dsw-alias-label-primary);
      }
      html[data-workbench-theme] .kB3qhq_root .Kjh-qa_searchButton[aria-expanded="false"]::after {
        content: attr(aria-label);
        font-size: var(--cw-sidebar-font);
      }
      html[data-workbench-theme] .kB3qhq_root .Kjh-qa_searchExpanded {
        background: var(--cw-surface);
        border-color: var(--cw-border-strong);
      }
      html[data-workbench-theme] .kB3qhq_root [data-row-key^="workspace:"] {
        height: 32px;
        border-radius: 7px;
        color: var(--cw-sidebar-muted);
        font-size: var(--cw-sidebar-font);
      }
      html[data-workbench-theme] .kB3qhq_root :is(.kB3qhq_panelRow, .JoiKIa_title, .JoiKIa_searchResultTitle, .Kjh-qa_searchInput) {
        font-size: var(--cw-sidebar-font);
        line-height: 20px;
      }
      html[data-workbench-theme] .kB3qhq_root [data-row-key^="workspace:"] .JoiKIa_folder { display: none; }
      html[data-workbench-theme] .kB3qhq_root [data-row-key^="workspace:"] .JoiKIa_projectText {
        order: -2;
        flex: 0 1 auto;
      }
      html[data-workbench-theme] .kB3qhq_root [data-row-key^="workspace:"] .JoiKIa_chevron {
        order: -1;
        width: 11px;
        display: inline-flex;
      }
      html[data-workbench-theme] .kB3qhq_root .JoiKIa_projectRow .JoiKIa_rowActions { margin-left: auto; }
      html[data-workbench-theme] .kB3qhq_root .JoiKIa_sessionRow {
        border-radius: 7px;
      }
      html[data-workbench-theme] .kB3qhq_root .JoiKIa_sessionRow.JoiKIa_selected {
        background-color: var(--cw-sidebar-selected);
      }
      html[data-workbench-theme] .kB3qhq_root:not(.kB3qhq_collapsed) .kB3qhq_footArea {
        flex-direction: row;
        align-items: center;
        gap: 4px;
        min-height: 43px;
        margin: 0 calc(-1 * var(--dsh-sidebar-inline-padding)) -6px;
        padding: 3px 9px;
        border-top: 1px solid var(--cw-border);
      }
      html[data-workbench-theme] .kB3qhq_root:not(.kB3qhq_collapsed) .kB3qhq_settingsArea {
        order: -1;
        flex: 1;
        width: auto;
      }
      html[data-workbench-theme] .kB3qhq_root:not(.kB3qhq_collapsed) .kB3qhq_footerActions {
        width: auto;
        flex: 0 0 auto;
        align-items: center;
      }
      html[data-workbench-theme] .kB3qhq_root .hjANda_trigger:not([data-collapsed="true"]) {
        height: 34px;
        padding-inline: 5px;
        font-size: var(--cw-sidebar-font);
      }
      html[data-workbench-theme] .kB3qhq_root .hjANda_trigger:not([data-collapsed="true"])::after {
        content: "";
        width: 5px; height: 5px;
        margin: -3px 3px 0 0;
        flex: 0 0 auto;
        border-right: 1px solid var(--cw-sidebar-muted);
        border-bottom: 1px solid var(--cw-sidebar-muted);
        transform: rotate(45deg);
      }
      html[data-workbench-theme] .kB3qhq_footArea .hjANda_avatar {
        width: 20px;
        height: 20px;
        background: #5f4ba6;
        color: #f5f1ff;
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
        text-transform: uppercase;
      }
      html[data-workbench-theme] .kB3qhq_footArea .hjANda_avatar > * { display: none; }
      html[data-workbench-theme] .kB3qhq_footArea .hjANda_avatar::before {
        content: var(--cw-account-initial, "•") / "";
      }
      .cw-sidebar-settings {
        width: 32px;
        height: 32px;
        color: var(--dsw-alias-label-primary);
        border-radius: 7px;
      }
      .cw-sidebar-settings:hover { background: var(--dsw-alias-interactive-bg-hover); }
      .cw-sidebar-settings:focus-visible { outline: 2px solid var(--cw-accent); outline-offset: -2px; }
      .cw-sidebar-settings .cw-icon { width: 17px; height: 17px; }

      .cw-message { width: 100%; padding: 9px 28px; background: transparent; }
      .cw-message-inner { width: min(100%, 760px); margin: 0 auto; }
      .cw-user-inner { display: flex; justify-content: flex-end; }
      .cw-user-bubble {
        max-width: min(82%, 620px); padding: 10px 15px; border-radius: 14px;
        background: var(--cw-user); color: var(--cw-text);
        line-height: 1.6; overflow-wrap: anywhere;
      }
      .cw-assistant-inner {
        color: var(--cw-text); line-height: 1.75;
        font-size: calc(var(--dsh-content-font-size, 14px) + 1px);
      }
      .cw-text { white-space: pre-wrap; overflow-wrap: anywhere; }
      .cw-text + .cw-text { margin-top: 12px; }
      .cw-heading {
        margin: 18px 0 7px; color: var(--cw-text);
        font-size: 15px; font-weight: 600; line-height: 1.45;
      }
      .cw-heading:first-child { margin-top: 0; }
      .cw-list {
        margin: 8px 0; padding-left: 22px; color: var(--cw-text);
        line-height: 1.7;
      }
      .cw-list li + li { margin-top: 3px; }
      .cw-quote {
        margin: 10px 0; padding: 2px 0 2px 12px;
        border-left: 2px solid var(--cw-border-strong);
        color: var(--cw-text-secondary); white-space: pre-wrap;
      }
      .cw-code {
        margin: 12px 0; padding: 13px 15px; overflow: auto;
        border: 1px solid var(--cw-border); border-radius: 10px;
        background: var(--cw-code); color: var(--cw-text);
        font-family: var(--ds-font-family-code, monospace);
        font-size: var(--dsh-code-font-size, 12px); line-height: 1.55;
        white-space: pre; tab-size: 2;
      }
      .cw-reasoning {
        margin: 0 0 12px; color: var(--cw-text-secondary);
        border-left: 2px solid var(--cw-border-strong); padding-left: 12px;
      }
      .cw-reasoning summary { cursor: pointer; color: var(--cw-text-muted); }
      .cw-reasoning-content { margin-top: 8px; white-space: pre-wrap; }
      .cw-interrupted { margin-top: 10px; color: var(--cw-text-muted); font-size: 12px; }
      .cw-composer-files { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
      .cw-composer-file {
        display: inline-flex; align-items: center; gap: 6px;
        max-width: 220px; padding: 4px 8px; border: 1px solid var(--cw-border);
        border-radius: 8px; background: var(--cw-surface);
        color: var(--cw-text-secondary); font-size: 11.5px;
      }
      .cw-composer-file .cw-icon { width: 13px; height: 13px; color: var(--cw-text-muted); flex: 0 0 auto; }
      .cw-composer-file-name {
        min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .cw-composer-file-size { color: var(--cw-text-muted); font-size: 10.5px; flex: 0 0 auto; }
      .cw-composer-file button {
        width: 18px; height: 18px; padding: 0; border: 0; border-radius: 5px;
        display: inline-flex; align-items: center; justify-content: center;
        background: transparent; color: var(--cw-text-muted) !important; cursor: pointer;
        flex: 0 0 auto;
      }
      .cw-composer-file button:hover { background: var(--cw-border); color: var(--cw-text) !important; }
      .cw-composer-file button .cw-icon { width: 11px; height: 11px; }
      .cw-composer-file-pending { border-style: dashed; color: var(--cw-text-muted); }
      .cw-tool-row { width: 100%; padding: 2px 28px; }
      .cw-tool-row-inner { width: min(100%, 760px); margin: 0 auto; }
      .cw-tool-summary {
        width: 100%; min-height: 30px; display: flex; align-items: center; gap: 8px;
        padding: 5px 8px; border: 0; border-radius: 7px;
        background: transparent; color: var(--cw-text-secondary) !important;
        text-align: left; cursor: pointer; font-size: 12.5px;
      }
      .cw-tool-summary:hover { background: var(--cw-surface-hover); color: var(--cw-text) !important; }
      .cw-tool-summary:disabled { cursor: default; }
      .cw-tool-leading { color: var(--cw-text-muted); display: inline-flex; }
      .cw-tool-leading .cw-icon { width: 14px; height: 14px; }
      .cw-tool-label { flex: 0 0 auto; color: var(--cw-text); }
      .cw-tool-detail {
        min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis;
        white-space: nowrap; color: var(--cw-text-muted); font-size: 11px;
      }
      .cw-tool-count { color: var(--cw-text-muted); font-size: 10.5px; }
      .cw-tool-state {
        flex: 0 0 auto; color: var(--cw-text-muted); font-size: 10.5px;
      }
      .cw-tool-state[data-state="error"] { color: var(--cw-danger); }
      .cw-tool-state[data-state="running"],
      .cw-tool-state[data-state="preparing"] { color: var(--cw-accent); }
      .cw-tool-chevron { flex: none; color: var(--cw-text-muted); }
      .cw-tool-chevron .cw-icon { width: 13px; height: 13px; transform: rotate(-90deg); }
      [data-workbench-theme] [data-turn-process][aria-expanded][data-turn-process-tool-calls]:not([data-turn-process-tool-calls="0"], [data-cw-work-summary])::after {
        content: "· " attr(data-turn-process-tool-calls) " tool calls";
        order: 1; flex: none; margin-inline-start: 7px;
        font-size: calc(var(--dsh-content-font-size, 14px) - 1px);
      }
      [data-workbench-theme] [data-turn-process][aria-expanded][data-turn-process-tool-calls="1"]:not([data-cw-work-summary])::after {
        content: "· 1 tool call";
      }
      html[data-workbench-theme][lang|="zh"] [data-turn-process][aria-expanded][data-turn-process-tool-calls]:not([data-turn-process-tool-calls="0"], [data-cw-work-summary])::after {
        content: "· " attr(data-turn-process-tool-calls) " 次工具调用";
      }
      [data-workbench-theme] [data-turn-process] > .gTO55a_chevron {
        order: 2;
        margin-inline-start: 6px;
      }
      [data-workbench-theme] [data-turn-process][aria-expanded="false"] > .gTO55a_chevron {
        transform: rotate(-90deg);
      }
      [data-workbench-theme] [data-turn-process][aria-expanded="false"][data-cw-work-summary]::after {
        content: "· " attr(data-cw-work-summary);
        order: 1; min-width: 0; margin-inline-start: 7px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        font-size: calc(var(--dsh-content-font-size, 14px) - 1px);
      }
      [data-workbench-theme] [data-turn-process][aria-expanded="false"][data-cw-work-summary] > .gTO55a_label {
        flex: none;
        max-width: 45%;
      }
      [data-workbench-theme] [data-step-process] .r52wTW_leading { order: 1; }
      [data-workbench-theme] [data-step-process] [data-step-process-icon] { display: none; }
      [data-workbench-theme] [data-step-process] [data-step-process-chevron] { opacity: 1; }
      [data-workbench-theme] [data-step-process] button[aria-expanded="false"] [data-step-process-chevron] svg {
        transform: rotate(-90deg);
      }
      [data-workbench-theme] [data-step-process]:not([data-group-expanded-mode]) button[data-cw-work-summary] > :not(.r52wTW_leading) {
        display: none;
      }
      [data-workbench-theme] [data-step-process]:not([data-group-expanded-mode]) button[data-cw-work-summary]::before {
        content: attr(data-cw-work-summary);
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .cw-attachment {
        display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px;
        border: 1px solid var(--cw-border); border-radius: 7px;
        color: var(--cw-text-secondary); font-size: 12px;
      }

      .cw-composer {
        width: min(100%, 760px); margin: 0 auto; background: transparent;
        padding: 0;
      }
      [data-composer-seat] .cw-composer-composer,
      [data-workbench-theme] [data-composer-seat] [data-testid="todo-panel"] {
        /* Match the native chat column, including its adjustable width. */
        width: min(var(--dsh-chat-content-width, 760px),
          calc(100% - 2 * (var(--dsh-composer-side-clearance, 16px) + 16px)));
      }
      [data-workbench-theme] [data-composer-seat] [data-testid="todo-panel"] {
        position: relative; max-width: none; margin: 0 auto 8px;
        border: 1px solid var(--dsw-alias-border-l1); border-radius: 12px;
        background: var(--dsw-alias-bg-base); box-shadow: none; backdrop-filter: none;
      }
      [data-workbench-theme] [data-testid="todo-panel"] > div { padding: 6px 13px; }
      [data-workbench-theme] [data-testid="todo-panel"]:has(button[aria-expanded="true"]) > div {
        padding: 12px 14px;
      }
      [data-workbench-theme] [data-testid="todo-panel"] button[aria-expanded="true"] {
        position: absolute; inset-block-start: 7px; inset-inline-end: 7px; z-index: 1;
        display: grid; place-items: center; width: 26px; height: 26px; border-radius: 6px;
      }
      [data-workbench-theme] [data-testid="todo-panel"] button[aria-expanded="true"]:hover {
        background: var(--dsw-alias-interactive-bg-hover);
      }
      [data-workbench-theme] [data-testid="todo-panel"] button[aria-expanded="true"] > :not(:last-child) {
        position: absolute; inline-size: 1px; block-size: 1px;
        overflow: hidden; clip-path: inset(50%); white-space: nowrap;
      }
      [data-workbench-theme] [data-testid="todo-panel"] ul {
        gap: 7px; max-height: min(240px, 30vh); padding-inline-end: 25px;
      }
      [data-workbench-theme] [data-testid="todo-panel"] li[data-status] {
        align-items: flex-start; gap: 7px; color: var(--dsw-alias-label-primary);
        font-size: var(--dsh-content-font-size, 14px); line-height: 1.5;
      }
      [data-workbench-theme] [data-testid="todo-panel"] li[data-status="completed"] {
        color: var(--dsw-alias-label-secondary);
      }
      [data-workbench-theme] [data-testid="todo-panel"] li[data-status] > :last-child {
        white-space: normal; overflow-wrap: anywhere;
      }
      [data-workbench-theme] [data-testid="todo-panel"] li > [role="img"] {
        position: relative; box-sizing: border-box; margin-block-start: 3px;
        inline-size: 14px; block-size: 14px; border: 1.5px solid currentColor; border-radius: 50%;
      }
      [data-workbench-theme] [data-testid="todo-panel"] li > [role="img"] > * { display: none; }
      [data-workbench-theme] [data-testid="todo-panel"] li[data-status="pending"] > [role="img"] {
        border-style: dashed; color: var(--dsw-alias-label-secondary);
      }
      [data-workbench-theme] [data-testid="todo-panel"] li[data-status="completed"] > [role="img"] {
        background: currentColor;
      }
      [data-workbench-theme] [data-testid="todo-panel"] li[data-status="completed"] > [role="img"]::after {
        content: ""; box-sizing: border-box; width: 4px; height: 7px;
        border: solid var(--dsw-alias-bg-base); border-width: 0 1.5px 1.5px 0;
        transform: translateY(-1px) rotate(40deg);
      }
      [data-workbench-theme] [data-testid="todo-panel"] li[data-status="in_progress"] > [role="img"]::after {
        content: ""; width: 2px; height: 2px; border-radius: 50%; background: currentColor;
        box-shadow: -3px 0 currentColor, 3px 0 currentColor;
      }
      .cw-command-menu {
        max-height: 240px; overflow-y: auto; margin-bottom: 6px;
        padding: 4px; border: 1px solid var(--cw-border-strong);
        border-radius: 11px; background: var(--cw-bg);
        box-shadow: 0 12px 32px var(--cw-shadow);
      }
      .cw-command-row {
        width: 100%; min-height: 30px; display: flex; align-items: baseline;
        gap: 9px; padding: 5px 8px; border: 0; border-radius: 7px;
        background: transparent; color: var(--cw-text-secondary) !important;
        text-align: left; cursor: pointer;
      }
      .cw-command-row:hover,
      .cw-command-row[data-active="true"] {
        background: var(--cw-surface-hover); color: var(--cw-text) !important;
      }
      .cw-command-name {
        flex: 0 0 auto; color: var(--cw-text); font-size: 12.5px;
        font-family: var(--ds-font-family-code, monospace);
      }
      .cw-command-detail {
        min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis;
        white-space: nowrap; color: var(--cw-text-muted); font-size: 11px;
      }
      .cw-command-hint {
        flex: 0 0 auto; color: var(--cw-text-muted); font-size: 10.5px;
        font-family: var(--ds-font-family-code, monospace);
      }
      .cw-command-status {
        padding: 8px; color: var(--cw-text-muted); font-size: 11.5px;
      }
      .cw-command-status[data-error="true"] { color: var(--cw-danger); }
      .cw-composer-card {
        border: 1px solid var(--cw-border-strong); border-radius: 12px;
        background: var(--cw-surface); color: var(--cw-text);
        padding: 4px 8px;
        margin-bottom: 12px;
      }
      .cw-composer-footer {
        display: flex; align-items: center;
        gap: 12px; padding: 0 4px 8px 7px; min-height: 18px;
      }
      .cw-composer-hint {
        padding: 0; color: var(--cw-text-muted);
        text-align: left; font-size: 10px; line-height: 1.2;
        min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: 0;
      }
      .cw-composer:has(.cw-composer-input:focus) .cw-composer-hint { opacity: 1; }
      .cw-footer-controls { display: flex; align-items: center; gap: 1px; flex: 0 1 auto; min-width: 0; margin-inline-start: auto; }
      .cw-folder-button { max-width: 150px; }
      .cw-folder-button .cw-icon { width: 12px; height: 12px; }
      .cw-mention-menu .cw-command-row .cw-icon {
        width: 13px; height: 13px; color: var(--cw-text-muted); flex: 0 0 auto;
      }
      .cw-mention-heading {
        padding: 7px 10px 4px; color: var(--cw-text-muted); font-size: 10.5px;
        letter-spacing: 0.02em;
      }
      .cw-permission-button { max-width: 150px; }
      .cw-permission-button .cw-icon { width: 12px; height: 12px; }
      .cw-permission-menu { width: 280px; }
      .cw-permission-badge {
        border: 1px solid var(--cw-border-strong); border-radius: 3px;
        padding: 0 3px; color: var(--cw-text-muted); font-size: 8px;
      }
      .cw-permission-confirm {
        margin-top: 5px; padding: 8px; border-top: 1px solid var(--cw-border);
        color: var(--cw-text-secondary); font-size: 11.5px; line-height: 1.5;
      }
      .cw-permission-confirm-actions {
        display: flex; justify-content: flex-end; gap: 6px; margin-top: 8px;
      }
      .cw-permission-confirm-actions button {
        min-width: 54px; height: 26px; padding: 0 9px;
        border: 1px solid var(--cw-border-strong); border-radius: 7px;
        background: transparent; color: var(--cw-text-secondary) !important;
        font-size: 11.5px; cursor: pointer;
      }
      .cw-permission-confirm-actions button:hover { background: var(--cw-surface-hover); }
      .cw-permission-confirm-actions button[data-primary="true"] {
        border-color: var(--cw-accent); background: var(--cw-accent); color: var(--cw-on-accent) !important;
      }
      .cw-model-wrap { position: relative; min-width: 0; flex: 0 1 auto; }
      .cw-model-button {
        max-width: 190px; height: 20px; padding: 0 5px; border: 0; border-radius: 5px;
        background: transparent; color: var(--cw-text-secondary) !important;
        display: inline-flex; align-items: center; gap: 3px; cursor: pointer;
        font-size: 11px; min-width: 0;
      }
      .cw-model-button:hover { background: var(--cw-surface-hover); color: var(--cw-text) !important; }
      .cw-model-button:disabled { cursor: default; opacity: 0.6; }
      .cw-model-button-label {
        min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .cw-model-button .cw-icon { width: 13px; height: 13px; color: var(--cw-text-muted); }
      .cw-model-effort {
        flex: 0 0 auto; color: var(--cw-text-muted); font-size: 11px;
        max-width: 74px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .cw-model-menu {
        position: fixed; z-index: 2147483000;
        max-height: min(380px, 55vh);
        overflow-y: auto; padding: 5px;
        border: 1px solid var(--cw-border-strong);
        border-radius: 11px;
        background: var(--cw-popover);
        color: var(--cw-text);
        box-shadow: 0 14px 40px var(--cw-shadow);
      }
      .cw-model-search {
        width: 100%; height: 30px; margin-bottom: 4px; padding: 0 8px;
        border: 1px solid var(--cw-border); border-radius: 7px;
        background: var(--cw-surface); color: var(--cw-text); outline: none;
      }
      .cw-model-group-label {
        padding: 8px 8px 5px; color: var(--cw-text-muted);
        font-size: 11px; line-height: 1.3;
      }
      .cw-model-more {
        justify-content: space-between; margin-top: 3px;
        border-top: 1px solid var(--cw-border); border-radius: 0 0 7px 7px;
      }
      .cw-model-more .cw-icon { width: 13px; height: 13px; transform: rotate(-90deg); }
      .cw-model-back {
        width: 100%; height: 26px; margin-bottom: 4px; padding: 0 7px;
        border: 0; border-radius: 6px; background: transparent;
        color: var(--cw-text-muted) !important; text-align: left; cursor: pointer;
        font-size: 11px;
      }
      .cw-model-back:hover { background: var(--cw-surface-hover); color: var(--cw-text) !important; }
      .cw-model-option {
        width: 100%; min-height: 32px; border: 0; border-radius: 7px;
        background: transparent; color: var(--cw-text-secondary) !important;
        padding: 6px 8px; display: flex; align-items: center; gap: 8px;
        text-align: left; font-size: 13px; cursor: pointer;
      }
      .cw-model-option:hover { background: var(--cw-surface-hover); color: var(--cw-text) !important; }
      .cw-model-option > .cw-icon {
        width: 14px; height: 14px; color: var(--cw-text-muted); flex: 0 0 auto;
      }
      .cw-model-option[aria-checked="true"] { color: var(--cw-text) !important; }
      .cw-model-option-label {
        min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .cw-model-option-check { color: var(--cw-accent); font-size: 12px; }
      .cw-model-efforts {
        margin-top: 4px; padding: 4px 8px 8px;
        border-top: 1px solid var(--cw-border);
      }
      .cw-effort-options { display: flex; flex-wrap: wrap; gap: 5px; }
      .cw-effort-option {
        min-width: 48px; height: 26px; padding: 0 9px;
        border: 1px solid var(--cw-border); border-radius: 7px;
        background: transparent; color: var(--cw-text-secondary) !important;
        font-size: 12px; cursor: pointer;
      }
      .cw-effort-option:hover { background: var(--cw-surface-hover); color: var(--cw-text) !important; }
      .cw-effort-option[aria-checked="true"] {
        border-color: var(--cw-accent);
        background: color-mix(in srgb, var(--cw-accent) 12%, transparent);
        color: var(--cw-text) !important;
      }
      .cw-model-empty, .cw-model-error {
        padding: 10px 8px; color: var(--cw-text-muted); font-size: 12px; line-height: 1.5;
      }
      .cw-model-error { color: var(--cw-danger); }
      [data-workbench-theme] .kiGsTW_header:has([data-conversation-tabs]) {
        min-height: 0;
        padding-bottom: 7px;
        border-bottom-color: var(--cw-border);
      }
      [data-workbench-theme] .kiGsTW_header:has([data-conversation-tabs]) .kiGsTW_titleRow {
        min-height: 34px;
      }
      [data-workbench-theme] .kiGsTW_tabs {
        align-items: center;
        gap: 4px;
        margin-top: 3px;
        -webkit-app-region: no-drag;
      }
      [data-workbench-theme] [data-conversation-tabs] {
        align-items: center;
        gap: 2px;
        min-height: 0;
        padding: 2px;
        border: 1px solid var(--cw-border);
        border-radius: 7px;
        background: var(--cw-tabs-bg);
      }
      [data-workbench-theme] [data-conversation-tabs] [role="tab"] {
        min-height: 23px;
        margin: 0;
        padding: 3px 9px;
        border-radius: 4px;
        color: var(--cw-tabs-text);
        font-size: 12px;
        line-height: 17px;
      }
      [data-workbench-theme] [data-conversation-tabs] [role="tab"]::after { content: none; }
      [data-workbench-theme] [data-conversation-tabs] [role="tab"]:hover,
      [data-workbench-theme] .kiGsTW_tabs .kiGsTW_viewsMore:hover {
        background: var(--cw-tabs-hover);
        color: var(--cw-text);
      }
      [data-workbench-theme] [data-conversation-tabs] [role="tab"][aria-selected="true"],
      [data-workbench-theme] .kiGsTW_tabs .kiGsTW_viewsMore:is(.kiGsTW_viewsMoreActive, [aria-expanded="true"]) {
        background: var(--cw-tabs-active);
        color: var(--cw-text);
      }
      [data-workbench-theme] .kiGsTW_tabs .kiGsTW_viewsMore {
        width: 26px;
        height: 26px;
        margin: 0;
        border-radius: 6px;
        color: var(--cw-tabs-text);
      }
      [data-workbench-theme] .kiGsTW_tabs :is([role="tab"], .kiGsTW_viewsMore):focus-visible {
        outline: 1px solid var(--cw-accent);
        outline-offset: 1px;
      }
      @supports (grid-template-columns: subgrid) {
        [data-workbench-theme] .kiGsTW_root[data-phase="active"] {
          container: cw-conversation / inline-size;
        }
        @container cw-conversation (min-width: 820px) {
          /* Keep the native tab bar wide enough for its own two-tab measurement. */
          [data-workbench-theme] .kiGsTW_header:has([data-conversation-tabs]) {
            grid-template-columns: auto minmax(0, 1fr) 292px max-content max-content;
            align-items: center;
            padding-block: 5px;
          }
          [data-workbench-theme] .kiGsTW_header:has([data-conversation-tabs]) .kiGsTW_titleRow {
            grid-area: 1 / 2 / 2 / -1;
            display: grid;
            grid-template-columns: subgrid;
            container-type: normal;
          }
          [data-workbench-theme] .kiGsTW_header:has([data-conversation-tabs]) .kiGsTW_titleCluster {
            grid-area: 1 / 1;
          }
          [data-workbench-theme] .kiGsTW_header:has([data-conversation-tabs]) .kiGsTW_headerUtilities {
            grid-area: 1 / 3;
            margin-inline-start: 0;
            gap: 5px;
          }
          [data-workbench-theme] .kiGsTW_header:has([data-conversation-tabs]) .kiGsTW_headerCorner {
            grid-area: 1 / 4;
          }
          [data-workbench-theme] .kiGsTW_header .kiGsTW_tabs {
            grid-area: 1 / 3;
            justify-content: center;
            flex-wrap: nowrap;
            margin: 0;
            padding: 0;
          }
        }
      }
      [data-workbench-theme] [data-message-bubble] { border-radius: 14px; }
      .cw-header-actions { display: flex; align-items: center; gap: 1px; }
      .cw-context-button {
        width: 28px; height: 28px; padding: 0; border: 0; border-radius: 7px;
        background: transparent; color: var(--cw-text-secondary);
        display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
        opacity: 0.9;
      }
      .cw-context-button .cw-icon { width: 15px; height: 15px; }
      .cw-context-button:hover,
      .cw-context-button[aria-pressed="true"] {
        background: var(--cw-surface-hover);
        color: var(--cw-text); opacity: 1;
      }
      .cw-context-button[aria-pressed="true"] { background: var(--cw-context-active); }
      [data-workbench-theme] [data-sidebar-right-panel] {
        --dsw-alias-bg-base: var(--cw-panel);
        --dsw-alias-bg-layer-1: var(--cw-panel-layer);
        --dsw-alias-bg-layer-2: var(--cw-panel-hover);
      }
      [data-workbench-theme] [data-sidebar-right-panel] [role="tab"]:has(.Dv5QdW_tabTitle) {
        border-radius: 7px;
      }
      [data-workbench-theme] [data-sidebar-right-panel] [role="tab"][aria-selected="true"]:has(.Dv5QdW_tabTitle) {
        background-color: var(--cw-panel-selected);
      }
      .cw-context {
        height: 100%; overflow-y: auto; padding: 3px clamp(12px, 5%, 22px) 24px;
        color: var(--cw-text); background: var(--cw-panel);
        font-size: 13px; line-height: 1.45;
      }
      .cw-context-section { padding: 15px 0; }
      .cw-context-section + .cw-context-section { border-top: 1px solid var(--cw-border); }
      .cw-context-heading {
        margin: 0 0 11px; font-size: 13px; line-height: 18px; font-weight: 600;
      }
      .cw-output-list { list-style: none; margin: 0; padding: 0; }
      .cw-output-row {
        width: 100%; min-height: 30px; padding: 4px 6px;
        border: 0; border-radius: 6px; background: transparent;
        display: flex; align-items: center; gap: 9px;
        text-align: left; cursor: pointer;
      }
      .cw-output-row:hover { background: var(--cw-surface-hover); }
      .cw-output-icon {
        width: 30px; height: 30px; flex: none; display: grid; place-items: center;
        border-radius: 6px; overflow: hidden; background: var(--cw-surface);
        color: var(--cw-text-muted);
      }
      .cw-output-icon img { display: block; width: 100%; height: 100%; object-fit: cover; }
      .cw-output-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .cw-output-type { margin-inline-start: auto; flex: none; color: var(--cw-text-muted); font-size: 10px; }
      .cw-context-environment {
        display: flex; align-items: center; gap: 10px; min-width: 0; padding: 5px 0;
      }
      .cw-context-environment .cw-icon { color: var(--cw-sidebar-muted); }
      .cw-context-environment-text {
        display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 7px; min-width: 0;
      }
      .cw-context-environment-text > span {
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;
      }
      .cw-context-row {
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 12px; padding: 4px 0;
      }
      .cw-context-label { flex: 0 0 auto; color: var(--cw-text-secondary); }
      .cw-context-value {
        min-width: 0; color: var(--cw-text-secondary);
        text-align: right; overflow-wrap: anywhere;
      }
      .cw-metric-head {
        display: flex; flex-wrap: wrap; justify-content: space-between;
        align-items: baseline; gap: 2px 8px; font-variant-numeric: tabular-nums;
      }
      .cw-metric-head > :last-child { color: var(--cw-text-secondary); }
      .cw-metric-track {
        display: flex; height: 4px; margin: 6px 0 9px; overflow: hidden;
        border-radius: 999px; background: var(--cw-metric-track);
      }
      .cw-metric-track > span {
        display: block; flex: 0 0 auto; height: 100%; background: var(--cw-metric, var(--cw-metric-blue));
      }
      .cw-root [data-metric="messages"] { --cw-metric: var(--cw-metric-blue); }
      .cw-root :is([data-metric="tools"], [data-metric="output"]) { --cw-metric: var(--cw-metric-orange); }
      .cw-root :is([data-metric="system"], [data-metric="write"]) { --cw-metric: var(--cw-metric-gold); }
      .cw-root [data-metric="free"] { --cw-metric: var(--cw-metric-free); }
      .cw-root [data-metric="read"] { --cw-metric: var(--cw-metric-teal); }
      .cw-context-legend {
        display: grid; grid-template-columns: minmax(0, 1fr) auto auto;
        align-items: center; gap: 6px 12px; margin: 11px 0 0;
      }
      .cw-context-legend dt {
        display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--cw-text-secondary);
      }
      .cw-context-legend dt::before, .cw-usage-breakdown dt::before {
        content: ""; width: 8px; height: 8px; border-radius: 2px;
        flex: 0 0 auto; background: var(--cw-metric);
      }
      .cw-context-legend dt span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .cw-context-legend dd {
        margin: 0; text-align: right; white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .cw-context-legend dd:nth-of-type(odd) { color: var(--cw-text-secondary); }
      .cw-context-subtle { color: var(--cw-text-muted); font-size: 11px; }
      .cw-context-note { margin: 9px 0 0; }
      .cw-context-details > summary {
        display: flex; align-items: center; gap: 7px; cursor: pointer; list-style: none;
        font-weight: 550; border-radius: 5px;
      }
      .cw-context-details > summary::-webkit-details-marker { display: none; }
      .cw-context-details > summary .cw-icon { width: 13px; height: 13px; transform: rotate(-90deg); }
      .cw-context-details[open] > summary { margin-bottom: 7px; }
      .cw-context-details[open] > summary .cw-icon { transform: none; }
      .cw-usage-trigger {
        flex: 0 0 auto; width: 27px; height: 25px; margin-left: 2px;
        color: var(--cw-metric-blue) !important; border-radius: 7px;
      }
      .cw-usage-trigger[aria-expanded="true"] { background: var(--cw-surface-hover); }
      .cw-usage-trigger[data-level="high"] { color: var(--cw-danger) !important; }
      .cw-usage-trigger[data-level="warn"] { color: var(--cw-metric-gold) !important; }
      .cw-usage-ring { width: 16px; height: 16px; }
      .cw-usage-popover {
        position: fixed; z-index: 1000; overflow-y: auto; padding: 10px 15px 11px;
        scrollbar-width: none; overscroll-behavior-y: contain;
        border: 1px solid var(--cw-border-strong); border-radius: 12px;
        background: var(--cw-popover); box-shadow: 0 9px 28px var(--cw-shadow);
        font-size: 12px; line-height: 1.45;
      }
      .cw-usage-popover::-webkit-scrollbar { display: none; }
      .cw-usage-popover:focus { outline: none; }
      .cw-usage-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 3px 8px; margin-bottom: 9px; }
      .cw-usage-header h2 { margin: 0; font-size: 13px; font-weight: 600; }
      .cw-usage-link {
        border: 0; padding: 2px 0; border-radius: 3px; background: none;
        color: var(--cw-text-secondary) !important; cursor: pointer;
      }
      .cw-usage-link:hover { color: var(--cw-text) !important; }
      .cw-provider-usage {
        border-bottom: 1px solid var(--cw-border-strong); padding-bottom: 8px; margin-bottom: 8px;
      }
      .cw-provider-usage h3 { margin: 0; font-size: 12px; font-weight: 600; }
      .cw-provider-usage h3 span { color: var(--cw-text-secondary); font-weight: 400; }
      .cw-provider-usage h3 strong { color: var(--cw-text); font-weight: 600; }
      .cw-provider-usage > section + section {
        border-top: 1px solid var(--cw-border-strong); margin-top: 8px; padding-top: 8px;
      }
      .cw-provider-window { margin-top: 5px; }
      .cw-provider-window .cw-metric-track { margin: 3px 0 0; }
      .cw-provider-window [data-metric="quota-high"] { --cw-metric: var(--cw-danger); }
      .cw-provider-balance { margin-top: 5px; }
      .cw-provider-balance strong { color: var(--cw-text); font-weight: 600; }
      .cw-provider-usage .cw-context-subtle { margin: 3px 0 0; }
      .cw-usage-breakdown {
        border-top: 1px solid var(--cw-border-strong); margin-top: 8px; padding-top: 7px;
      }
      .cw-usage-breakdown .cw-metric-head { margin-bottom: 4px; }
      .cw-usage-breakdown dl { margin: 4px 0 0; }
      .cw-usage-breakdown .cw-context-row { padding: 2px 0; }
      .cw-usage-breakdown dt { display: flex; align-items: center; gap: 8px; }
      .cw-usage-breakdown dd { margin: 0; font-variant-numeric: tabular-nums; }
      .cw-composer-row {
        display: flex; align-items: center; gap: 3px; min-height: 28px;
      }
      .cw-composer-input {
        flex: 1; min-width: 0; display: block; min-height: 28px; max-height: 160px;
        border: 0; outline: none !important; resize: none; overflow-y: auto;
        background: transparent; color: var(--cw-text); padding: 4px;
        line-height: max(20px, 1.4em); field-sizing: content;
      }
      .cw-composer-input:placeholder-shown { field-sizing: fixed; }
      .cw-composer-input::placeholder { color: var(--cw-text-muted); }
      .cw-composer-input:disabled { cursor: not-allowed; opacity: 0.65; }
      .cw-composer-actions {
        display: flex; align-items: center; gap: 6px;
      }
      .cw-composer-voice {
        display: flex; align-items: center; min-width: 0;
      }
      .cw-composer-voice:not(:has(button)) { display: none; }
      .cw-composer-row:has(.cw-composer-voice [data-voice-activity]) { flex-wrap: wrap; }
      .cw-composer-voice:has([data-voice-activity]) { order: 1; flex: 1 0 100%; padding: 3px 0; }
      .cw-composer-voice [data-voice-activity] { width: 100%; }
      .cw-composer-state { color: var(--cw-text-muted); font-size: 12px; margin-left: 8px; }
      .cw-attach-button { width: 26px; height: 26px; }
      .cw-composer-images {
        display: flex; flex-wrap: wrap; gap: 5px; padding: 1px 4px 4px;
      }
      .cw-composer-image {
        position: relative; width: 44px; height: 44px; border-radius: 7px;
        overflow: hidden; border: 1px solid var(--cw-border-strong);
        background: var(--cw-code);
      }
      .cw-composer-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .cw-composer-image button {
        position: absolute; top: 3px; right: 3px; width: 20px; height: 20px;
        border: 0; border-radius: 50%; padding: 0; cursor: pointer;
        background: rgba(20, 19, 18, 0.82); color: #fffaf6;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .cw-composer-image button .cw-icon { width: 12px; height: 12px; }
      .cw-send-button {
        width: 26px; min-width: 26px; height: 26px; padding: 0; border: 0;
        border-radius: 50%; background: var(--cw-accent); color: var(--cw-on-accent) !important;
        display: inline-flex; align-items: center; justify-content: center;
        cursor: pointer;
      }
      .cw-send-button:hover { background: var(--cw-accent-hover); }
      .cw-send-button:disabled { background: var(--cw-surface-hover); color: var(--cw-text-muted) !important; cursor: default; }
      .cw-stop-button {
        background: transparent; border: 1px solid var(--cw-border-strong);
        color: var(--cw-text) !important;
      }
      .cw-stop-button:hover { background: var(--cw-surface-hover); }
      .cw-composer-error { color: var(--cw-danger); font-size: 12px; padding: 6px 4px 0; }
      .cw-workspace-button {
        border: 1px solid var(--cw-border-strong); border-radius: 9px;
        background: transparent; padding: 7px 12px; cursor: pointer;
      }
      .cw-workspace-button:hover { background: var(--cw-surface-hover); }
      @media (max-width: 640px) {
        .cw-message { padding-left: 14px; padding-right: 14px; }
        .cw-user-bubble { max-width: 92%; }
      }
    `;

    class WorkbenchBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { failed: false };
      }

      static getDerivedStateFromError() {
        return { failed: true };
      }

      componentDidCatch(error) {
        reportDiagnostic(`slot render failed: ${error?.message || error}`);
        this.props.onFailure?.();
      }

      render() {
        if (this.state.failed) return null;
        return this.props.children;
      }
    }

    function withBoundary(Component) {
      return function ClaudeWorkbenchStyled(props) {
        return h(WorkbenchBoundary, null, h(Component, props));
      };
    }

    function translate(props, key) {
      const t = props.t || runtime.t || ((name) => en[name] || name);
      return t(key);
    }

    const IMAGE_ROWS = [
      ['z-image', 'Z-Image Turbo', 'imageZ'], ['cogview', 'CogView-3-Flash', 'imageCog'],
      ['pollinations', 'Pollinations', 'imagePoll'], ['comfy', 'ComfyUI + Comfy MCP', 'imageComfy'],
    ];

    function ImageGenerationSettings(props) {
      const t = (key) => translate(props, key);
      const [state, setState] = React.useState(null);
      const [keys, setKeys] = React.useState({});
      const [pending, setPending] = React.useState('');
      const [error, setError] = React.useState(false);
      const requestRef = React.useRef(null);
      const installing = state?.providers?.comfy?.setup?.state === 'installing';
      const loading = state === null;

      async function request(signal, input) {
        const response = await fetch(new URL('api/workbench/imageSettings', document.baseURI), {
          cache: 'no-store', signal,
          ...(input ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) } : {}),
        });
        if (!response.ok) throw new Error('Image settings request failed');
        return response.json();
      }

      React.useEffect(() => () => requestRef.current?.abort(), []);
      React.useEffect(() => {
        if (pending || (!loading && !installing)) return;
        const controller = new AbortController();
        let timer;
        async function refresh() {
          try {
            const result = await request(controller.signal);
            if (controller.signal.aborted) return;
            setState(result);
            setError(false);
            if (result.providers?.comfy?.setup?.state === 'installing') timer = setTimeout(refresh, 1500);
          } catch {
            if (controller.signal.aborted) return;
            setError(true);
            if (installing) timer = setTimeout(refresh, 3000);
            else setState({ supported: false });
          }
        }
        if (loading) void refresh();
        else timer = setTimeout(refresh, 1500);
        return () => { controller.abort(); clearTimeout(timer); };
      }, [loading, installing, pending]);

      async function change(input) {
        if (requestRef.current) return;
        const controller = new AbortController();
        requestRef.current = controller;
        setPending(input.provider || 'comfy');
        setError(false);
        try {
          const result = await request(controller.signal, input);
          if (controller.signal.aborted) return;
          setState(result);
          if (input.action === 'saveKey') setKeys((old) => ({ ...old, [input.provider]: '' }));
        } catch {
          if (!controller.signal.aborted) setError(true);
        } finally {
          requestRef.current = null;
          if (!controller.signal.aborted) setPending('');
        }
      }

      function keyControls(provider, title, row) {
        const key = keys[provider] || '';
        const save = () => change({ action: 'saveKey', provider, key });
        return h('div', { className: 'cw-image-actions' },
          h('p', null, t(row.configured ? 'imageKeyConfigured' : 'imageKeyMissing')),
          row.writable ? h(React.Fragment, null,
            h('input', { type: 'password', value: key, placeholder: t('imageKey'), autoComplete: 'off',
              'aria-label': `${title} ${t('imageKey')}`, disabled: !!pending, maxLength: 2048,
              onChange: (event) => setKeys((old) => ({ ...old, [provider]: event.target.value })),
              onKeyDown: (event) => { if (event.key === 'Enter' && key.trim()) { event.preventDefault(); void save(); } },
            }),
            h('button', { type: 'button', disabled: !!pending || !key.trim(), onClick: save }, t('imageSaveKey')),
            row.stored && h('button', { type: 'button', disabled: !!pending,
              onClick: () => change({ action: 'saveKey', provider, key: '' }) }, t('imageRemoveKey')),
          ) : !row.configured && h('p', null, t('imageKeyUnavailable')),
        );
      }

      function comfyControls({ state: phase, stage, detail }) {
        const phaseKey = { ready: 'imageReady', missing: 'imageMissing', unsupported: 'imageUnsupported', error: 'imageInstallError' }[phase];
        const stageKey = `imageStage_${stage}`;
        const label = phase === 'installing' ? t(Object.hasOwn(en, stageKey) ? stageKey : 'imageInstalling') : phaseKey ? t(phaseKey) : '';
        return h('div', { className: 'cw-image-actions' },
          h('p', { role: 'status' }, label),
          ['unsupported', 'error', 'missing'].includes(phase) && typeof detail === 'string' && detail
            ? h('p', null, detail.slice(0, 500)) : null,
          ['missing', 'error'].includes(phase) && h('button', { type: 'button', disabled: !!pending,
            onClick: () => change({ action: 'installComfy' }) }, t(phase === 'error' ? 'imageRetry' : 'imageInstall')),
          phase === 'installing' && h('button', { type: 'button', disabled: !!pending,
            onClick: () => change({ action: 'cancelComfy' }) }, t('imageCancel')),
        );
      }

      return h('section', { className: 'cw-image-settings', 'aria-labelledby': 'cw-image-heading' },
        h(CompatibilityPanel, { t }),
        h('h2', { id: 'cw-image-heading' }, t('imageSettings')),
        h('p', null, t('imageSettingsIntro')),
        loading ? h('p', { role: 'status' }, t('imageSettingsLoad'))
          : !state?.supported && !error ? h('p', null, t('imageSettingsUnavailable')) : null,
        error && h('p', { className: 'cw-image-error', role: 'alert' }, t(state?.supported ? 'imageSettingsError' : 'imageSettingsReadError')),
        state?.supported && IMAGE_ROWS.map(([provider, title, description]) => {
          const row = state.providers[provider];
          const detailsId = `cw-image-${provider}-details`;
          return h('div', { key: provider, className: 'cw-image-row' },
            h('div', { id: detailsId }, h('strong', null, title), h('p', null, t(description)),
              provider === 'comfy' && h('p', null, t('imageComfyRequirements'))),
            h('button', { type: 'button', className: 'cw-image-switch', role: 'switch',
              'aria-label': title, 'aria-describedby': detailsId, 'aria-checked': row.enabled,
              disabled: !!pending, onClick: () => {
                if (row.enabled) setKeys((old) => ({ ...old, [provider]: '' }));
                void change({ action: 'toggle', provider, enabled: !row.enabled });
              },
            }),
            row.enabled && (provider === 'comfy' ? comfyControls(row.setup)
              : Object.hasOwn(row, 'configured') ? keyControls(provider, title, row) : null),
          );
        }),
      );
    }

    function commandQuery(text) {
      if (typeof text !== 'string' || !text.startsWith('/')) return null;
      if (/\s/u.test(text)) return null;
      return text.slice(1);
    }

    function filterCommandRows(rows, query) {
      if (!Array.isArray(rows)) return [];
      const needle = String(query || '').trim().toLowerCase();
      return rows.filter((row) => {
        if (!row || typeof row.name !== 'string' || row.name.trim() === '') return false;
        if (!needle) return true;
        const fields = [row.name, row.label, row.description];
        return fields.some((field) => typeof field === 'string' && field.toLowerCase().includes(needle));
      });
    }

    function commandRowsFromDescriptors(descriptors) {
      if (!Array.isArray(descriptors)) return [];
      return descriptors.flatMap((descriptor) => {
        if (!descriptor || typeof descriptor.name !== 'string' || descriptor.name.trim() === '') return [];
        return [{
          name: descriptor.name,
          label: descriptor.name,
          description: typeof descriptor.description === 'string' ? descriptor.description : '',
          hasInput: descriptor.input !== undefined,
          hint: typeof descriptor.input?.hint === 'string' ? descriptor.input.hint : '',
        }];
      });
    }

    function commandInsertion(row) {
      return `/${row.name}${row.hasInput ? ' ' : ''}`;
    }

    function formatBytes(value) {
      const bytes = Number(value);
      if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      const exponent = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
      const scaled = bytes / (1024 ** exponent);
      const text = exponent === 0 ? String(Math.round(scaled)) : scaled.toFixed(1);
      return `${text} ${units[exponent]}`;
    }

    function mentionQuery(text, caret) {
      const before = text.slice(0, caret);
      const match = /(?:^|\s)(@(?:"([^"\r\n]*)|([^\s@"]*)))$/u.exec(before);
      if (!match) return null;
      const quoted = match[2] !== undefined;
      const after = text.slice(caret).match(quoted ? /^[^"\r\n]*"?/u : /^[^\s@"]*/u);
      return { query: match[2] ?? match[3], quoted, start: before.length - match[1].length, end: caret + after[0].length };
    }

    function referenceRows(files, sessions, quoted) {
      const fileRows = files.flatMap(({ path, kind }) => {
        if (typeof path !== 'string' || !path || /[\u0000-\u001f\u007f-\u009f"]/u.test(path)) return [];
        const directory = kind === 'directory';
        const value = directory ? `${path}/` : path;
        const mention = quoted || /\s/u.test(value) ? `@"${value}"` : `@${value}`;
        return [{ key: `file:${path}`, label: value, icon: directory ? 'folder' : 'file', mention }];
      });
      const sessionRows = sessions.flatMap(({ sessionId, displayTitle, label, mention }) => (
        typeof mention === 'string' && mention.startsWith('@')
          ? [{ key: `session:${sessionId}`, label: displayTitle || label || mention, icon: 'chat', mention }]
          : []
      ));
      return [...fileRows, ...sessionRows];
    }

    function submitMode(session, preference, alternate = false) {
      if (!session?.running || (session.subagent && session.subagent.address?.mode !== 'continuable')) return 'queue';
      return (preference === 'steer') !== alternate ? 'steer' : 'queue';
    }

    const subscribeComposerSettings = (listener) => runtime.composerSettings?.subscribe(listener) ?? (() => {});
    const readBusyEnter = () => runtime.composerSettings?.getSnapshot().value?.busyEnter ?? 'queue';

    function isDangerousPermission(value) {
      return value === 'full-access' || value === 'danger-full-access' || value === 'auto';
    }

    function summarizeToolCall(data) {
      const root = data?.root || data;
      if (!root || typeof root !== 'object') return null;
      const callId = root.callId || root.call?.id || '';
      const name = root.name || root.call?.name || 'tool';
      const status = root.kind === 'tool-result'
        ? (root.isError ? 'error' : 'done')
        : (root.phase === 'preparing' ? 'preparing' : 'running');
      let detail = '';
      const argsRaw = root.argsRaw ?? root.call?.argsRaw;
      if (typeof argsRaw === 'string') {
        try {
          const parsed = JSON.parse(argsRaw);
          if (parsed && typeof parsed === 'object') {
            for (const key of ['description', 'command', 'path', 'file_path', 'query', 'pattern']) {
              if (typeof parsed[key] === 'string' && parsed[key].trim()) {
                detail = parsed[key].trim();
                break;
              }
            }
          }
        } catch {
          detail = '';
        }
      }
      const subCalls = Array.isArray(root.subCalls) ? root.subCalls.length : 0;
      return { callId: String(callId), name, status, detail, subCalls };
    }

    function changedToolPaths(tool, args) {
      if (tool.name === 'apply_patch') {
        const paths = [];
        for (const part of tool.content ?? []) {
          if (part.type !== 'text' || typeof part.text !== 'string' ||
            !part.text.startsWith('Success. Updated the following files:\n')) continue;
          for (const match of part.text.matchAll(/^[AMD] (.+)$/gmu)) paths.push(match[1]);
        }
        return paths.length ? paths : (tool.meta?.diffs ?? []).map(({ path }) => path);
      }
      const editorWrite = tool.name === 'str_replace_editor' &&
        ['create', 'insert', 'str_replace', 'undo_edit'].includes(args('command'));
      if (tool.name === 'write' || tool.name === 'edit' || editorWrite) {
        return [tool.meta?.path ?? args('file_path') ?? args('path')];
      }
      return [];
    }

    function summarizeWorkGroup(tools, t) {
      const seen = new Set();
      const reads = new Set();
      const changes = new Set();
      let commands = 0;
      let failures = 0;
      const pathKey = (path) => path.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '');

      function visit(tool) {
        if (!tool || seen.has(tool.callId)) return;
        seen.add(tool.callId);
        if (tool.kind === 'tool-result') {
          if (tool.isError) {
            failures += 1;
          } else {
            const args = (key) => tool.args?.value?.(key);
            const editorView = tool.name === 'str_replace_editor' && args('command') === 'view';
            if (tool.name === 'read' || tool.name === 'read_image' || editorView) {
              const path = tool.meta?.path ?? args('file_path') ?? args('path');
              if (typeof path === 'string' && path) reads.add(pathKey(path));
            }
            if (['bash', 'pwsh', 'exec_command'].includes(tool.name) ||
              (tool.name?.startsWith('terminal_') && (args('command') || args('cmd')))) commands += 1;
            for (const path of changedToolPaths(tool, args)) {
              if (typeof path === 'string' && path) changes.add(pathKey(path));
            }
          }
        }
        for (const child of tool.subCalls ?? []) visit(child);
      }

      for (const tool of tools) visit(tool);
      const parts = [];
      if (reads.size) parts.push(t(reads.size === 1 ? 'workReadOne' : 'workReadMany').replace('{count}', reads.size));
      if (commands) parts.push(t(commands === 1 ? 'workCommandOne' : 'workCommandMany').replace('{count}', commands));
      if (changes.size) {
        const files = [...changes];
        const names = files.map((path) => path.split('/').pop());
        const labels = names.map((name, index) => names.indexOf(name) === names.lastIndexOf(name) ? name : files[index]);
        parts.push(t('workChanged').replace('{files}', () => labels.join(', ')));
      }
      if (parts.length && failures) parts.push(t('workFailed').replace('{count}', failures));
      return parts.join(' · ');
    }

    function bindWorkSummaries(root, conversation, locale) {
      const chat = conversation.target('chat');
      const attribute = 'data-cw-work-summary';
      const summaries = new WeakMap();
      let decorated = new Set();
      let frame = null;
      let languageVersion = 0;
      function clear(button) {
        if (button.title === button.getAttribute(attribute)) button.removeAttribute('title');
        button.removeAttribute(attribute);
      }
      function decorate(button, summary, current) {
        if (!summary) return;
        if (button.getAttribute(attribute) !== summary) {
          button.setAttribute(attribute, summary);
          button.title = summary;
        }
        current.add(button);
      }
      function update() {
        frame = null;
        const nodes = chat.getSnapshot()?.nodes;
        const groups = conversation.snapshot.getSnapshot().views.grouped('chat');
        const current = new Set();
        const turnGroups = new Map();
        if (nodes && groups) {
          for (const group of root.querySelectorAll('[data-chat-group-key][data-step-process]:not([data-group-expanded-mode])')) {
            const data = groups.groupSource(group.dataset.chatGroupKey).getSnapshot();
            if (!data?.data.closed) continue;
            const button = group.querySelector(':scope > :first-child > button[data-process-activity]');
            if (!button) continue;
            const tools = data.members.map(({ key }) => nodes.get(key))
              .filter((node) => node?.kind === 'tool-call').map((node) => node.data.root);
            let cached = summaries.get(data.members);
            if (cached?.languageVersion !== languageVersion || cached.tools.length !== tools.length ||
              tools.some((tool, index) => tool !== cached.tools[index])) {
              cached = { tools, languageVersion, summary: summarizeWorkGroup(tools, (key) => translate({}, key)) };
              summaries.set(data.members, cached);
            }
            decorate(button, cached.summary, current);
            if (tools.length) {
              const turn = group.dataset.chatTurn;
              const groupsInTurn = turnGroups.get(turn) ?? [];
              groupsInTurn.push(cached);
              turnGroups.set(turn, groupsInTurn);
            }
          }
          for (const button of root.querySelectorAll('button[data-turn-process][aria-expanded="false"]')) {
            const groupsInTurn = turnGroups.get(button.dataset.turnProcess);
            if (!groupsInTurn) continue;
            const summary = groupsInTurn.length === 1 ? groupsInTurn[0].summary
              : summarizeWorkGroup(groupsInTurn.flatMap(({ tools }) => tools), (key) => translate({}, key));
            decorate(button, summary, current);
          }
        }
        for (const button of decorated) if (!current.has(button)) clear(button);
        decorated = current;
      }
      function schedule() {
        if (frame === null) frame = requestAnimationFrame(update);
      }
      const unsubscribeChat = conversation.snapshot.subscribe(schedule);
      const unsubscribeLocale = locale.subscribe(() => {
        languageVersion += 1;
        schedule();
      });
      const observer = new MutationObserver(schedule);
      observer.observe(root, {
        childList: true, subtree: true, attributes: true,
        attributeFilter: ['data-group-expanded-mode', 'aria-expanded'],
      });
      schedule();
      return () => {
        if (frame !== null) cancelAnimationFrame(frame);
        unsubscribeChat();
        unsubscribeLocale();
        observer.disconnect();
        for (const button of decorated) clear(button);
      };
    }

    function formatTokenCount(value) {
      const count = Number(value);
      if (!Number.isFinite(count)) return '0';
      if (count < 1000) return String(Math.round(count));
      const scaled = (amount) => (amount >= 100 ? Math.round(amount) : Math.round(amount * 10) / 10);
      if (count < 1_000_000) return `${scaled(count / 1000)}K`;
      return `${scaled(count / 1_000_000)}M`;
    }

    function contextPercent(pressure) {
      const used = pressure?.projectedTokens ?? pressure?.pressureTokens;
      const capacity = pressure?.contextWindow;
      if (!Number.isFinite(used) || !Number.isFinite(capacity) || capacity <= 0) return null;
      return Math.round((used / capacity) * 100);
    }

    function contextMeter(pressure) {
      const percent = contextPercent(pressure);
      if (percent === null) return null;
      const used = pressure.projectedTokens ?? pressure.pressureTokens;
      const limit = pressure.contextWindow;
      return {
        used, limit, percent, fill: Math.max(0, Math.min(100, 100 * used / limit)),
        approximate: Number.isFinite(pressure.projectedTokens),
      };
    }

    function contextComposition(breakdown, meter) {
      const categories = [
        ['messages', 'contextMessages', breakdown?.messageTokens],
        ['tools', 'contextTools', breakdown?.toolsTokens],
        ['system', 'contextSystemPrompt', breakdown?.systemTokens],
      ].filter(([, , tokens]) => Number.isFinite(tokens) && tokens > 0);
      const total = categories.reduce((sum, [, , tokens]) => sum + tokens, 0);
      return {
        categories,
        segments: meter && total ? categories.map(([id, , tokens]) => ({
          id, width: meter.fill * tokens / total,
        })) : null,
      };
    }

    async function executeHostCommand(commands, sessionId, line) {
      const result = await commands.execute(sessionId, line, []);
      if (!result?.ok) {
        return {
          ok: false,
          error: result?.error ? `${result.error.code}: ${result.error.message}` : 'command.execute failed',
        };
      }
      if (result.value === undefined) return { ok: false, error: 'unmatched' };
      if (result.value.result?.kind === 'error') {
        return { ok: false, error: result.value.result.text || 'command failed' };
      }
      return { ok: true };
    }

    function Icon({ name }) {
      const common = {
        className: 'cw-icon', viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round',
        strokeLinejoin: 'round', 'aria-hidden': true,
      };
      if (name === 'plus') return h('svg', common,
        h('path', { d: 'M12 5v14M5 12h14' }));
      if (name === 'search') return h('svg', common,
        h('circle', { cx: 10.8, cy: 10.8, r: 6.3 }), h('path', { d: 'm16 16 4 4' }));
      if (name === 'chat') return h('svg', common,
        h('path', { d: 'M5 5.5h14v10H9l-4 3v-13Z' }));
      if (name === 'stop') return h('svg', common,
        h('rect', { x: 7, y: 7, width: 10, height: 10, rx: 1.5, fill: 'currentColor', stroke: 'none' }));
      if (name === 'expand') return h('svg', common,
        h('path', { d: 'M8 5h11v14H8M4 12h10m-4-4 4 4-4 4' }));
      if (name === 'attach') return h('svg', common,
        h('path', { d: 'M9 12.5 15.5 6a3.2 3.2 0 0 1 4.5 4.5l-8 8a5 5 0 0 1-7-7l8-8' }),
        h('path', { d: 'M7.5 15.5 15 8' }));
      if (name === 'close') return h('svg', common,
        h('path', { d: 'm6 6 12 12M18 6 6 18' }));
      if (name === 'up') return h('svg', common,
        h('path', { d: 'M12 19V5m-6 6 6-6 6 6' }));
      if (name === 'chevron') return h('svg', common,
        h('path', { d: 'm7 10 5 5 5-5' }));
      if (name === 'back') return h('svg', common, h('path', { d: 'm15 4-8 8 8 8' }));
      if (name === 'forward') return h('svg', common, h('path', { d: 'm9 4 8 8-8 8' }));
      if (name === 'panel') return h('svg', common,
        h('rect', { x: 4, y: 5, width: 16, height: 14, rx: 2 }),
        h('path', { d: 'M14 5v14' }));
      if (name === 'info') return h('svg', common,
        h('circle', { cx: 12, cy: 12, r: 8 }),
        h('path', { d: 'M12 11v5M12 8h.01' }));
      if (name === 'context') return h('svg', common,
        h('path', { d: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01' }));
      if (name === 'model') return h('svg', common,
        h('rect', { x: 5, y: 5, width: 14, height: 14, rx: 2 }),
        h('path', { d: 'M9 9h6v6H9zM9 2.5V5m6-2.5V5M9 19v2.5m6-2.5v2.5M2.5 9H5m-2.5 6H5m14-6h2.5M19 15h2.5' }));
      if (name === 'shield') return h('svg', common,
        h('path', { d: 'M12 4 5.5 6.5v5.2c0 4 2.7 6.8 6.5 8.3 3.8-1.5 6.5-4.3 6.5-8.3V6.5L12 4Z' }));
      if (name === 'panel') return h('svg', common,
        h('rect', { x: 3.5, y: 4.5, width: 17, height: 15, rx: 2 }),
        h('path', { d: 'M9 4.5v15' }));
      if (name === 'more') return h('svg', common,
        h('circle', { cx: 6, cy: 12, r: 1.2, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 12, cy: 12, r: 1.2, fill: 'currentColor', stroke: 'none' }),
        h('circle', { cx: 18, cy: 12, r: 1.2, fill: 'currentColor', stroke: 'none' }));
      if (name === 'pin') return h('svg', common,
        h('path', { d: 'm9 4 6 6M8 5l3-1 8 8-1 3-5-1-5 5-1-1 5-5-1-5-3-1Z' }));
      if (name === 'archive') return h('svg', common,
        h('rect', { x: 3.5, y: 5, width: 17, height: 4, rx: 1 }),
        h('path', { d: 'M5 9v10h14V9M10 13h4' }));
      if (name === 'fork') return h('svg', common,
        h('circle', { cx: 7, cy: 5, r: 2 }), h('circle', { cx: 7, cy: 19, r: 2 }),
        h('circle', { cx: 17, cy: 8, r: 2 }), h('path', { d: 'M7 7v10M7 15c5 0 10-2 10-5' }));
      if (name === 'edit') return h('svg', common,
        h('path', { d: 'M4 20h4L20 8l-4-4L4 16v4Z' }), h('path', { d: 'm14 6 4 4' }));
      if (name === 'clock') return h('svg', common,
        h('circle', { cx: 12, cy: 12, r: 8 }), h('path', { d: 'M12 7.5V12l3 2' }));
      if (name === 'folder') return h('svg', common,
        h('path', { d: 'M3.5 7.5h17v10.5h-17V7.5Z' }),
        h('path', { d: 'M3.5 7.5V6h6l2 2h9' }));
      if (name === 'gear') return h('svg', common,
        h('path', { d: 'm9.8 3.6-.6 2.1-1.4.8-2.1-.5-2.1 3.6 1.5 1.6v1.6l-1.5 1.6 2.1 3.6 2.1-.5 1.4.8.6 2.1h4.4l.6-2.1 1.4-.8 2.1.5 2.1-3.6-1.5-1.6v-1.6l1.5-1.6-2.1-3.6-2.1.5-1.4-.8-.6-2.1Z' }),
        h('circle', { cx: 12, cy: 12, r: 3.1 }));
      if (name === 'file') return h('svg', common,
        h('path', { d: 'M6 3.5h7l5 5v12H6v-17Z' }), h('path', { d: 'M13 3.5v5h5' }));
      if (name === 'image') return h('svg', common,
        h('rect', { x: 4, y: 4, width: 16, height: 16, rx: 2 }),
        h('circle', { cx: 9, cy: 9, r: 1.5 }),
        h('path', { d: 'm4 17 5-4 3 2 4-5 4 4' }));
      if (name === 'terminal') return h('svg', common,
        h('rect', { x: 3.5, y: 5, width: 17, height: 14, rx: 2 }),
        h('path', { d: 'm7 10 3 2.5L7 15M13 15h4' }));
      if (name === 'browser') return h('svg', common,
        h('circle', { cx: 12, cy: 12, r: 8 }), h('path', { d: 'M4 12h16M12 4c2.2 2.2 3.3 5 3.3 8S14.2 17.8 12 20c-2.2-2.2-3.3-5-3.3-8S9.8 6.2 12 4Z' }));
      if (name === 'slash') return h('svg', common,
        h('path', { d: 'M14 4 9 20' }));
      if (name === 'tool') return h('svg', common,
        h('path', { d: 'M14.5 6.5a3.5 3.5 0 0 0 4.4 4.4L10 19.8a2.1 2.1 0 0 1-3-3l8.9-8.9a3.5 3.5 0 0 0-1.4-1.4Z' }),
        h('path', { d: 'm6 6 2 2' }));
      return h('svg', common, h('path', { d: 'm5 12 14-7-4 14-3-6-7-1Z' }),
        h('path', { d: 'm12 13 7-8' }));
    }

    function createSessionHistory(workspace, sessions, workspaces, beforeOpen) {
      const visits = [];
      const listeners = new Set();
      let cursor = -1;
      let restoring = -1;
      let snapshot = { back: false, forward: false };

      function findVisit(step) {
        const { byId } = sessions.list.getSnapshot();
        const { archivedSessionIds } = workspaces.list.getSnapshot();
        const currentId = visits[cursor]?.sessionId;
        for (let index = cursor + step; index >= 0 && index < visits.length; index += step) {
          const entry = visits[index];
          if (!entry || entry.sessionId === currentId) continue;
          const parentId = entry.subagentAddress?.parentSessionId;
          if ((byId[entry.sessionId] || (parentId && byId[parentId])) &&
            !archivedSessionIds.includes(entry.sessionId) && !archivedSessionIds.includes(parentId)) return index;
        }
        return -1;
      }

      function refresh() {
        const back = findVisit(-1) !== -1;
        const forward = findVisit(1) !== -1;
        if (back === snapshot.back && forward === snapshot.forward) return;
        snapshot = { back, forward };
        for (const listener of listeners) listener();
      }

      function recordSelection() {
        const selection = workspace.selection.getSnapshot();
        if (restoring !== -1 && visits[restoring].sessionId === selection.sessionId) {
          cursor = restoring;
        } else if (selection.sessionId !== visits[cursor]?.sessionId) {
          // An ordinary visit after going back starts a new branch.
          visits.splice(cursor + 1);
          visits.push(selection.sessionId ? selection : null);
          if (visits.length > 60) visits.shift();
          cursor = visits.length - 1;
        }
        refresh();
      }

      const unsubscribers = [workspace.selection.subscribe(recordSelection),
        sessions.list.subscribe(refresh), workspaces.list.subscribe(refresh)];
      recordSelection();
      return {
        getSnapshot: () => snapshot,
        subscribe(listener) {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
        go(step) {
          const index = findVisit(step);
          if (index === -1) return;
          const entry = visits[index];
          restoring = index;
          try {
            beforeOpen();
            workspace.openSession(entry.subagentAddress ?? entry.sessionId);
            recordSelection();
          } catch (error) {
            reportDiagnostic(`could not open conversation history: ${errorMessage(error)}`);
          } finally {
            restoring = -1;
          }
        },
        dispose() {
          for (const unsubscribe of unsubscribers) unsubscribe();
          listeners.clear();
        },
      };
    }

    function SidebarHistoryButtons({ history }) {
      const { back, forward } = React.useSyncExternalStore(history.subscribe, history.getSnapshot);
      const button = (name, key, enabled, step) => {
        const label = translate({}, key);
        return h('button', {
          type: 'button', className: 'cw-icon-button', title: label, 'aria-label': label,
          disabled: !enabled, onClick: () => history.go(step),
        }, h(Icon, { name }));
      };
      return h('div', { className: 'cw-session-history', role: 'group', 'aria-label': translate({}, 'sessionHistory') },
        button('back', 'sessionBack', back, -1),
        button('forward', 'sessionForward', forward, 1));
    }

    function SidebarSettingsButton() {
      const buttonRef = React.useRef(null);
      const [historyHost, setHistoryHost] = React.useState(null);
      const name = useAccountName();
      const initial = name.normalize('NFC').match(/[\p{L}\p{N}]/u)?.[0];
      React.useLayoutEffect(() => {
        const sidebar = buttonRef.current?.closest('.kB3qhq_root');
        setHistoryHost(sidebar?.querySelector(':scope > .kB3qhq_topStrip, :scope > .kB3qhq_logoRow') ?? null);
      }, []);
      React.useLayoutEffect(() => {
        const footer = buttonRef.current?.closest('.kB3qhq_footArea');
        if (!footer || !initial) return;
        footer.style.setProperty('--cw-account-initial', JSON.stringify(initial));
        return () => footer.style.removeProperty('--cw-account-initial');
      }, [initial]);
      const label = translate({}, 'menuSettings');
      return h(React.Fragment, null, h('button', {
        ref: buttonRef, type: 'button', className: 'cw-icon-button cw-sidebar-settings',
        title: label, 'aria-label': label,
        onClick: () => runtime.shortcuts.registry.invoke('settings.open', { modal: null }),
      }, h(Icon, { name: 'gear' })),
      historyHost && runtime.sessionHistory
        ? ReactDOM.createPortal(h(SidebarHistoryButtons, { history: runtime.sessionHistory }), historyHost) : null);
    }

    const TOOL_LABEL_KEYS = {
      apply_patch: 'toolApplyPatch',
      edit: 'toolApplyPatch',
      write: 'toolWrite',
      bash: 'toolBash',
      read: 'toolRead',
      read_image: 'toolRead',
      grep: 'toolGrep',
      glob: 'toolGlob',
      web_search: 'toolWebSearch',
      web_fetch: 'toolWebFetch',
    };

    function toolDisplayName(name, t) {
      const key = TOOL_LABEL_KEYS[name];
      if (key) return t(key);
      return String(name || 'tool').replace(/[_-]+/gu, ' ').replace(/^\w/u, (letter) => letter.toUpperCase());
    }

    function ToolCallMessageBase(props) {
      const t = (key) => translate(props, key);
      const summary = summarizeToolCall(props.node?.data);
      if (!summary) return null;
      const canInspect = summary.callId && typeof props.inspectCall === 'function';
      const stateLabel = summary.status === 'error'
        ? t('toolFailed')
        : summary.status === 'done'
          ? t('toolDone')
          : summary.status === 'preparing'
            ? t('toolPreparing') : t('toolRunning');
      const content = [
        h('span', { className: 'cw-tool-leading', key: 'icon' }, h(Icon, { name: 'tool' })),
        h('span', { className: 'cw-tool-label', key: 'label' }, toolDisplayName(summary.name, t)),
        summary.detail ? h('span', { className: 'cw-tool-detail', key: 'detail' }, summary.detail) : null,
        summary.subCalls > 0 ? h('span', { className: 'cw-tool-count', key: 'count' }, `+${summary.subCalls}`) : null,
        summary.status !== 'done' ? h('span', {
          className: 'cw-tool-state', key: 'state', 'data-state': summary.status,
        }, stateLabel) : null,
        canInspect ? h('span', { className: 'cw-tool-chevron', key: 'chevron' }, h(Icon, { name: 'chevron' })) : null,
      ];
      const rowProps = {
        className: 'cw-tool-summary',
        title: canInspect ? t('toolDetails') : stateLabel,
        'aria-label': canInspect ? `${t('toolDetails')}: ${summary.name}` : summary.name,
      };
      return h('div', { className: 'cw-root cw-tool-row' },
        h('div', { className: 'cw-tool-row-inner' },
          canInspect
            ? h('button', {
                ...rowProps, type: 'button',
                onClick: () => props.inspectCall(summary.callId),
              }, content)
            : h('div', rowProps, content),
        ),
      );
    }

    function errorMessage(error) {
      if (!error) return '';
      return error.error?.message || error.message || String(error);
    }

    const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
    const MAX_IMAGES = 4;
    const MAX_FILES = 6;
    const MAX_FILE_BYTES = 20 * 1024 * 1024;

    function needsImageRecognition(result, images) {
      return images.length > 0 && !result?.ok
        && result?.error?.details?.reason === 'MODEL_DOES_NOT_SUPPORT_IMAGES';
    }

    async function requestImageDescription(images, question, signal, t) {
      const response = await fetch(new URL('api/workbench/describeImages', document.baseURI), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, images: images.map(({ mediaType, data }) => ({ mediaType, data })) }),
        signal,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.description) {
        throw new Error([t('imageRecognitionFailed'), result?.error].filter(Boolean).join(' '));
      }
      return result.description;
    }

    function readAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const marker = result.indexOf(',');
          if (marker < 0) {
            reject(new Error('read-failed'));
            return;
          }
          resolve(result.slice(marker + 1));
        };
        reader.onerror = () => reject(new Error('read-failed'));
        reader.readAsDataURL(file);
      });
    }
    const DRAFT_PREFIX = 'claude-workbench:draft:';

    function draftKey(sessionId) {
      return `${DRAFT_PREFIX}${String(sessionId)}`;
    }

    function readDraft(sessionId) {
      if (!sessionId) return '';
      try {
        return localStorage.getItem(draftKey(sessionId)) || '';
      } catch {
        return '';
      }
    }

    function writeDraft(sessionId, text) {
      if (!sessionId) return;
      try {
        if (text) localStorage.setItem(draftKey(sessionId), text);
        else localStorage.removeItem(draftKey(sessionId));
      } catch {
        // Draft persistence is best-effort when storage is unavailable.
      }
    }

    // Browser/profile-local storage; file bytes never leave the device until Send.
    function createAttachmentStorage(indexedDB = globalThis.indexedDB, timeoutMs = 10000) {
      let database;
      function open() {
        if (database) return database;
        const pending = new Promise((resolve, reject) => {
          if (!indexedDB) return reject(new Error('Storage unavailable'));
          let settled = false;
          const fail = (error) => {
            if (settled) return;
            settled = true; clearTimeout(timer); reject(error);
          };
          const timer = setTimeout(() => fail(new Error('Storage open timed out')), timeoutMs);
          let request;
          try { request = indexedDB.open('fps-attachment-drafts', 1); }
          catch (error) { fail(error); return; }
          request.onupgradeneeded = () => {
            if (settled) { request.transaction?.abort(); return; }
            request.result.createObjectStore('drafts', { keyPath: 'id' });
          };
          request.onerror = () => fail(request.error);
          request.onblocked = () => fail(new Error('Storage blocked'));
          request.onsuccess = () => {
            const db = request.result;
            if (settled) { db.close(); return; }
            settled = true; clearTimeout(timer);
            db.onversionchange = () => { db.close(); database = undefined; };
            resolve(db);
          };
        });
        database = pending;
        pending.catch(() => { if (database === pending) database = undefined; });
        return pending;
      }
      async function transaction(mode, action) {
        const db = await open();
        return new Promise((resolve, reject) => {
          const tx = db.transaction('drafts', mode);
          let value, settled = false;
          function finish(error) {
            if (settled) return;
            settled = true; clearTimeout(timer);
            if (error) reject(error); else resolve(value);
          }
          const timer = setTimeout(() => {
            // Abort before allowing a retry: an old write must never commit later.
            try { tx.abort(); } catch { /* Transaction already settled. */ }
            finish(new Error('Draft storage timed out'));
          }, timeoutMs);
          tx.oncomplete = () => finish();
          tx.onabort = tx.onerror = () => finish(tx.error || new Error('Draft transaction failed'));
          try {
            const request = action(tx.objectStore('drafts'));
            if (request) request.onsuccess = () => { value = request.result; };
          } catch (error) {
            try { tx.abort(); } catch { /* Transaction already settled. */ }
            finish(error);
          }
        });
      }
      const encode = (file) => ({ blob: file, name: file.name, type: file.type, lastModified: file.lastModified });
      const decode = (file) => {
        if (!(file?.blob instanceof Blob) || typeof file.name !== 'string') throw new Error('Invalid saved attachment');
        return new File([file.blob], file.name, { type: file.type || '', lastModified: file.lastModified });
      };
      return {
        async load() {
          const rows = await transaction('readonly', (store) => store.getAll());
          const valid = [];
          for (const row of rows) {
            if (Date.now() - row.updatedAt > 30 * 86400_000) {
              await transaction('readwrite', (store) => store.delete(row.id));
              continue;
            }
            valid.push({ id: row.id, images: row.images.map(decode), files: row.files.map(decode) });
          }
          return valid;
        },
        save(id, draft) {
          return transaction('readwrite', (store) => draft.images.length || draft.files.length
            ? store.put({ id, updatedAt: Date.now(), images: draft.images.map(encode), files: draft.files.map(encode) })
            : store.delete(id));
        },
        clear: () => transaction('readwrite', (store) => store.clear()),
      };
    }

    function createAttachmentDrafts(storage) {
      const drafts = new Map();
      const listeners = new Set();
      const empty = { images: [], files: [], submission: null };
      const read = (id) => drafts.get(id) ?? empty;
      let status = storage ? 'loading' : 'memory';
      let chain = Promise.resolve();
      let revision = 0;
      let hydrationFailed = false;
      const dirty = new Map();
      const touched = new Set();
      const notify = () => { for (const listener of listeners) listener(); };
      async function hydrate() {
        if (!storage) return;
        return storage.load().then((rows) => {
        for (const row of rows) if (!touched.has(row.id)) drafts.set(row.id,
          { images: row.images, files: row.files, submission: null });
        hydrationFailed = false; status = dirty.size ? 'saving' : 'saved'; notify();
        }).catch(() => { hydrationFailed = true; status = 'error'; notify(); });
      }
      const ready = hydrate();
      chain = ready;
      function persist(id, draft) {
        if (!storage) return;
        const current = ++revision;
        dirty.set(id, { draft, revision: current });
        status = 'saving';
        chain = chain.then(() => storage.save(id, draft)).then(() => {
          if (dirty.get(id)?.revision === current) dirty.delete(id);
          status = dirty.size || hydrationFailed ? 'error' : 'saved'; notify();
        }, () => { status = 'error'; notify(); });
      }
      function write(id, draft, durable = true) {
        touched.add(id);
        if (draft.images.length || draft.files.length || draft.submission) drafts.set(id, draft);
        else drafts.delete(id);
        if (durable) persist(id, draft);
        notify();
      }
      return {
        read, ready, flush: () => chain,
        status: () => status,
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        replace(id, kind, change) {
          const draft = read(id);
          if (!id || draft.submission || !['images', 'files'].includes(kind)) return;
          write(id, { ...draft, [kind]: change(draft[kind]) });
        },
        begin(id) {
          const draft = read(id);
          if (!id || draft.submission || status === 'loading') return null;
          const submission = Symbol();
          write(id, { ...draft, submission }, false);
          return submission;
        },
        finish(id, submission, accepted = false) {
          const draft = read(id);
          if (draft.submission !== submission) return;
          write(id, accepted ? empty : { ...draft, submission: null }, accepted);
        },
        async retry() {
          await chain;
          if (hydrationFailed) await hydrate();
          for (const [id, { draft }] of [...dirty]) persist(id, draft);
          notify();
          await chain;
        },
      };
    }
    const attachmentDrafts = createAttachmentDrafts(
      typeof window !== 'undefined' && !window.__CLAUDE_WORKBENCH_TEST__ ? createAttachmentStorage() : undefined);

    function DraftImage({ file, fallback }) {
      const [previewUrl, setPreviewUrl] = React.useState('');
      React.useLayoutEffect(() => {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      }, [file]);
      return previewUrl ? h('img', { src: previewUrl, alt: file.name || fallback }) : null;
    }

    function voiceDraftInsertion(draft, span, transcript) {
      if (!span || span.sessionId !== draft.sessionId || span.draftRev !== draft.revision) return null;
      const { start, end } = span;
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end > draft.text.length) return null;
      return {
        text: draft.text.slice(0, start) + transcript + draft.text.slice(end),
        caret: start + transcript.length,
      };
    }

    function imageFromFile(file, t) {
      return new Promise((resolve, reject) => {
        if (!file || !String(file.type).startsWith('image/')) {
          reject(new Error(t('imageReadFailed')));
          return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          reject(new Error(t('imageTooLarge')));
          return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error(t('imageReadFailed')));
        reader.onload = () => {
          const dataUrl = typeof reader.result === 'string' ? reader.result : '';
          const comma = dataUrl.indexOf(',');
          if (comma < 0) {
            reject(new Error(t('imageReadFailed')));
            return;
          }
          resolve({
            name: file.name || t('image'),
            mediaType: file.type,
            previewUrl: dataUrl,
            data: dataUrl.slice(comma + 1),
          });
        };
        reader.readAsDataURL(file);
      });
    }

    function rootModelGroup(groups, current) {
      if (!Array.isArray(groups) || groups.length === 0) return null;
      const active = groups.find((group) => group.id === current?.provider);
      if (active) return active;
      return groups.find((group) => Array.isArray(group.models) && group.models.length > 0) || groups[0];
    }

    function modelEffortLabel(state, model, t) {
      const reasoning = model?.reasoning;
      const effortId = state?.current?.reasoningEffort ?? reasoning?.defaultEffort;
      if (effortId === undefined) return state?.retainedEffort || '';
      return reasoning?.efforts?.find((effort) => effort.id === effortId)?.name || effortId;
    }

    function ModelControl({ props, sessionId, t, openRequest }) {
      const service = runtime.modelDirectories || runtime.ctx?.get('modelDirectories');
      let directory;
      try {
        directory = service && sessionId ? service.directoryFor(sessionId) : undefined;
      } catch {
        directory = undefined;
      }
      const [state, setState] = React.useState(() => directory?.store.getSnapshot() || null);
      const [open, setOpen] = React.useState(false);
      const [view, setView] = React.useState('root');
      const [query, setQuery] = React.useState('');
      const [selecting, setSelecting] = React.useState(false);
      const [error, setError] = React.useState('');
      const [menuPos, setMenuPos] = React.useState(null);
      const rootRef = React.useRef(null);
      const triggerRef = React.useRef(null);
      const menuRef = React.useRef(null);

      React.useEffect(() => {
        if (openRequest && directory) setOpen(true);
      }, [openRequest, directory]);

      React.useEffect(() => {
        if (!directory) {
          setState(null);
          return undefined;
        }
        let active = true;
        const sync = () => {
          if (active) setState(directory.store.getSnapshot());
        };
        sync();
        const unsubscribe = directory.store.subscribe(sync);
        directory.load().catch((cause) => {
          if (active) setError(`${t('modelLoadFailed')} ${errorMessage(cause)}`);
        });
        return () => {
          active = false;
          unsubscribe?.();
        };
      }, [directory, sessionId]);

      React.useEffect(() => {
        if (!open) return undefined;
        const closeOutside = (event) => {
          if (rootRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
          setOpen(false);
        };
        document.addEventListener('mousedown', closeOutside);
        return () => document.removeEventListener('mousedown', closeOutside);
      }, [open]);

      React.useLayoutEffect(() => {
        if (!open) {
          setMenuPos(null);
          return undefined;
        }
        const place = () => {
          const rect = triggerRef.current?.getBoundingClientRect();
          const menu = menuRef.current;
          if (!rect || !menu) return;
          const width = Math.min(340, window.innerWidth - 32);
          const left = Math.max(16, Math.min(rect.right - width, window.innerWidth - width - 16));
          const availableHeight = Math.max(160, Math.min(380, rect.top - 24));
          const height = Math.min(menu.offsetHeight || availableHeight, availableHeight);
          const top = Math.max(16, rect.top - height - 8);
          setMenuPos({ left, width, top, maxHeight: availableHeight });
        };
        place();
        const observer = typeof ResizeObserver === 'function'
          ? new ResizeObserver(place) : null;
        if (observer && menuRef.current) observer.observe(menuRef.current);
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
          observer?.disconnect();
          window.removeEventListener('resize', place);
          window.removeEventListener('scroll', place, true);
        };
      }, [open]);

      React.useEffect(() => {
        setOpen(false);
        setView('root');
        setQuery('');
        setError('');
      }, [sessionId]);

      if (!directory) return null;
      const groups = Array.isArray(state?.groups) ? state.groups : [];
      const current = state?.current;
      const currentGroup = groups.find((group) => group.id === current?.provider);
      const currentModel = currentGroup?.models.find((model) => model.id === current?.model);
      const currentName = currentModel?.name || (current ? current.model : t('selectModel'));
      const effort = modelEffortLabel(state, currentModel, t);
      const currentEffortId = current?.reasoningEffort ?? currentModel?.reasoning?.defaultEffort;
      const effortChoices = currentModel?.reasoning
        ? [
            ...(currentModel.reasoning.defaultEffort === undefined
              ? [{ key: 'default', id: undefined, label: t('effortDefault') }]
              : []),
            ...(currentModel.reasoning.efforts || []).map((level) => ({
              key: `effort:${level.id}`, id: level.id, label: level.name,
            })),
          ]
        : [];
      const totalModels = groups.reduce((count, group) => count + group.models.length, 0);
      const rootGroup = rootModelGroup(groups, current);
      const allView = view === 'all';
      const showSearch = allView && totalModels > 4;
      const normalized = query.trim().toLowerCase();
      const filtered = groups.map((group) => ({
        ...group,
        models: group.models.filter((model) =>
          !normalized
          || model.name.toLowerCase().includes(normalized)
          || group.name.toLowerCase().includes(normalized)
          || group.id.toLowerCase().includes(normalized)),
      })).filter((group) => group.models.length > 0);
      const visibleGroups = allView
        ? filtered
        : (rootGroup ? [rootGroup] : []);
      const hasMoreGroups = groups.some((group) =>
        group.id !== rootGroup?.id && Array.isArray(group.models) && group.models.length > 0);

      async function choose(group, model) {
        setSelecting(true);
        setError('');
        try {
          const result = await directory.select({ provider: group.id, model: model.id });
          if (!result.ok) {
            throw new Error(`${result.error.code}: ${result.error.message}`);
          }
          setOpen(false);
          setQuery('');
        } catch (cause) {
          setError(`${t('modelSelectFailed')} ${errorMessage(cause)}`);
        } finally {
          setSelecting(false);
        }
      }

      async function chooseEffort(effortId) {
        if (!current) return;
        setSelecting(true);
        setError('');
        try {
          const result = await directory.select({
            provider: current.provider,
            model: current.model,
            ...effortId === undefined ? {} : { reasoningEffort: effortId },
          });
          if (!result.ok) {
            throw new Error(`${result.error.code}: ${result.error.message}`);
          }
          setOpen(false);
        } catch (cause) {
          setError(`${t('effortSelectFailed')} ${errorMessage(cause)}`);
        } finally {
          setSelecting(false);
        }
      }

      function onMenuKeyDown(event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
          return;
        }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const items = Array.from(menuRef.current?.querySelectorAll('[data-cw-menu-item]') || []);
        if (items.length === 0) return;
        event.preventDefault();
        const active = items.indexOf(document.activeElement);
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = active < 0
          ? (step > 0 ? 0 : items.length - 1)
          : (active + step + items.length) % items.length;
        items[next]?.focus();
      }

      return h('div', { className: 'cw-model-wrap', ref: rootRef },
        h('button', {
          ref: triggerRef,
          type: 'button', className: 'cw-model-button',
          title: currentName, 'aria-label': t('selectModel'),
          'aria-expanded': open, disabled: selecting || state?.status === 'selecting',
          onClick: () => {
            const next = !open;
            setOpen(next);
            if (next) setView('root');
            setQuery('');
            setError('');
            if (next) directory.load().catch((cause) => setError(`${t('modelLoadFailed')} ${errorMessage(cause)}`));
          },
        },
          h('span', { className: 'cw-model-button-label' }, currentName),
          effort ? h('span', { className: 'cw-model-effort' }, effort) : null,
          h(Icon, { name: 'chevron' })),
        open ? ReactDOM.createPortal(
          h('div', {
            ref: menuRef, className: 'cw-root cw-model-menu',
            style: menuPos || {
              visibility: 'hidden', left: 0, top: 0,
              width: Math.min(340, window.innerWidth - 32),
            },
            role: 'dialog', 'aria-label': t('selectModel'),
            onKeyDown: onMenuKeyDown,
          },
          allView ? h('button', {
            type: 'button', className: 'cw-model-back', 'data-cw-menu-item': '',
            onClick: () => { setView('root'); setQuery(''); },
          }, `‹ ${t('modelBack')}`) : null,
          showSearch ? h('input', {
            className: 'cw-model-search', value: query, autoFocus: true,
            placeholder: t('modelSearch'), 'aria-label': t('modelSearch'),
            onChange: (event) => setQuery(event.target.value),
          }) : null,
          state?.status === 'loading' ? h('div', { className: 'cw-model-empty' }, t('modelLoading')) : null,
          !state?.status || totalModels === 0
            ? h('div', { className: 'cw-model-empty' }, t('noModels')) : null,
          visibleGroups.map((group) => h('div', { key: group.id },
            h('div', { className: 'cw-model-group-label' }, group.name),
            group.models.map((model) => {
              const checked = current?.provider === group.id && current?.model === model.id;
              return h('button', {
                type: 'button', key: model.id, className: 'cw-model-option',
                role: 'menuitemradio', 'aria-checked': checked,
                'data-cw-menu-item': '',
                autoFocus: !showSearch && checked,
                disabled: selecting || state?.status === 'selecting',
                onClick: () => void choose(group, model),
              },
                h('span', { className: 'cw-model-option-label' }, model.name),
                checked ? h('span', { className: 'cw-model-option-check' }, '✓') : null);
            }),
          )),
          !allView && effortChoices.length > 0 ? h('div', { className: 'cw-model-efforts' },
            h('div', { className: 'cw-model-group-label' }, t('effortLabel')),
            h('div', { className: 'cw-effort-options' },
              effortChoices.map((level) => h('button', {
                type: 'button', key: level.key, className: 'cw-effort-option',
                role: 'menuitemradio', 'aria-checked': currentEffortId === level.id,
                'data-cw-menu-item': '',
                disabled: selecting || state?.status === 'selecting',
                onClick: () => void chooseEffort(level.id),
              }, level.label)),
            ),
          ) : null,
          !allView && hasMoreGroups ? h('button', {
            type: 'button', className: 'cw-model-option cw-model-more',
            'data-cw-menu-item': '',
            onClick: () => { setView('all'); setQuery(''); },
          },
            h('span', { className: 'cw-model-option-label' }, t('modelMore')),
            h(Icon, { name: 'chevron' })) : null,
          error ? h('div', { className: 'cw-model-error' }, error) : null,
          ),
          document.body,
        ) : null,
      );
    }

    function useContextModel(sessionId) {
      const service = runtime.modelDirectories || runtime.ctx?.get('modelDirectories');
      let directory;
      try {
        directory = service && sessionId ? service.directoryFor(sessionId) : undefined;
      } catch {
        directory = undefined;
      }
      const [state, setState] = React.useState(() => directory?.store.getSnapshot() || null);
      React.useEffect(() => {
        if (!directory) {
          setState(null);
          return undefined;
        }
        let active = true;
        const sync = () => {
          if (active) setState(directory.store.getSnapshot());
        };
        sync();
        const unsubscribe = directory.store.subscribe(sync);
        directory.load().catch(() => {});
        return () => {
          active = false;
          unsubscribe?.();
        };
      }, [directory, sessionId]);
      const groups = Array.isArray(state?.groups) ? state.groups : [];
      const current = state?.current;
      const group = groups.find((item) => item.id === current?.provider);
      const model = group?.models.find((item) => item.id === current?.model);
      return {
        name: model?.name || (current ? current.model : ''),
        provider: group?.name || current?.provider || '',
        effort: modelEffortLabel(state, model, (key) => translate({}, key)),
      };
    }

    function useAnchoredPopup(open, width = 340, heightLimit = 380) {
      const triggerRef = React.useRef(null);
      const menuRef = React.useRef(null);
      const [position, setPosition] = React.useState(null);
      React.useLayoutEffect(() => {
        if (!open) {
          setPosition(null);
          return undefined;
        }
        const place = () => {
          const rect = triggerRef.current?.getBoundingClientRect();
          const menu = menuRef.current;
          if (!rect || !menu) return;
          const resolvedWidth = Math.min(width, window.innerWidth - 32);
          const left = Math.max(16, Math.min(rect.right - resolvedWidth, window.innerWidth - resolvedWidth - 16));
          const availableHeight = Math.max(160, Math.min(heightLimit, rect.top - 24));
          const height = Math.min(menu.offsetHeight || availableHeight, availableHeight);
          setPosition({
            left, width: resolvedWidth,
            top: Math.max(16, rect.top - height - 8),
            maxHeight: availableHeight,
          });
        };
        place();
        const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(place) : null;
        if (observer && menuRef.current) observer.observe(menuRef.current);
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
          observer?.disconnect();
          window.removeEventListener('resize', place);
          window.removeEventListener('scroll', place, true);
        };
      }, [open, width, heightLimit]);
      return { triggerRef, menuRef, position };
    }

    const PERMISSION_LABEL_KEYS = {
      'read-only': 'permissionReadOnly',
      'workspace-write': 'permissionWorkspaceWrite',
      'full-access': 'permissionFullAccess',
      'danger-full-access': 'permissionFullAccess',
      auto: 'permissionAuto',
      custom: 'permissionCustom',
    };

    function permissionLabel(option, t) {
      if (!option) return t('permissionCustom');
      const key = PERMISSION_LABEL_KEYS[option.value];
      return key ? t(key) : (option.name || option.value);
    }

    function PermissionControl({ props, sessionId, t }) {
      const projected = props.useProjection('permissions');
      const currentValue = projected?.currentValue;
      const [catalog, setCatalog] = React.useState(null);
      const [status, setStatus] = React.useState('loading');
      const [error, setError] = React.useState('');
      const [open, setOpen] = React.useState(false);
      const [confirming, setConfirming] = React.useState(null);
      const [busy, setBusy] = React.useState(false);
      const { triggerRef, menuRef, position } = useAnchoredPopup(open, 280);

      React.useEffect(() => {
        let active = true;
        const remote = runtime.permissionPresets;
        if (!remote?.catalog) {
          setStatus('error');
          setError(t('commandsUnavailable'));
          return undefined;
        }
        Promise.resolve(remote.catalog()).then((result) => {
          if (!active) return;
          if (!result?.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
          setCatalog(result.value);
          setStatus('ready');
        }).catch((cause) => {
          if (!active) return;
          setStatus('error');
          setError(`${t('permissionLoadFailed')} ${errorMessage(cause)}`);
        });
        return () => {
          active = false;
        };
      }, [sessionId]);

      React.useEffect(() => {
        if (!open) {
          setConfirming(null);
          return undefined;
        }
        const closeOutside = (event) => {
          if (triggerRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
          setOpen(false);
        };
        document.addEventListener('mousedown', closeOutside);
        return () => document.removeEventListener('mousedown', closeOutside);
      }, [open]);

      const options = Array.isArray(catalog?.options) ? catalog.options : [];
      const currentOption = options.find((option) => option.value === currentValue)
        || (currentValue ? { value: currentValue, name: currentValue } : null);
      const label = permissionLabel(currentOption, t);

      async function apply(option) {
        setBusy(true);
        setError('');
        try {
          const binding = runtime.sessions?.binding(sessionId);
          if (!binding) throw new Error(t('sessionNotReady'));
          const result = await binding.session.command(`/permission ${option.value}`);
          if (!result?.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
          if (!result.value?.matched) throw new Error(t('permissionSwitchFailed'));
          setOpen(false);
          setConfirming(null);
        } catch (cause) {
          setError(`${t('permissionSwitchFailed')} ${errorMessage(cause)}`);
        } finally {
          setBusy(false);
        }
      }

      function choose(option) {
        if (option.value === currentValue) {
          setOpen(false);
          return;
        }
        if (isDangerousPermission(option.value)) {
          setConfirming(option);
          return;
        }
        void apply(option);
      }

      if (!currentValue && status !== 'ready') return null;
      return h('div', { className: 'cw-model-wrap', ref: triggerRef },
        h('button', {
          type: 'button', className: 'cw-model-button cw-permission-button',
          title: `${t('permissionTitle')}: ${label}`, 'aria-label': t('permissionTitle'),
          'aria-expanded': open, disabled: busy || status !== 'ready',
          onClick: () => {
            setError('');
            setOpen((value) => !value);
          },
        },
          h(Icon, { name: 'shield' }),
          h('span', { className: 'cw-model-button-label' }, label),
          h(Icon, { name: 'chevron' })),
        open ? ReactDOM.createPortal(
          h('div', {
            ref: menuRef, className: 'cw-root cw-model-menu cw-permission-menu',
            style: position || { visibility: 'hidden', left: 0, top: 0, width: 280 },
            role: 'dialog', 'aria-label': t('permissionTitle'),
            onKeyDown: (event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
              }
            },
          },
            h('div', { className: 'cw-model-group-label' }, t('permissionTitle')),
            options.map((option) => h('button', {
              type: 'button', key: option.value, className: 'cw-model-option',
              role: 'menuitemradio', 'aria-checked': option.value === currentValue,
              disabled: busy,
              onClick: () => choose(option),
            },
              h('span', { className: 'cw-model-option-label' }, permissionLabel(option, t)),
              option.value === 'auto' ? h('span', { className: 'cw-permission-badge' }, 'EXP') : null,
              option.value === currentValue ? h('span', { className: 'cw-model-option-check' }, '✓') : null,
            )),
            confirming ? h('div', { className: 'cw-permission-confirm' },
              confirming.value === 'auto' ? t('permissionConfirmAuto') : t('permissionConfirmFull'),
              h('div', { className: 'cw-permission-confirm-actions' },
                h('button', { type: 'button', onClick: () => setConfirming(null) }, t('permissionCancel')),
                h('button', {
                  type: 'button', 'data-primary': 'true', disabled: busy,
                  onClick: () => void apply(confirming),
                }, t('permissionEnable')),
              ),
            ) : null,
            error ? h('div', { className: 'cw-model-error' }, error) : null,
          ),
          document.body,
        ) : null,
      );
    }

    function MetricTrack({ segments }) {
      return h('div', { className: 'cw-metric-track', 'aria-hidden': true },
        segments.map(({ id, width }) => h('span', {
          key: id, 'data-metric': id, style: { width: `${width}%` },
        })),
      );
    }

    function ContextMeter({ meter, segments, label, t }) {
      return h(React.Fragment, null,
        h('div', { className: 'cw-metric-head' },
          h('span', null, `${label || t('contextUsed')} ${meter.percent}%`),
          h('span', null, `${meter.approximate ? '~' : ''}${formatTokenCount(meter.used)} / ${formatTokenCount(meter.limit)}`),
        ),
        h(MetricTrack, { segments: segments || [{ id: 'messages', width: meter.fill }] }),
      );
    }

    function outputFileAddress(sessionId, cwd, path) {
      const absolute = path.replace(/\\/g, '/');
      const root = cwd.replace(/\\/g, '/').replace(/\/+$/, '');
      const relative = root && absolute.startsWith(`${root}/`) ? absolute.slice(root.length + 1) : absolute;
      const encodedPath = relative.split('/').map((part) => encodeURIComponent(part).replace(/%3A/gi, ':')).join('/');
      return `dsh-resource://file/session/${encodeURIComponent(sessionId)}/${encodedPath}`;
    }

    const OUTPUT_IMAGE_TYPES = {
      avif: 'image/avif', bmp: 'image/bmp', gif: 'image/gif', ico: 'image/x-icon',
      jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', webp: 'image/webp',
    };
    const MAX_THUMBNAIL_BYTES = 8 * 1024 * 1024;

    function OutputIcon({ sessionId, file, mediaType }) {
      const ref = React.useRef(null);
      const [src, setSrc] = React.useState('');
      React.useEffect(() => {
        if (!mediaType || !(file.bytes > 0 && file.bytes <= MAX_THUMBNAIL_BYTES)) return;
        const controller = new AbortController();
        let url;
        const observer = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          // The native full-file reader also caps the response if the file has grown since stat.
          void runtime.workspaceFiles.readBytes(sessionId, file.path, {}, controller.signal).then((result) => {
            if (!controller.signal.aborted && result.ok && result.value.data.length <= MAX_THUMBNAIL_BYTES) {
              url = URL.createObjectURL(new Blob([new Uint8Array(result.value.data)], { type: mediaType }));
              setSrc(url);
            }
          }).catch(() => {});
        }, { root: ref.current.closest('.cw-context'), rootMargin: '48px' });
        observer.observe(ref.current);
        return () => {
          observer.disconnect();
          controller.abort();
          if (url) URL.revokeObjectURL(url);
        };
      }, [sessionId, file.path, file.bytes, mediaType]);
      return h('span', { className: 'cw-output-icon', ref, 'aria-hidden': true },
        src ? h('img', { src, alt: '', onError: () => setSrc('') }) : h(Icon, { name: mediaType ? 'image' : 'file' }),
      );
    }

    function ContextOutputs({ sessionId, cwd, files, t }) {
      const [verified, setVerified] = React.useState(null);
      const [error, setError] = React.useState(false);
      React.useEffect(() => {
        if (!Array.isArray(files) || !runtime.workspaceFiles?.stat) return;
        const controller = new AbortController();
        const signal = controller.signal;
        async function verifyOutputs() {
          const available = [];
          const newest = files.slice().reverse();
          for (let offset = 0; offset < newest.length && !signal.aborted; offset += 8) {
            const batch = await Promise.allSettled(newest.slice(offset, offset + 8).map(async (path) => {
              const result = await runtime.workspaceFiles.stat(sessionId, path, signal);
              return result.ok ? { path, ...result.value } : null;
            }));
            for (const item of batch) if (item.status === 'fulfilled' && item.value) available.push(item.value);
            if (!signal.aborted && available.length) setVerified([...available]);
          }
          if (!signal.aborted) setVerified(available);
        }
        void verifyOutputs();
        return () => controller.abort();
      }, [sessionId, files]);
      if (!Array.isArray(files) || !runtime.workspaceFiles?.stat) return null;

      return h('section', { className: 'cw-context-section' },
        h('h2', { className: 'cw-context-heading' }, t('contextOutputs')),
        verified?.length ? h('ul', { className: 'cw-output-list' }, verified.map((file) => {
          const name = file.path.split(/[\\/]/u).pop();
          const extension = /\.([a-z0-9]{1,8})$/iu.exec(name)?.[1].toLowerCase();
          const mediaType = extension && Object.hasOwn(OUTPUT_IMAGE_TYPES, extension) ? OUTPUT_IMAGE_TYPES[extension] : '';
          return h('li', { key: file.path },
            h('button', {
              type: 'button', className: 'cw-output-row', title: file.path,
              onClick: () => {
                try {
                  runtime.sidebarRight.openResource(outputFileAddress(sessionId, cwd, file.path), { destination: 'sidebar' });
                  setError(false);
                } catch (failure) {
                  reportDiagnostic(`output preview failed: ${failure?.message || failure}`);
                  setError(true);
                }
              },
            },
            h(OutputIcon, { key: file.version, sessionId, file, mediaType }),
            h('span', { className: 'cw-output-name' }, name),
            extension ? h('span', { className: 'cw-output-type', 'aria-hidden': true }, extension.toUpperCase()) : null),
          );
        })) : h('div', { className: 'cw-context-subtle' },
          t(verified === null && files.length ? 'contextOutputsLoading' : 'contextOutputsEmpty')),
        error ? h('p', { className: 'cw-context-subtle', role: 'alert' }, t('contextOutputOpenFailed')) : null,
      );
    }

    const EMPTY_JOBS = { rows: {}, observed: {} };
    const noopSubscribe = () => () => {};
    const compatibilityListeners = new Set();
    let compatibilityRevision = 0;
    let runtimeFailure = false;
    function compatibilityChanged() {
      compatibilityRevision += 1;
      for (const listener of compatibilityListeners) listener();
    }
    function subscribeCompatibility(listener) {
      compatibilityListeners.add(listener);
      return () => compatibilityListeners.delete(listener);
    }
    const readCompatibilityRevision = () => compatibilityRevision;
    function compatibilityChecks(services, slots, storageStatus) {
      const method = (object, key) => typeof object?.[key] === 'function';
      return [
        ['compatComposer', ['register', 'inject', 'subscribe', 'entriesOfSlot'].every((key) => method(slots, key)) && !services.composerFallback],
        ['compatFiles', method(services.fileUploads, 'upload') && method(services.workspaceFiles, 'stat')],
        ['compatPreview', method(services.sidebarRight, 'openResource')],
        ['compatJobs', method(services.jobs?.state, 'subscribe') && method(services.jobs?.state, 'getSnapshot') && method(services.jobs, 'watchRows')],
        ['compatStorage', ['saved', 'saving'].includes(storageStatus)],
      ];
    }
    function CompatibilityPanel({ t }) {
      React.useSyncExternalStore(subscribeCompatibility, readCompatibilityRevision);
      const storageStatus = React.useSyncExternalStore(attachmentDrafts.subscribe, attachmentDrafts.status);
      const [copied, setCopied] = React.useState(false);
      const checks = compatibilityChecks(runtime, runtime.ctx?.slots, storageStatus);
      async function copy() {
        const report = { plugin: 'FPS', checks: Object.fromEntries(checks),
          runtimeErrorObserved: runtimeFailure, nativeComposerFallback: !!runtime.composerFallback };
        try { await navigator.clipboard.writeText(JSON.stringify(report, null, 2)); setCopied(true); }
        catch { setCopied(false); }
      }
      return h('details', { className: 'cw-compatibility' },
        h('summary', null, t('compatTitle')),
        h('p', { className: 'cw-context-subtle' }, t('compatIntro')),
        ...checks.map(([key, available]) => h('div', { key, className: 'cw-context-row' },
          h('span', null, t(key)), h('span', { 'data-ready': available }, t(available ? 'compatReady' : 'compatUnavailable')))),
        runtimeFailure ? h('p', { role: 'status' }, t('compatRuntimeFailure')) : null,
        h('button', { type: 'button', onClick: () => { setCopied(false); compatibilityChanged(); } }, t('compatRefresh')),
        h('button', { type: 'button', onClick: copy }, t(copied ? 'compatCopied' : 'compatCopy')),
      );
    }
    function orderJobs(rows) {
      const live = (job) => ['running', 'stopping'].includes(job.status);
      return (Array.isArray(rows) ? rows : []).filter((job) => job && typeof job.id === 'string')
        .slice().sort((a, b) => Number(live(b)) - Number(live(a)) ||
          (live(a) ? a.startedAt - b.startedAt : (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt)));
    }
    function jobElapsed(job, now) {
      const end = ['running', 'stopping'].includes(job.status) ? now : job.finishedAt;
      if (!Number.isFinite(end) || !Number.isFinite(job.startedAt)) return '—';
      const seconds = Math.max(0, Math.floor((end - job.startedAt) / 1000));
      return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    }
    function TaskPlan({ useProjection, t }) {
      const todos = useProjection('todos');
      if (!Array.isArray(todos) || !todos.length) return h('p', { className: 'cw-context-subtle' }, t('tasksNoPlan'));
      return h('ul', { className: 'cw-task-plan' }, todos.map((todo, index) => h('li', {
        key: todo.id ?? index, 'data-status': todo.status,
      }, h('span', { className: 'cw-task-dot', 'aria-label': t(`task_${todo.status}`) },
        todo.status === 'completed' ? '✓' : todo.status === 'in_progress' ? '·' : ''),
      h('span', null, todo.content))));
    }
    function LongTasks(props) {
      const t = (key) => translate(props, key);
      React.useSyncExternalStore(subscribeCompatibility, readCompatibilityRevision);
      const jobs = runtime.jobs;
      const subscribe = React.useCallback((listener) => jobs?.state?.subscribe?.(listener) ?? (() => {}), [jobs]);
      const snapshot = React.useCallback(() => jobs?.state?.getSnapshot?.() ?? EMPTY_JOBS, [jobs]);
      const state = React.useSyncExternalStore(subscribe, snapshot);
      const [watchFailed, setWatchFailed] = React.useState(false);
      React.useEffect(() => {
        setWatchFailed(false);
        if (!jobs?.watchRows || !props.sessionId) return;
        try { return jobs.watchRows(props.sessionId); }
        catch { setWatchFailed(true); }
      }, [jobs, props.sessionId]);
      const rows = orderJobs(state.rows?.[props.sessionId]);
      const live = rows.filter((job) => ['running', 'stopping'].includes(job.status));
      const settled = rows.filter((job) => !['running', 'stopping'].includes(job.status));
      const [now, setNow] = React.useState(Date.now);
      React.useEffect(() => {
        if (!live.length) return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
      }, [live.length]);
      function row(job) {
        const statusKey = `task_${job.status}`;
        return h('li', { key: job.id, className: 'cw-task-row', 'data-status': job.status },
          h('span', { className: 'cw-task-dot', 'aria-hidden': true }, job.status === 'completed' ? '✓' : ''),
          h('div', { className: 'cw-task-main' },
            h('span', { title: job.label }, job.label || job.kind),
            h('small', null, t(Object.hasOwn(en, statusKey) ? statusKey : 'task_unknown'), ' · ', jobElapsed(job, now)),
            job.progress || job.detail ? h('small', { title: job.progress || job.detail }, job.progress || job.detail) : null));
      }
      return h('section', { className: 'cw-context-section cw-long-tasks' },
        h('h2', { className: 'cw-context-heading' }, t('tasksTitle')),
        h('details', { className: 'cw-task-plan-details', open: undefined },
          h('summary', null, t('tasksPlan')),
          h(WorkbenchBoundary, null, h(TaskPlan, { useProjection: props.useProjection, t }))),
        h('h3', null, t('tasksBackground'), live.length ? ` · ${live.length}` : ''),
        !jobs || watchFailed ? h('p', { className: 'cw-context-subtle' }, t('tasksUnavailable'))
          : !rows.length ? h('p', { className: 'cw-context-subtle' }, t('tasksEmpty')) : null,
        live.length ? h('ul', { className: 'cw-task-list' }, live.map(row)) : null,
        settled.length ? h('details', { className: 'cw-task-settled' },
          h('summary', null, `${t('tasksSettled')} · ${settled.length}`),
          h('ul', { className: 'cw-task-list' }, settled.map(row))) : null,
        rows.length && props.renderSlot ? h('div', { className: 'cw-native-jobs' },
          h('small', null, t('tasksNative')),
          props.renderSlot('workbench.context.jobs', {})) : null,
      );
    }

    // Own only the mirror and its subscription; never dispose a native entry.
    function disposeSafely(dispose) {
      try { if (typeof dispose === 'function') dispose(); }
      catch (error) { reportDiagnostic(`integration cleanup failed: ${error?.message || error}`); }
    }
    function mirrorNativeEntry(slots, source, target, match, onError) {
      let active = true, current, dispose, unsubscribe;
      function sync() {
        if (!active) return;
        try {
          const entry = slots.entriesOfSlot(source).find(match);
          if (current === entry) return;
          disposeSafely(dispose); dispose = undefined; current = undefined;
          if (entry) {
            dispose = slots.register({ name: target, locale: entry.locale, inject: entry.inject }, entry.component);
            current = entry;
          }
        } catch (error) {
          // Native registry notifications must never receive our exception.
          disposeSafely(dispose); dispose = current = undefined;
          reportDiagnostic(`optional slot mirror unavailable: ${error?.message || error}`);
          onError?.();
        }
      }
      function cleanup() {
        if (!active) return;
        active = false;
        disposeSafely(unsubscribe); disposeSafely(dispose);
        unsubscribe = dispose = current = undefined;
      }
      try {
        unsubscribe = slots.subscribe(source, sync);
        sync();
      } catch (error) {
        cleanup();
        reportDiagnostic(`optional slot subscription unavailable: ${error?.message || error}`);
        onError?.();
      }
      return cleanup;
    }
    function bridgeNativeJobs(slots) {
      return mirrorNativeEntry(slots, 'conversation.session.header.actions', 'workbench.context.jobs',
        (entry) => entry.options?.id === 'job-list');
    }

    function ContextPanelBase(props) {
      const t = (key) => translate(props, key);
      const state = props.useSessions((value) => value) || {};
      const session = props.useSession((value) => value);
      const row = state.byId?.[props.sessionId] || {};
      const title = row.blank ? t('newChat') : (row.title || t('untitled'));
      const model = useContextModel(props.sessionId);
      const meter = contextMeter(props.useProjection('contextPressure'));
      const breakdown = props.useProjection('contextBreakdown');
      const stats = props.useProjection('sessionStats');
      const outputFiles = props.useProjection('workbenchOutputs');
      const pending = session?.pendingSubmissions?.length ?? 0;
      const status = session?.running ? t('contextRunning') : t('contextIdle');
      const { categories, segments } = contextComposition(breakdown, meter);
      const cwd = row.cwd || '';
      const workspace = cwd.split(/[\\/]/u).filter(Boolean).pop() || t('contextWorkspace');

      function rowView(label, value) {
        return h('div', { className: 'cw-context-row' },
          h('span', { className: 'cw-context-label' }, label),
          h('span', { className: 'cw-context-value', title: value }, value || '—'),
        );
      }

      function legendRow(id, label, tokens, estimated) {
        return h(React.Fragment, { key: id },
          h('dt', { 'data-metric': id }, h('span', null, label)),
          h('dd', null, `${estimated ? '~' : ''}${formatTokenCount(tokens)}`),
          h('dd', null, meter ? `${(100 * tokens / meter.limit).toFixed(1)}%` : '—'),
        );
      }

      return h('aside', { className: 'cw-root cw-context' },
        h('section', { className: 'cw-context-section' },
          h('h2', { className: 'cw-context-heading' }, t('contextEnvironment')),
          h('div', { className: 'cw-context-environment' }, h(Icon, { name: 'folder' }),
            h('div', { className: 'cw-context-environment-text' },
              h('span', null, workspace),
              cwd ? h('span', { className: 'cw-context-subtle', title: cwd }, cwd) : null,
            ),
          ),
          h('div', { className: 'cw-context-environment' }, h(Icon, { name: 'model' }),
            h('div', { className: 'cw-context-environment-text' },
              h('span', null, model.name || t('selectModel')),
              model.provider ? h('span', { className: 'cw-context-subtle' }, model.provider) : null,
              model.effort ? h('span', { className: 'cw-context-subtle' }, model.effort) : null,
            ),
          ),
        ),
        h('section', { className: 'cw-context-section' },
          h('h2', { className: 'cw-context-heading' }, t('contextTitle')),
          meter ? h(ContextMeter, { meter, segments, t }) : null,
          meter || categories.length ? h('dl', { className: 'cw-context-legend' },
            ...categories.map(([id, key, tokens]) => legendRow(id, t(key), tokens, true)),
            meter ? legendRow('free', t('contextFree'), Math.max(0, meter.limit - meter.used), meter.approximate) : null,
          ) : h('div', { className: 'cw-context-subtle' }, t('contextEmpty')),
          categories.length ? h('p', { className: 'cw-context-subtle cw-context-note' }, t('contextEstimate')) : null,
        ),
        h(WorkbenchBoundary, null, h(LongTasks, { ...props, key: props.sessionId })),
        h(ContextOutputs, { key: props.sessionId, sessionId: props.sessionId, cwd, files: outputFiles, t }),
        h('section', { className: 'cw-context-section' },
          h('details', { className: 'cw-context-details' },
            h('summary', null, h(Icon, { name: 'chevron' }), t('contextSession')),
            rowView(t('contextSession'), title),
            rowView(t('contextStatus'), status),
            rowView(t('contextQueued'), String(pending)),
            stats ? rowView(t('contextTurns'), String(stats.turns ?? 0)) : null,
            stats ? rowView(t('contextSteps'), String(stats.steps ?? 0)) : null,
            rowView(t('contextSessionId'), String(props.sessionId || '')),
          ),
        ),
      );
    }

    const USAGE_WINDOW_LABELS = {
      fiveHours: 'usageFiveHours', sevenDays: 'usageSevenDays',
      monthTotal: 'usageMonthTotal',
    };

    function formatMoney({ currency, amount }) {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
    }

    function ProviderUsageSection({ t }) {
      const [usage, setUsage] = React.useState(null);

      React.useEffect(() => {
        const controller = new AbortController();
        fetch(new URL('api/workbench/providerUsage', document.baseURI), {
          cache: 'no-store', signal: controller.signal,
        }).then((response) => {
          if (!response.ok) throw new Error('Provider usage request failed');
          return response.json();
        }).then((result) => {
          if (!controller.signal.aborted) setUsage(result);
        }).catch(() => {
          if (!controller.signal.aborted) setUsage({});
        });
        return () => controller.abort();
      }, []);

      if (!Array.isArray(usage) || usage.length === 0) return null;
      const locale = document.documentElement.lang || undefined;
      const resetFormat = new Intl.DateTimeFormat(locale, {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      const percentFormat = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 });
      const creditFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
      const compareNames = new Intl.Collator('en', { sensitivity: 'base' }).compare;
      const sortedUsage = [...usage].sort((first, second) => compareNames(first.name, second.name));
      const metric = (id, label, value) => h('div', {
        key: id, className: 'cw-metric-head cw-provider-balance',
      }, h('span', null, label), h('strong', null, value));
      const windowView = ({ id, ratio, resetAt, credits }) => h('div', { className: 'cw-provider-window', key: id },
        h('div', { className: 'cw-metric-head' },
          h('span', null, t(USAGE_WINDOW_LABELS[id])),
          h('span', null, `${resetAt > Date.now() ? `${resetFormat.format(resetAt)} ${t('usageReset')} · ` : ''}${t('contextUsed')} ${percentFormat.format(ratio)}`),
        ),
        h(MetricTrack, { segments: [{ id: ratio >= 0.95 ? 'quota-high' : 'messages', width: Math.min(100, 100 * ratio) }] }),
        credits ? h('p', { className: 'cw-context-subtle' }, t('usageCreditsRemaining').replace('{amount}',
          `${creditFormat.format(credits.remaining)} / ${creditFormat.format(credits.total)}`)) : null,
      );

      return h('div', { className: 'cw-provider-usage', 'aria-live': 'polite' }, sortedUsage.map((provider) => {
        const name = provider.id === 'dreamina' ? t('usageDreaminaName') : provider.name;
        const duplicate = usage.some((other) => other !== provider && other.name === provider.name);
        return h('section', { key: provider.id },
          h('h3', { className: 'cw-metric-head' },
            h('span', null, duplicate ? `${name} · ${provider.id}` : name),
            provider.plan ? h('strong', null, provider.plan) : null,
          ),
          provider.balances?.length
            ? metric('balance', t('usageBalance'), provider.balances.map(formatMoney).join(' · ')) : null,
          provider.balance ? metric('extra', t('usageExtraBalance'), formatMoney(provider.balance)) : null,
          provider.charges?.map((charge) => metric(charge.id,
            t(charge.id === 'spent' ? 'usageKeySpent' : 'usageKeyRemaining'), formatMoney(charge))),
          provider.organizationSpend?.length
            ? metric('organization-spend', t('usageOrganizationSpend'), provider.organizationSpend.map(formatMoney).join(' · ')) : null,
          Number.isFinite(provider.organizationTokens)
            ? metric('organization-tokens', t('usageOrganizationTokens'), formatTokenCount(provider.organizationTokens)) : null,
          provider.windows?.filter(({ id }) => Object.hasOwn(USAGE_WINDOW_LABELS, id)).map(windowView),
          Number.isFinite(provider.credits)
            ? metric('credits', t('usageDreaminaBalance'), creditFormat.format(provider.credits)) : null,
          provider.resetAt > Date.now() ? h('p', { className: 'cw-metric-head cw-context-subtle' },
            h('span', null, t('usageDreaminaReset')),
            h('time', { dateTime: new Date(provider.resetAt).toISOString() }, resetFormat.format(provider.resetAt)),
          ) : null,
        );
      }));
    }

    function UsageControl({ useProjection, t }) {
      const meter = contextMeter(useProjection('contextPressure'));
      const usage = useProjection('tokenUsage');
      const [open, setOpen] = React.useState(false);
      const { triggerRef, menuRef, position } = useAnchoredPopup(open, 340, 720);
      const ready = Boolean(position);
      const popupId = React.useId();
      const rows = [
        ['messages', 'usageInput', usage?.uncachedInputTokens],
        ['output', 'usageOutput', usage?.outputTokens],
        ['read', 'usageCacheRead', usage?.cacheReadTokens],
        ['write', 'usageCacheWrite', usage?.cacheWriteTokens],
      ].filter(([, , tokens]) => Number.isFinite(tokens));
      const total = rows.reduce((sum, [, , tokens]) => sum + tokens, 0);
      const level = meter?.fill >= 95 ? 'high' : meter?.fill >= 80 ? 'warn' : undefined;
      const label = meter ? `${t('usageTitle')} · ${t('contextUsed')} ${meter.percent}%` : t('usageTitle');

      React.useEffect(() => {
        if (!open) return undefined;
        const dismiss = (event) => {
          if (triggerRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
          setOpen(false);
        };
        const escape = (event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        };
        document.addEventListener('pointerdown', dismiss);
        document.addEventListener('keydown', escape);
        return () => {
          document.removeEventListener('pointerdown', dismiss);
          document.removeEventListener('keydown', escape);
        };
      }, [open, triggerRef, menuRef]);

      React.useEffect(() => {
        if (open && ready) menuRef.current?.focus({ preventScroll: true });
      }, [open, ready, menuRef]);

      return h(React.Fragment, null,
        h('button', {
          ref: triggerRef, className: 'cw-icon-button cw-usage-trigger', type: 'button',
          'data-level': level, title: label, 'aria-label': label, 'aria-expanded': open,
          'aria-haspopup': 'dialog', 'aria-controls': open ? popupId : undefined,
          onClick: () => setOpen((value) => !value),
        },
          h('svg', { className: 'cw-usage-ring', viewBox: '0 0 20 20', fill: 'none', 'aria-hidden': true },
            h('circle', { cx: 10, cy: 10, r: 7, stroke: 'var(--cw-metric-ring)', strokeWidth: 2 }),
            meter?.fill > 0 ? h('circle', {
              cx: 10, cy: 10, r: 7, stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round',
              pathLength: 100, strokeDasharray: `${meter.fill} 100`, transform: 'rotate(-90 10 10)',
            }) : null,
          ),
        ),
        open ? ReactDOM.createPortal(
          h('div', {
            id: popupId, ref: menuRef, className: 'cw-root cw-usage-popover',
            style: position || { visibility: 'hidden', width: 340 },
            tabIndex: -1, role: 'dialog', 'aria-label': t('usageTitle'),
          },
            h('div', { className: 'cw-usage-header' },
              h('h2', null, t('usageTitle')),
              runtime.sidebarRight ? h('button', {
                type: 'button', className: 'cw-usage-link', onClick: () => {
                  setOpen(false);
                  runtime.sidebarRight.openTab(CONTEXT_TAB);
                },
              }, `${t('usageDetails')} →`) : null,
            ),
            h(ProviderUsageSection, { t }),
            meter ? h(ContextMeter, { meter, t, label: t('contextUsage') }) : null,
            total > 0 ? h('section', { className: 'cw-usage-breakdown' },
              h('div', { className: 'cw-metric-head' },
                h('span', null, t('usageTotal')),
                h('span', null, formatTokenCount(total)),
              ),
              h(MetricTrack, { segments: rows.filter(([, , tokens]) => tokens > 0).map(([id, , tokens]) => ({
                id, width: 100 * tokens / total,
              })) }),
              h('dl', null, rows.map(([id, key, tokens]) => h('div', { key: id, className: 'cw-context-row' },
                h('dt', { className: 'cw-context-label', 'data-metric': id }, t(key)),
                h('dd', { className: 'cw-context-value' }, formatTokenCount(tokens)),
              ))),
            ) : h('p', { className: 'cw-context-subtle cw-context-note' }, t('usageEmpty')),
          ),
          document.body,
        ) : null,
      );
    }

    function BrandMark() {
      return h('svg', { viewBox: BRAND_VIEW_BOX, 'aria-hidden': 'true' },
        BRAND_RAYS.map((ray, index) => h('path', {
          key: ray.transform, ...ray, fill: index % 2 ? 'var(--cw-brand-ray-shade)' : 'var(--cw-brand-ray)',
        })),
      );
    }

    function useAccountName() {
      const [name, setName] = React.useState('');
      React.useEffect(() => {
        const slots = runtime.ctx?.slots;
        if (!slots) return;
        const launcherSlot = 'settings.launcher';
        let unsubscribeAccount;

        function connectAccount() {
          unsubscribeAccount?.();
          const launcher = slots.entriesOfSlot(launcherSlot).find((entry) => entry.locale === 'settings.account');
          const account = launcher?.inject?.()?.hooks?.account;
          const update = () => {
            const state = account?.getSnapshot();
            const profile = state?.details?.profile;
            const displayName = state?.view?.status === 'credential-stored' && profile?.status === 'ready'
              ? profile.value.name
              : undefined;
            setName(typeof displayName === 'string' ? displayName.trim() : '');
          };
          unsubscribeAccount = account?.subscribe(update);
          update();
        }

        const unsubscribeSlot = slots.subscribe(launcherSlot, connectAccount);
        connectAccount();
        return () => {
          unsubscribeSlot();
          unsubscribeAccount?.();
        };
      }, []);
      return name;
    }

    function greetingKey() {
      const hour = new Date().getHours();
      if (hour < 12) return 'greetingMorning';
      if (hour < 18) return 'greetingAfternoon';
      return 'greetingEvening';
    }

    function HeroGreetingBase() {
      const name = useAccountName();
      const [key, setKey] = React.useState(greetingKey);
      React.useEffect(() => {
        const timer = setInterval(() => setKey(greetingKey()), 60_000);
        return () => clearInterval(timer);
      }, []);
      const greeting = translate({}, key);
      const text = name
        ? translate({}, 'greetingWithName').replace('{greeting}', () => greeting).replace('{name}', () => name)
        : greeting;
      return h('span', { className: 'cw-hero-greeting', role: 'heading', 'aria-level': 1 },
        h(BrandMark), h('span', null, text),
      );
    }

    function ContextButton({ sessionId: id }) {
      const headerRef = React.useRef(null);
      const [activeKind, setActiveKind] = React.useState();
      const sidebar = runtime.sidebarRight;
      React.useEffect(() => {
        if (!id || !sidebar) return;
        const update = () => setActiveKind(sidebar.mounted.getSnapshot() === id && sidebar.isExpanded()
          ? sidebar.active()?.kind : undefined);
        // Membership changes have a service subscription. The tab strip reflects native focus and visibility.
        const observer = new MutationObserver((records) => {
          if (records.some(({ target }) => target.closest('[data-sidebar-right-session]'))) update();
        });
        observer.observe(document.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ['data-sidebar-right-open', 'data-dockkit-pane-active', 'data-dockkit-float-active', 'aria-selected'],
        });
        const unsubscribeMounted = sidebar.mounted.subscribe(update);
        const unsubscribeTabs = sidebar.openTabs.subscribe(update);
        update();
        return () => {
          observer.disconnect();
          unsubscribeMounted();
          unsubscribeTabs();
        };
      }, [id, sidebar]);

      React.useEffect(() => {
        const root = headerRef.current?.closest('.kiGsTW_root');
        const conversation = runtime.ctx.get('uiConversation');
        if (id && root && conversation && runtime.sessions.binding(id)) {
          return bindWorkSummaries(root, conversation.binding(id), runtime.ctx.locale);
        }
      }, [id]);

      React.useEffect(() => {
        if (!id || !sidebar || runtime.contextAutoOpened) return undefined;
        if (window.innerWidth < 980) return undefined;
        const timer = setTimeout(() => {
          if (sidebar.mounted.getSnapshot() !== id) return;
          runtime.contextAutoOpened = true;
          try {
            if (!sidebar.isExpanded() && sidebar.tabsIn(id).every((tab) => tab.kind === 'guide')) {
              sidebar.openTab(CONTEXT_TAB);
            }
          } catch (error) {
            console.error('[claude-workbench] could not open session details', error);
          }
        }, 260);
        return () => clearTimeout(timer);
      }, [id, sidebar]);

      const buttons = [
        { kind: CONTEXT_TAB, icon: 'context', label: translate({}, 'contextOpen') },
        { kind: 'terminal', icon: 'terminal', label: translate({}, 'headerTerminal') },
        { kind: 'browser', icon: 'browser', label: translate({}, 'headerBrowser') },
        { kind: 'files', icon: 'folder', label: translate({}, 'headerFiles') },
      ];
      return h('div', { ref: headerRef, className: 'cw-header-actions' }, buttons.map((item) =>
        h('button', {
          type: 'button', key: item.kind, className: 'cw-context-button',
          title: item.label, 'aria-label': item.label, 'aria-pressed': item.kind === activeKind,
          onClick: () => {
            if (!sidebar || sidebar.mounted.getSnapshot() !== id) return;
            try {
              if (sidebar.active()?.kind === item.kind) {
                sidebar.toggleExpanded();
                return;
              }
              const existing = sidebar.tabsIn(id).findLast((tab) => tab.kind === item.kind);
              if (existing) {
                sidebar.focus(existing.id);
                if (!sidebar.isExpanded()) sidebar.toggleExpanded();
              } else {
                sidebar.openTab(item.kind);
              }
            } catch (error) {
              console.error(`[claude-workbench] could not open ${item.kind}`, error);
            }
          },
        }, h(Icon, { name: item.icon }))));
    }

    function ComposerAddMenu({ disabled, onImages, onFiles, onCommands, onContext, onPlugins, t }) {
      const [open, setOpen] = React.useState(false);
      const { triggerRef, menuRef, position } = useAnchoredPopup(open, 220);

      React.useEffect(() => {
        if (!open) return undefined;
        const closeOutside = (event) => {
          if (triggerRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
          setOpen(false);
        };
        document.addEventListener('mousedown', closeOutside);
        return () => document.removeEventListener('mousedown', closeOutside);
      }, [open]);

      const items = [
        { key: 'image', icon: 'plus', label: t('addImage'), action: onImages },
        { key: 'files', icon: 'folder', label: t('addFiles'), action: onFiles },
        { key: 'commands', icon: 'slash', label: t('addCommands'), action: onCommands },
        { key: 'context', icon: 'info', label: t('addContext'), action: onContext },
        { key: 'plugins', icon: 'panel', label: t('addPlugins'), action: onPlugins },
      ];

      return h(React.Fragment, null,
        h('button', {
          ref: triggerRef, type: 'button',
          className: 'cw-icon-button cw-attach-button',
          title: t('addMenuTitle'), 'aria-label': t('addMenuTitle'),
          'aria-expanded': open, disabled,
          onClick: () => setOpen((value) => !value),
        }, h(Icon, { name: 'plus' })),
        open ? ReactDOM.createPortal(
          h('div', {
            ref: menuRef, className: 'cw-root cw-model-menu',
            style: position || { visibility: 'hidden', left: 0, top: 0, width: 220 },
            role: 'menu', 'aria-label': t('addMenuTitle'),
            onKeyDown: (event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
              }
            },
          },
            h('div', { className: 'cw-model-group-label' }, t('addMenuTitle')),
            items.map((item) => h('button', {
              type: 'button', key: item.key, className: 'cw-model-option',
              role: 'menuitem', 'data-cw-menu-item': '',
              onClick: () => {
                setOpen(false);
                item.action?.();
              },
            },
              h(Icon, { name: item.icon }),
              h('span', { className: 'cw-model-option-label' }, item.label),
            )),
          ),
          document.body,
        ) : null,
      );
    }

    function FolderControl({ cwd, disabled, t, onError }) {
      const [busy, setBusy] = React.useState(false);
      const label = String(cwd || '').split(/[\\/]/u).filter(Boolean).pop() || t('workspaceLabel');
      async function choose() {
        if (busy || disabled) return;
        setBusy(true);
        try {
          const path = await runtime.workspace?.pickDirectory?.();
          if (!path) return;
          const view = await runtime.workspaces?.create?.({ path });
          if (view?.workspaceId) await runtime.workspace?.openWorkspace?.(view.workspaceId);
        } catch (cause) {
          onError?.(`${t('workspaceOpenFailed')} ${errorMessage(cause)}`);
        } finally {
          setBusy(false);
        }
      }
      return h('button', {
        type: 'button', className: 'cw-model-button cw-permission-button cw-folder-button',
        title: cwd ? `${t('workspaceChange')}\n${cwd}` : t('workspaceChange'),
        'aria-label': t('workspaceChange'), disabled: busy || disabled,
        onClick: () => void choose(),
      },
        h(Icon, { name: 'folder' }),
        h('span', { className: 'cw-model-button-label' }, label),
      );
    }

    function ComposerBase(props) {
      const session = props.useSession((value) => value);
      const promptAllowed = props.useAccess('session/prompt') !== false;
      const cancelAllowed = props.useAccess('session/cancel') !== false;
      const sessionId = props.sessionId;
      const [text, setText] = React.useState(() => readDraft(sessionId));
      const readAttachments = React.useCallback(() => attachmentDrafts.read(sessionId), [sessionId]);
      const { images, files, submission: draftSubmission } =
        React.useSyncExternalStore(attachmentDrafts.subscribe, readAttachments);
      const draftStorageStatus = React.useSyncExternalStore(attachmentDrafts.subscribe, attachmentDrafts.status);
      const [commandSending, setSending] = React.useState(false);
      const sending = commandSending || Boolean(draftSubmission);
      const [recognizing, setRecognizing] = React.useState(false);
      const [error, setError] = React.useState('');
      const [commandRows, setCommandRows] = React.useState([]);
      const [commandStatus, setCommandStatus] = React.useState('idle');
      const [commandError, setCommandError] = React.useState('');
      const [commandActive, setCommandActive] = React.useState(0);
      const [commandDismissed, setCommandDismissed] = React.useState(null);
      const [commandLauncherOpen, setCommandLauncherOpen] = React.useState(false);
      const [modelOpenRequest, setModelOpenRequest] = React.useState(0);
      const [caret, setCaret] = React.useState(0);
      const [mentionRows, setMentionRows] = React.useState([]);
      const [mentionStatus, setMentionStatus] = React.useState('idle');
      const [mentionActive, setMentionActive] = React.useState(0);
      const [mentionDismissed, setMentionDismissed] = React.useState(null);
      const composerRef = React.useRef(null);
      const fileInputRef = React.useRef(null);
      const uploadInputRef = React.useRef(null);
      const textareaRef = React.useRef(null);
      const voiceDraft = React.useRef({ sessionId, text, revision: 0, locked: true });
      const commandFetchedFor = React.useRef(null);
      const visionRequest = React.useRef(null);
      const sessionRef = React.useRef(sessionId);
      sessionRef.current = sessionId;
      const preference = React.useSyncExternalStore(subscribeComposerSettings, readBusyEnter);
      React.useEffect(() => {
        sessionRef.current = sessionId;
        return () => {
          sessionRef.current = undefined;
          visionRequest.current?.abort();
        };
      }, [sessionId]);
      React.useEffect(() => {
        setText(readDraft(sessionId));
        setSending(false);
        setRecognizing(false);
        setError('');
        setCommandRows([]);
        setCommandStatus('idle');
        setCommandError('');
        setCommandActive(0);
        setCommandDismissed(null);
        setCommandLauncherOpen(false);
        setModelOpenRequest(0);
        setCaret(0);
        setMentionRows([]);
        setMentionStatus('idle');
        setMentionActive(0);
        setMentionDismissed(null);
        commandFetchedFor.current = null;
      }, [sessionId]);
      // Acceptance can arrive while this composer is being reopened in another slot instance.
      React.useEffect(() => {
        if (!draftSubmission) setText(readDraft(sessionId));
      }, [sessionId, draftSubmission]);

      React.useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea || globalThis.CSS?.supports('field-sizing', 'content')) return;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }, [text]);
      React.useEffect(() => {
        if (!commandLauncherOpen) return undefined;
        const dismiss = (event) => {
          if (!composerRef.current?.contains(event.target)) setCommandLauncherOpen(false);
        };
        document.addEventListener('mousedown', dismiss);
        return () => document.removeEventListener('mousedown', dismiss);
      }, [commandLauncherOpen]);
      const running = Boolean(session?.running);
      const unavailable = Boolean(props.disabled || props.blocked || !sessionId || !promptAllowed);
      const draftLoading = draftStorageStatus === 'loading';
      const voiceLocked = unavailable || sending;
      const previousVoiceDraft = voiceDraft.current;
      voiceDraft.current = {
        sessionId, text, locked: voiceLocked,
        revision: previousVoiceDraft.sessionId === sessionId && previousVoiceDraft.text === text
          ? previousVoiceDraft.revision : previousVoiceDraft.revision + 1,
      };
      const voiceInputActions = React.useMemo(() => ({
        captureInsertion() {
          const draft = voiceDraft.current;
          const editor = textareaRef.current;
          return {
            sessionId: draft.sessionId,
            draftRev: draft.revision,
            start: editor?.selectionStart ?? draft.text.length,
            end: editor?.selectionEnd ?? draft.text.length,
          };
        },
        insertText(transcript, span) {
          const draft = voiceDraft.current;
          const editor = textareaRef.current;
          if (!editor || draft.locked || editor.value !== draft.text) return false;
          const next = voiceDraftInsertion(draft, span, transcript);
          if (!next) return false;
          voiceDraft.current = { ...draft, text: next.text, revision: draft.revision + 1 };
          setText(next.text);
          writeDraft(draft.sessionId, next.text);
          setCommandLauncherOpen(false);
          setCommandDismissed(null);
          setMentionDismissed(null);
          setCaret(next.caret);
          requestAnimationFrame(() => {
            if (textareaRef.current !== editor || editor.value !== next.text || editor.disabled) return;
            editor.focus();
            editor.setSelectionRange(next.caret, next.caret);
          });
          return true;
        },
      }), []);
      const t = (key) => translate(props, key);
      const canSend = Boolean(!unavailable && !draftLoading && !sending && (text.trim() || images.length || files.length));
      const slashQuery = images.length === 0 ? commandQuery(text) : null;
      const commandMenuVisible = commandLauncherOpen || (slashQuery !== null && commandDismissed !== text);
      const commandChoices = commandLauncherOpen && text.trim() && slashQuery === null
        ? commandRows.filter((row) => !row.hasInput) : commandRows;
      const filteredCommands = filterCommandRows(commandChoices, commandLauncherOpen ? '' : (slashQuery ?? ''));
      const activeCommandIndex = filteredCommands.length === 0
        ? 0 : Math.min(commandActive, filteredCommands.length - 1);
      const activeCommand = filteredCommands[activeCommandIndex];

      const sessionsState = typeof props.useSessions === 'function'
        ? props.useSessions((value) => value) : null;
      const cwd = sessionsState?.byId?.[sessionId]?.cwd || session?.cwd || '';
      const mention = mentionQuery(text, caret);
      const mentionToken = mention && text.slice(mention.start, caret);
      const mentionMenuVisible = mention !== null
        && !commandMenuVisible && slashQuery === null
        && mentionDismissed !== mentionToken
        && !unavailable;
      const activeMentionIndex = Math.min(mentionActive, Math.max(0, mentionRows.length - 1));
      const activeMention = mentionRows[activeMentionIndex];
      const mentionSearch = mentionMenuVisible ? mention.query : null;
      const mentionQuoted = mention?.quoted === true;

      React.useEffect(() => {
        if (mentionSearch === null || !sessionId) return undefined;
        const controller = new AbortController();
        setMentionRows([]);
        setMentionActive(0);
        setMentionStatus('loading');
        const timer = setTimeout(async () => {
          const { signal } = controller;
          const results = await Promise.allSettled([
            Promise.resolve().then(() => runtime.fileReferences.list(sessionId, mentionSearch, signal)),
            mentionQuoted ? { ok: true, value: [] } : Promise.resolve().then(() =>
              runtime.sessionReferences.candidates(sessionId, mentionSearch, signal)),
          ]);
          if (signal.aborted) return;
          const catalogs = results.map((result) => result.status === 'fulfilled' && result.value?.ok
            ? result.value.value : undefined);
          setMentionRows(referenceRows(catalogs[0] || [], catalogs[1] || [], mentionQuoted));
          setMentionStatus(catalogs[0] || (!mentionQuoted && catalogs[1]) ? 'ready' : 'error');
        }, 100);
        return () => {
          clearTimeout(timer);
          controller.abort();
        };
      }, [mentionSearch, mentionQuoted, sessionId]);

      React.useEffect(() => {
        if (!commandMenuVisible || !sessionId || commandFetchedFor.current === sessionId) return undefined;
        setCommandStatus('loading');
        setCommandError('');
        setCommandRows([]);
        const commands = runtime.commandsRemote;
        if (typeof commands?.list !== 'function') {
          setCommandStatus('error');
          setCommandError(t('commandsUnavailable'));
          return undefined;
        }
        let active = true;
        Promise.resolve().then(() => commands.list(sessionId)).then((result) => {
          if (!active) return;
          if (!result?.ok) throw new Error(errorMessage(result));
          commandFetchedFor.current = sessionId;
          const rows = commandRowsFromDescriptors(result.value);
          if (runtime.modelDirectories && !rows.some((row) => row.name === 'model')) {
            rows.push({ name: 'model', label: 'model', description: t('selectModel') });
          }
          setCommandRows(rows);
          setCommandStatus('ready');
          setCommandActive(0);
        }).catch((cause) => {
          if (!active) return;
          setCommandStatus('error');
          setCommandError(`${t('commandLoadFailed')} ${errorMessage(cause)}`);
        });
        return () => {
          active = false;
        };
      }, [commandMenuVisible, sessionId]);

      function addImageFiles(fileList) {
        if (draftLoading) { setError(t('draft_loading')); return; }
        const available = Math.max(0, MAX_IMAGES - readAttachments().images.length);
        const incoming = Array.from(fileList || []).filter((file) => file?.type?.startsWith('image/')).slice(0, available);
        if (incoming.length === 0) return;
        if (incoming.some((file) => file.size > MAX_IMAGE_BYTES)) {
          setError(t('imageTooLarge'));
          return;
        }
        setError('');
        attachmentDrafts.replace(sessionId, 'images', (current) => [...current, ...incoming]);
      }

      function onPaste(event) {
        const items = Array.from(event.clipboardData?.items || []);
        const pasted = items.filter((item) => item.kind === 'file').map((item) => item.getAsFile()).filter(Boolean);
        if (pasted.length === 0) return;
        event.preventDefault();
        addImageFiles(pasted.filter((file) => file.type.startsWith('image/')));
        addDraftFiles(pasted.filter((file) => !file.type.startsWith('image/')));
      }

      function addDraftFiles(fileList) {
        if (draftLoading) { setError(t('draft_loading')); return; }
        const incoming = Array.from(fileList || []).filter(Boolean);
        if (incoming.length === 0) return;
        if (readAttachments().files.length + incoming.length > MAX_FILES) {
          setError(t('fileTooMany'));
          return;
        }
        if (incoming.some((file) => file.size > MAX_FILE_BYTES)) {
          setError(t('fileTooLarge'));
          return;
        }
        setError('');
        attachmentDrafts.replace(sessionId, 'files', (current) => [...current, ...incoming]);
      }

      async function stageDraftFiles(outgoing) {
        const staged = [];
        if (outgoing.length === 0) return staged;
        const uploads = runtime.fileUploads;
        if (!uploads?.upload) throw new Error(t('fileUploadFailed'));
        try {
          for (const file of outgoing) {
            const data = await readAsBase64(file);
            const result = await uploads.upload(sessionId, { data, name: file.name });
            if (!result?.ok) throw new Error(errorMessage(result));
            staged.push({
              receiptId: result.value.receiptId,
              name: result.value.file?.name || file.name,
              bytes: result.value.file?.bytes ?? file.size,
            });
          }
        } catch (cause) {
          throw new Error(`${t('fileUploadFailed')} ${errorMessage(cause)}`, { cause });
        }
        return staged;
      }

      async function runCommandLine(line, preserveDraft = false) {
        if (line === '/model' && runtime.modelDirectories) {
          setModelOpenRequest((current) => current + 1);
        } else {
          const commands = runtime.commandsRemote;
          if (typeof commands?.execute !== 'function') throw new Error(t('commandsUnavailable'));
          const outcome = await executeHostCommand(commands, sessionId, line);
          if (!outcome.ok) {
            throw new Error(outcome.error === 'unmatched' ? t('commandNotFound') : outcome.error);
          }
        }
        if (!preserveDraft) {
          if (readDraft(sessionId) === text) writeDraft(sessionId, '');
          if (sessionRef.current === sessionId && voiceDraft.current.text === text) setText('');
        }
      }

      async function chooseCommand(row) {
        if (!row) return;
        const preserveDraft = commandLauncherOpen && slashQuery === null;
        setCommandLauncherOpen(false);
        setCommandDismissed(text);
        if (row.hasInput) {
          const insertion = commandInsertion(row);
          setText(insertion);
          writeDraft(sessionId, insertion);
          setCommandDismissed(insertion);
          requestAnimationFrame(() => textareaRef.current?.focus());
          return;
        }
        setSending(true);
        setError('');
        try {
          await runCommandLine(`/${row.name}`, preserveDraft);
        } catch (cause) {
          setError(errorMessage(cause));
        } finally {
          if (sessionRef.current === sessionId) setSending(false);
        }
      }

      function chooseMention(entry) {
        if (!entry || !mention) return;
        const suffix = text.slice(mention.end);
        const spacing = /^\s/u.test(suffix) ? '' : ' ';
        const next = `${text.slice(0, mention.start)}${entry.mention}${spacing}${suffix}`;
        const nextCaret = mention.start + entry.mention.length + spacing.length;
        setText(next);
        writeDraft(sessionId, next);
        setMentionDismissed(null);
        setMentionActive(0);
        setCaret(nextCaret);
        requestAnimationFrame(() => {
          const node = textareaRef.current;
          if (!node) return;
          node.focus();
          node.setSelectionRange(nextCaret, nextCaret);
        });
      }

      async function submit(alternate = false) {
        const draft = text;
        const { images: draftImages, files: draftFiles } = readAttachments();
        if (!canSend) return;
        setError('');
        const commandLine = draftImages.length === 0 && draftFiles.length === 0
          && draft.trim().startsWith('/')
          ? draft.trim() : null;
        if (commandLine) {
          setSending(true);
          try {
            await runCommandLine(commandLine);
          } catch (cause) {
            setError(errorMessage(cause));
          } finally {
            if (sessionRef.current === sessionId) setSending(false);
          }
          return;
        }
        const draftToken = attachmentDrafts.begin(sessionId);
        if (!draftToken) return;
        let submission;
        let accepted = false;
        let reference;
        const mode = submitMode(session, preference, alternate);
        try {
          const binding = runtime.sessions?.binding(sessionId);
          if (!binding) throw new Error(t('sessionNotReady'));
          reference = runtime.sessions.retain(sessionId, { source: 'workbenchPrompt' });
          await reference.ready;
          const outgoingImages = await Promise.all(draftImages.map((file) => imageFromFile(file, t)));
          const outgoingFiles = await stageDraftFiles(draftFiles);
          const send = (message, attachedImages, attachedFiles, signal) => {
            const content = [
              ...(message.trim() ? [{ type: 'text', text: message }] : []),
              ...attachedImages.map(({ mediaType, data, name }) => ({ type: 'image', mediaType, data, name })),
              ...attachedFiles.map(({ receiptId }) => ({ type: 'file', receiptId })),
            ];
            submission = binding.session.beginSubmission({
              mode,
              text: message,
              attachments: [
                ...attachedImages.map(({ previewUrl, name }) => ({ type: 'image', value: { previewUrl, name } })),
                ...attachedFiles.map(({ name, bytes }) => ({ type: 'file', value: { name, bytes } })),
              ],
              onAccept: () => {
                accepted = true;
                if (readDraft(sessionId) === draft) writeDraft(sessionId, '');
                if (sessionRef.current === sessionId && voiceDraft.current.text === draft) setText('');
                attachmentDrafts.finish(sessionId, draftToken, true);
              },
            });
            return binding.session.prompt(content, mode, signal, submission.requestId);
          };

          let result = await send(draft, outgoingImages, outgoingFiles);
          if (needsImageRecognition(result, outgoingImages) && sessionRef.current === sessionId) {
            submission.abandon();
            submission = undefined;
            const request = new AbortController();
            visionRequest.current = request;
            setRecognizing(true);
            try {
              const description = await requestImageDescription(outgoingImages, draft, request.signal, t);
              const retainedFiles = [...outgoingFiles];
              if (result.error.code === 'session/attachment-invalid') {
                const uploads = runtime.fileUploads;
                if (!uploads?.upload) throw new Error(t('fileUploadFailed'));
                for (const { data, name } of outgoingImages) {
                  request.signal.throwIfAborted();
                  const upload = await uploads.upload(sessionId, { data, name }, request.signal);
                  if (!upload?.ok) throw new Error(`${t('fileUploadFailed')} ${errorMessage(upload)}`);
                  retainedFiles.push({
                    receiptId: upload.value.receiptId,
                    name: upload.value.file?.name || name,
                    bytes: upload.value.file?.bytes,
                  });
                }
              }
              request.signal.throwIfAborted();
              const message = `${draft.trim() ? draft : t('imageOnlyRequest')}\n\n[${t('imageRecognitionContext')}]\n${description}`;
              result = await send(message, [], retainedFiles, request.signal);
            } finally {
              if (visionRequest.current === request) {
                visionRequest.current = null;
                if (sessionRef.current === sessionId) setRecognizing(false);
              }
            }
          }
          if (!result?.ok) {
            throw new Error(errorMessage(result));
          }
        } catch (cause) {
          if (submission && !accepted) submission.abandon();
          if (sessionRef.current === sessionId) {
            setError(`${t('sendFailed')} ${errorMessage(cause)}`);
          }
        } finally {
          attachmentDrafts.finish(sessionId, draftToken);
          reference?.release();
        }
      }

      async function stop() {
        if (!sessionId) return;
        setError('');
        try {
          const binding = runtime.sessions?.binding(sessionId);
          if (!binding) throw new Error(t('sessionNotReady'));
          const result = await binding.session.cancel();
          if (!result?.ok) throw new Error(errorMessage(result));
        } catch (cause) {
          setError(`${t('stopFailed')} ${errorMessage(cause)}`);
        }
      }

      function onKeyDown(event) {
        if (event.isComposing || event.nativeEvent?.isComposing) return;
        if (mentionMenuVisible) {
          if (event.key === 'Escape') {
            event.preventDefault();
            setMentionDismissed(mentionToken);
            return;
          }
          if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && mentionRows.length > 0) {
            event.preventDefault();
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setMentionActive((current) => (
              current + step + mentionRows.length
            ) % mentionRows.length);
            return;
          }
          if ((event.key === 'Enter' && !event.shiftKey || event.key === 'Tab') && activeMention) {
            event.preventDefault();
            chooseMention(activeMention);
            return;
          }
        }
        if (commandMenuVisible) {
          if (event.key === 'Escape') {
            event.preventDefault();
            setCommandLauncherOpen(false);
            setCommandDismissed(text);
            return;
          }
          if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && filteredCommands.length > 0) {
            event.preventDefault();
            const step = event.key === 'ArrowDown' ? 1 : -1;
            setCommandActive((current) => (
              current + step + filteredCommands.length
            ) % filteredCommands.length);
            return;
          }
          if ((event.key === 'Enter' && !event.shiftKey || event.key === 'Tab') && activeCommand) {
            event.preventDefault();
            void chooseCommand(activeCommand);
            return;
          }
        }
        if (event.key !== 'Enter' || event.shiftKey) return;
        event.preventDefault();
        void submit(event.metaKey || event.ctrlKey);
      }

      if (!sessionId && props.onRequestWorkspace) {
        return h('div', { className: 'cw-root cw-composer' },
          h('button', { type: 'button', className: 'cw-workspace-button', onClick: props.onRequestWorkspace }, t('chooseWorkspace')));
      }

      return h('div', { ref: composerRef, className: `cw-root cw-composer cw-composer-${props.variant || 'composer'}` },
        commandMenuVisible ? h('div', {
          className: 'cw-command-menu', role: 'listbox',
          'aria-label': t('composerHint'),
        },
          commandStatus === 'loading'
            ? h('div', { className: 'cw-command-status' }, t('commandLoading')) : null,
          commandStatus === 'error'
            ? h('div', { className: 'cw-command-status', 'data-error': true }, commandError) : null,
          commandStatus === 'ready' && filteredCommands.length === 0
            ? h('div', { className: 'cw-command-status' }, t('commandNoMatch')) : null,
          filteredCommands.map((row, index) => h('button', {
            type: 'button', key: row.name,
            className: 'cw-command-row', role: 'option',
            'aria-selected': index === activeCommandIndex,
            'data-active': index === activeCommandIndex ? 'true' : undefined,
            onMouseEnter: () => setCommandActive(index),
            onClick: () => void chooseCommand(row),
          },
            h('span', { className: 'cw-command-name' }, `/${row.name}`),
            h('span', { className: 'cw-command-detail' }, row.description),
            row.hint ? h('span', { className: 'cw-command-hint' }, row.hint) : null,
          )),
        ) : null,
        mentionMenuVisible ? h('div', {
          className: 'cw-command-menu cw-mention-menu', role: 'listbox',
          'aria-label': t('mentionTitle'),
        },
          h('div', { className: 'cw-mention-heading' }, t('mentionTitle')),
          mentionStatus === 'loading'
            ? h('div', { className: 'cw-command-status' }, t('mentionLoading')) : null,
          mentionStatus === 'error'
            ? h('div', { className: 'cw-command-status', 'data-error': true }, t('mentionUnavailable')) : null,
          mentionStatus === 'ready' && mentionRows.length === 0
            ? h('div', { className: 'cw-command-status' }, t('mentionNoMatch')) : null,
          mentionRows.map((entry, index) => h('button', {
            type: 'button', key: entry.key, className: 'cw-command-row', role: 'option',
            'aria-selected': index === activeMentionIndex,
            'data-active': index === activeMentionIndex ? 'true' : undefined,
            onMouseEnter: () => setMentionActive(index),
            onClick: () => chooseMention(entry),
          },
            h(Icon, { name: entry.icon }),
            h('span', { className: 'cw-command-name' }, entry.label),
          )),
        ) : null,
        h('div', { className: 'cw-composer-card' },
          h('input', {
            ref: fileInputRef, type: 'file', accept: 'image/*', multiple: true,
            style: { display: 'none' },
            onChange: (event) => {
              addImageFiles(event.target.files);
              event.target.value = '';
            },
          }),
          h('input', {
            ref: uploadInputRef, type: 'file', multiple: true,
            style: { display: 'none' },
            onChange: (event) => {
              addDraftFiles(event.target.files);
              event.target.value = '';
            },
          }),
          files.length > 0 ? h('div', { className: 'cw-composer-files' },
            files.map((file, index) => h('div', {
              className: 'cw-composer-file', key: `${file.name}-${index}`,
            },
              h(Icon, { name: 'file' }),
              h('span', { className: 'cw-composer-file-name', title: file.name }, file.name),
              h('span', { className: 'cw-composer-file-size' }, formatBytes(file.size)),
              h('button', {
                type: 'button', title: t('removeFile'), 'aria-label': `${t('removeFile')}: ${file.name}`,
                disabled: sending,
                onClick: () => attachmentDrafts.replace(sessionId, 'files', (current) =>
                  current.filter((_, itemIndex) => itemIndex !== index)),
              }, h(Icon, { name: 'close' })),
            )),
          ) : null,
          images.length > 0 ? h('div', { className: 'cw-composer-images' },
            images.map((image, index) => h('div', { className: 'cw-composer-image', key: `${image.name}-${index}` },
              h(DraftImage, { file: image, fallback: t('image') }),
              h('button', {
                type: 'button', title: t('removeImage'), 'aria-label': t('removeImage'),
                disabled: sending,
                onClick: () => attachmentDrafts.replace(sessionId, 'images', (current) =>
                  current.filter((_, itemIndex) => itemIndex !== index)),
              }, h(Icon, { name: 'close' })),
            )),
          ) : null,
          h('div', { className: 'cw-composer-row' },
            h(ComposerAddMenu, {
              disabled: unavailable || draftLoading || sending,
              t,
              onImages: () => {
                if (images.length < MAX_IMAGES) fileInputRef.current?.click();
              },
              onFiles: () => {
                if (files.length < MAX_FILES) uploadInputRef.current?.click();
              },
              onCommands: () => {
                setCommandLauncherOpen(true);
                setCommandActive(0);
                setCommandDismissed(null);
                requestAnimationFrame(() => textareaRef.current?.focus());
              },
              onContext: () => {
                try {
                  runtime.sidebarRight?.openTab(CONTEXT_TAB);
                } catch (error) {
                  console.error('[claude-workbench] could not open context', error);
                }
              },
              onPlugins: () => {
                try {
                  runtime.ctx?.get('layout')?.selectPanel('plugins');
                } catch (error) {
                  console.error('[claude-workbench] could not open plugins', error);
                }
              },
            }),
            h('textarea', {
              ref: textareaRef,
              className: 'cw-composer-input', rows: 1, value: text,
              onChange: (event) => {
                setText(event.target.value);
                writeDraft(sessionId, event.target.value);
                setCommandLauncherOpen(false);
                setCommandDismissed(null);
                setMentionDismissed(null);
                setCaret(event.target.selectionStart ?? 0);
              },
              onSelect: (event) => setCaret(event.currentTarget.selectionStart ?? 0),
              onKeyDown, onPaste,
              placeholder: unavailable ? t('inputDisabled') : (props.placeholder || t('inputPlaceholder')),
              'aria-label': t('inputPlaceholder'),
              disabled: unavailable || sending,
            }),
            sessionId ? h('div', { className: 'cw-composer-voice' },
              props.renderSlot(WORKBENCH_VOICE_SLOT, {
                inputActions: voiceInputActions,
                locked: voiceLocked,
                onActiveChange: ignoreVoiceActivity,
              }),
            ) : null,
            h('div', { className: 'cw-composer-actions' },
              sending ? h('span', { className: 'cw-composer-state', role: 'status' },
                t(recognizing ? 'imageRecognizing' : 'sending')) : null,
              running && cancelAllowed ? h('button', {
                type: 'button', className: 'cw-send-button cw-stop-button', onClick: () => void stop(),
                title: t('stop'), 'aria-label': t('stop'),
              }, h(Icon, { name: 'stop' })) : null,
              h('button', {
                type: 'button', className: 'cw-send-button', disabled: !canSend,
                onClick: () => void submit(),
                title: running ? `${t(submitMode(session, preference, false))}\n${t('busySendHint')}` : t('send'),
                'aria-label': running ? t(submitMode(session, preference, false)) : t('send'),
              }, h(Icon, { name: 'up' })),
            ),
          ),
          props.accessory || null,
          (images.length || files.length || ['loading', 'error'].includes(draftStorageStatus))
            ? h('div', { className: 'cw-draft-status', role: 'status' },
              t(`draft_${draftStorageStatus}`),
              draftStorageStatus === 'error' ? h('button', {
                type: 'button', onClick: () => attachmentDrafts.retry(),
              }, t('imageRetry')) : null) : null,
          error ? h('div', { className: 'cw-composer-error', role: 'alert' }, error) : null,
          props.blocked?.reason ? h('div', { className: 'cw-composer-error' }, props.blocked.reason) : null,
        ),
        h('div', { className: 'cw-composer-footer' },
          h('div', { className: 'cw-composer-hint' }, t('composerHint')),
          h('div', { className: 'cw-footer-controls' },
            h(FolderControl, { cwd, disabled: unavailable || sending, t, onError: (message) => setError(message) }),
            h(PermissionControl, { props, sessionId, t }),
            h(ModelControl, { props, sessionId, t, openRequest: modelOpenRequest }),
            sessionId ? h(UsageControl, { key: sessionId, useProjection: props.useProjection, t }) : null,
          ),
        ),
      );
    }

    const HeroGreeting = withBoundary(HeroGreetingBase);
    const ToolCallMessage = withBoundary(ToolCallMessageBase);
    function Composer(props, fallback) {
      const required = ['useSession', 'useAccess', 'useProjection', 'useSessions', 'renderSlot'];
      if (required.some((name) => typeof props[name] !== 'function')) {
        fallback();
        return null;
      }
      return h(WorkbenchBoundary, { onFailure: fallback }, h(ComposerBase, props));
    }
    const ContextPanel = withBoundary(ContextPanelBase);
    const HeaderContextButton = withBoundary(ContextButton);

    function registerComposer(slots) {
      let active = true, fallbackPending = false, disposeComposer, disposeVoice;
      function cleanup() {
        if (!active) return;
        active = false;
        // Child mirrors/subscriptions go first, before their parent slot vanishes.
        disposeSafely(disposeVoice); disposeSafely(disposeComposer);
        disposeVoice = disposeComposer = undefined;
      }
      function fallback() {
        if (!active || fallbackPending) return;
        fallbackPending = true;
        // This callback belongs to one registration, never a newer replacement.
        queueMicrotask(() => {
          if (!active) return;
          runtime.composerFallback = true;
          cleanup(); compatibilityChanged();
        });
      }
      if (!['register', 'subscribe', 'entriesOfSlot'].every((key) => typeof slots?.[key] === 'function')) {
        runtime.composerFallback = true; compatibilityChanged(); return cleanup;
      }
      try {
        disposeComposer = slots.register({
          name: 'conversation.composer.bar', priority: -1,
          children: { [WORKBENCH_VOICE_SLOT]: { kind: 'single', scope: 'session' } },
        }, (props) => Composer(props, fallback));
        disposeVoice = mirrorNativeEntry(slots, NATIVE_INPUT_ACTIVITY, WORKBENCH_VOICE_SLOT,
          (entry) => entry.locale === 'voice-input', fallback);
        if (fallbackPending) {
          runtime.composerFallback = true; cleanup();
        } else runtime.composerFallback = false;
      } catch (error) {
        runtime.composerFallback = true; cleanup();
        reportDiagnostic(`composer integration unavailable: ${error?.message || error}`);
      }
      compatibilityChanged();
      return cleanup;
    }

    return {
      inject: [
        'slots', 'locale', 'shortcuts', 'configForms', 'uiWorkspace', 'workspaces', 'sessions', 'remote',
      ],
      ...(typeof window !== 'undefined' && window.__CLAUDE_WORKBENCH_TEST__
        ? { testHooks: { commandQuery, filterCommandRows, commandRowsFromDescriptors, commandInsertion, executeHostCommand, summarizeToolCall, summarizeWorkGroup, isDangerousPermission, rootModelGroup, formatTokenCount, contextPercent, mentionQuery, referenceRows, submitMode, formatBytes, voiceDraftInsertion, createSessionHistory, createAttachmentDrafts, createAttachmentStorage, compatibilityChecks, orderJobs, jobElapsed, registerComposer, bridgeNativeJobs } }
        : {}),
      apply(ctx) {
        runtime.ctx = ctx;
        runtime.workspace = ctx.get('uiWorkspace');
        runtime.workspaces = ctx.get('workspaces');
        runtime.sessions = ctx.get('sessions');
        runtime.composerSettings = ctx.configForms.get('ui-conversation');
        try {
          ctx.inject(['jobs'], (scope) => {
            scope.effect(() => {
              const jobs = scope.get('jobs'); runtime.jobs = jobs; compatibilityChanged();
              return () => { if (runtime.jobs === jobs) { runtime.jobs = undefined; compatibilityChanged(); } };
            }, 'fps: native background jobs');
          });
        } catch (error) {
          reportDiagnostic(`background jobs unavailable: ${error?.message || error}`);
        }
        for (const [property, namespace] of [
          ['commandsRemote', 'commands'], ['fileReferences', 'fileReferences'],
          ['sessionReferences', 'sessionReferenceResolver'], ['permissionPresets', 'permissionPresets'],
          ['fileUploads', 'fileUploads'], ['workspaceFiles', 'workspaceFiles'],
        ]) {
          ctx.inject([`remote.${namespace}`], (scope) => {
            scope.effect(() => {
              const service = scope.remote?.[namespace];
              runtime[property] = service; compatibilityChanged();
              return () => {
                if (runtime[property] === service) { runtime[property] = undefined; compatibilityChanged(); }
              };
            }, `claude-workbench: ${namespace}`);
          });
        }
        runtime.shortcuts = ctx.get('shortcuts');
        runtime.modelDirectories = ctx.get('modelDirectories');
        if (runtime.workspace?.selection) {
          ctx.effect(() => {
            runtime.sessionHistory = createSessionHistory(runtime.workspace, runtime.sessions, runtime.workspaces,
              () => ctx.get('layout')?.beginNavigation?.());
            return () => {
              runtime.sessionHistory.dispose();
              runtime.sessionHistory = undefined;
            };
          }, 'claude-workbench: session visit history');
        }
        ctx.effect(() => {
          const style = document.createElement('style');
          style.dataset.pluginCss = '@local/claude-code-workbench';
          style.textContent = CSS;
          document.head.appendChild(style);
          document.documentElement.setAttribute('data-workbench-theme', '');
          return () => {
            document.documentElement.removeAttribute('data-workbench-theme');
            style.remove();
          };
        }, 'claude-workbench: presentation styles');
        try {
          ctx.inject?.(['layout'], (scope) => {
            // Seed the native width once when the frame is created. Dragging uses the same action.
            scope.get('layout')?.panels?.setRightbar?.(RIGHT_SIDEBAR_MIN_WIDTH);
          });
        } catch (error) {
          reportDiagnostic(`right sidebar default width failed: ${error?.message || error}`);
        }
        try {
          if (ctx.inject) {
            ctx.inject(['modelDirectories'], (scope) => {
              runtime.modelDirectories = scope.modelDirectories;
              scope.effect(() => () => {
                if (runtime.modelDirectories === scope.modelDirectories) runtime.modelDirectories = undefined;
              }, 'claude-workbench: model directories');
            });
          }
        } catch (error) {
          reportDiagnostic(`model directory injection failed: ${error?.message || error}`);
        }
        try {
          ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'claude-workbench: locale');
          runtime.t = ctx.locale.bind(NS);
          ctx.effect(() => {
            const locale = ctx.locale;
            const translate = locale.translate;
            if (typeof translate !== 'function') return;
            let active = true;
            // The native status supplies its own localized elapsed time and shimmer.
            function translateRunningStatus(namespace, key, params) {
              if (active && namespace === 'chat') {
                if (key === 'chat.deepDiving') return 'ThinKing';
                if (key === 'chat.deepDivingFor' && params?.duration) return `ThinKing · ${params.duration}`;
              }
              return translate.call(this, namespace, key, params);
            }
            locale.translate = translateRunningStatus;
            return () => {
              active = false;
              if (locale.translate === translateRunningStatus) locale.translate = translate;
            };
          }, 'claude-workbench: running status label');
        } catch (error) {
          reportDiagnostic(`locale registration failed: ${error?.message || error}`);
        }
        try {
          ctx.inject(['theme'], (scope) => {
            scope.effect(() => scope.theme.overrideTokens('@local/claude-code-workbench', THEME_TOKENS),
              'claude-workbench: appearance');
          });
        } catch (error) {
          reportDiagnostic(`theme registration failed: ${error?.message || error}`);
        }

        function install(label, register) {
          try {
            return register();
          } catch (error) {
            reportDiagnostic(`${label} registration failed: ${error?.message || error}`);
            return () => {};
          }
        }

        function guardInjection(label, register) {
          return () => {
            try {
              return register();
            } catch (error) {
              reportDiagnostic(`${label} activation failed: ${error?.message || error}`);
              return () => {};
            }
          };
        }

        ctx.effect(() => {
          let active = true;
          const disposers = [];
          const timer = setTimeout(() => {
            if (!active) return;
            disposers.push(
              install('image generation settings', () => ctx.slots.inject(
                'plugins.bundle.config',
                guardInjection('image generation settings', () => ctx.slots.register({
                  name: 'plugins.bundle.config', key: 'dsh-fps-workbench', locale: NS,
                }, withBoundary(ImageGenerationSettings))),
              )),
              install('new session greeting', () => ctx.slots.inject(
                'conversation.hero.brand.mark',
                guardInjection('new session greeting', () => ctx.slots.register({
                  name: 'conversation.hero.brand.mark', priority: -1, locale: NS,
                }, HeroGreeting)),
              )),
              install('sidebar settings', () => ctx.slots.inject(
                'sidebar.footer.action',
                guardInjection('sidebar settings', () => ctx.slots.register({
                  name: 'sidebar.footer.action', id: 'workbench-settings', order: 50,
                }, SidebarSettingsButton)),
              )),
              install('chat nodes', () => ctx.slots.inject(
                'conversation.chat.node',
                guardInjection('chat nodes', () => ctx.slots.register({
                  name: 'conversation.chat.node', key: 'tool-call', priority: -1,
                }, ToolCallMessage)),
              )),
              install('composer', () => ctx.slots.inject(
                'conversation.composer.bar',
                guardInjection('composer', () => registerComposer(ctx.slots)),
              )),
              install('context tab', () => {
                const tabs = ctx.get('sidebarRightTabs');
                runtime.sidebarRight = ctx.get('sidebarRight');
                if (!tabs) return () => {};
                const disposeType = ctx.effect(() => tabs.register({
                  id: CONTEXT_TAB,
                  kind: CONTEXT_TAB,
                  keepMounted: true,
                  title: () => translate({}, 'contextTitle'),
                }), 'claude-workbench: context tab type');
                const disposeBody = ctx.slots.inject(
                  'sidebar.right.pane.tab',
                  guardInjection('context body', () => ctx.slots.register({
                    name: 'sidebar.right.pane.tab', key: CONTEXT_TAB,
                    children: { 'workbench.context.jobs': { kind: 'single', scope: 'session' } },
                  }, ContextPanel)),
                );
                const disposeJobs = install('native job details', () => bridgeNativeJobs(ctx.slots));
                const disposeHeader = ctx.slots.inject(
                  'conversation.session.header.utilities',
                  guardInjection('session header utilities', () => ctx.slots.register({
                    name: 'conversation.session.header.utilities', id: 'workbench-panes', order: 50,
                  }, HeaderContextButton)),
                );
                return () => {
                  disposeJobs();
                  disposeHeader();
                  disposeBody();
                  disposeType();
                };
              }),
            );
          }, 0);
          return () => {
            active = false;
            clearTimeout(timer);
            for (const dispose of disposers) {
              try {
                dispose();
              } catch (error) {
                console.error('[claude-workbench] cleanup failed', error);
              }
            }
          };
        }, 'claude-workbench: delayed slot registration');
      },
    };
    } catch (error) {
      console.error('[claude-workbench] Client factory failed', error);
      return {
        inject: ['slots'],
        apply(ctx) {
          try {
            ctx.effect(() => ctx.slots.register({
              name: 'conversation.composer.dock', id: 'claude-workbench-load-error', order: 9000,
            }, () => null), 'claude-workbench: inert fallback');
          } catch (registrationError) {
            console.error('[claude-workbench] fallback registration failed', registrationError);
          }
        },
      };
    }
  },
});
