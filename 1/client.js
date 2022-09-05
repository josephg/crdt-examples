import * as crdt from './crdt.js'

let db = crdt.create ? crdt.create() : {}

let ws = null

const rerender = () => {
  const valueElem = document.getElementById('value')
  valueElem.textContent = db
}

const decrButton = document.getElementById('decrement')
const incrButton = document.getElementById('increment')

incrButton.onclick = () => {
  db = crdt.merge(db, db + 1)
  send(db)
  rerender()
}

decrButton.onclick = () => {
  db = crdt.merge(db, db - 1)
  send(db)
  rerender()
}


function send(msg) {
  if (ws != null && ws.readyState == WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

const connect = () => {
  const loc = window.location
  const url = (loc.protocol === 'https:' ? 'wss://' : 'ws://')
    + loc.host
    + loc.pathname
    + 'ws'
  ws = new WebSocket(url)
  ws.onopen = (e) => {
    console.log('open', e)
    send(db)
  }

  ws.onmessage = (e) => {
    const op = JSON.parse(e.data)
    console.log('data', op)
    db = crdt.merge(db, op)
    rerender()
  }
  
  ws.onclose = (e) => {
    console.log('WS closed', e)
    ws = null
    setTimeout(() => {
      connect()
    }, 3000)
  }

  ws.onerror = (e) => {
    console.error('WS error', e)
  }
}

connect()
