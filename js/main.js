window.onload = loadFunction;

function loadFunction(){

    AjaxD.interceptor(function(baseApi, oldParams){
        console.log("interseptor", this);
        oldParams.params.sid = "asdasda5454asd57e45sa4da5s4d65a4sd";

        return oldParams;
    },
    function(data){
        return JSON.parse(data);
    });

    var someObject;
    var send1 = document.querySelector(".send1");
    send1.addEventListener("click", clickSend);
    var send2 = document.querySelector(".send2");
    send2.addEventListener("click", clickSend2);

    function clickSend(){
        var text = document.getElementById("first").value;
        someObject = AjaxD.parseStringForParams(text);
    }
    function clickSend2(){
        var text = document.getElementById("first").value;
        console.log("click");

        AjaxD("get", "json/my_work.json", {darel: 25, rt: "rty-seruyt", text: text})
            .send({ss : "sadas", textSend: text}, function(){
                console.log("send");
            })
            .success(function(data){
                console.log("data Send", data);
            });

        AjaxD("put", "json/my_wor.json", {title: "nemo"})
            .send({date: text})
            .success(function(data){
                console.log(data);
            })
            .fail(function(data){
                console.log("fail", data);
            })
    }
}
