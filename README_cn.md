# vs-piclist

## 概览

`vs-piclist`是一个功能丰富的VSCode扩展，搭配PicList使用，可以轻松地将图像上传到各种图床，并自动将生成的URL插入到当前活动文件中。

`vs-piclist`通过和PicList配合使用，可以实现包括图像压缩，水印和其他高级图像处理功能。

### 先决条件

在使用`vs-piclist`之前，你必须先安装桌面软件[PicList](https://github.com/Kuingsmile/PicList)。

### 功能对比

尽管存在类似的扩展，如[vs-picgo](https://github.com/PicGo/vs-picgo)，其依赖于[PicGo-Core](https://github.com/PicGo/PicGo-Core)，但`vs-piclist`提供了更强大的功能，支持从图像处理、上传到云删除的一整套功能。

## 功能

- **轻松上传**：只需点击几下，即可将图像上传到您喜欢的远程图像托管服务。
- **自动插入URL**：扩展会自动将图像URL插入到您的工作文件中。
- **图像管理**：通过VSCode中的PicList轻松删除存储在远程托管服务中的图像。
- **高级图像处理**：包括对图像压缩、水印和其他上传后处理的支持。
- **远程服务器模式**：支持使用在服务器或远程机器上运行的PicList以及piclist-core服务。

### Gif 演示

<img src="https://s2.loli.net/2023/08/31/XvZrtgiuWwLYIHy.gif" alt="clipboard.gif">
<img src="https://s2.loli.net/2023/08/31/npvwQoT4Ucr5mPN.gif" alt="explorer.gif">
<img src="https://s2.loli.net/2023/08/31/tAW54rVFhO2KSTo.gif" alt="input box.gif">
<img src="https://s2.loli.net/2023/09/01/8oYzJinhgajLfdI.gif" alt="input box.gif">

## 设置

![setting](https://s2.loli.net/2023/08/31/vL7WgcDrxIGzZBR.webp)

### 上传API接口地址

这是PicList的上传api接口地址，默认为`http://127.0.0.1:36677/upload`，参考说明文档[PicList Server](https://piclist.cn/en/advanced.html#use-of-built-in-server)。

### 删除API接口地址

这是PicList的删除api接口地址，默认为`http://127.0.0.1:36677/delete`，参考说明文档[PicList Server](https://piclist.cn/en/advanced.html#use-of-built-in-server)。

### 粘贴格式

默认为markdown格式。

| 类型     | 格式                    |
| -------- | ----------------------- |
| url      | `url`                   |
| markdown | `![alt](url)`           |
| html     | `<img src=url alt=alt>` |
| ubb      | `[img]url[/img]`        |
| custom   | `custom`                |

### 自定义格式

默认为`![$filename]($url)`.

### URL编码

是否需要在插入时编码URL。

### 拖拽上传

是否开启拖拽上传。

### 远程服务器模式

当您在服务器或其它机器上部署了Piclist或Piclist-Core服务时，可开启远程服务器模式，此时将会通过发送文件的方式发起上传请求。

## 作者

- [Kuingsmile](https://github.com/Kuingsmile)

## 依赖

- [PicList](https://github.com/Kuingsmile/PicList)
- [PicList-Core](https://github.com/Kuingsmile/piclist-core)
