'use strict'

let fs = require('fs')
let path = require('path')
let uniqid = require('uniqid')
let express = require('express')
let bodyParser = require('body-parser')

let app = express()

const COMMENTS_FILE = path.join(__dirname, 'comments.json')

app.set('port', (process.env.PORT || 3000))

app.use('/', express.static(path.join(__dirname, 'public/dist')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

function bail(err) {
  console.error(err)
  process.exit(1)
}

app.get('/api/comments', (req, res) => {
  fs.readFile(COMMENTS_FILE, (err, data) => {
    if (err) return bail(err)
    res.setHeader('Cache-Control', 'no-cache')
    res.json(JSON.parse(data))
  })
})

app.post('/api/comments', (req, res) => {
  fs.readFile(COMMENTS_FILE, (err, data) => {
    if (err) return bail()

    let comments = JSON.parse(data)
    comments.push({
      id: req.body.id || uniqid(),
      author: req.body.author,
      text: req.body.text,
    })
    fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), (err) => {
      if (err) return bail()
        
      res.setHeader('Cache-Control', 'no-cache')
      res.json(comments)
    })
  })
})


app.listen(app.get('port'), () => {
  console.log('go you localhost:' + app.get('port'))
})