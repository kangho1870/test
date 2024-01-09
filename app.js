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
app.use(bodyParser.urlencoded({ extended: false }));

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
// //app.get('/test', (req, res) => {
//   const gameName = req.body.gameName;
//   const memName = req.body.userName;
//   const memAvg = req.body.userAvg;

//   let teams = {
//     teamScore1: [],
//     teamScore2: [],
//     teamScore3: [],
//     teamScore4: [],
//     teamScore5: [],
//     teamScore6: [],
//     teamScore7: []
//   }
  
//   connection.query(`select * from ${gameName} order by teamNumber`, (error, results5) => {
//     if (error) {
//       console.error(error);
//       return;
//     }
  
//     results5.forEach(result => {
//       const { teamNumber } = result;
//       switch (teamNumber) {
//         case 1:
//           teams.teamScore1.push(result);
//           break;
//         case 2:
//           teams.teamScore2.push(result);
//           break;
//         case 3:
//           teams.teamScore3.push(result);
//           break;
//         case 4:
//           teams.teamScore4.push(result);
//           break;
//         case 5:
//           teams.teamScore5.push(result);
//           break;
//         case 6:
//           teams.teamScore6.push(result);
//           break;
//         case 7:
//           teams.teamScore7.push(result);
//           break;
//         default:
//           // 예외 처리: 팀 번호가 1에서 7 사이의 값이 아닌 경우
//           console.warn(`잘못된 팀 번호: ${teamNumber}`);
//       }
//     });
//   })

//   let teamScores = {
//     team1: [],
//     team2: [],
//     team3: [],
//     team4: [],
//     team5: [],
//     team6: [],
//     team7: []
//   }
//   connection.query(`SELECT teamNumber, SUM(1Game) AS sum_game1, SUM(1Game_P_M) AS sum_1game_p_m, 
//     SUM(2Game) AS sum_game2, SUM(2Game_P_M) AS sum_2game_p_m, 
//     SUM(3Game) AS sum_game3, SUM(3Game_P_M) AS sum_3game_p_m, 
//     SUM(4Game) AS sum_game4, SUM(4Game_P_M) AS sum_4game_p_m
//     FROM ${gameName}
//     GROUP BY teamNumber
//     ORDER BY teamNumber;`, (error, result3) => {
//       if(error){
//         console.log(error)
//         return;
//       }
//       result3.forEach(result => {
//         const { teamNumber } = result;
//         switch (teamNumber) {
//           case 1:
//             teamScores.team1.push(result);
//             break;
//           case 2:
//             teamScores.team2.push(result);
//             break;
//           case 3:
//             teamScores.team3.push(result);
//             break;
//           case 4:
//             teamScores.team4.push(result);
//             break;
//           case 5:
//             teamScores.team5.push(result);
//             break;
//           case 6:
//             teamScores.team6.push(result);
//             break;
//           case 7:
//             teamScores.team7.push(result);
//             break;
//           default:
//             console.warn(`잘못된 팀 번호: ${teamNumber}`);
//         }
//       })
//     })


