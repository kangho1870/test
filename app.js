const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
const bodyParser = require('body-parser');
// const session = require('express-session');
// const MySQLStore = require('express-mysql-session')(session);
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Express는 정적인 파일은 직접 포워딩 해줘야 함
// Express는 파일을 찾으라고 하면 기본적으로 public 폴더로 포워딩 해주기 때문에
// 파일 경로에는 public을 생략해야 함
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(bodyParser.json());
http.listen(3000, () => {
    console.log('서버가 3000번 포트에서 실행 중입니다.');
});

const mysql = require('mysql2');
const { error, log } = require('console');
const { Socket } = require('socket.io');
const e = require('express');

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'allcover'
});

app.get('/', (req, res) => {
  connection.query('select * from member', (error, results) => {
    if(error) {
      throw(error)
    }else {
      res.render('home', {results: results});
    }
  })
});

app.get('/select', (req, res) => {
  res.render('select');
});

app.get('/member', (req, res) => {
  if (req.session.userName) {
    connection.query('SELECT memid, memName, memAge, memAvg FROM member', (error, results) => {
      if (error) {
        throw error;
      } else {
        console.log(results);
        res.render('member', { member: results });
      }
    });
  } else {
    res.status(401).send('로그인이 필요합니다.');
  }
});
// 전체회원 상세 조회
app.get('/member/all', (req, res) => {
  connection.query('SELECT * FROM member', (error, results) => {
    if(error) {
        throw error;
    }else {
        console.log(results);
        res.render('memberall', { member: results });
    }
  });
});
// 회원별 상세조회
app.get('/member/:memid', (req, res) => {
  const memid = req.params.memid;
  connection.query('SELECT * FROM member WHERE memid = ?', [memid], (error, results) => {
    if(error) {
      throw error;
    }else {
      const detailedMember = results[0].memName;
      console.log(`${detailedMember} 님의 상세 정보 페이지입니다.`);
      res.render('detailedpage', {detailedMember: results});
    }
  });
});
app.get('/scoreboard/:memId/:memGender', (req, res) => {
  const gameName = req.query.joinGame;
  const memid = req.params.memId;
  const memName = req.query.memName;
  const memAvg = req.query.memAvg;
  const memGender = req.params.memGender;
  
  console.log(memid)
  console.log(gameName)
  console.log(memName)

  connection.query(`select * from ${gameName} WHERE userName = ?`, [memName], (error, rows) => {
    if (error) {
      throw error;
    }

    if (rows.length > 0) {
      connection.query(`SELECT userName, userAvg, 1Game, 2Game, 3Game, 4Game FROM ${gameName} WHERE userName = '${memName}'`, (error, result) => {
        if (error) {
          throw error;
        }
      })
    }else {
      connection.query(`insert into ${gameName} (userName, userAvg, gender) values (?, ?, ?)`, [memName, memAvg, memGender], (error, result) => {
        if (error) {
          throw error;
        }
      })
    }
    
    let teams = {
    teamScore1: [],
    teamScore2: [],
    teamScore3: [],
    teamScore4: [],
    teamScore5: [],
    teamScore6: [],
    teamScore7: []
    }
  
    connection.query(`select * from ${gameName} order by teamNumber, userAvg desc;`, (error, results5) => {
      if (error) {
        console.error(error);
        return;
      }
    
      results5.forEach(result => {
        const { teamNumber } = result;
        switch (teamNumber) {
          case 1:
            teams.teamScore1.push(result);
            break;
          case 2:
            teams.teamScore2.push(result);
            break;
          case 3:
            teams.teamScore3.push(result);
            break;
          case 4:
            teams.teamScore4.push(result);
            break;
          case 5:
            teams.teamScore5.push(result);
            break;
          case 6:
            teams.teamScore6.push(result);
            break;
          case 7:
            teams.teamScore7.push(result);
            break;
        }
      });
    })

    let teamScores = {
      team1: [],
      team2: [],
      team3: [],
      team4: [],
      team5: [],
      team6: [],
      team7: []
    }
    connection.query(`
      SELECT teamNumber,
        sum(CAST(1Game_P_M AS DECIMAL) + CAST(2Game_P_M AS DECIMAL) + CAST(3Game_P_M AS DECIMAL) + CAST(4Game_P_M AS DECIMAL)) as teamSum,
        SUM(1Game) AS sum_game1, SUM(1Game_P_M) AS sum_1game_p_m, 
        SUM(2Game) AS sum_game2, SUM(2Game_P_M) AS sum_2game_p_m, 
        SUM(3Game) AS sum_game3, SUM(3Game_P_M) AS sum_3game_p_m, 
        SUM(4Game) AS sum_game4, SUM(4Game_P_M) AS sum_4game_p_m
      FROM ${gameName}
      GROUP BY teamNumber
      ORDER BY teamNumber;`, (error, result3) => {
        if(error){
          console.log(error)
        }
        result3.forEach(result => {
          const { teamNumber } = result;
          switch (teamNumber) {
            case 1:
              teamScores.team1.push(result);
              break;
            case 2:
              teamScores.team2.push(result);
              break;
            case 3:
              teamScores.team3.push(result);
              break;
            case 4:
              teamScores.team4.push(result);
              break;
            case 5:
              teamScores.team5.push(result);
              break;
            case 6:
              teamScores.team6.push(result);
              break;
            case 7:
              teamScores.team7.push(result);
              break;
          }
        })
      })
      let pin1st = [];
      connection.query(`select userName from ${gameName} order by userTotal desc limit 1;`, (error, result) =>{
        if(error){
          console.log(error)
        }
        pin1st = result;
        var pin1stName = pin1st[0].userName;
        
          let superHero = []
          connection.query(`
            SELECT userName, 
              (CAST(1Game_P_M AS SIGNED) + CAST(2Game_P_M AS SIGNED) + CAST(3Game_P_M AS SIGNED) + CAST(4Game_P_M AS SIGNED)) AS avgTotal
            FROM ${gameName}
            ORDER BY avgTotal DESC
            LIMIT 1;
            `, (error, result) => {
            if(error) {
              console.log(error)
            }
            superHero = result
    
            let grade1st = {
              grade1_1st: [],
              grade2_1st: [],
              grade3_1st: [],
              grade4_1st: []
            };
    
            connection.query(`
              SELECT userName, 
                (CAST(1Game_P_M AS SIGNED) + CAST(2Game_P_M AS SIGNED) + CAST(3Game_P_M AS SIGNED) + CAST(4Game_P_M AS SIGNED)) AS avgTotal
              FROM ${gameName}
              WHERE grade = 1 AND userName NOT IN ('${pin1stName}')
              ORDER BY avgTotal DESC
              LIMIT 1;
              `, (error, result) =>{
              if(error){
                console.log(error)
              }
              if(result && result.length > 0) {
                grade1st.grade1_1st = result[0].userName
              }
    
              connection.query(`
                SELECT userName, 
                  (CAST(1Game_P_M AS SIGNED) + CAST(2Game_P_M AS SIGNED) + CAST(3Game_P_M AS SIGNED) + CAST(4Game_P_M AS SIGNED)) AS avgTotal
                FROM ${gameName}
                WHERE grade = 2 AND userName NOT IN ('${pin1stName}')
                ORDER BY avgTotal DESC
                LIMIT 1;
              `, (error, result) =>{
                if(error){
                  console.log(error)
                }
                if(result && result.length > 0) {
                  grade1st.grade2_1st = result[0].userName
                }
    
                connection.query(`
                  SELECT userName, 
                    (CAST(1Game_P_M AS SIGNED) + CAST(2Game_P_M AS SIGNED) + CAST(3Game_P_M AS SIGNED) + CAST(4Game_P_M AS SIGNED)) AS avgTotal
                  FROM ${gameName}
                  WHERE grade = 3 AND userName NOT IN ('${pin1stName}')
                  ORDER BY avgTotal DESC
                  LIMIT 1;
                `, (error, result) =>{
                  if(error){
                    console.log(error)
                  }
                  if(result && result.length > 0) {
                    grade1st.grade3_1st = result[0].userName
                  }
    
                  connection.query(`
                    SELECT userName, 
                      (CAST(1Game_P_M AS SIGNED) + CAST(2Game_P_M AS SIGNED) + CAST(3Game_P_M AS SIGNED) + CAST(4Game_P_M AS SIGNED)) AS avgTotal
                    FROM ${gameName}
                    WHERE grade = 4 AND userName NOT IN ('${pin1stName}')
                    ORDER BY avgTotal DESC
                    LIMIT 1;
                  `, (error, result) =>{
                    if(error){
                      console.log(error)
                    }
                    if(result && result.length > 0) {
                      grade1st.grade4_1st = result[0].userName
                    }
    
                    let manHigh = []
                    connection.query(`
                      SELECT userName
                      FROM ${gameName}
                      WHERE 
                        gender = 1 AND 
                        userName NOT IN (
                          '${pin1stName}', 
                          '${grade1st.grade1_1st}', 
                          '${grade1st.grade2_1st}', 
                          '${grade1st.grade3_1st}', 
                          '${grade1st.grade4_1st}'
                          ) AND 
                        userHigh >= 230
                      ORDER BY userHigh DESC
                      LIMIT 1;
                      `, (error, result) => {
                      if (error) {
                        console.log(error)
                      }
                      if (result && result.length > 0) {
                        manHigh = result[0].userName
                      }
                          let womanHigh = []
                          connection.query(`
                          SELECT userName
                          FROM ${gameName}
                          WHERE 
                            gender = 2 AND 
                            userName NOT IN (
                              '${pin1stName}', 
                              '${grade1st.grade1_1st}', 
                              '${grade1st.grade2_1st}', 
                              '${grade1st.grade3_1st}', 
                              '${grade1st.grade4_1st}'
                              ) AND 
                            userHigh >= 200
                          ORDER BY userHigh DESC
                          LIMIT 1;
                          `, (error, result) => {
                            if (error) {
                              console.log(error)
                            }
                            if (result && result.length > 0) {
                              womanHigh = result[0].userName
                            } else {
                              womanHigh = null;
                            }
                          })
                          let team1st = []
                          connection.query(`
                          SELECT t1.teamNumber,
                            t1.teamSum,
                            t1.teamRank,
                            t2.userName
                          FROM (
                                SELECT teamNumber,
                                      teamSum,
                                      ROW_NUMBER() OVER (ORDER BY teamSum DESC) AS teamRank
                                FROM (
                                    SELECT teamNumber,
                                          SUM(CAST(1Game_P_M AS DECIMAL) + CAST(2Game_P_M AS DECIMAL) + CAST(3Game_P_M AS DECIMAL) + CAST(4Game_P_M AS DECIMAL)) AS teamSum
                                    FROM ${gameName}
                                    WHERE teamNumber BETWEEN 1 AND 7
                                    GROUP BY teamNumber
                                ) AS subquery
                          ) AS t1
                          JOIN ${gameName} AS t2 ON t1.teamNumber = t2.teamNumber
                          WHERE t1.teamRank = 1;
                          `, (error, result) =>{
                            if(error){
                              console.log(error)
                            }
                            team1st = result
                          })
  connection.query(`select userName, userAvg, 1Game, 2Game, 3Game, 4Game from ${gameName} where userName = '${memName}'`, (error, result) => {
    if (error) {
      throw error;
    } else {
      connection.query(`select * from ${gameName} ORDER BY userTotal DESC, userAvg DESC`, (error, results) => {
        if (error) {
          throw error;
        }else {
          connection.query(`
            SELECT 
              teamNumber, 
              SUM(CAST(1Game_P_M AS DECIMAL)) AS total_1Game_P_M,
              SUM(CAST(2Game_P_M AS DECIMAL)) AS total_2Game_P_M,
              SUM(CAST(3Game_P_M AS DECIMAL)) AS total_3Game_P_M,
              SUM(CAST(4Game_P_M AS DECIMAL)) AS total_4Game_P_M,
              RANK() OVER (ORDER BY SUM(CAST(1Game_P_M AS DECIMAL)) DESC) AS ranking_1Game_P_M,
              RANK() OVER (ORDER BY SUM(CAST(2Game_P_M AS DECIMAL)) DESC) AS ranking_2Game_P_M,
              RANK() OVER (ORDER BY SUM(CAST(3Game_P_M AS DECIMAL)) DESC) AS ranking_3Game_P_M,
              RANK() OVER (ORDER BY SUM(CAST(4Game_P_M AS DECIMAL)) DESC) AS ranking_4Game_P_M
            FROM ${gameName}
            WHERE teamNumber BETWEEN 1 AND 7
            GROUP BY teamNumber;
            `, (error, teamRank) =>{
              if(error){
                throw error
              }else {
                connection.query(`
                  SELECT userName, CAST(1Game_P_M AS SIGNED) AS 1Game_P_M
                  FROM ${gameName}
                  WHERE avg_side = 1
                  ORDER BY 1Game_P_M desc
                  limit 7;
                  `, (error, avgGame1) =>{
                    if(error){
                      console.log(error)
                    }else {
                      connection.query(`
                        SELECT userName, CAST(2Game_P_M AS SIGNED) AS 2Game_P_M
                        FROM ${gameName}
                        WHERE avg_side = 1
                        ORDER BY 2Game_P_M desc
                        limit 7;
                        `, (error, avgGame2) =>{
                          if(error){
                            console.log(error)
                          }else{
                            connection.query(`
                              SELECT userName, CAST(3Game_P_M AS SIGNED) AS 3Game_P_M
                              FROM ${gameName}
                              WHERE avg_side = 1
                              ORDER BY 3Game_P_M desc
                                limit 7;
                              `, (error, avgGame3) =>{
                                if(error){
                                  console.log(error)
                                }else{
                                  connection.query(`
                                    SELECT userName, CAST(4Game_P_M AS SIGNED) AS 4Game_P_M
                                    FROM ${gameName}
                                    WHERE avg_side = 1
                                    ORDER BY 4Game_P_M desc
                                      limit 7;
                                    `, (error, avgGame4) =>{
                                      if(error){
                                        console.log(error)
                                      }else {
                                        connection.query(`
                                          SELECT 
                                            userName,
                                            RANK() OVER (ORDER BY 1Game DESC, userAvg DESC) AS 1Game_Rank
                                          FROM ${gameName}
                                            WHERE grade1_side = 1
                                            ORDER BY 1Game_Rank, userName;
                                          `,(error, grade1_side1) =>{
                                            if(error){
                                              console.log(error)
                                              }
                                              connection.query(`
                                                SELECT 
                                                  userName,
                                                  RANK() OVER (ORDER BY 2Game DESC, userAvg DESC) AS 2Game_Rank
                                                FROM ${gameName}
                                                  WHERE grade1_side = 1
                                                  ORDER BY 2Game_Rank, userName;
                                                `,(error, grade1_side2) =>{
                                                  if(error){
                                                    console.log(error)
                                                  }
                                                  connection.query(`
                                                    SELECT 
                                                      userName,
                                                      RANK() OVER (ORDER BY 3Game DESC, userAvg DESC) AS 3Game_Rank
                                                    FROM ${gameName}
                                                      WHERE grade1_side = 1
                                                      ORDER BY 3Game_Rank, userName;
                                                    `,(error, grade1_side3) =>{
                                                      if(error){
                                                        console.log(error)
                                                      }
                                                      connection.query(`
                                                        SELECT 
                                                          userName,
                                                          RANK() OVER (ORDER BY 4Game DESC, userAvg DESC) AS 4Game_Rank
                                                        FROM ${gameName}
                                                          WHERE grade1_side = 1
                                                          ORDER BY 4Game_Rank, userName;
                                                        `,(error, grade1_side4) =>{
                                                          if(error){
                                                            console.log(error)
                                                          }
                                                          let avgGame = {
                                                            avgGame1: avgGame1,
                                                            avgGame2: avgGame2,
                                                            avgGame3: avgGame3,
                                                            avgGame4: avgGame4
                                                          };
                                                          let grade1_side = {
                                                            grade1_side1: grade1_side1,
                                                            grade1_side2: grade1_side2,
                                                            grade1_side3: grade1_side3,
                                                            grade1_side4: grade1_side4
                                                          }
                                                          connection.query(`
                                                            SELECT userName,
                                                              (userTotal - (
                                                                SELECT userTotal
                                                                FROM ${gameName}
                                                                ORDER BY userTotal DESC
                                                                LIMIT 1
                                                              )) AS pinDifference
                                                            FROM ${gameName}
                                                            ORDER BY userTotal DESC;
                                                            `, (error, userRank) =>{
                                                              if(error){
                                                                console.log(error)
                                                              }
                                                              console.log(userRank)
                                                          connection.query(`select * from ${gameName} order by userAvg desc;`, (error, settings) =>{
                                                            connection.query(`select management from member where memid = '${memid}' and management = 1;`, (error, management) =>{
                                                              if(management.length == 1) {
                                                                res.render('test', { userName: result, results: results, gameName: gameName, teams, teamScores, teamRank: teamRank, grade1_side, avgGame, pin1st, superHero, grade1st, manHigh, womanHigh, team1st, settings, memid, memGender, userRank});
                                                              }else {
                                                                res.render('test2', { userName: result, results: results, gameName: gameName, teams, teamScores, teamRank: teamRank, grade1_side, avgGame, pin1st, superHero, grade1st, manHigh, womanHigh, team1st, settings, memid, memGender, userRank});
                                                              }
                                                            })
                                                          })
                                                        })
                                                      })
                                                    })
                                                  })
                                                })
                                              }
                                            })
                                          }
                                        })
                                      }
                                    })
                                  }
                                })
                              }
                            })
                          }
                        })
                      }
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
app.get('/eventGame/:gameName/:memId', (req, res) =>{
  const gameName = req.params.gameName;
  const memId = req.params.memId;
  const memName = req.query.eventName;
  const memAvg = req.query.eventAvg;

  let memHandi = 0;
  if(memAvg >= 190) {
    memHandi = 0;
  }else if(memAvg < 190 && memAvg >= 180) {
    memHandi = (200 - memAvg) * 0.6
  }else if(memAvg < 180 && memAvg >= 170) {
    memHandi = (200 - memAvg) * 0.8
  }else if(memAvg < 170 && memAvg >= 160) {
    memHandi = (200 - memAvg) * 0.9
  }else if(memAvg < 160) {
    memHandi = 200 - memAvg
  }

  connection.query(`select userName from 하이게임8 order by userTotal desc limit 8;`, (error, results) =>{
    if(error) {
      console.log(error)
    }
    results.forEach((row) =>{
      if(row.userName == memName) {
        connection.query(`select userName from 하이게임결승 where userName = '${memName}'`, (error, result) =>{
          if(error) {
            console.log(error)
          }
          if(result.length > 0) {
            
          }else {
            connection.query(`insert into 하이게임결승 set userName = '${memName}', userAvg = ${memAvg}, userHandi = ${memHandi}`, (error, result) =>{
              if(error) {
                console.log(error)
              }
            })
          }
        })
      }
    })
  })

  // 8강 시작할 때 변경 사항
  // 8강 테이블에 8강진출자 이름 있는지 확인 (where 조건에 8강 진출자 이름)
  // 없으면 추가, 있으면 넘어감
  // 8강 진출자가 아닌사람이 페이지 진입 시 테이블에 추가 없이 넘김
  // 8강, 결승 핀차이 계산 sql 로직 작성 후 렌더링 -> 템플릿 8강, 결승 핀차이 변수이름 수정
  // 점수 입력 밸류값 수정
  connection.query(`select userName from ${gameName} where userName = '${memName}'`, (error, result) =>{
    if(error){
      console.log(error)
    }
    if(result.length > 0) {
      connection.query(`select * from ${gameName} ORDER BY userTotal DESC;`, (error, highGame) =>{
        if(error) {
          console.log(error)
        }
      })
    }else {
      connection.query(`insert into ${gameName} set userName = '${memName}', userAvg = ${memAvg}, userHandi = ${memHandi}`, (error, result) =>{
        if(error){
          console.log(error)
        }
      })
    }
    connection.query(`select * from ${gameName} ORDER BY userTotal DESC;`, (error, highGame) =>{
      if(error){
        console.log(error)
      }
      connection.query(`select * from member where memid = ${memId}`, (error, member) =>{
        if(error){
          console.log(error)
        }
        connection.query(`select * from 하이게임8 ORDER BY userTotal DESC;`, (error, highGame8) =>{
          if(error){
            console.log(error)
          }
          connection.query(`select * from 하이게임결승 ORDER BY userTotal DESC;`, (error, highGameFinal) =>{
            if(error){
              console.log(error)
            }
            connection.query(`select * from 하이게임결승 where userName = '${memName}'`, (error, userName) =>{
              if(error){
                console.log(error)
              }
              connection.query(`
              SELECT userName, userTotal, userTotal - (
                SELECT MAX(userTotal) FROM 하이게임
              ) AS pinDifference
              FROM 하이게임;
              `, (error, rank) =>{
                if(error){
                  console.log(error)
                }
              connection.query(`select * from 하이게임 order by userAvg desc;`, (error, memberScore) =>{
                if(error){
                  console.log(error)
                }
                connection.query(`
                  SELECT userName, userTotal, userTotal - (
                    SELECT MAX(userTotal) FROM 하이게임8
                  ) AS pinDifference
                  FROM 하이게임8;
                  `, (error, rank8) =>{
                    if(error) {
                      console.log(error)
                    }
                    connection.query(`
                    SELECT userName, userTotal, userTotal - (
                      SELECT MAX(userTotal) FROM 하이게임결승
                    ) AS pinDifference
                    FROM 하이게임결승;
                    `, (error, rankFinal) =>{
                      if(error) {
                        console.log(error)
                      }
                      res.render('highGame', {highGame, member, highGame8, highGameFinal, userName, rank, memberScore, rank8, rankFinal})
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})
app.get('/recordroom', (req, res) => {
  res.render('recordroom')
})
app.post('/saveDb', (req, res) => {
  const gameName = req.body.gameName
  const loggedName = req.body.sessionName;
  const memAvg = req.body.sessionAvg;
  const memId = req.body.memId;
  const memGender = req.body.memGender
  const game1 = req.body.Game1 || 0;
  const game2 = req.body.Game2 || 0;
  const game3 = req.body.Game3 || 0;
  const game4 = req.body.Game4 || 0;
  const db1Game = req.body.db1Game || 0;
  const db2Game = req.body.db2Game || 0;
  const db3Game = req.body.db3Game || 0;
  const db4Game = req.body.db4Game || 0;
  const redirectPath = `/scoreboard/${memId}/${memGender}?joinGame=${encodeURIComponent(gameName)}&memName=${encodeURIComponent(loggedName)}`
  
  let game1PM = 0;
  let game2PM = 0;
  let game3PM = 0;
  let game4PM = 0;

  if(game1 !== 0 && game2 == 0 && game3 == 0 && game4 == 0) {
    game1PM = parseInt(game1) - parseInt(memAvg)
  }else if(game1 == 0 && game2 !== 0 && game3 == 0 && game4 == 0) {
    game1PM = parseInt(db1Game) - parseInt(memAvg)
    game2PM = parseInt(game2) - parseInt(memAvg)
  }else if(game1 == 0 && game2 == 0 && game3 !== 0 && game4 == 0) {
    game1PM = parseInt(db1Game) - parseInt(memAvg)
    game2PM = parseInt(db2Game) - parseInt(memAvg)
    game3PM = parseInt(game3) - parseInt(memAvg)
  }else if(game1 == 0 && game2 == 0 && game3 == 0 && game4 !== 0) {
    game1PM = parseInt(db1Game) - parseInt(memAvg)
    game2PM = parseInt(db2Game) - parseInt(memAvg)
    game3PM = parseInt(db3Game) - parseInt(memAvg)
    game4PM = parseInt(game4) - parseInt(memAvg)
  }
   
  let userThisAvg = 0
  if(game1 !== 0 && game2 == 0 && game3 == 0 && game4 == 0) {
    userThisAvg = (parseInt(game1) / 1).toFixed(2).toString();
  }else if(game1 == 0 && game2 !== 0 && game3 == 0 && game4 == 0) {
    userThisAvg = ((parseInt(db1Game) + parseInt(game2)) / 2).toFixed(2).toString();
  }else if(game1 == 0 && game2 == 0 && game3 !== 0 && game4 == 0) {
    userThisAvg = ((parseInt(db1Game) + parseInt(db2Game) + parseInt(game3)) / 3).toFixed(2).toString();
  }else if(game1 == 0 && game2 == 0 && game3 == 0 && game4 !== 0) {
    userThisAvg = ((parseInt(db1Game) + parseInt(db2Game) + parseInt(db3Game) + parseInt(game4)) / 4).toFixed(2).toString();
  }

  let userTotal = 0;
  if(game1 !== 0 && game2 == 0 && game3 == 0 && game4 == 0) {
    userTotal = parseInt(game1)
  }else if(game1 == 0 && game2 !== 0 && game3 == 0 && game4 == 0) {
    userTotal =  parseInt(db1Game) + parseInt(game2)
  }else if(game1 == 0 && game2 == 0 && game3 !== 0 && game4 == 0) {
    userTotal = parseInt(db1Game) + parseInt(db2Game) + parseInt(game3)
  }else if(game1 == 0 && game2 == 0 && game3 == 0 && game4 !== 0) {
    userTotal = parseInt(db1Game) + parseInt(db2Game) + parseInt(db3Game) + parseInt(game4)
  }
  let userHigh = Math.max(parseInt(game1), parseInt(game2), parseInt(game3), parseInt(game4));
  if(game1 !== 0 && game2 == 0 && game3 == 0 && game4 == 0) {
    userHigh = Math.max(parseInt(game1), parseInt(db2Game), parseInt(db3Game), parseInt(db4Game));
  }else if(game1 == 0 && game2 !== 0 && game3 == 0 && game4 == 0) {
    userHigh =  Math.max(parseInt(db1Game), parseInt(game2), parseInt(db3Game), parseInt(db4Game));
  }else if(game1 == 0 && game2 == 0 && game3 !== 0 && game4 == 0) {
    userHigh = Math.max(parseInt(db1Game), parseInt(db2Game), parseInt(game3), parseInt(db4Game));
  }else if(game1 == 0 && game2 == 0 && game3 == 0 && game4 !== 0) {
    userHigh = Math.max(parseInt(db1Game), parseInt(db2Game), parseInt(db3Game), parseInt(game4));
  }
  let userLow = Math.min(parseInt(game1), parseInt(game2), parseInt(game3), parseInt(game4));
  if(game1 !== 0 && game2 == 0 && game3 == 0 && game4 == 0) {
    userLow = Math.min(parseInt(game1));
  }else if(game1 == 0 && game2 !== 0 && game3 == 0 && game4 == 0) {
    userLow =  Math.min(parseInt(db1Game), parseInt(game2));
  }else if(game1 == 0 && game2 == 0 && game3 !== 0 && game4 == 0) {
    userLow = Math.min(parseInt(db1Game), parseInt(db2Game), parseInt(game3));
  }else if(game1 == 0 && game2 == 0 && game3 == 0 && game4 !== 0) {
    userLow = Math.min(parseInt(db1Game), parseInt(db2Game), parseInt(db3Game), parseInt(game4));
  }

  if (parseInt(game1) !== 0 && parseInt(game2) == 0 && parseInt(game3) == 0 && parseInt(game4) == 0) {
    connection.query(`UPDATE ${gameName} SET 1Game = ${game1}, 1Game_P_M = ${game1PM}, 2Game = ${db2Game}, 2Game_P_M = ${game2PM}, 3Game = ${db3Game}, 3Game_P_M = ${game3PM}, 4Game = ${db4Game}, 4Game_P_M = ${game4PM},  userThisAvg = ${userThisAvg}, userTotal = ${userTotal}, userHigh = ${userHigh}, userLow = ${userLow}  WHERE userName = '${loggedName}'`, (error, result, fields) => {
      if (error) {
        console.error('MySQL 데이터 삽입 오류:', error);
        res.status(500).json({ error: 'MySQL 데이터 삽입 오류' });
      }
    });
  }else if(parseInt(game1) == 0 && parseInt(game2) !== 0 && parseInt(game3) == 0 && parseInt(game4) == 0){
    connection.query(`UPDATE ${gameName} SET 1Game = ${db1Game}, 1Game_P_M = ${game1PM}, 2Game = ${game2}, 2Game_P_M = ${game2PM}, 3Game = ${db3Game}, 3Game_P_M = ${game3PM}, 4Game = ${db4Game}, 4Game_P_M = ${game4PM}, userThisAvg = ${userThisAvg}, userTotal = ${userTotal}, userHigh = ${userHigh}, userLow = ${userLow}  WHERE userName = '${loggedName}'`, (error, result, fields) => {
        if (error) {
            console.error('MySQL 데이터 삽입 오류:', error);
            res.status(500).json({ error: 'MySQL 데이터 삽입 오류' });
        }
      });
  }else if (parseInt(game1) == 0 && parseInt(game2) == 0 && parseInt(game3) !== 0 && parseInt(game4) == 0){
    connection.query(`UPDATE ${gameName} SET 1Game = ${db1Game}, 1Game_P_M = ${game1PM}, 2Game = ${db2Game}, 2Game_P_M = ${game2PM}, 3Game = ${game3}, 3Game_P_M = ${game3PM}, 4Game = ${db4Game}, 4Game_P_M = ${game4PM}, userThisAvg = ${userThisAvg}, userTotal = ${userTotal}, userHigh = ${userHigh}, userLow = ${userLow}  WHERE userName = '${loggedName}'`, (error, result, fields) => {
        if (error) {
            console.error('MySQL 데이터 삽입 오류:', error);
            res.status(500).json({ error: 'MySQL 데이터 삽입 오류' });
        };
      });
  }else if (parseInt(game1) == 0 && parseInt(game2) == 0 && parseInt(game3) == 0 && parseInt(game4) !== 0){
    connection.query(`UPDATE ${gameName} SET 1Game = ${db1Game}, 1Game_P_M = ${game1PM}, 2Game = ${db2Game}, 2Game_P_M = ${game2PM}, 3Game = ${db3Game}, 3Game_P_M = ${game3PM}, 4Game = ${game4}, 4Game_P_M = ${game4PM}, userThisAvg = ${userThisAvg}, userTotal = ${userTotal}, userHigh = ${userHigh}, userLow = ${userLow}  WHERE userName = '${loggedName}'`, (error, result, fields) => {
        if (error) {
            console.error('MySQL 데이터 삽입 오류:', error);
            res.status(500).json({ error: 'MySQL 데이터 삽입 오류' });
      } 
    });
  }else if (parseInt(game1) == 0 && parseInt(game2) == 0 && parseInt(game3) == 0 && parseInt(game4) == 0){
    game1PM = parseInt(db1Game) - parseInt(memAvg);
    game2PM = parseInt(db2Game) - parseInt(memAvg);
    game3PM = parseInt(db3Game) - parseInt(memAvg);
    game4PM = parseInt(db4Game) - parseInt(memAvg);
    userTotal = parseInt(db1Game) + parseInt(db2Game) + parseInt(db3Game) + parseInt(db4Game)
    
    if(parseInt(db1Game) == 0) {
      game1PM = 0;
    }else if(parseInt(db2Game) == 0) {
      game2PM = 0;
    }else if(parseInt(db3Game) == 0) {
      game3PM = 0;
    }else if(parseInt(db4Game) == 0) {
      game4PM = 0;
    }
    connection.query(`UPDATE ${gameName} SET 1Game = ${db1Game}, 1Game_P_M = ${game1PM}, 2Game = ${db2Game}, 2Game_P_M = ${game2PM}, 3Game = ${db3Game}, 3Game_P_M = ${game3PM}, 4Game = ${db4Game}, 4Game_P_M = ${game4PM}, userTotal = ${userTotal} WHERE userName = '${loggedName}'`, (error, result, fields) => {
        if (error) {
            console.error('MySQL 데이터 삽입 오류:', error);
            res.status(500).json({ error: 'MySQL 데이터 삽입 오류' });
        }
        
      });
  }
  res.redirect(redirectPath);
})
app.post('/saveHighGame', (req, res) => {
  const game1 = parseInt(req.body.Game1) || 0;
  const game2 = parseInt(req.body.Game2) || 0;
  const game3 = parseInt(req.body.Game3) || 0;
  
  const userName = req.body.userName
  const userAvg = req.body.userAvg

  const memId = req.body.userId
  console.log(memId)
  const gameName = '하이게임'
  let memHandi = 0;
  if(userAvg >= 190) {
    memHandi = 0;
  }else if(userAvg < 190 && userAvg >= 180) {
    memHandi = (200 - userAvg) * 0.6
  }else if(userAvg < 180 && userAvg >= 170) {
    memHandi = (200 - userAvg) * 0.8
  }else if(userAvg < 170 && userAvg >= 160) {
    memHandi = (200 - userAvg) * 0.9
  }else if(userAvg < 160) {
    memHandi = 200 - userAvg
  }
  let game1Plus = game1 + memHandi
  let game2Plus = game2 + memHandi
  let game3Plus = game3 + memHandi
  
  if (game1Plus >= 300) {
    game1Plus = 300;
  }
  
  if (game2Plus >= 300) {
    game2Plus = 300;
  }
  
  if (game3Plus >= 300) {
    game3Plus = 300;
  }
  if(game1 == 0) {
    game1Plus = 0
  }
  if(game2 == 0) {
    game2Plus = 0;
  }
  if(game3 == 0) {
    game3Plus = 0;
  }
  let userTotal = game1Plus + game2Plus + game3Plus
  const redirectPath = `/eventGame/${gameName}/${memId}?eventName=${userName}&eventAvg=${userAvg}`
  connection.query(`select userName from 하이게임8 order by userTotal desc limit 8;`, (error, result) => {
    if(error) {
      console.log
    }
    result.forEach((row) => {
      if(row.userName == userName) {
        connection.query(`update 하이게임결승 set game1 = ${game1}, game1Origin = ${game1Plus}, game2Origin = ${game2Plus}, game3Origin = ${game3Plus}, game2 = ${game2}, game3 = ${game3}, userTotal = ${userTotal} where userName = '${userName}'`, (error, result) =>{
          if(error){
            console.log(error)
          }
          res.redirect(redirectPath)
        })
      }
    })
  })
})

app.post('/login', (req, res) => {
  const userName = req.body.userName;
  const userPassword = req.body.userPassword;
  const query = 'SELECT * FROM member WHERE memName = ? AND memPhoneNumber = ?';
  const values = [userName, userPassword];

  connection.query(query, values, (error, results) => {
    if (error) {
      throw error;
    } else {
      if (results.length > 0) {
        connection.query(`select * from member where memName = '${userName}'`, (error, result) => {
          if (error) {
            throw error;
          } else {
            connection.query(`show tables`, (error, results) => {
              if (error) {
                throw error;
              }
              const filteredTables = results.filter((row) => {
                const tableName = row[`Tables_in_allcover`];
                return tableName !== 'member' && tableName !== 'scorebord' && tableName !== 'team_scoreboard' && tableName !== '하이게임' && tableName !== '하이게임8' && tableName !== '하이게임결승'; // member와 scoreboard 테이블 제외
              });
              connection.query(`select table_name from information_schema.tables where table_name = '하이게임'`, (error, highGame) =>{
                if(error){
                  console.log(error)
                }
                var highGame = highGame[0].TABLE_NAME
                res.render('gameselect', { results: results, result: result, filteredTables: filteredTables , highGame});
              })
            });
          }
        });
      }
    }
  });
})

app.post('/createGame', (req, res) => {
  const gameName = req.body.gameName;
  const memName = req.body.userName;
  const memAvg = req.body.userAvg;
  const memId = req.body.userId;
  const memGender = req.body.memGender;
  const redirectPath = `/scoreboard/${memId}/${memGender}?joinGame=${encodeURIComponent(gameName)}&memName=${encodeURIComponent(memName)}`


  const checkTableQuery = `SHOW TABLES LIKE '${gameName}'`;
  connection.query(checkTableQuery, (error, results) => {
    if (error) {
      console.error('테이블 조회 실패:', error);
      res.status(500).send('테이블 조회에 실패했습니다.');
      return;
    }

    if (results.length > 0) {
      console.log('이미 존재하는 게임입니다.');
      res.status(400).send(`<script>alert('이미 존재하는 게임입니다.')</script>`);
      return;
    }else {
      const createTableQuery = `CREATE TABLE ${gameName} (userName varchar(5), userAvg int, grade int, gender int, 1Game int, 1Game_P_M varchar(20), 2Game int, 2Game_P_M varchar(20), 3Game int, 3Game_P_M varchar(20), 4Game int, 4Game_P_M varchar(20), userThisAvg float, userTotal int, userHigh int, userLow int, teamNumber int, checking int, grade1_side int, avg_side int)`;
      connection.query(createTableQuery, (error, results) => {
        if (error) {
          console.error('테이블 생성 실패:', error);
          res.status(500).send('테이블 생성에 실패했습니다.');
          return;
        }
        const insertUserQuery = `INSERT INTO ${gameName} (userName, userAvg, gender) VALUES (?, ?, ?)`;
        connection.query(insertUserQuery, [memName, memAvg, memGender], (error, results) => {
          if (error) {
            console.error('사용자 추가 실패:', error);
            res.status(500).send('사용자 추가에 실패했습니다.');
            return;
          }
          console.log('테이블이 성공적으로 생성되었습니다.');
          console.log('사용자가 성공적으로 추가되었습니다.');

          res.redirect(redirectPath);
        })
      })
    }
  })
})
    

app.post('/teamJoin', (req, res) => {
  const loggedName = req.body.joinGameuserName
  const gameName = req.body.joinGameName
  const teamNumber = req.body.teamNumber
  const memId = req.body.memId;
  const memGender = req.body.memGender

  const redirectPath = `/scoreboard/${memId}/${memGender}?joinGame=${encodeURIComponent(gameName)}&memName=${encodeURIComponent(loggedName)}`

  connection.query(`update ${gameName} set teamNumber = ${teamNumber} where userName = '${loggedName}'`, (error, result) => {
    if (error) {
      throw error;
    }
  })
  res.redirect(redirectPath);
})

app.post('/resetTeam', (req, res) => {
  const loggedName = req.body.resetTeamuserName;
  const gameName = req.body.resetTeamGameName 
  const memId = req.body.memId;
  const memGender = req.body.memGender

  const redirectPath = `/scoreboard/${memId}/${memGender}?joinGame=${encodeURIComponent(gameName)}&memName=${encodeURIComponent(loggedName)}`

  connection.query(`update ${gameName} set teamNumber = null;`, (error, result) => {
    if (error) {
      throw error;
    }
  })
  res.redirect(redirectPath);
})

app.post('/gameSetting', (req, res) =>{
  const gameSettings = req.body.gameSettings;
  const gameName = req.body.gameSettingGameName;
  const loggedName = req.body.gameSettingUserName
  const memId = req.body.memId;
  const memGender = req.body.memGender

  const redirectPath = `/scoreboard/${memId}/${memGender}?joinGame=${encodeURIComponent(gameName)}&memName=${encodeURIComponent(loggedName)}`

  
  for(var i = 0; i < gameSettings.length; i++) {
    let grade = gameSettings[i].grade;
    let grade1_side = gameSettings[i].grade1Game || 0;
    let avg_side = gameSettings[i].avgGame || 0;
    let userName = gameSettings[i].userName;
    connection.query(`update ${gameName} set grade = ${grade}, grade1_side = ${grade1_side}, avg_side = ${avg_side} where userName = '${userName}'`, (error, result) =>{
      if(error){
        console.log(error)
      }
    })
  }

  res.redirect(redirectPath);
})