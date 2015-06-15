const http = require('http')
const hat = require('hat')
const websocket = require('websocket-stream')
const HostTrie = require('remote-merkle-patricia-tree/host')
const prettyHrtime = require('pretty-hrtime')

module.exports = remoteDbServer


function remoteDbServer(port, db, cb) {

  var server = http.createServer()
  websocket.createServer({ server: server }, onConnect)
  server.listen(port, cb)

  function onConnect(duplex) {

    var id = hat()
    var start = process.hrtime()
    console.log(id, '- connected')
    var trie = new HostTrie(db)
    duplex.pipe(trie.createNetworkStream()).pipe(duplex)
    duplex.on('end', function(){
      var duration = process.hrtime(start)
      console.log(id, '- disconnected', prettyHrtime(duration))
    })

  }

}

