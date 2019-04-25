var keys = {
  test: process.env.STRIPE_TEST_SECRET_KEY || '',
  live: process.env.STRIPE_LIVE_SECRET_KEY || ''
}

var express = require('express')
var request = require('request')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/test', function(request, response) {
  stripe_callback('test', request.query.code, response)
})

app.get('/live', function(request, response) {
  stripe_callback('live', request.query.code, response)
})

function stripe_callback(keyType, code, response) {
  var key = keys[keyType]

  if (!key) {
    console.error(`Unset ${keyType} key`)
    response.send(`Unset ${keyType} key`)
    return
  }

  console.log(`Received code: ${code}`)
  console.log(`Using ${keyType} key`)
  request.post('https://connect.stripe.com/oauth/token', {
    json: {
      client_secret: key,
      code: code,
      grant_type: 'authorization_code'
    }
  }, (error, res, body) => {
    var safeBody
    if (error) {
      console.error(error)
      return
    }
    console.log(`statusCode: ${res.statusCode}`)
    console.log(body)

    safeBody = JSON.stringify(body).replace(key, '[key]')
    if (res.statusCode == 200) {
      response.send(`Success: <pre>${safeBody}</pre>`)
    }
    else {
      response.send(`Error: <pre>${safeBody}</pre>`)
    }
  })
}

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
