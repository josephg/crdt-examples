import * as crdt from './crdt.js'

let db = crdt.create ? crdt.create() : {}

let ws = null

const rerender = () => {
  const valueElem = document.getElementById('value')
  valueElem.textContent = db.length === 1
    ? db[0].value
    : `[${db.map(({value}) => value).join(', ')}]`
  console.log(db)

  const rawElem = document.getElementById('raw')
  rawElem.innerText = `
Internal: ${JSON.stringify(db, null, 2)}
`
}

const setLastOp = op => {
  const lastElem = document.getElementById('last')
  lastElem.innerText = `
Last: ${JSON.stringify(op, null, 2)}
`
}


const form = document.getElementById('form')
const textElem = document.getElementById('text')

form.onsubmit = (e) => {
  console.log('submit!', textElem.value)

  const op = crdt.set(db, textElem.value || '')
  setLastOp(op)
  db = crdt.merge(db, op)
  send(op)
  rerender()

  e.preventDefault()
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
    // send(db)
  }

  ws.onmessage = (e) => {
    const op = JSON.parse(e.data)
    console.log('data', op)
    setLastOp(op)
    if (op.supercedes == null) {
      db = op
    } else {
      db = crdt.merge(db, op)
    }
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
    // ws = null
  }
}

connect()
