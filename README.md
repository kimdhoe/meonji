# MeonJi

서울시 대기 환경 정보를 터미널에서 바로 볼 수 있는 형태로 제공합니다.

## 사용법

```shell
$ curl meonji.cafe24app.com               # 서울시 평균 공기 상태
$ curl meonji.cafe24app.com/seoul         # 서울시 평균 공기 상태
$ curl meonji.cafe24app.com/<district>    # 자치구별 공기 상태
```

## 자치구 표기법

`<district>`는 세 가지 방식 중 하나로 표기할 수 있습니다.

  - 이름: `jongno, gangnam, ...`
  - 이름-gu: `jongnogu, gangnamgu, ...`
  - 코드: `111123, 111261, ...`

## 예시

```shell
$ curl meonji.cafe24app.com/jongno
$ curl meonji.cafe24app.com/jongnogu
$ curl meonji.cafe24app.com/111123
```

## 자치구 코드 목록

```shell
$ curl meonji.cafe24app.com/stations  # 자치구 코드 목록
```

|          | 1            | 2              | 3      |
|:--------:|:--------------:|:--------------:|:------:|
|   종로   |    `jongno`    |    `jongnogu`    | `111123` |
|   중구   |     `jung`     |     `junggu`     | `111121` |
|  용산구  |    `yongsan`   |    `yongsangu`   | `111131` |
|  성동구  |   `seongdong`  |   `seongdonggu`  | `111142` |
| 광진구   | `gwangjin`     | `gwangjingu`     | `111141` |
| 동대문구 | `dongdaemun`   | `dongdaemungu`   | `111141` |
| 중랑구   | `jungnang`     | `jungnanggu`     | `111151` |
| 성북구   | `seongbuk`     | `seongbukgu`     | `111161` |
| 강북구   | `gangbuk`      | `gangbukgu`      | `111291` |
| 도봉구   | `dobong`       | `dobonggu`       | `111171` |
| 노원구   | `nowon`        | `nowongu`        | `111311` |
| 은평구   | `eunpyeong`    | `eunpyeonggu`    | `111181` |
| 서대문구 | `seodaemun`    | `seodaemungu`    | `111191` |
| 마포구   | `mapo`         | `mapogu`         | `111201` |
| 양천구   | `yangcheon`    | `yangcheongu`    | `111301` |
| 강서구   | `gangseo`      | `gangseogu`      | `111212` |
| 구로구   | `guro`         | `gurogu`         | `111221` |
| 금천구   | `geumcheon`    | `geumcheongu`    | `111281` |
| 영등포구 | `yeongdeungpo` | `yeongdeungpogu` | `111231` |
| 동작구   | `dongjak`      | `dongjakgu`      | `111241` |
| 관악구   | `gwanak`       | `gwanakgu`       | `111251` |
| 서초구   | `seocho`       | `seochogu`       | `111262` |
| 강남구   | `gangnam`      | `gangnamgu`      | `111261` |
| 송파구   | `songpa`       | `songpagu`       | `111273` |
| 강동구   | `gangdong`     | `gangdonggu`     | `111274` |

## 도움말

```shell
$ curl meonji.cafe24app.com/help    # 지금 보고 있는 도움말
```
