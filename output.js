//      .-=====-.
//     ’         `
//    | .-.   .-. |
//    |( x ) ( x )|
//    \ `-’   `-’ /
//  ,-.\  ,---.  /,-.
//  | |--| ::: |--| |
//  | |--| ::: |--| |
//  `-’   `---’   `-’

const axios     = require('axios')
const stripAnsi = require('strip-ansi')
const moment    = require('moment')

const config = require('./config')
const { red
      , green
      , blue
      , yellow
      , cyan
      , bgYellow
      }      = require('./util/logger')

moment.locale('ko')

const momentFormet = 'MM월 DD일 a h시'

// A Chunk is an [Array-of String].
//   All strings have the same length.
//   e.g. [ 'aa '
//        , 'bbb'
//        , 'c  '
//        ]
//
// A Grade is one of:
//   - '좋음'
//   - '보통'
//   - '나쁨'
//   - '매우나쁨'

// 1string * integer -> string
// Repeats c to build a string of length n.
const chars = (c, n) =>
  n === 0 ? '' : c + chars(c, n - 1)

// string * 1string * integer -> string
// Appends n chars to str.
const appendChars = (str, char, n) =>
  str + chars(char, n)

// string * 1string * integer -> string
// Preppends n chars to str.
const prependChars = (str, char, n) =>
  chars(char, n) + str

// Array<string> * boolean -> Array<string>
// Makes all strings in ss to be of the same length.
// If shouldPrepend is true, pads spaces to the front of the string.
const padSpaces = (ss, shouldPrepend) => {
  const l = Math.max.apply(null, ss.map(s => stripAnsi(s).length))
  const pad = shouldPrepend ? prependChars : appendChars

  return ss.map(s => pad(s, ' ', l - stripAnsi(s).length))
}

// Array<string> * boolean -> Chunk
// Given an array of strings, produces a (sanitized) chunk.
const makeChunk = (ss, shouldAlignRight) =>
  padSpaces(ss, shouldAlignRight)

// Chunk * Chunk -> Chunk
// Merges the given two chunks. Each chunk becomes a column.
const merge = (xs, ys) => {
  const longer      = xs.length > ys.length ? xs : ys
  const shorter     = xs.length > ys.length ? ys : xs
  const t           = longer.length
  const placeholder = chars(' ', stripAnsi(shorter[0]).length)
  const result      = []

  for (let i = 0; i < t; i++) {
    const x = xs[i] || placeholder
    const y = ys[i] || placeholder

    result.push(x + '' + y)
  }

  return result
}

// ...Chunk -> Chunk
// Merges the given chunks.
const mergeChunks = (...chunks) =>
  chunks.reduce(merge)

// Chunk -> string
// Produces a string representation of a given chunk.
const showChunk = chunk =>
  chunk.join('\n') + '\n'

const FACE_GOOD = [ blue('o o')
                  , blue(' ‿')
                  ]
const FACE_MODERATE  = [ green("o o")
                       , green("---")
                       ]
const FACE_UNHEALTHY = [ yellow(' x  x')
                       , yellow('=') + bgYellow(yellow("[  ]")) + yellow('=')
                       ]
const FACE_VERY_UNHEALTHY = [ red("  ,----.")
                            , red("  |⊙  ⊙|")
                            , red("[]=(::)=[]")
                            ]

// Grade -> Chunk
const getFace = grade => {
  switch (grade) {
    case '좋음':
      return mergeChunks( makeChunk(FACE_GOOD)
                        , [ blue('    좋음') ]
                        )
    case '보통':
      return mergeChunks( makeChunk(FACE_MODERATE)
                        , [ green('    보통') ]
                        )
    case '나쁨':
      return mergeChunks( makeChunk(FACE_UNHEALTHY)
                        , [ yellow('    나쁨') ]
                        )
    case '매우나쁨':
      return mergeChunks( makeChunk(FACE_VERY_UNHEALTHY)
                        , [ red('    매우 나쁨') ]
                        )
  }
}

// Grade -> string
// Given a grade string, produces a colored grade string.
const grade = x =>
  x === '좋음'    ? blue(x)   :
  x === '보통'    ? green(x)  :
  x === '나쁨'    ? yellow(x) :
  x === '매우나쁨' ? red(x)    :
                   '-'

//    number * number * number * number * number * number * number
// -> (number -> string)
// Given the gradations, produces a function that colorizes a given value.
const makeChalk = (a, b, c, d, e, f, g) => v => {
  n = Number(v)

  return a <= n && n <= b ?   blue(v) :
         c <= n && n <= d ?  green(v) :
         e <= n && n <= f ? yellow(v) :
         g <= n           ?    red(v) :
                                   v
}

// number -> string
const pm10 = makeChalk(0, 30,    31,     80,    81,     150,    151    )
const pm25 = makeChalk(0, 15,    16,     50,    51,     100,    101    )
const o3   = makeChalk(0,  0.03,  0.031,  0.09,  0.091,   0.15,   0.151)
const no2  = makeChalk(0,  0.03,  0.031,  0.06,  0.061,   0.2,    0.201)
const co   = makeChalk(0,  2,     2.01,   9,     9.01,   15,     15.01 )
const so2  = makeChalk(0,  0.02,  0.021,  0.05,  0.051,   0.15,   0.151)

