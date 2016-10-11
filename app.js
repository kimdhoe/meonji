const express = require('express')
const axios   = require('axios')
const path    = require('path')

const config             = require('./config')
const installMiddlewares = require('./middlewares')
const { deliverSeoulData
      , deliverDistrictData
      , showStations
      , showHelp
      }                  = require('./controllers')

const app = express()

app.set('x-powered-by', false)
app.set('views',        path.join(__dirname, 'views'))
app.set('view engine',  'pug')

installMiddlewares(app)

app.get('/',         deliverSeoulData)
app.get('/seoul',    deliverSeoulData)
app.get('/stations', showStations)
app.get('/help',     showHelp)
app.get('/:station', deliverDistrictData)

module.exports = app
