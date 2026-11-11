# Four-pointed star (FPS)

FPS is a conversation workspace for DeepSeek Harness (DSH). Track tool progress, open session outputs, and check context and provider usage from one interface. Return to unsent attachments when you switch sessions, and use a configured vision model to interpret images for a text-only model.

## What you can do

- **Context and session outputs.** Open Context in the conversation header to see the model, session state, and estimated context composition. Outputs lists local files produced or explicitly linked in the session. Select a file to open it in DSH's native preview. The header also gives you access to Files, Terminal, and Browser.
- **Tool progress summaries.** Consecutive file reads, commands, and edits appear in one summary row. Expand it for DSH's native tool details. The task list distinguishes completed, active, and pending work. While the session runs, `ThinKing` shows elapsed time alongside the FPS mark and respects the system's reduced motion setting.
- **Composer and attachment drafts.** Paste images or use the Add menu to choose images and files. When you return to a session, its draft text and unsent attachments are restored. Reloading or closing the interface clears unsent attachments. Each message supports up to four images of 8 MB each and six files of 20 MB each.
- **Images with text-only models.** When the selected model does not support images, FPS looks for an available model with image input in DSH. It sends the image and prompt to that model and passes the resulting description to the current session. If no suitable model is available, the composer keeps the draft and shows an error.
- **Sessions and workspaces.** The sidebar keeps DSH's workspaces, session search, and settings. Use the back and forward arrows beside the sidebar toggle to revisit sessions opened in the current window.
- **Commands, references, and voice.** Type `/` to find commands and `@` to reference files or sessions. The composer footer gives you access to the workspace, permissions, model, reasoning effort, and usage. Enable the DSH voice input plugin to see a microphone in the composer.

FPS sends messages through the native DSH session. Models can use the tools enabled in the current configuration, and DSH runs them or requests approval according to the session permissions.

## Provider usage

Click the ring next to the model selector. FPS queries usage using the providers and API keys enabled in DSH. It shows the balance, spending, quota, or reset time returned by a supported endpoint. Zero balances are displayed. Accounts or fields are hidden when an endpoint is unsupported, a query fails, or data is missing. DSH supplies the session's token counts and estimated context usage separately.

## Optional image generation

Open **Plugins → Four-pointed star → Image generation** to switch on the providers you want. All four start off. Enabled providers become available once their setup is complete, and compatible session models can call them through DSH according to the session's permissions. FPS saves generated images in DSH's generated files directory, where you can open them with DSH's native preview. Cloud tools send prompts to the selected service, so avoid including confidential material.

You can name a provider in your prompt. By default, FPS asks the model to prefer an existing image generation tool. When it uses FPS, it tries to select ComfyUI first if ready, followed by Z-Image Turbo, CogView-3-Flash, and Pollinations. A failed request returns its error so you can decide whether to try again or switch providers.

- **Z-Image Turbo.** Uses the official Hugging Face Space without an API key. It generates images at roughly one megapixel and is suitable for quick concepts. The shared service may queue requests or stop accepting them when its GPU quota runs out. The documented anonymous ZeroGPU allowance is two minutes of GPU time per day. [ZeroGPU quota](https://huggingface.co/docs/hub/spaces-zerogpu#usage-tiers)
- **CogView-3-Flash.** Requires an API key from the Zhipu BigModel platform. Zhipu lists the Flash tier as free. It suits standard-quality images and is subject to the provider's eligibility, rate limits, and availability. FPS uses the specified Flash model only. [Zhipu pricing](https://docs.bigmodel.cn/cn/guide/start/pricing)
- **Pollinations.** Requires your own Pollinations API key and may require a positive available balance even for a zero-priced model. FPS checks the live price of its SDXL Lightning model before sending a generation request. This community model is suited to quick drafts, and its description states that prompts and completions are logged. [Pollinations API](https://gen.pollinations.ai/docs)
- **ComfyUI + Comfy MCP.** Switch it on, then start the download from Image generation. The setup installs ComfyUI and its official Comfy MCP integration. It targets Apple Silicon with macOS 14 or newer, 64-bit Windows, and x86-64 Linux with glibc 2.28 or newer. Have Git, Python 3.11–3.13 with `venv` and `pip`, internet access, at least 8 GB of RAM, and 16 GiB of free disk space for setup. A compatible Apple or NVIDIA GPU is recommended. CPU generation can take several minutes. The included SD 1.5 workflow produces local drafts around 512 × 512 pixels by default. Fine text and photorealism can be limited. Local generation needs no Comfy account or credits. [Comfy MCP](https://github.com/Comfy-Org/comfy-mcp) · [Checkpoint and license](https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive)

Turning ComfyUI off disables local image generation and keeps the downloaded files for later use. FPS uses the official MCP to run the starter workflow and exposes only image generation to the conversation.

Save the CogView-3-Flash and Pollinations keys in the Image generation settings. FPS uses the DSH credential store. You can also provide `FPS_COGVIEW_API_KEY` or `POLLINATIONS_API_KEY` in the environment that starts DSH. Each provider uses its own key.

## Customize

- **Appearance.** In DSH, open Settings → General → Appearance and select Light, Dark, or System. FPS follows that setting across its sidebar, conversation, composer, and menus.
- **Models and usage.** In DSH, open Settings → Models to add or edit your providers, API endpoints, models, and API keys. Reopen the usage panel to query the updated configuration. A custom endpoint needs a matching usage integration to show balances or quotas. If you use a text-only model, you can add a model that supports image input here for FPS to select automatically.
- **Tools and permissions.** Manage plugins that provide tools in DSH's Plugins page. Use the composer footer to select your session model and permissions. Tool availability depends on the model's capabilities and the session permissions.
