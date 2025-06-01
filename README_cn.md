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
- **全部上传**：一键上传当前文件所有图片。
- **右键上传选中图片**：右键上传选中的图片。
- **自动插入链接**：上传后自动插入图片链接。
- **图片管理**：在 VSCode 内直接删除远程图床图片。
- **高级处理**：支持图片压缩、水印等后处理。
- **远程服务器模式**：支持通过远程 PicList 或 PicList-Core 服务上传。

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

默认：`![$filename]($url)`。

### URL 编码

插入链接时是否编码 URL。默认：`false`。

### 拖拽上传

是否启用拖拽上传。默认：`true`。

### 远程服务器模式

如在服务器或其他机器部署 PicList 或 PicList-Core，可开启远程模式，上传将以文件方式发送。

## 作者

- [Kuingsmile](https://github.com/Kuingsmile)

## 依赖

- [PicList](https://github.com/Kuingsmile/PicList)
- [PicList-Core](https://github.com/Kuingsmile/piclist-core)
