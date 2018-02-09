function niconicoscreenobj(o) {
  var f = niconicoscreenobj.f, i, len, n, prop;
  f.prototype = o;
  n = new f;
  for (i=1, len=arguments.length; i<len; ++i)
    for (prop in arguments[i])
      n[prop] = arguments[i][prop];
  return n;
}

niconicoscreenobj.f = function(){};

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
		
		if(o.nicosettings.color){
			this.env.color = o.nicosettings.color;
		}
		
		if(o.nicosettings.loop){
			this.env.loop = o.nicosettings.loop;
		}
		
		if(o.nicosettings.interval){
			
			switch(o.nicosettings.interval){
				
			case "fast":
				this.env.interval=3000;
				break;
			case "slow":
				this.env.interval=9500;
				break;
				
			}
			
		}
					
			if(o.nicosettings.font_size){
				this.env.font_size = o.nicosettings.font_size;
			}
			
			if(o.nicosettings.speed){
			
				switch(o.nicosettings.speed){
				
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

var nicoscreen = niconicoscreenobj(r9.NicoScreen);


//Record details event
kintone.events.on('app.record.detail.show', function (event) {

	var appId = kintone.app.getId();
	var recordId = kintone.app.record.getId();
	var allrecordcomments = [];
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
		var NicoObject = {
		//Basic info for displayed text
		"nicosettings":{
			color:"#FFCC00", //Font color
			speed:"slow", //Font speed - slow/fast/normal
			interval:"normal",//Font interval - slow/fast/normal
			font_size:"30px", //Font size。
			loop:true //Loop if all text have been displayed - true/false
		},
		
		//Text to flow on the page. There is no limit.
		"comments": allrecordcomments
		};

		return NicoObject;
	}

	//
	fetchComments(appId,recordId).then(function(resp){
		for(var ci=0; ci<resp.length; ci++){
			tempcomment = resp[ci].creator.name + ":" + resp[ci].text;
			allrecordcomments.push(tempcomment);
		}
		return allrecordcomments;
	}).then(createNicoObject).then(function(NicoObject){
			nicoscreen.set(NicoObject);
			nicoscreen.start();
	});

});
