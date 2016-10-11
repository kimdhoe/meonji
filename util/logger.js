const config = require('../config')

const red      = s => '\u001b[31m' + s + '\u001b[39m'
const green    = s => '\u001b[32m' + s + '\u001b[39m'
const yellow   = s => '\u001b[33m' + s + '\u001b[39m'
const blue     = s => '\u001b[34m' + s + '\u001b[39m'
const cyan     = s => '\u001b[36m' + s + '\u001b[39m'
const bgYellow = s => '\u001b[43m' + s + '\u001b[49m'


const noOp = () => {}
const logXs = xs => console.log(...xs)

const consoleLog = config.shouldLog ? logXs : () => {}

const logInfo = (...xs) => {
  const tag = green('[* LOG *]')

  const format = x =>
    typeof x === 'object'
      ? `${tag}  ${cyan(JSON.stringify(x, null, 2))}`
      : `${tag}  ${cyan(x)}`

  consoleLog(xs.map(format))
}

const logError = (...es) => {
  const format = e => {
    e          = e.stack || e
    const name = e.name  || 'ERR'
    const tag  = yellow(`[* ${name} *]`)

    return `${tag}  ${red(e)}`
  }

  consoleLog(es.map(format))
}

module.exports = { logInfo
                 , logError
                 , red
                 , green
                 , yellow
                 , blue
                 , cyan
                 , bgYellow
                 }
