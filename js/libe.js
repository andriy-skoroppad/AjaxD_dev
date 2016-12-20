(function(window, undefined){
    console.log(window, undefined);

    //window.AjaxD = {};

    window.AjaxD = function(type, baseApi, params){
        return new AjaxReqest(type, baseApi, params);
    };

    //AjaxD._requestArchive = [];

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
     * @param params {header:{}, params: {}}
     */

    AjaxD.addParams = function(url, params){
        var urlNew = url;
        var urlVariable = urlNew.match(/\/?::[^\/]+/g) || [];
        console.log(urlVariable);

        urlVariable.forEach(function(el){
            var paramsEl = params[el.replace(/\/?::/, "")];

            console.log("paramsEl", el);
            if(paramsEl){
                if(~el.indexOf("/")){
                    paramsEl = "/" + paramsEl;
                }
                urlNew = urlNew.replace(el, paramsEl );
            } else {
                urlNew = urlNew.replace(el, "" );
            }

        });

        if(!~urlNew.indexOf("?")){
            urlNew += "?";
        }

        for (var key in params){
            if(!~urlVariable.indexOf("/::" + key) &&  !~urlVariable.indexOf("::" + key)){
                urlNew +=  "&" + key + "=" + encodeURIComponent(params[key].toString());
            }
        }

        return urlNew.replace("?&", "?").replace("&&", "&");

    };

    AjaxD.interceptor = function(changeParamsBefore, changeParamsAfter){
        if(changeParamsBefore){
            AjaxD.interceptor.before = changeParamsBefore;
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
        this.reqest.addEventListener("load", this._load.bind(this) );
        this.reqest.addEventListener("progress", this._progress.bind(this) );


        //this.reqest.onload = this._load.bind(this);
        //this.reqest.onprogress = this._progress.bind(this);
    }

    AjaxReqest.prototype.addHeader = function(obj){
        if(obj){
            this.props.header = obj;
        }
      return this;
    };


    AjaxReqest.prototype.send = function(objectForSend, afterSendFn){

        console.log(AjaxD.interceptor.before.call(this, this.baseApi, this.props));

        this.reqest.open(this.type, AjaxD.addParams(this.baseApi, this.props.params), true);
        console.log('OPENED');

        //add header
        if(this.props.header){
            for(var key in this.props.header){
                this.reqest.setRequestHeader( key , this.props.header[key]);
            }
        }




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

  /*  AjaxReqest.prototype._save = function(reqest){
        var url = AjaxD.addParams(this.baseApi, this.props.params);
        var baseUrl = url.replace(/\?.+$/, "");

        AjaxD._requestArchive.push({
            url: url,
            mainUrl: baseUrl,
            props: this.props,
            data: reqest.response,
            reqest: reqest
        })
    };*/

   /* AjaxReqest.prototype._loadFromArchive = function(){
        var url = AjaxD.addParams(this.baseApi, this.props.params);
        var reqestData = null;
        AjaxD._requestArchive.forEach(function(el){
            if(el.url === url){
                reqestData = el.reqest;
            }
        });
        return reqestData;
    };*/
    AjaxReqest.prototype._load = function(ev){
        console.log("this", this);

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



