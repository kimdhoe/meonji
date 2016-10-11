const morgan = require('morgan')

const config = require('../config')

const installMiddlewares = app => {
  app.use(morgan(config.morgan))
}

module.exports = installMiddlewares
