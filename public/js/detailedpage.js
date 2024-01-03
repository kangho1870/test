fetch('/protected')
            .then(Response => {
                if(Response.ok) {
                    document.body.innerHTML = 
                    `<h1>Allcover 회원정보</h1>
                        <table>
                            <tr>
                            <th>이름</th>
                            <th>전화번호</th>
                            <th>평균점수</th>
                            <th>나이</th>
                            <th>최고기록 점수</th>
                            <th>퍼펙트 횟수</th>
                            </tr>
                            <% for(var i = 0; i < detailedMember.length; i++) { %>
                            <tr>
                                <td><%= detailedMember[i].memName %></td>
                                <td><%= detailedMember[i].memPhoneNumber %></td>
                                <td><%= detailedMember[i].memAvg %></td>
                                <td><%= detailedMember[i].memAge %></td>
                                <td><%= detailedMember[i].memMaxScore %></td>
                                <td><%= detailedMember[i].memPerfectCount %></td>
                            </tr>
                            <% }; %>
                        </table>`
                }else {
                    alert('로그인 필요');
                }
            });