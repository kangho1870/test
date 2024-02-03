function saveLocal() {
    var userName = document.getElementsByName('userName')[0].value;
    
    results.forEach(row => {
        if(row.memName == userName) {
            if(localStorage.length == 0) {
                sessionStorage.setItem("loggedName", userName);
            }else {
                sessionStorage.clear
                sessionStorage.setItem("loggedName", userName);
            }
        }
        document.getElementById('login-form').submit();
    });
}