const level = require('level')
const trieServer = require('./server.js')
const port = 9000

var db = level('./db')

trieServer(port, db, function(){
  console.log('MerklePatriaServer listening on '+port)
})