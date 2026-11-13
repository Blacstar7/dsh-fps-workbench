# Changelog · 更新日志

## [0.1.79](https://github.com/Blacstar7/dsh-fps-workbench/releases/tag/v0.1.79) — 2026-11-13

### English

- Persist unsent image/file drafts in device-local IndexedDB, restore them after reload, and keep failed submissions. Accepted drafts and explicit removals are cleared; attachments expire on load after 30 days without an attachment edit. Storage failures offer retry.
- Add a Context task-status section with native plan steps, live background jobs, elapsed time, and collapsed terminal states. Native job details, logs, permissions, and stop behavior remain in DSH.
- Add passive compatibility checks and a credential-free diagnostic summary to plugin settings. Fall back to the native composer when the input contract is unavailable or the FPS composer fails to render.
- Harden native integration cleanup: composer fallback releases the voice mirror and subscription, stale fallback callbacks cannot remove a newer composer, and optional job/voice registration errors stay isolated. Locate the native voice contribution regardless of slot order. Draft storage operations time out after 10 seconds; loading drafts no longer locks text editing or voice input.
- Rewrite both READMEs around long-task visibility, output discovery, draft recovery, usage, and native integration. Add separate English and Chinese desktop screenshot sets, and update installation/migration guidance.
- Add optional OpenAI organization spend and token totals when a separate local credential reference is configured. Credentials and personal usage configuration are never bundled.
- Include 12 fullscreen dark-mode screenshots with visible sidebars, bilingual guides, and a storefront screenshot manifest in the published package.
- Verified on macOS DSH 0.2.2-rc.2, including real microphone transcription and session switching with attachment drafts. This is not a guarantee of compatibility with every host version or voice provider.

### 简体中文

- 未发送图片和文件写入本机 IndexedDB，重载后恢复，发送失败保留。发送被接收或手动移除后清除；连续 30 天未修改的附件在下次加载时过期。存储失败支持重试。
- 上下文新增任务状态区，显示原生计划步骤、后台任务、实际用时和折叠的结束状态。详情、日志、权限和停止逻辑继续使用 DSH 原生实现。
- 插件设置新增兼容性自检和不含凭据的诊断摘要。输入框接口不匹配或 FPS 输入框渲染失败时回退原生输入框。
- 加固原生接口清理：输入框回退时同时释放语音镜像及订阅，旧回退回调不会撤下新输入框，后台任务和语音插槽注册异常独立隔离。语音入口不再依赖插槽排序。草稿存储单次操作超过 10 秒会报错并允许重试，加载草稿不再锁住文字编辑和语音输入。
- 重写中英文 README，突出长任务、产物、草稿、用量和原生集成，分别配套中英文桌面截图，并更新安装与迁移说明。
- 当用户另行配置本机凭据引用时，可显示 OpenAI 组织花费与 Token 统计；安装包不包含凭据或个人用量配置。
- 发布包包含 12 张展开侧栏的全屏深色截图、双语指南和市场截图清单。
- 已在 macOS DSH 0.2.2-rc.2 验证，包括真实麦克风转写、切换会话和附件草稿共存；不代表所有宿主版本和语音服务均已验证。

## [0.1.78](https://github.com/Blacstar7/dsh-fps-workbench/releases/tag/v0.1.78) — 2026-11-13

### English

- Releases from version tags use npm Trusted Publishing. The workflow waits for the exact npm version to become public and verifies the archive before attaching it to GitHub Releases.
- If you are still using the old `@local/claude-code-workbench` package, follow the one-time switch described in v0.1.77 below.

### 简体中文

- 推送版本标签后，GitHub Actions 通过 npm 可信发布发包。流程会等 npm 公开对应版本并核对安装包，再将同一份包上传到 GitHub Releases。
- 仍在使用旧包 `@local/claude-code-workbench` 的用户，可按下方 v0.1.77 的说明完成一次换装。