app.post('/saveDb', (req, res) => {
  const gameName = req.body.gameName
  const loggedName = req.body.sessionName;
  const memAvg = req.body.sessionAvg;
  const game1 = req.body.Game1 || 0;
  const game2 = req.body.Game2 || 0;
  const game3 = req.body.Game3 || 0;
  const game4 = req.body.Game4 || 0;
  const db1Game = req.body.db1Game || 0;
  const db2Game = req.body.db2Game || 0;
  const db3Game = req.body.db3Game || 0;
  const db4Game = req.body.db4Game || 0;

  
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
  connection.query(`SELECT teamNumber, SUM(1Game) AS sum_game1, SUM(1Game_P_M) AS sum_1game_p_m, 
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
  connection.query(`select userName, userAvg, 1Game, 2Game, 3Game, 4Game from ${gameName} where userName = '${loggedName}'`, (error, result) => {
    if(error) {
      throw error;
    }else {
      connection.query(`select * from ${gameName} ORDER BY userTotal DESC, userAvg DESC`, (error, results) => {
        if (error) {
          throw error;
        }else {
          connection.query(`
            SELECT teamNumber, 
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
            GROUP BY teamNumber;`, (error, teamRank) =>{
            if(error){
              throw error
            }else {
              res.render('test', { userName: result, results: results, gameName: gameName, teams, teamScores, teamRank: teamRank});}
            });
          }
        })
      }
    })
  })



// 로그인 gameselect 렌더링
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
                const tableName = row[`Tables_in_allcover`]; // 테이블 이름 추출
                return tableName !== 'member' && tableName !== 'scorebord' && tableName !== 'team_scoreboard'; // member와 scoreboard 테이블 제외
              });

              res.render('gameselect', { results: results, result: result, filteredTables: filteredTables });
            });
          }
        });
      }
    }
  });
});


app.post('/createGame', (req, res) => {
  const gameName = req.body.gameName;
  const memName = req.body.userName;
  const memAvg = req.body.userAvg;
  console.log(gameName)
  console.log(memName)
  console.log(memAvg)

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
    const createTableQuery = `CREATE TABLE ${gameName} (userName varchar(5), userAvg int, 1Game int, 1Game_P_M varchar(20), 2Game int, 2Game_P_M varchar(20), 3Game int, 3Game_P_M varchar(20), 4Game int, 4Game_P_M varchar(20), userThisAvg float, userTotal int, userHigh int, userLow int, teamNumber int)`;
    connection.query(createTableQuery, (error, results) => {
      if (error) {
        console.error('테이블 생성 실패:', error);
        res.status(500).send('테이블 생성에 실패했습니다.');
        return;
      }
      const insertUserQuery = `INSERT INTO ${gameName} (userName, userAvg) VALUES (?, ?)`;
      connection.query(insertUserQuery, [memName, memAvg], (error, results) => {
        if (error) {
          console.error('사용자 추가 실패:', error);
          res.status(500).send('사용자 추가에 실패했습니다.');
          return;
        }
        console.log('테이블이 성공적으로 생성되었습니다.');
        console.log('사용자가 성공적으로 추가되었습니다.');
      })
    })
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
    connection.query(`SELECT teamNumber, SUM(1Game) AS sum_game1, SUM(1Game_P_M) AS sum_1game_p_m, 
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

  connection.query(`select userName, userAvg, 1Game, 2Game, 3Game, 4Game from ${gameName} where userName = '${memName}'`, (error, result) => {
    if (error) {
      throw error;
    } else {
      connection.query(`select * from ${gameName} ORDER BY userTotal DESC, userAvg DESC`, (error, results) => {
        if (error) {
          throw error;
        }else {
          connection.query(`
            SELECT teamNumber, 
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
              res.render('test', { userName: result, results: results, gameName: gameName, teams, teamScores, teamRank: teamRank});}
              });
            }
          })
        }
      })
    }
  })
})

app.post('/joinGame', (req, res) => {
  const gameName = req.body.joinGame;
  const memName = req.body.memName;
  const memAvg = req.body.memAvg;

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
      connection.query(`insert into ${gameName} (userName, userAvg) values (?, ?)`, [memName, memAvg], (error, result) => {
        if (error) {
          throw error;
        }
      })
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
      connection.query(`SELECT teamNumber, SUM(1Game) AS sum_game1, SUM(1Game_P_M) AS sum_1game_p_m, 
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
  connection.query(`select userName, userAvg, 1Game, 2Game, 3Game, 4Game from ${gameName} where userName = '${memName}'`, (error, result) => {
    if (error) {
      throw error;
    } else {
      connection.query(`select * from ${gameName} ORDER BY userTotal DESC, userAvg DESC`, (error, results) => {
        if (error) {
          throw error;
        }else {
          connection.query(`
            SELECT teamNumber, 
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
              res.render('test', { userName: result, results: results, gameName: gameName, teams, teamScores, teamRank: teamRank});}
              });
            }
          })
        }
      })
    }
  })
})


app.post('/teamJoin', (req, res) => {
  const loggedName = req.body.joinGameuserName
  const gameName = req.body.joinGameName
  const teamNumber = req.body.teamNumber

  connection.query(`update ${gameName} set teamNumber = ${teamNumber} where userName = '${loggedName}'`, (error, result) => {
    if (error) {
      throw error;
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
    connection.query(`SELECT teamNumber, SUM(1Game) AS sum_game1, SUM(1Game_P_M) AS sum_1game_p_m, 
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
  connection.query(`select userName, userAvg, 1Game, 2Game, 3Game, 4Game from ${gameName} where userName = '${loggedName}'`, (error, result) => {
  if (error) {
    throw error;
  } else {
    connection.query(`select * from ${gameName} ORDER BY userTotal DESC, userAvg DESC`, (error, results) => {
      if (error) {
        throw error;
      }else {
        connection.query(`
          SELECT teamNumber, 
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
            res.render('test', { userName: result, results: results, gameName: gameName, teams, teamScores, teamRank: teamRank});}
            });
          }
        })
      }
    })
  })
})

app.post('/resetTeam', (req, res) => {
  const loggedName = req.body.resetTeamuserName;
  const gameName = req.body.resetTeamGameName 

  connection.query(`update ${gameName} set teamNumber = null;`, (error, result) => {
    if (error) {
      throw error;
    } else {
      connection.query(`SELECT userName, userAvg, 1Game, 2Game, 3Game, 4Game FROM ${gameName} WHERE userName = '${loggedName}'`, (error, result) => {
        if (error) {
          throw error;
        } else {
          connection.query(`SELECT * FROM ${gameName} ORDER BY userTotal DESC, userAvg DESC`, (error, results) => {
            if (error) {
              throw error;
            } else {
              connection.query(`select SUM(1Game) as sum_game1, sum(1Game_P_M) as sum_1game_p_m, sum(2Game) as sum_game2, sum(2Game_P_M) as sum_2game_p_m, sum(3Game) as sum_game3, sum(3Game_P_M) as sum_3game_p_m, sum(4Game) as sum_game4, sum(4Game_P_M) as sum_4game_p_m from ${gameName} where teamNumber = 1`, (error, team1) => {
                if (error) {
                  throw error;
                } else {
                  connection.query(`select * from ${gameName} where teamNumber = 1`, (error, teamScore1) => {
                    if (error) {
                      throw error;
                    } else {
                      connection.query(`select SUM(1Game) as sum_game1, sum(1Game_P_M) as sum_1game_p_m, sum(2Game) as sum_game2, sum(2Game_P_M) as sum_2game_p_m, sum(3Game) as sum_game3, sum(3Game_P_M) as sum_3game_p_m, sum(4Game) as sum_game4, sum(4Game_P_M) as sum_4game_p_m from ${gameName} where teamNumber = 2`, (error, team2) => {
                        if (error) {
                          throw error;
                        } else {
                          connection.query(`select * from ${gameName} where teamNumber = 2`, (error, teamScore2) => {
                            if (error) {
                              throw error;
                            } else {
                              connection.query(`select SUM(1Game) as sum_game1, sum(1Game_P_M) as sum_1game_p_m, sum(2Game) as sum_game2, sum(2Game_P_M) as sum_2game_p_m, sum(3Game) as sum_game3, sum(3Game_P_M) as sum_3game_p_m, sum(4Game) as sum_game4, sum(4Game_P_M) as sum_4game_p_m from ${gameName} where teamNumber = 3`, (error, team3) => {
                                if (error) {
                                  throw error;
                                } else {
                                  connection.query(`select * from ${gameName} where teamNumber = 3`, (error, teamScore3) => {
                                    if (error) {
                                      throw error;
                                    } else {
                                      connection.query(`select SUM(1Game) as sum_game1, sum(1Game_P_M) as sum_1game_p_m, sum(2Game) as sum_game2, sum(2Game_P_M) as sum_2game_p_m, sum(3Game) as sum_game3, sum(3Game_P_M) as sum_3game_p_m, sum(4Game) as sum_game4, sum(4Game_P_M) as sum_4game_p_m from ${gameName} where teamNumber = 4`, (error, team4) => {
                                        if (error) {
                                          throw error;
                                        } else {
                                          connection.query(`select * from ${gameName} where teamNumber = 4`, (error, teamScore4) => {
                                            if (error) {
                                              throw error;
                                            } else {
                                              connection.query(`select SUM(1Game) as sum_game1, sum(1Game_P_M) as sum_1game_p_m, sum(2Game) as sum_game2, sum(2Game_P_M) as sum_2game_p_m, sum(3Game) as sum_game3, sum(3Game_P_M) as sum_3game_p_m, sum(4Game) as sum_game4, sum(4Game_P_M) as sum_4game_p_m from ${gameName} where teamNumber = 5`, (error, team5) => {
                                                if (error) {
                                                  throw error;
                                                } else {
                                                  connection.query(`select * from ${gameName} where teamNumber = 5`, (error, teamScore5) => {
                                                    if (error) {
                                                      throw error;
                                                    } else {
                                                      connection.query(`select SUM(1Game) as sum_game1, sum(1Game_P_M) as sum_1game_p_m, sum(2Game) as sum_game2, sum(2Game_P_M) as sum_2game_p_m, sum(3Game) as sum_game3, sum(3Game_P_M) as sum_3game_p_m, sum(4Game) as sum_game4, sum(4Game_P_M) as sum_4game_p_m from ${gameName} where teamNumber = 6`, (error, team6) => {
                                                        if (error) {
                                                          throw error;
                                                        } else {
                                                          connection.query(`select * from ${gameName} where teamNumber = 6`, (error, teamScore6) => {
                                                            if (error) {
                                                              throw error;
                                                            } else {
                                                              connection.query(`select SUM(1Game) as sum_game1, sum(1Game_P_M) as sum_1game_p_m, sum(2Game) as sum_game2, sum(2Game_P_M) as sum_2game_p_m, sum(3Game) as sum_game3, sum(3Game_P_M) as sum_3game_p_m, sum(4Game) as sum_game4, sum(4Game_P_M) as sum_4game_p_m from ${gameName} where teamNumber = 7`, (error, team7) => {
                                                                if (error) {
                                                                  throw error;
                                                                } else {
                                                                  connection.query(`select * from ${gameName} where teamNumber = 7`, (error, teamScore7) => {
                                                                    if (error) {
                                                                      throw error;
                                                                    }else {
                                                                      connection.query(`
                                                                        SELECT teamNumber, 
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
                                                                          const teams = {
                                                                            team1: team1,
                                                                            team2: team2,
                                                                            team3: team3,
                                                                            team4: team4,
                                                                            team5: team5,
                                                                            team6: team6,
                                                                            team7: team7
                                                                          }
                                                                          const teamScores = {
                                                                            teamScore1: teamScore1,
                                                                            teamScore2: teamScore2,
                                                                            teamScore3: teamScore3,
                                                                            teamScore4: teamScore4,
                                                                            teamScore5: teamScore5,
                                                                            teamScore6: teamScore6,
                                                                            teamScore7: teamScore7
                                                                          }
                                                                            res.render('test', { userName: result, results: results, gameName: gameName, teams, teamScores, teamRank: teamRank});}
                                                                          });
                                                                        }
                                                                      })
                                                                    }
                                                                  })
                                                                }
                                                              });
                                                            }
                                                          });
                                                        }
                                                      });
                                                    }
                                                  });
                                                }
                                              });
                                            }
                                          });
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    });
    