// string -> string? -> string
// Renders header.
// Assume time is a formatted string: YYYYMMDDhhmm
const renderHeader = (station, time) => {
  const when = time ?   ' ('
                      + moment(time.substring(0, 8) + 'T' + time.substring(8))
                          .format(momentFormet)
                      + ' 기준)'
                    : ''

  return ' ' + cyan(station) + ' 공기 상태' + when + ':\n\n'
}

const tableLeft   = () => makeChunk([ '┌', '│', '├', '│', '└' ])
const tableMiddle = () => makeChunk([ '┬', '│', '┼', '│', '┴' ])
const tableRight  = () => makeChunk([ '┐', '│', '┤', '│', '┘' ])
const tableColumn = (heading, data) =>
  makeChunk([ '───────────'
            , heading
            , '───────────'
            , ' ' + data
            , '───────────'
            ]
           )

// Renders body.
const renderCurrent = data => {
  if (!data)
    return '     ?\n'

  if (data.GRADE === '점검중')
    return '     점검 중\n'

  return showChunk(mergeChunks( [ '     ']
                              , getFace(data.GRADE)
                              )
                  )
       + '\n'
       + showChunk(mergeChunks( [ '     ' ]
                              , tableLeft()
                              , tableColumn( '   PM-10'
                                           , pm10(data.PM10) +' µg/m³'
                                           )
                              , tableMiddle()
                              , tableColumn( '  PM-2.5'
                                           , pm25(data.PM25) +' µg/m³'
                                           )
                              , tableMiddle()
                              , tableColumn( '    O3'
                                           , o3(data.OZONE) +' ppm'
                                           )
                              , tableMiddle()
                              , tableColumn( '   NO2'
                                           , no2(data.NITROGEN) +' ppm'
                                           )
                              , tableMiddle()
                              , tableColumn( '    CO'
                                           , co(data.CARBON) +' ppm'
                                           )
                              , tableMiddle()
                              , tableColumn( '   SO2'
                                           , so2(data.SULFUROUS) +' ppm'
                                           )
                              , tableRight()
                              )
                  )
  }

const renderForecast = (data, title) => {
  if (!data)
    return '     ?\n'

  const level       = data.FA_ON === 'f' ? data.CAISTEP    : data.ALERTSTEP
  const instruction = data.FA_ON === 'f' ? '' : data.CNDT1
  const time        = moment( data.APPLC_DT.substring(0, 8)
                            + 'T'
                            + data.APPLC_DT.substring(8)
                            )
  const now         = new Date()
  const when        = time.hour() <  17           ? '오늘' :
                      time.hour() >= 17
                   && now.getDate() > time.date() ? '오늘' :
                                                    '내일'

  return '     ' + when + ' ' + title + ' '
       + grade(level) + '\n'
       + (instruction ? '         ' + instruction : '') + '\n'
}

const renderForecasts = (pm10, pm25) =>
    '\n 서울시 예보:\n\n'
  + renderForecast(pm10, 'PM-10 ')
  + renderForecast(pm25, 'PM-2.5')

const renderBody = (current, pm10, pm25) =>
    renderCurrent(current)
  + renderForecasts(pm10, pm25)

// Renders footer.
const renderFooter = () =>
  ' 자료 제공: Air Korea\n'

// Renders stations list.
const renderStationList = districts => {
  const col1 = makeChunk(districts.map(x => '    ' + x[0]))
  const col2 = makeChunk(districts.map(x => '  ' + x[1]))
  const col3 = makeChunk(districts.map(x => '  ' + x[2]))
  const col4 = makeChunk(districts.map(x => '   # ' + x[3]))

  return   ' 자치구 표기법:\n'
         + '\n'
         + showChunk(mergeChunks(col1, col2, col3, col4))
         + '\n'
         + ' 예시:\n'
         + '\n'
         + `    $ curl ${config.url}/${cyan('jongno')}     # 종로구 공기 상태\n`
         + `    $ curl ${config.url}/${cyan('jongnogu')}   # 종로구 공기 상태\n`
         + `    $ curl ${config.url}/${cyan('111123')}     # 종로구 공기 상태\n`
}

// Renders help page.
const renderHelp = () => {
  const url = config.url
  const view =
      `사용법:\n`
    + `\n`
    + `    $ ${cyan('curl ' + url)}              # 서울시 평균 공기 상태\n`
    + `    $ ${cyan('curl ' + url + '/<district>')}   # 자치구별 공기 상태\n`
    + `\n`
    + `자치구 표기법:\n`
    + `\n`
    + `    $ ${cyan('curl ' + url + '/stations')}     # 자치구 코드 목록\n`
    + `\n`
    + `    <district>는 세 가지 방식 중 하나로 표기할 수 있습니다.\n`
    + `\n`
    + `        - 이름:\n`
    + `            jongno, gangnam, ...\n\n`
    + `        - 이름-gu:\n`
    + `            jongnogu, gangnamgu, ...\n\n`
    + `        - 코드:\n`
    + `            111123, 111261, ...\n`
    + `\n`
    + `예시:\n`
    + `\n`
    + `    $ curl ${url}/jongno\n`
    + `    $ curl ${url}/jongnogu\n`
    + `    $ curl ${url}/111123\n`
    + `\n`
    + `도움말:\n`
    + `\n`
    + `    $ ${cyan('curl ' + url + '/help')}         # 지금 보고 있는 도움말\n`

  return view
}

module.exports = { renderHeader
                 , renderFooter
                 , renderBody
                 , renderForecasts
                 , renderStationList
                 , renderHelp
                 }
