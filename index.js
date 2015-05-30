var pathJoin = require('path').join
var mkdirp = require('mkdirp')
var hat = require('hat')
var level = require('level-prebuilt')
var express = require('express')
var bodyParser = require('body-parser')
var passport = require('passport')
var BearerStrategy = require('passport-http-bearer')
var Trie = require('merkle-patricia-tree')
var PORT = process.env.PORT || 7000
var ADMIN_TOKEN = process.env.ADMIN_TOKEN

//
// initialization
//

if (!ADMIN_TOKEN) throw new Error('No admin token specified.')

// setup db
mkdirp(path('./db/'))
var stateDb = level(path('./db/state'))
var apiKeyDb = level(path('./db/apiKey'))

// setup server
var app = express()
app.use(bodyParser.urlencoded({extended: false}))

// setup auth
var apiAuth = new BearerStrategy(lookupToken)
var adminAuth = new BearerStrategy(checkAdmin)
adminAuth.name = 'admin'

passport.use(apiAuth)
passport.use(adminAuth)

function lookupToken(token, cb) {
  if (token === ADMIN_TOKEN) return cb(null, true)
  apiKeyDb.get(token, function(err, data){
    if (err) return cb(null, null)
    cb(null, JSON.parse(data))
  })
}

function checkAdmin(token, cb) {
  var isValid = (token === ADMIN_TOKEN)
  cb(null, isValid)
}

//
// tree op routes
//

// get value for key at root
app.get('/:root/:key', function(req, res){
  console.log(req.params)
  var root = req.params.root
  var key = req.params.key
  console.log('GET /:root/:key', 'root:', root, 'key:', key)
  var trie = new Trie(stateDb, root)
  trie.get(key, function (err, value) {
    if (err) return res.status(500).json({ error: err.message })
    res.send(value)
  })
})

// get trie for root
app.get('/:root', function(req, res){
  var root = req.params.root
  console.log('GET /:root', 'root:', root)
  var trie = new Trie(stateDb, root)
  trie.createReadStream().pipe(res)
})

// update value at key for root, get new root
app.post('/:root/:key', passport.authenticate('bearer', { session: false }), function(req, res){
  var root = req.params.root
  var key = req.params.key
  var value = req.body.value
  console.log('POST /:root/:key', 'root:', root, 'key:', key, 'value:', value)
  var trie = new Trie(stateDb, root)
  trie.put(key, value, function (err, value) {
    if (err) return res.status(500).json({ error: err.message })
    res.send(trie.root.toString('hex'))
  })
})

//
// admin
//

// create api key
app.post('/access_token', passport.authenticate('admin', { session: false }), function(req, res){
  var accessToken = {
    uuid: hat(),
    createdAt: Date(),
    ip: req.ip,
  }
  console.log('ACCESS TOKEN', accessToken)
  apiKeyDb.put(accessToken.uuid, JSON.stringify(accessToken), function (err, value) {
    if (err) return res.status(500).json({ error: err.message })
    res.send(accessToken.uuid)
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