# vs-piclist

> A powerful VSCode extension for seamless image management, powered by [PicList](https://github.com/Kuingsmile/PicList).

[![version](https://img.shields.io/vscode-marketplace/v/Kuingsmile.vs-piclist.svg?style=flat-square&label=vscode%20marketplace)](https://marketplace.visualstudio.com/items?itemName=Kuingsmile.vs-piclist)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/Kuingsmile.vs-piclist?style=flat-square)
[![installs](https://img.shields.io/vscode-marketplace/d/Kuingsmile.vs-piclist.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=Kuingsmile.vs-piclist)
[![GitHub stars](https://img.shields.io/github/stars/Kuingsmile/vs-piclist.svg?style=flat-square&label=github%20stars)](https://github.com/Kuingsmile/vs-piclist)

## Overview

`vs-piclist` is a feature-rich VSCode extension for effortless image uploading and management. Upload images to remote hosting services and automatically insert the generated URLs into your files.

Unlike other solutions, `vs-piclist` offers advanced features such as image compression, watermarking, and flexible image processing.

### Prerequisites

Install [PicList](https://github.com/Kuingsmile/PicList) desktop app or [PicList-Core](https://github.com/Kuingsmile/piclist-core) before using this extension.

### Why vs-piclist?

While alternatives like [vs-picgo](https://github.com/PicGo/vs-picgo) exist (based on [PicGo-Core](https://github.com/PicGo/PicGo-Core)), `vs-piclist` provides a broader set of features for comprehensive image management.

## Features

- **Easy Uploads**: Upload images to your preferred hosting service in just a few clicks.
- **Drag-and-Drop Support**: Drag images from your file explorer directly into your editor to upload.
- **Paste to Upload**: Paste screenshots or image files into the editor to upload them (enable `piclist.enablePasteUpload`).
- **Upload from the Explorer**: Right-click image files in the VS Code explorer to upload them.
- **Upload All Images**: Upload every image in the current file. Only the image URLs are replaced, so alt text, titles, and HTML attributes are kept. Images in code blocks and links to web pages are left alone.
- **Upload Selected Images**: Right-click to upload only the selected images, or the image at the cursor.
- **Auto URL Insertion**: Automatically insert image URLs into your file after upload.
- **Image Management**: Delete images from your remote hosting service directly within VSCode.
- **Advanced Processing**: Supports image compression, watermarking, and more.
- **Remote Server Mode**: Upload via PicList or PicList-Core running on a remote server.
- **Remote Development**: Works in Remote-SSH, WSL, Dev Containers, and code-server.

### Demo

<details>
<summary>Upload from clipboard</summary>
<img src="https://s2.loli.net/2023/08/31/XvZrtgiuWwLYIHy.gif" alt="clipboard.gif">
</details>

<details>
<summary>Upload from explorer</summary>
<img src="https://s2.loli.net/2023/08/31/npvwQoT4Ucr5mPN.gif" alt="explorer.gif">
</details>

<details>
<summary>Upload from local path or URL</summary>
<img src="https://s2.loli.net/2023/08/31/tAW54rVFhO2KSTo.gif" alt="input box.gif">
</details>

<details>
<summary>Drag-and-drop upload</summary>
<img src="https://s2.loli.net/2023/09/01/rflXoJLsR5heDqK.gif" alt="drag-and-drop.gif">
</details>

<details>
<summary>Delete images from remote hosting</summary>
<img src="https://s2.loli.net/2023/09/01/8oYzJinhgajLfdI.gif" alt="delete.gif">
</details>

<details>
<summary>Upload all images in a file</summary>
<img src="https://s2.loli.net/2024/06/16/9JDyICxZ3mUEBio.gif" alt="upload-all.gif">
</details>

<details>
<summary>Upload selected images by right-click</summary>
<img src="https://s2.loli.net/2024/06/16/GUVjraIWTuX2wgn.gif" alt="upload-selected.gif">
</details>

## Settings

![setting](https://s2.loli.net/2023/08/31/vL7WgcDrxIGzZBR.webp)

### Upload API URL

The PicList upload API endpoint. Default: `http://127.0.0.1:36677/upload`. See [PicList Server](https://piclist.cn/en/advanced.html#use-of-built-in-server).

### Delete API URL

The PicList delete API endpoint. Default: `http://127.0.0.1:36677/delete`. See [PicList Server](https://piclist.cn/en/advanced.html#use-of-built-in-server).

### Server Key

The server key set in PicList, or passed to PicList-Core with `picgo-server -k <key>`. It is sent as the `key` query
parameter. PicList only checks it for requests from other machines. Default: empty.

### Picbed and Config Name

Upload to a specific image host and configuration instead of PicList's defaults, for example `aws-s3` and
`piclist-test`. Set them in workspace settings to use a different image host for each project. Default: empty.

### Copy Type

Default: markdown.

| Type     | Format                  |
| -------- | ----------------------- |
| url      | `url`                   |
| markdown | `![alt](url)`           |
| html     | `<img src=url alt=alt>` |
| ubb      | `[img]url[/img]`        |
| custom   | `custom`                |

### Custom Type

Default: `![$fileName]($url)`. Placeholders: `$fileName`, `$url`.

### Encode URL

Whether to encode the URL when inserting text. Default: `false`.

### Enable Upload on Drop

Enable or disable upload on drag-and-drop. Default: `true`.

### Enable Upload on Paste

Upload images pasted into the editor, such as screenshots or copied image files, instead of using VS Code's default
paste. When the clipboard also holds text, as it does when copying from Word or Excel, the text is still pasted by
default. Default: `false`.

When this setting is off, you can still upload a single paste with a keybinding:

```json
{
  "key": "ctrl+alt+v",
  "command": "editor.action.pasteAs",
  "args": { "kind": "piclist.upload" },
  "when": "editorTextFocus"
}
```

### Skip Remote Images

When uploading all or selected images, skip images that already have an `http(s)` URL and upload only local images.
When off, remote images are uploaded again to your image host. Default: `false`.

### Remote Server Mode

Enable when using PicList or PicList-Core on a remote server. Uploads will be sent as files.

## Remote Development

With Remote-SSH, WSL, or Dev Containers, the extension runs on your local machine and talks to your local PicList.
In browser-based setups such as code-server, it runs on the server, so the API URLs must point to a PicList server
reachable from there. The clipboard command cannot read your computer's clipboard in that case, so use paste or
drag-and-drop to upload images from your computer.

## Development

Use Node.js 22.13 or later in the 22.x line, or Node.js 24+, with pnpm 10.34.6.
Install [pnpm](https://pnpm.io/10.x/installation), or enable it with `corepack enable pnpm` if Corepack is available.
The `packageManager` field pins the pnpm version.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm compile
pnpm package
```

Rolldown bundles the extension and its clipboard scripts into `dist/extension.js`. `pnpm compile` includes a source map;
`pnpm package` minifies the bundle and generates a hidden source map. Both commands check TypeScript before building.

Create a VSIX with `pnpm dlx @vscode/vsce package`. The `vsce.dependencies` setting disables dependency scanning because
all runtime dependencies are bundled.

Press F5 in VS Code to build and debug the extension. The default build task runs `pnpm watch` and `pnpm typecheck:watch`
together so changes are bundled and checked as you work.

## Contributors

- [Kuingsmile](https://github.com/Kuingsmile)

## Dependencies

- [PicList](https://github.com/Kuingsmile/PicList)
- [PicList-Core](https://github.com/Kuingsmile/piclist-core)
