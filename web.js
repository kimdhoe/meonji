const app         = require('./app')
const config      = require('./config')
const { logInfo } = require('./util/logger')

app.listen( config.port
          , () => { logInfo(`Listening on port ${config.port}.`) }
          )