## [0.1.77](https://github.com/Blacstar7/dsh-fps-workbench/releases/tag/v0.1.77)

### English

- FPS is now packaged as `dsh-fps-workbench` for npm and the DSH Discover index. The GitHub repository and community catalog listing stay the same. Discover availability follows the catalog and mirror refresh.
- If you installed v0.1.76 or earlier, save unsent attachments, remove `@local/claude-code-workbench`, and install `dsh-fps-workbench` in the same DSH profile. This is a one-time switch. The new package reads the same image settings, saved credentials, and local usage settings. DSH conversations, workspaces, and text drafts in the same client profile remain available.
- Version tags trigger the release workflow for npm and GitHub. A prebuilt `.tgz` remains available through GitHub Releases.

### 简体中文

- FPS 改用公开包名 `dsh-fps-workbench`，供 npm 安装和 DSH「发现」索引收录。GitHub 仓库和社区目录条目沿用原来的地址。「发现」中的可见时间取决于目录和镜像刷新。
- 已安装 v0.1.76 或更早版本的用户，先保存未发送的附件，再卸载 `@local/claude-code-workbench`，在同一个 DSH 配置安装 `dsh-fps-workbench`。这一步只需做一次。新版沿用生图设置、已保存凭证和本地用量配置。原配置中的会话、工作区和文字草稿可以继续使用。
- 以后推送版本标签会触发 npm 和 GitHub 发布流程。GitHub Releases 继续提供预打包的 `.tgz`。

## [0.1.76](https://github.com/Blacstar7/dsh-fps-workbench/releases/tag/v0.1.76) — 2026-11-11

### English

FPS now includes optional text-to-image tools in **Plugins → Four-pointed star → Image generation**. All four switches are off by default.

- **Z-Image Turbo:** no API key; shared Hugging Face GPU quotas and queues apply.
- **CogView-3-Flash and Pollinations:** use your own API key. FPS checks the Pollinations catalog before requesting its zero-priced SDXL Lightning community model.
- **ComfyUI + official Comfy MCP:** enable the switch, then select **Download and install** to set up local generation. Setup shows progress and can be cancelled. The starter SD 1.5 workflow is intended for roughly 512 px drafts.
- A compatible DSH model can call an enabled, ready provider through the native tool system. Generated images appear in **Outputs** and open in DSH's native preview. A failed request does not switch providers automatically.
- Updated both READMEs and in-app plugin descriptions with setup, limits, and expected quality. Restart DSH after updating an existing installation.

Live generation was verified with Z-Image Turbo and with the official Comfy MCP on an Apple silicon Mac. CogView and Pollinations were tested with simulated responses; local setup was not tested on Windows or Linux.

### 简体中文

FPS 在「插件 → Four-pointed star → 图片生成」中新增可选文生图工具。四个开关默认关闭。

- **Z-Image Turbo**：无需 API Key，受 Hugging Face 共享 GPU 的排队和额度限制。
- **CogView-3-Flash 与 Pollinations**：使用自己的 API Key。调用 Pollinations 前，FPS 会查询目录，确认 SDXL Lightning 社区模型的实时标价为零。
- **ComfyUI + 官方 Comfy MCP**：开启后点「下载并安装」配置本地生图，可查看进度或取消。入门 SD 1.5 工作流适合生成约 512 像素的草图。
- 支持工具调用的 DSH 模型可通过原生工具系统调用已开启、已就绪的服务。图片进入「输出内容」，可用 DSH 原生预览打开。请求失败时不会自动换服务。
- 中英文 README 和插件详情补充了配置步骤、使用限制和预期画质。更新已有安装后，请重启 DSH。

Z-Image Turbo 已实测出图，官方 Comfy MCP 已在 Apple 芯片 Mac 上实测本地出图。智谱和 Pollinations 使用模拟响应验证；Windows 和 Linux 的本地安装未实机验证。

[Previous releases · 历史版本](https://github.com/Blacstar7/dsh-fps-workbench/releases)
