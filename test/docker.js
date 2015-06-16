const websocket = require('websocket-stream')
const trieServer = require('../server.js')
const RemoteTrie = require('remote-merkle-patricia-tree/remote')
const port = 7001

var ws = websocket('ws://192.168.59.103:'+port)
var trie = new RemoteTrie()
ws.pipe(trie.createNetworkStream()).pipe(ws)

trie.checkpoint()
trie.put('beans', 'cakes', function(){
  trie.get('beans', function(err, result){
    console.log(result.toString())
    trie.revert(function(){
      trie.get('beans', function(err, result){
        console.log(result && result.toString())
        process.exit()
      })
    })
  })
})

