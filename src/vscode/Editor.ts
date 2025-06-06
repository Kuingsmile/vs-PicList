import * as vscode from 'vscode'

export class Editor {
  static get editor() {
    return vscode.window.activeTextEditor
  }

  static async writeToEditor(text: string) {
    const editor = this.editor
    return await editor?.edit(editBuilder => {
      editBuilder.replace(editor.selection, text)
    })
  }
}
