const test = require('tape')
const net = require('net')
const RemoteTrie = require('remote-merkle-patricia-tree/remote')
const trieServer = require('../server.js')
const port = 7001

test('basic functionality', function(t){
  t.plan(7)

  var server = trieServer(port, null, function(){

    console.log('TrieServer listening on '+port)
    var transport = net.connect(port)
    console.log('connecting to '+port)
    var trie = new RemoteTrie()
    transport.pipe(trie.createNetworkStream()).pipe(transport)

    function closeServer(){
      server.close()
      transport.end()
    }

    var rootInitial = '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421'
    var rootAfterWrite = '3af29acb397a840bdd98fed6e3cb066b5a0b5c379c04ed968e1ede754ab1ace0'

    trie.checkpoint()
    t.equal(trie.root.toString('hex'), rootInitial, 'root matches expected')
    trie.put('beans', 'cakes', function(){
      t.equal(trie.root.toString('hex'), rootAfterWrite, 'root matches expected')
      trie.get('beans', function(err, result){
        t.equal(trie.root.toString('hex'), rootAfterWrite, 'root matches expected')
        t.equal(result.toString(), 'cakes', 'value is as set, "cakes"')
        trie.revert(function(){
          t.equal(trie.root.toString('hex'), rootInitial, 'root matches expected')
          trie.get('beans', function(err, result){
            t.equal(trie.root.toString('hex'), rootInitial, 'root matches expected')
            t.equal(result, null, 'value returned to unwritten state')
            closeServer()
          })
        })
      })
    })

  })

})