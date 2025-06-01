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
- **Upload All Images**: Upload every image in the current file.
- **Upload Selected Images**: Right-click to upload only selected images.
- **Auto URL Insertion**: Automatically insert image URLs into your file after upload.
- **Image Management**: Delete images from your remote hosting service directly within VSCode.
- **Advanced Processing**: Supports image compression, watermarking, and more.
- **Remote Server Mode**: Upload via PicList or PicList-Core running on a remote server.

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

Default: `![$filename]($url)`.

### Encode URL

Whether to encode the URL when inserting text. Default: `false`.

### Enable Upload on Drop

Enable or disable upload on drag-and-drop. Default: `true`.

### Remote Server Mode

Enable when using PicList or PicList-Core on a remote server. Uploads will be sent as files.

## Contributors

- [Kuingsmile](https://github.com/Kuingsmile)

## Dependencies

- [PicList](https://github.com/Kuingsmile/PicList)
- [PicList-Core](https://github.com/Kuingsmile/piclist-core)