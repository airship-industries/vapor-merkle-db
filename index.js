var pathJoin = require('path').join
var mkdirp = require('mkdirp')
var level = require('level-prebuilt')
var express = require('express')
var bodyParser = require('body-parser')
var passport = require('passport')
var LocalAPIKeyStrategy = require('passport-localapikey')
var Trie = require('merkle-patricia-tree')
var PORT = process.env.PORT || 7000

//
// initialization
//

// setup db
mkdirp(path('./db/'))
var stateDb = level(path('./db/state'))
var apiKeyDb = level(path('./db/apiKey'))

// setup server + auth
var app = express()
app.use(bodyParser.urlencoded({extended: false}))
// passport.use(new LocalAPIKeyStr  ategy(function(apikey, done) {
//   apiKeyDb.get(apikey, function(err, value){
//     // apiKey invalid
//     if (!value) return done(null, false)
//     // apiKey valid
//     done(null, value)
//   })
// }))
// app.use(passport.initialize())

//
// routes
//

// get value for key at root
app.get('/:root/:key', function(req, res){
  var root = req.params.root
  var key = req.params.key
  console.log('/:root/:key', 'root:', root, 'key:', key)
  var trie = new Trie(stateDb, root)
  trie.get(key, function (err, value) {
    if (err) return res.status(500).json({ error: err.message })
    res.send(value)
  })
})

// get trie for root
app.get('/:root', function(req, res){
  var root = req.params.root
  console.log('/:root', 'root:', root)
  var trie = new Trie(stateDb, root)
  trie.createReadStream().pipe(res)
})

// update value at key for root, get new root
app.post('/:root/:key', function(req, res){
  var root = req.params.root
  var key = req.params.key
  var value = req.body.value
  console.log('/:root/:key', 'root:', root, 'key:', key, 'value:', value)
  var trie = new Trie(stateDb, root)
  trie.put(key, value, function (err, value) {
    if (err) return res.status(500).json({ error: err.message })
    res.send(trie.root.toString('hex'))
  })
})

//
// start app
//

app.listen(PORT)

//
// util
//

function path(pathname) {
  return pathJoin(__dirname, pathname)
}