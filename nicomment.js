function nicoscreenobj(o) {
  var f = nicoscreenobj.f, i, len, n, prop;
  f.prototype = o;
  n = new f;
  for (i=1, len=arguments.length; i<len; ++i)
    for (prop in arguments[i])
      n[prop] = arguments[i][prop];
  return n;
}

nicoscreenobj.f = function(){};

var r9 = {};
r9.NicoScreen = {
	env : {
		color:"white",
		interval:500,
		speed:6500,
		font_size:"24px",
		loop:true,
		height:"",
		width:""
	},
			
	top_pos:20,
	draw_index:0,
	comments:[],
		
set:function(o){
	
	this.comments = o.comments;
	
	if(o.base.color){
		this.env.color = o.base.color;
	}
	
	if(o.base.loop){
		this.env.loop = o.base.loop;
	}
	
	if(o.base.interval){
		
		switch(o.base.interval){
			
		case "fast":
			this.env.interval=3000;
			break;
		case "slow":
			this.env.interval=9500;
			break;
			
		}
		
	}
				
		if(o.base.font_size){
			this.env.font_size = o.base.font_size;
		}
		
		if(o.base.speed){
		
			switch(o.base.speed){
			
			case "fast":
				this.env.speed=4000;
				break;
			case "slow":
				this.env.speed=12000;
				break;
				
			}
		
		}
		
	},
			
	start : function(){
		
		//Set attributes with jQuery
		var elm = $("#record-gaia");
		this.elm = elm;
		this.elm.css("position", "relative");
		//this.elm.css("border", "solid 1px gray");
		this.elm.css("overflow", "hidden");
		this.elm.bind("selectstart",function(){return false;});
		this.elm.bind("mousedown",function(){return false;});
		
		
		this.env.width = ""+elm.css("width");
		this.env.height = ""+elm.css("height");
		
		this.env.width = this.env.width.replace("px","");
		this.env.height = this.env.height.replace("px","");
		
		//console.log(this.env.width);
		
		var inid = setInterval("nicoscreen.draw(null)", this.env.interval);
		
	},
		
	draw: function(str){
		var n = nicoscreen;
		
		var i = n.draw_index;
		var comment_str =  "";
		
		if(str){
			comment_str = str;
			i=parseInt((new Date)/1000);
		}else{
		
			if (n.draw_index >= n.comments.length) {
				if(n.env.loop) n.draw_index = 0;
				return false;
			}
			comment_str = n.comments[i];
			n.draw_index++;
		}
		
		n.top_pos =  Math.floor( Math.random() * parseInt(n.env.height) );
		
		var end_left = (parseInt(n.env.width)) * -1;
		
		var cmid = "cm" + i + "";
		var com_obj = $("<div id='" + cmid + "' style='left:" + n.env.width + "px; position:absolute;top:" + n.top_pos + "px;color:"+n.env.color+";font-size:"+n.env.font_size+";font-weight:bold;text-shadow: black 1px 1px 1px;width:100%;z-index:99999;cursor:default'>" + comment_str + "</div>");
		
		$("#record-gaia").append(com_obj);
		
		(function(that){
			var tmp_cmid = cmid;
			com_obj.animate({
				left: end_left
			}, {
				duration: n.env.speed,
				complete: function(){
					var elm_id = "#" + tmp_cmid;
					$("#record-gaia").remove(elm_id);
					that.top_pos = 10;
					
				}
				
			});
		})(this);
	},
		
		add:function(str){
			this.draw(str);
		}
		
		
	};

		var nicoscreen = nicoscreenobj(r9.NicoScreen);


    kintone.events.on('app.record.detail.show', function (event) {
	//nicoscreen.set(obj);
	//nicoscreen.start();

			var appId = kintone.app.getId();
		var recordId = kintone.app.record.getId();
		var bodyofcomments = [];
		var tempcomment = "";

		//Return all comments in the record
		function fetchComments(appId, recordId, opt_offset, opt_comments) {
			var offset = opt_offset || 0;
			var body = {
			    "app": appId,
			    "record": recordId,
			    "offset": offset
			};
			var comments = opt_comments || [];
			return kintone.api(kintone.api.url('/k/v1/record/comments', true), 'GET', body).then(function(resp) {
			    comments = comments.concat(resp.comments);
			    if (resp.older === true) {
			        return fetchComments(appId,recordId, offset + 10, comments);
			    }
			    return comments;
			});
		}

		function createNicoObject(comments){
			var obj = {
			
			//Basic info for displayed text
			"base":{
				color:"#FFCC00", //Font color
				speed:"slow", //Font speed - slow/fast/normal
				interval:"normal",//Font interval - slow/fast/normal
				font_size:"30px", //Font size。
				loop:true //Loop if all text have been displayed - true/false
				
			},
			
			//Text to flow on the page. There is no limit.
			"comments": bodyofcomments
			};

			return obj;
		}

		//
		fetchComments(appId,recordId).then(function(resp){
			for(var ci=0; ci<resp.length; ci++){
				//console.log(resp[ci].creator.name + ":" + resp[ci].text);
				tempcomment = resp[ci].creator.name + ":" + resp[ci].text;
				bodyofcomments.push(tempcomment);
				//console.log(bodyofcomments);
			}
			return bodyofcomments;
		}).then(createNicoObject).then(function(obj){
				nicoscreen.set(obj);
				nicoscreen.start();
		});

    });

