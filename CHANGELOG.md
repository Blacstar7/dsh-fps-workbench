# Changelog · 更新日志

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
