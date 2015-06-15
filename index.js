const level = require('level')
const trieServer = require('./server.js')
const port = 7001

var db = level('./db')

trieServer(port, db, function(){
  console.log('TrieServer listening on '+port)
})