var request = require('request')
var Trie = require('merkle-patricia-tree')
var async = require('async')
var _ = require('lodash')

// 56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421
var emptyStateRoot = (new Trie()).EMPTY_TRIE_ROOT.toString('hex')
var targetKey = '0abc'
var targetValue = 'hello world'

async.waterfall([
  _.curry(setState)(emptyStateRoot, targetKey, targetValue),
  _.curry(getState)(_, targetKey),
], function(err, result){
  console.log('did it work?', (result === targetValue))
})

function setState(root, key, value, cb){

  request.post({
    url: 'http://localhost:7000/'+root+'/'+key,
    form: { value: value },
  }, function(err, resp, body){
    cb(err, body)
  })

}

function getState(root, key, cb){
  request.get({
    url: 'http://localhost:7000/'+root+'/'+key,
  }, function(err, resp, body){
    cb(err, body)
  })

}
