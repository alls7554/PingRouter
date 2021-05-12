# PingRouter (V 1.1.1)

### You must `npm install` after cloning.

### 1. Structure of directory

```bash
└─ PingRouter
      │
      ├── README.md                     - root 리드미 파일
      ├── app.js                        - Node.js server 파일
      ├── package.json                  - 해당 프로젝트의 정보와 사용된 모듈이 담긴 파일
      ├── .gitignore                    - 일부 파일 및 폴더를 git에 올리지 않기 위해 작성한 파일
      │
      ├── public/                       - css, javascript등 static파일이 모여 있는 폴더
      │     ├── stylesheets/            - stylesheet를 모아둔 폴더
      │     │        ├── style.css      - 기본적인 태그의 스타일 속성을 담아둔 stylesheet
      │     │        └── clock.css      - 로딩화면과 관련된 스타일 속성을 담아둔 stylesheet
      │     │
      │     ├── javascripts/            - javascript를 모아둔 폴더
      │     │        ├── disabled.js    - 각 상황에 버튼을 비활성화 시키는 기능을 담은 javascript
      │     │        ├── download.js    - 테스트 기록을 엑셀 파일로 만드는 기능을 담은 javascript
      │     │        ├── loading.js     - 로딩화면을 보여주고 사라지게 하는 기능을 담은 javascript
      │     │        ├── myChart.js     - 테스트를 차트로 나타내기 위한 옵션과 기능을 담은 javascript
      │     │        ├── myTimer.js     - 타이머와 관련된 기능을 담은 javascript
      │     │        ├── ping.js        - ping 테스트 기록을 DataBase(MongoDB)에 담기 위한 Schema와 데이터 저장, 찾기 기능을 담은 javascript
      │     │        └── tracerouter.js - tracerouter 테스트 기록을 DataBase(MongoDB)에 담기 위한 Schema와 데이터 저장, 찾기 기능을 담은 javascript
      │     │
      │     └── bootstrap/              - bootstrap의 추가 기능을 사용하기 위한 파일이 모여 있는 폴더
      ├── routes/                       - 라우팅 폴더
      │     ├── index.js                - 메인 페이지의 라우팅
      │     └── history.js              - History 페이지의 라우팅
      │
      └── views/                        - view 폴더
            ├── index.ejs               - 메인 페이지
            ├── history.ejs             - History 페이지
            └── error.ejs               - 에러 페이지
```

### 2. screen

#### 2-1. Main Screen

![MainScreen](https://user-images.githubusercontent.com/51731660/117908710-e143ce80-b313-11eb-807d-6e0a20aeabb0.png)

#### 2-2. History Screen

![HistoryScreen](https://user-images.githubusercontent.com/51731660/117909001-66c77e80-b314-11eb-8612-209385633c80.png)

## 3. How to Use

1. Enter the IP address in the left sidebar.
2. If you only want to measure a certain amount of time, you can set Timer.
3. If you want to save it as an Excel file, click 'S A V E' button
4. If you want to check your past records, click 'Show History' button
5. Let's Start!

## 4. Release Note

V 1.0.1 (2021. 04. 27)

- SAVE버튼 클릭시 파일 다운 후 버튼 비활성화 추가
- UI 일부 변경
- 불필요 코드 정리

V 1.1.0 (2021. 05. 12)

- History 페이지 추가 (지난 기록 조회 가능, 일부 개선 필요)
- Sqlite3(Timestamp db), MongoDB(Test Log db) 사용으로 지난 기록 조회 가능
- 테스트 직후 엑셀 파일 다운로드 개선 및 지난 기록 엑셀 파일 다운로드 기능 추가

V 1.1.1 (2021. 05. 12)

- Pagination Login 수정
