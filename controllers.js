const axios = require('axios')
const { ansi_to_html
      , escape_for_html
      }     = require('ansi_up')

const config      = require('./config')
const { logInfo } = require('./util/logger')
const { renderHeader
      , renderBody
      , renderForecasts
      , renderFooter
      , renderStationList
      , renderHelp
      }           = require('./output')

const seoulApiUrl = 'http://openAPI.seoul.go.kr:8088/' + config.apiKey
const districts = [ ['jongno',       'jongnogu',       '111123', '종로구']
                  , ['jung',         'junggu',         '111121', '중구']
                  , ['yongsan',      'yongsangu',      '111131', '용산구']
                  , ['seongdong',    'seongdonggu',    '111142', '성동구']
                  , ['gwangjin',     'gwangjingu',     '111141', '광진구']
                  , ['dongdaemun',   'dongdaemungu',   '111152', '동대문구']
                  , ['jungnang',     'jungnanggu',     '111151', '중랑구']
                  , ['seongbuk',     'seongbukgu',     '111161', '성북구']
                  , ['gangbuk',      'gangbukgu',      '111291', '강북구']
                  , ['dobong',       'dobonggu',       '111171', '도봉구']
                  , ['nowon',        'nowongu',        '111311', '노원구']
                  , ['eunpyeong',    'eunpyeonggu',    '111181', '은평구']
                  , ['seodaemun',    'seodaemungu',    '111191', '서대문구']
                  , ['mapo',         'mapogu',         '111201', '마포구']
                  , ['yangcheon',    'yangcheongu',    '111301', '양천구']
                  , ['gangseo',      'gangseogu',      '111212', '강서구']
                  , ['guro',         'gurogu',         '111221', '구로구']
                  , ['geumcheon',    'geumcheongu',    '111281', '금천구']
                  , ['yeongdeungpo', 'yeongdeungpogu', '111231', '영등포구']
                  , ['dongjak',      'dongjakgu',      '111241', '동작구']
                  , ['gwanak',       'gwanakgu',       '111251', '관악구']
                  , ['seocho',       'seochogu',       '111262', '서초구']
                  , ['gangnam',      'gangnamgu',      '111261', '강남구']
                  , ['songpa',       'songpagu',       '111273', '송파구']
                  , ['gangdong',     'gangdonggu',     '111274', '강동구']
                  ]
const codes = districts.reduce( (acc, x) => {
                                  acc[x[0]] = acc[x[1]] = acc[x[2]] = x[2]
                                  return acc
                                }
                              , {}
                              )

const fetchSeoulData = () =>
  axios
    .get(seoulApiUrl + '/json/ListAvgOfSeoulAirQualityService/1/5/')
    .then(x => x.data.ListAvgOfSeoulAirQualityService.row[0])
    .catch(err => { console.error(err) })

const fetchDistrictData = code =>
  axios
    .get(seoulApiUrl + '/json/ListAirQualityByDistrictService/1/5/' + code)
    .then(x => x.data.ListAirQualityByDistrictService.row[0])
    .catch(err => { console.error(err) })

const fetchPM10Forecast = () =>
  axios
    .get(seoulApiUrl + '/json/ForecastWarningMinuteParticleOfDustService/1/1/')
    .then(x => x.data.ForecastWarningMinuteParticleOfDustService.row[0])
    .catch(err => { console.error(err) })

const fetchPM25Forecast = () =>
  axios
    .get( seoulApiUrl
        + '/json/ForecastWarningUltrafineParticleOfDustService/1/5/'
        )
    .then(x => x.data.ForecastWarningUltrafineParticleOfDustService.row[0])
    .catch(err => { console.error(err) })

const isTerminalAgent = userAgentStr =>
  /curl|wget|httpie|lwp-request/i.test(userAgentStr)

const sendView = (req, res, view) => {
  if (isTerminalAgent(req.headers['user-agent']))
    res.send(view)
  else
    res.render('index', { contents: ansi_to_html(escape_for_html(view)) })
}

const showStations = (req, res) => {
  sendView(req, res, renderStationList(districts))
}

const showHelp = (req, res) => {
  sendView(req, res, renderHelp())
}

const deliverSeoulData = (req, res) => {
  const seoul = fetchSeoulData()
  const pm10  = fetchPM10Forecast()
  const pm25  = fetchPM25Forecast()

  Promise.all([ seoul, pm10, pm25 ])
    .then(([ seoulData, pm10Data, pm25Data ]) => {
      const view = renderHeader('서울시')
                 + renderBody(seoulData, pm10Data, pm25Data)
                 + renderFooter()

      sendView(req, res, view)
    })
    .catch(err => {
      console.error(err)
    })
}

const deliverDistrictData = (req, res) => {
  const stationCode = codes[req.params.station.toLowerCase()]

  if (!stationCode)
    return showHelp(req, res)

  const district    = fetchDistrictData(stationCode)
  const pm10        = fetchPM10Forecast()
  const pm25        = fetchPM25Forecast()

  Promise.all([ district, pm10, pm25 ])
    .then(([ districtData, pm10Data, pm25Data ]) => {
      const view = renderHeader(districtData.MSRSTENAME, districtData.MSRDATE)
                 + renderBody(districtData, pm10Data, pm25Data)
                 + renderFooter()

      sendView(req, res, view)
    })
    .catch(err => {
      console.error(err)
    })
}

module.exports = { deliverSeoulData
                 , deliverDistrictData
                 , showStations
                 , showHelp
                 }
