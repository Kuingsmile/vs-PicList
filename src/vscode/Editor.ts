import * as vscode from 'vscode'

export class Editor {
  static get editor() {
    return vscode.window.activeTextEditor
  }

  static getSelectedText(editor = this.editor) {
    return editor?.document.getText(editor.selection)
  }

  /**
   * Replaces the selection in an editor showing `editor`'s document, which may have been replaced by another
   * editor object if the user switched tabs during an upload. Returns `false` if the document is not visible.
   */
  static async writeToEditor(text: string, editor = this.editor): Promise<boolean> {
    if (!editor) return false
    const { visibleTextEditors } = vscode.window
    const target = visibleTextEditors.includes(editor)
      ? editor
      : visibleTextEditors.find(item => item.document === editor.document)
    if (!target) return false
    return await target.edit(editBuilder => {
      editBuilder.replace(target.selection, text)
    })
  }
}
