const net = require('net')
const hat = require('hat')
const HostTrie = require('remote-merkle-patricia-tree/host')
const prettyHrtime = require('pretty-hrtime')

module.exports = remoteDbServer


function remoteDbServer(port, db, cb) {

  var server = net.createServer(onConnect)
  server.listen(port, cb)
  return server

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

