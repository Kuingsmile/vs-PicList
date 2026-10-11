# vs-piclist

> 基于 [PicList](https://github.com/Kuingsmile/PicList) 的强大 VSCode 图床插件。

[![version](https://img.shields.io/vscode-marketplace/v/Kuingsmile.vs-piclist.svg?style=flat-square&label=vscode%20marketplace)](https://marketplace.visualstudio.com/items?itemName=Kuingsmile.vs-piclist)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/Kuingsmile.vs-piclist?style=flat-square)
[![installs](https://img.shields.io/vscode-marketplace/d/Kuingsmile.vs-piclist.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=Kuingsmile.vs-piclist)
[![GitHub stars](https://img.shields.io/github/stars/Kuingsmile/vs-piclist.svg?style=flat-square&label=github%20stars)](https://github.com/Kuingsmile/vs-piclist)

## 概览

`vs-piclist` 是一款功能丰富的 VSCode 图床扩展，支持一键上传图片到远程图床，并自动插入图片链接到当前文件。

相比其他方案，`vs-piclist` 支持图片压缩、水印等高级处理，功能更全面。

### 先决条件

使用前请先安装 [PicList](https://github.com/Kuingsmile/PicList) 桌面端或 [PicList-Core](https://github.com/Kuingsmile/piclist-core)。

### 为什么选择 vs-piclist？

虽然有如 [vs-picgo](https://github.com/PicGo/vs-picgo)（基于 [PicGo-Core](https://github.com/PicGo/PicGo-Core)），但 `vs-piclist` 提供了更丰富的功能，满足更全面的图片管理需求。

## 功能

- **一键上传**：轻松上传图片到任意图床。
- **拖拽上传**：直接拖拽图片到编辑器即可上传。
- **粘贴上传**：在编辑器中粘贴截图或图片文件即可上传（需开启 `piclist.enablePasteUpload`）。
- **资源管理器上传**：在 VS Code 资源管理器中右键图片文件即可上传。
- **全部上传**：一键上传当前文件所有图片。只替换图片链接，保留原有的 alt 文本、标题和 HTML 属性；代码块中的图片和普通网页链接不会被处理。
- **右键上传选中图片**：右键上传选中的图片，或光标所在的图片。
- **自动插入链接**：上传后自动插入图片链接。
- **图片管理**：在 VSCode 内直接删除远程图床图片。
- **高级处理**：支持图片压缩、水印等后处理。
- **远程服务器模式**：支持通过远程 PicList 或 PicList-Core 服务上传。
- **远程开发**：支持 Remote-SSH、WSL、Dev Containers 和 code-server。

### 演示

<details>
<summary>剪贴板上传</summary>
<img src="https://s2.loli.net/2023/08/31/XvZrtgiuWwLYIHy.gif" alt="clipboard.gif">
</details>

<details>
<summary>资源管理器上传</summary>
<img src="https://s2.loli.net/2023/08/31/npvwQoT4Ucr5mPN.gif" alt="explorer.gif">
</details>

<details>
<summary>本地路径或 URL 上传</summary>
<img src="https://s2.loli.net/2023/08/31/tAW54rVFhO2KSTo.gif" alt="input box.gif">
</details>

<details>
<summary>拖拽上传</summary>
<img src="https://s2.loli.net/2023/09/01/rflXoJLsR5heDqK.gif" alt="drag-and-drop.gif">
</details>

<details>
<summary>云端删除图片</summary>
<img src="https://s2.loli.net/2023/09/01/8oYzJinhgajLfdI.gif" alt="delete.gif">
</details>

<details>
<summary>上传文件中所有图片</summary>
<img src="https://s2.loli.net/2024/06/16/9JDyICxZ3mUEBio.gif" alt="upload-all.gif">
</details>

<details>
<summary>右键上传选中图片</summary>
<img src="https://s2.loli.net/2024/06/16/GUVjraIWTuX2wgn.gif" alt="upload-selected.gif">
</details>

## 设置

![setting](https://s2.loli.net/2023/08/31/vL7WgcDrxIGzZBR.webp)

### 上传 API 地址

PicList 上传接口，默认：`http://127.0.0.1:36677/upload`。详见 [PicList Server](https://piclist.cn/en/advanced.html#use-of-built-in-server)。

### 删除 API 地址

PicList 删除接口，默认：`http://127.0.0.1:36677/delete`。详见 [PicList Server](https://piclist.cn/en/advanced.html#use-of-built-in-server)。

### 服务器密钥

PicList 中设置的服务器密钥，或通过 `picgo-server -k <key>` 启动 PicList-Core 时设置的密钥，会作为 `key` 查询参数发送。
PicList 只会对来自其他机器的请求校验密钥。默认：空。

### 图床与配置名称

指定上传使用的图床和配置，而不是 PicList 的默认设置，例如 `aws-s3` 和 `piclist-test`。
在工作区设置中配置，即可为不同项目使用不同图床。默认：空。

### 粘贴格式

默认：markdown。

| 类型     | 格式                    |
| -------- | ----------------------- |
| url      | `url`                   |
| markdown | `![alt](url)`           |
| html     | `<img src=url alt=alt>` |
| ubb      | `[img]url[/img]`        |
| custom   | `custom`                |

### 自定义格式

默认：`![$fileName]($url)`。占位符：`$fileName`、`$url`。

### URL 编码

插入链接时是否编码 URL。默认：`false`。

### 拖拽上传

是否启用拖拽上传。默认：`true`。

### 粘贴上传

开启后，在编辑器中粘贴截图或复制的图片文件时会上传图片，替代 VS Code 默认的粘贴行为。
如果剪贴板中同时包含文本（例如从 Word 或 Excel 复制），默认仍粘贴文本。默认：`false`。

关闭此设置时，也可以通过快捷键单次粘贴上传：

```json
{
  "key": "ctrl+alt+v",
  "command": "editor.action.pasteAs",
  "args": { "kind": "piclist.upload" },
  "when": "editorTextFocus"
}
```

### 跳过远程图片

上传全部或选中图片时，跳过已经是 `http(s)` 链接的图片，只上传本地图片。关闭时，远程图片会被重新上传到你的图床。默认：`false`。

### 远程服务器模式

如在服务器或其他机器部署 PicList 或 PicList-Core，可开启远程模式，上传将以文件方式发送。

## 远程开发

使用 Remote-SSH、WSL 或 Dev Containers 时，插件运行在本地并连接本地的 PicList。
在 code-server 等基于浏览器的环境中，插件运行在服务器上，因此 API 地址需要指向服务器可以访问的 PicList 服务。
此时剪贴板上传命令无法读取你电脑上的剪贴板，请使用粘贴或拖拽上传。

### 开发

使用 Node.js 22.13 或更高版本（22.x 系列），或 Node.js 24+，并配合 pnpm 10.34.6。
安装 [pnpm](https://pnpm.io/10.x/installation)，或在 Corepack 可用时运行 `corepack enable pnpm`。
`packageManager` 字段会固定 pnpm 版本。

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm compile
pnpm package
```

Rolldown 会将扩展及其剪贴板脚本打包到 `dist/extension.js` 中。`pnpm compile` 包含源映射；
`pnpm package` 会压缩包并生成隐藏的源映射。两个命令在构建前都会检查 TypeScript。

运行 `pnpm dlx @vscode/vsce package` 生成 VSIX。由于所有运行时依赖都已打包，`vsce.dependencies` 设置会禁用依赖扫描。

在 VS Code 中按 F5 构建并调试扩展。默认的构建任务会同时运行 `pnpm watch` 和 `pnpm typecheck:watch`，
这样在你工作时更改会被打包并检查。

## 作者

- [Kuingsmile](https://github.com/Kuingsmile)

## 依赖

- [PicList](https://github.com/Kuingsmile/PicList)
- [PicList-Core](https://github.com/Kuingsmile/piclist-core)
