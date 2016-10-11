const merge = require('lodash/merge')

const DEVELOPMENT = 'development'
const TESTING     = 'testing'
const PRODUCTION  = 'production'

const base = { env:    ''
             , port:   process.env.PORT || 8080
             , url:    'meonji.cafe24app.com'
             , apiKey: process.env.API_KEY
             }

process.env.NODE_ENV = process.env.NODE_ENV || DEVELOPMENT
base.env             = process.env.NODE_ENV

let envConfig = {}

try {
  envConfig = require(`./${base.env}`)
} catch (e) {
  console.log(`No configuration file for ${base.env}`)
}

const config = merge(base, envConfig)

module.exports = config
