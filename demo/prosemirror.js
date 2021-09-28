/* eslint-env browser */

import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { WebsocketProvider }  from 'y-websocket'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from '../src/y-prosemirror.js'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from './schema.js'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'

window.addEventListener('load', () => {
  const ydoc = new Y.Doc()
  // const provider = new WebrtcProvider('prosemirror-debug', ydoc)
  const websocketProvider = new WebsocketProvider(
    'ws://157.230.101.10:1234', 'count-demo', ydoc
    // 'ws://localhost:1234', 'count-demo', ydoc
  )
  const type = ydoc.getXmlFragment('prosemirror')

  const editor = document.createElement('div')
  editor.setAttribute('id', 'editor')
  const editorContainer = document.createElement('div')
  editorContainer.insertBefore(editor, null)
  const prosemirrorView = new EditorView(editor, {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(type),
        yCursorPlugin(websocketProvider.awareness),
        yUndoPlugin(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo
        })
      ].concat(exampleSetup({ schema }))
    })
  })
  document.body.insertBefore(editorContainer, null)

  const connectBtn = /** @type {HTMLElement} */ (document.getElementById('y-connect-btn'))
  connectBtn.addEventListener('click', () => {
    if (websocketProvider.shouldConnect) {
      websocketProvider.disconnect()
      connectBtn.textContent = 'Connect'
    } else {
      websocketProvider.connect()
      connectBtn.textContent = 'Disconnect'
    }
  })

  // @ts-ignore
  window.example = { websocketProvider, ydoc, type, prosemirrorView }
})
