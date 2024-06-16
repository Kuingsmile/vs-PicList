# vs-piclist

> The VSCode extension of [PicList](https://github.com/Kuingsmile/PicList).

[![version](https://img.shields.io/vscode-marketplace/v/Kuingsmile.vs-piclist.svg?style=flat-square&label=vscode%20marketplace)](https://marketplace.visualstudio.com/items?itemName=Kuingsmile.vs-piclist)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/Kuingsmile.vs-piclist?style=flat-square)
[![installs](https://img.shields.io/vscode-marketplace/d/Kuingsmile.vs-piclist.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=Kuingsmile.vs-piclist)
[![GitHub stars](https://img.shields.io/github/stars/Kuingsmile/vs-piclist.svg?style=flat-square&label=github%20stars)](https://github.com/Kuingsmile/vs-piclist)

## Overview

`vs-piclist` is a feature-rich VSCode extension designed for seamless image management. This extension enables you to easily upload images to a remote hosting service and automatically insert the generated URL into your currently active file.

What sets `vs-piclist` apart from other solutions is its robust set of features, including image compression, watermarking, and other advanced image processing capabilities.

### Prerequisites

Before you can make use of `vs-piclist`, you must first install the desktop software, [PicList](https://github.com/Kuingsmile/PicList), or the [PicList-Core](https://github.com/Kuingsmile/piclist-core).

### Competitive Edge

While similar extensions like [vs-picgo](https://github.com/PicGo/vs-picgo) exist, which rely on [PicGo-Core](https://github.com/PicGo/PicGo-Core), `vs-piclist` offers a broader range of functionalities, providing a more comprehensive solution for your image management needs.

## Features

- **Effortless Uploads**: With just a few clicks, upload images to your preferred remote image hosting service.
- **Upload on Drag-and-Drop**: Drag-and-drop images from your file explorer directly into your working file.
- **Upload All**: Upload all images in a file.
- **Upload Selected**: Right-click to upload selected images.
- **Auto-Insert URLs**: The extension takes care of inserting the image URL directly into your working file.
- **Image Management**: Easily delete images stored in your remote hosting service directly through PicList in VSCode.
- **Advanced Image Processing**: Includes support for image compression, watermarking, and other post-upload manipulations.
- **Remote Server Mode**: Supports the use of PicList and piclist-core services running on a server or remote machine.

### Gif Demo

<details>
<summary>Uploading an image from clipboard</summary>
<img src="https://s2.loli.net/2023/08/31/XvZrtgiuWwLYIHy.gif" alt="clipboard.gif">
</details>

<details>
<summary>Uploading images from explorer</summary>
<img src="https://s2.loli.net/2023/08/31/npvwQoT4Ucr5mPN.gif" alt="explorer.gif">
</details>

<details>
<summary>Uploading images from local path or URL</summary>
<img src="https://s2.loli.net/2023/08/31/tAW54rVFhO2KSTo.gif" alt="input box.gif">
</details>

<details>
<summary>Uploading images on Drag-and-Drop</summary>
<img src="https://s2.loli.net/2023/09/01/rflXoJLsR5heDqK.gif" alt="input box.gif">
</details>

<details>
<summary>Delete images in your remote hosting service</summary>
<img src="https://s2.loli.net/2023/09/01/8oYzJinhgajLfdI.gif" alt="input box.gif">
</details>

<details>
<summary>Upload all images in a file</summary>
<img src="https://s2.loli.net/2024/06/16/9JDyICxZ3mUEBio.gif" alt="input box.gif">
</details>

<details>
<summary>Upload selected images in a file by right click</summary>
<img src="https://s2.loli.net/2024/06/16/GUVjraIWTuX2wgn.gif" alt="input box.gif">
</details>

## Settings

![setting](https://s2.loli.net/2023/08/31/vL7WgcDrxIGzZBR.webp)

### Upload API URL

This is the upload api URL of PicList, default is `http://127.0.0.1:36677/upload`, refer to [PicList Server](https://piclist.cn/en/advanced.html#use-of-built-in-server)

### Delete API URL

This is the delete api URL of PicList, default is `http://127.0.0.1:36677/delete`, refer to [PicList Server](https://piclist.cn/en/advanced.html#use-of-built-in-server)

### Copy Type

Default is markdown.

| type     | format                  |
| -------- | ----------------------- |
| url      | `url`                   |
| markdown | `![alt](url)`           |
| html     | `<img src=url alt=alt>` |
| ubb      | `[img]url[/img]`        |
| custom   | `custom`                |

### Custom Type

Default is `![$filename]($url)`.

### Encode URL

Whether to encode URL when insert text. Default is `false`.

### Enable upload on drop

Whether to enable upload on drop.Default is `true`.

### Remote Server Mode

When you deploy Piclist or Piclist-Core service on a server or other machine, you can enable remote server mode, and then upload requests will be initiated by sending files.

## Contributors

- [Kuingsmile](https://github.com/Kuingsmile)

## Dependencies

- [PicList](https://github.com/Kuingsmile/PicList)
- [PicList-Core](https://github.com/Kuingsmile/piclist-core)