# PingRouter

<details>
<summary> 1. Structure of directory </summary>

```bash
└─ PingRouter
      │
      ├── README.md                          - root 리드미 파일
      ├── app.js                             - server setting
      ├── package.json                       - 해당 프로젝트의 정보와 사용된 모듈이 담긴 파일
      ├── .gitignore                         - 일부 파일 및 폴더를 git에 올리지 않기 위해 작성한 파일
      │
      ├── bin
      │    └── www.js                        - Node.js server 파일
      │
      └── src
           ├── config/                       - 설정 파일을 모아둔 폴더
           │     └── mongoDB.js              - mongoDB를 사용하기 위한 커넥트 파일
           │
           ├── controller/                   - Controller를 모아둔 폴더
           │     ├── indexCont.js            - 첫 페이지에서 클라이언트와 소통을 위한 controller
           │     ├── registerCont.js         - 회원가입 페이지에서 클라이언트와 소통을 위한 controller
           │     ├── mainCont.js             - 로그인 이후 메인 페이지에서 클라이언트와 소통을 위한 controller
           │     └── historyCont.js          - history페이지에서 클라이언트와 소통을 위한 controller
           │
           ├── lib/                          - 서버단에서 이용하는 특정 기능을 가지고 있는 파일을 모아둔 폴더
           │     ├── auto-id-setter.js       - Database idx 필드 auto increment를 위한 js 파일
           │     ├── dateCalc.js             - History 페이지의 Date Filter에 사용하기 위한 js 파일
           │     ├── encryption.js           - 비밀번호를 DB저장하기 전 암호화를 하기 위한 js 파일
           │     ├── getIPAddress.js         - 현재 접속 중인 IP 주소를 얻기 위한 js 파일
           │     ├── jwt.js                  - jwt를 발급하고 검증하는 js 파일
           │     ├── deepCopy.js             - 깊은 복사를 위한 js 파일
           │     ├── getSessionId.js         - socket통신 시 세션 ID를 얻기 위한 js 파일
           │     └── logFrame.js             - DB에 저장할 object를 return하는 js 파일
           │
           ├── model/                        - DB연산에 사용되는 파일을 모아둔 폴더
           │     ├── memberModel.js          - 유저의 정보를 저장하고 불러오는 js 파일
           │     ├── timeModel.js            - 테스트의 시작과 끝 시간을 저장하고 불러오는 js 파일
           │     ├── pingModel.js            - ping 기록을 저장하고 불러오는 js 파일
           │     └── tracerouterModel.js     - tracerouter 기록을 저장하고 불러오는 js 파일
           │
           ├── public/                       - css, javascript등 static파일이 모여 있는 폴더
           │     ├── stylesheets/            - stylesheet를 모아둔 폴더
           │     │        ├── style.css      - 기본적인 태그의 스타일 속성을 담아둔 stylesheet
           │     │        └── clock.css      - 로딩화면과 관련된 스타일 속성을 담아둔 stylesheet
           │     │
           │     ├── javascripts/            - javascript를 모아둔 폴더
           │     │        ├── disabled.js    - 각 상황에 버튼을 비활성화 시키는 기능을 담은 javascript
           │     │        ├── download.js    - 테스트 기록을 엑셀 파일로 만드는 기능을 담은 javascript
           │     │        ├── history.js     - History 페이지에서의 여러 기능을 담은 javascript
           │     │        ├── loading.js     - 로딩화면을 보여주고 사라지게 하는 기능을 담은 javascript
           │     │        ├── login.js       - 로그인 시 입력 값 검사와 로그인 성공시 Main 페이지로 이동하는 기능을 담은 javascript
           │     │        ├── logout.js      - 로그아웃 시 일련의 작업 후 로그인 페이지로 이동하는 기능을 담은 javascript
           │     │        ├── main.js        - Main 페이지에서의 여러 기능을 담은 javascript
           │     │        ├── myChart.js     - 테스트를 차트로 나타내기 위한 옵션과 기능을 담은 javascript
           │     │        ├── myTimer.js     - 타이머와 관련된 기능을 담은 javascript
           │     │        ├── register.js    - 로그인 페이지에서 회원가입 페이지로 변경하는 AJAX 통신을 하는 javacsript
           │     │        └── removeJWT.js   - 로그아웃시 토큰을 제거하는 기능을 담은javascript
           │     │
           │     ├── bootstrap/              - bootstrap의 추가 기능과 UI를 사용하기 위한 파일이 모여 있는 폴더(이하 폴더 설명 생략...)
           │     │        ├── css/
           │     │        └── js/
           │     │
           │     └── images/                 - 이미지를 모아둔 폴더(파일 설명 생략...)
           │
           ├── routes/                       - 라우팅 폴더
           │     ├── index.js                - 로그인 페이지의 라우팅
           │     ├── register.js             - 회원가입 페이지의 라우팅
           │     ├── main.js                 - 로그인 후 메인 페이지의 라우팅
           │     └── history.js              - History 페이지의 라우팅
           │
           ├── services/                     - 특정 행위들을 하나로 취합한 파일을 모아둔 폴더
           │     ├── database.js             - model 폴더의 파일들을 하나로 취합시킨 database.js 파일
           │     ├── login.js                - 로그인 기능을 가지고 있는 js vkdlf
           │     └── socket.io.js            - socket통신에 사용되는 function을 하나로 모아둔 js 파일
           │
           └── views/                        - view 폴더
                 ├── index.ejs               - 로그인 페이지
                 ├── register.ejs            - 회원가입 페이지(로그인 페이지에서 AJAX로 불러오기)
                 ├── main.ejs                - 메인 페이지
                 ├── history.ejs             - History 페이지
                 └── error.ejs               - 에러 페이지
```

</details>

<details>
<summary> 2. ScreenShot </summary>

#### 2-1. Login Screen

![LoginScreen](https://user-images.githubusercontent.com/51731660/121849633-88a68d80-cd26-11eb-8aca-be326a454032.png)

#### 2-2. Register Screen

![RegisterScreen](https://user-images.githubusercontent.com/51731660/121849717-aecc2d80-cd26-11eb-9951-97e3243c3aa9.png)

#### 2-3. Main Screen

![MainScreen](https://user-images.githubusercontent.com/51731660/121849893-e935ca80-cd26-11eb-9e2b-6582571aa560.png)

#### 2-4. History Screen

![HistoryScreen](https://user-images.githubusercontent.com/51731660/121850057-2a2ddf00-cd27-11eb-8705-d4497a9873c6.png)

</details>

## 3. How to Use

1. Enter the IP address in the left sidebar.
2. If you only want to measure a certain amount of time, you can set Timer.
3. If you want to save it as an Excel file, click 'S A V E' button
4. If you want to check your past records, click 'Show History' button
5. Let's Start!

## 4. Release Note

(2021. 04. 27)

- SAVE버튼 클릭시 파일 다운 후 버튼 비활성화 추가
- UI 일부 변경
- 불필요 코드 정리

(2021. 05. 12)

- History 페이지 추가 (지난 기록 조회 가능, 일부 개선 필요)
- Sqlite3(Timestamp db), MongoDB(Test Log db) 사용으로 지난 기록 조회 가능
- 테스트 직후 엑셀 파일 다운로드 개선 및 지난 기록 엑셀 파일 다운로드 기능 추가

(2021. 05. 12)

- Pagination Logic 수정

(2021. 05. 27)

- Code Refactoring

(2021. 06. 14)

- Change DataBase

  - Change the Member and Time table using sqlite to MongoDB

- IP Address

  - You can check the IP address you have accessed on all screens.

- Chart Design
  - You can also check the average speed in the graph.
