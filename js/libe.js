(function(window, undefined){
    console.log(window, undefined);

    //window.AjaxD = {};

    window.AjaxD = function(type, baseApi, params){
        return new AjaxReqest(type, baseApi, params);
    };

    AjaxD.parseStringForParams = function (stringWithUrl){

        var params = {},
            paramsString = stringWithUrl.split("?");

        params.url = stringWithUrl;
        params.urlMain = paramsString[0];

        if(paramsString.length > 1){
            var massOfParams = paramsString[1].split("&");
            params.param = {};

            massOfParams.forEach(function(el){
                var value = decodeURIComponent(el.split("=")[1]);

                switch (value){
                    case "null":
                        value = null;
                        break;
                    case "NaN":
                        value = NaN;
                        break;
                    case "undefined":
                        value = undefined;
                        break;
                    default:
                        if(+value === +value){
                            value = +value;
                        }
                        break;
                }
                params.param[el.split("=")[0]] = value ;
            })
        }

        console.log(params);
        return params;

    };

    /**
     *
     * @param params {key : value}
     */

    AjaxD.addParams = function(url, params){
        var urlNew = url;
        if(!~urlNew.indexOf("?")){
            urlNew += "?";
        }
        for (var key in params){
            urlNew +=  "&" + key + "=" + encodeURIComponent(params[key].toString());
        }
        return urlNew.replace("?&", "?").replace("&&", "&");

    };

    AjaxD.interceptor = function(changeParamsBefor, changeParamsAfter){
        if(changeParamsBefor){
            AjaxD.interceptor.before = changeParamsBefor;
            if(changeParamsAfter){
                AjaxD.interceptor.after = changeParamsAfter;
            }
        }

    };
    AjaxD.interceptor.after = function(){};
    AjaxD.interceptor.before = function(){};




    function AjaxReqest(type, baseApi, params){
        this.baseApi = baseApi;
        this.props = {
          header: {},
          params: params
        };
        this.type = type;
        this.reqest = new XMLHttpRequest();
        this._onload = function(){};
        this._notLoad = function(){};
        this._progress = function(){};
        this.reqest.onload = this._load.bind(this);
        this.reqest.onprogress = this._progress.bind(this);
    }



    AjaxReqest.prototype.send = function(objectForSend, afterSendFn){

        console.log(AjaxD.interceptor.before.call(this, this.baseApi, this.props));


        this.reqest.open(this.type, AjaxD.addParams(this.baseApi, this.props.params), true);
        console.log('OPENED');

        if(objectForSend){
            if(typeof(objectForSend) == "string"){
                this.reqest.send(objectForSend);
            } else {
                this.reqest.send(JSON.stringify(objectForSend));
            }

        } else {
            this.reqest.send(null);
        }
        if(afterSendFn){
            afterSendFn();
        }

        return this;
    };
    AjaxReqest.prototype._load = function(ev){

        try{
            this.reqest.response = AjaxD.interceptor.after.call(this, this.reqest.response );
        } catch (e) {
            console.error( e );
        }

        if(this.reqest.status > 199 && this.reqest.status < 400){

            this._onload.call(this.reqest, this.reqest.response, ev);
        } else {
            this._notLoad.call(this.reqest, this.reqest.response, ev);
        }

    };

    AjaxReqest.prototype._onProgress = function(ev){
        this._progress.call(this.reqest, this.reqest.response, ev);
    };

    AjaxReqest.prototype.onProgress = function(onProgress){

        if(typeof (onProgress) !== "function"){
            console.error(".success() mast contain " + "function" + " but not - " + typeof (onProgress) + " ::", onProgress);
        } else {
            this._progress = onProgress;
        }

        return this;
    };


    AjaxReqest.prototype.success = function(sucsess){

        if(typeof (sucsess) !== "function"){
            console.error(".success() mast contain " + "function" + " but not - " + typeof (sucsess) + " ::", sucsess);
        } else {
            this._onload = sucsess;
        }

        return this;
    };
    AjaxReqest.prototype.fail = function(fail){

        if(typeof (fail) !== "function"){
            console.error(".fail() mast contain " + "function" + " but not - " + typeof (fail) + " ::", fail);
        } else {
            this._notLoad = fail;
        }

        return this;
    }



    /*
     AjaxD("get", "json/my_wor.json")
     .send()
     .success(function(data, e){
     console.log("success", data);
     })
     .fail(function(data, e){
     console.log("fail", data);
     })
     */


})(window);



