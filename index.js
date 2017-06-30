// hoping for the best :)
var express=require("express");
var app=express();
var fs=require("fs");
var url=require("url");
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var connection=require("./db.js");  // attaching database from external file db.js
var mongo=require("mongodb");
var crypto = require('crypto'),   // 
    algorithm = 'aes-256-ctr',    //
    password = 'rohit';           // Password encryption module attached
app.use("/source",express.static("source")); // style sheets and css
app.use("/images",express.static("images")); // images folder
app.use("/uploads",express.static("uploads"));
app.use("/dp",express.static("dp"));
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
 var user_email="";

var http=require("http").Server(app);
var io=require("socket.io")(http);
/*var mobileBrowser = require('detect-mobile-browser');
 app.use(mobileBrowser());
 
app.get('/', function (req, res){
 
    //in req 
    var check1=req.SmartPhone.isAny();
    var check=res.locals.SmartPhone.isAny();
	
	console.log(check1 + " " +check);
    if(check==true && check1==true)
	{
		res.sendFile("mobile_index.htm",{root:'./'});
	}
   else{
	   
	   
   }	
    
 
});*/
 
var deviceType=require('device-type');
app.get("/",function(req,res){

 var type=deviceType(req);
 if(type.desktop==true)
 {
	res.sendFile("new_index.html",{root:'./'});
 }
 else
 {
	 res.sendFile("mobile_index.htm",{root:'./'});
 }
});


app.get("/discussion*",function(req,res){

 res.sendFile("discussion.html",{root:'./'});
});

app.get("/mobile_discussion*",function(req,res){

 res.sendFile("mobile_discussion.html",{root:'./'});
});

app.post("/choose_interest",function(req,res){

var packet=req.body.packet;
packet=JSON.parse(packet);
//console.log(packet.id_val + " " +user_email);
var cookie_email=req.cookies.cookie_email;
var user_id=new mongo.ObjectId(cookie_email);
    connection(function(err,db){
	
	       var user_interest={user_id:user_id,interest:packet.id_val};
	       db.collection("interests").insert(user_interest,function(error,result){
	       
		     if(!error)
			 {
			   console.log("Interest inserted successfully");
			 }
			 
	  
	       });
	
	
	});

})

app.post("/check",function(req,res){
var cookie_email=req.cookies.cookie_email;
var user_id=new mongo.ObjectId(cookie_email);
      connection(function(err,db){
         
		 db.collection("interests").find({"user_id":user_id}).toArray(function(error,result){
		 
		   var count=result.length;
		   if(count<3)
		   {  var left=3-count;
		      res.send("Please select " +left+ " more interest(s)!");
		   }
		   else
		   {
		     res.send("1");
		   }
		 
		 });
		 
    });

})

   
 
 function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  try{
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
  }
  catch(ex){
	  console.log('text encrypt nahi hua trying it again');
            encrypt(text);
  }
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  try{
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
  }
  catch(ex){
	  console.log('text decrypt nahi hua trying it again..');
            decrypt(text);
  }
}  

function filter_email(email)
  {
   var ok="";
	if(email.indexOf("@")!=-1)
	{
	    return 0;
	}
	else
	{
	  return 1;
	}
  }
  
  function filter_password(password,confirm_password)
  {
     if(password.length<5)
	 {
	   return -1;
	 }
	 else if(password===confirm_password)
	 {
	   return 0;
	 }
	 else
	 {
	    return 1;
	 }
  }
  

app.get("/form_page",function(req,res){

//res.sendFile("c:/node/shop/form_page.html");
res.sendFile("form_page.html",{root:'./'});

})



app.get("/masonary",function(req,res){

res.sendFile("masonary.html",{root:'./'});

})


app.post("/sign_up_form",function(req,res){

var packet=req.body.packet;
packet=JSON.parse(packet);

/*console.log(packet.fname + " " +packet.lname + " " +packet.email + " " +packet.password + " " +packet.confirm_password + " " +packet.gender);*/

  var fname_fil=filter_fname(packet.fname);
  var lname_fil=filter_lname(packet.lname);
  var email_fil=filter_email(packet.email);
 connection(function(err,db){
    db.collection("users").find({email:packet.email}).toArray(function(error,result){
		 
		 if(result.length>0)
		 {
		    email_fil=-1;
			
		 }
		 else
		 {
		   
		   email_fil=0;
		   user_email=packet.email;
		 }
		 
		 
		       if(fname_fil!="1" && fname_fil!=-1 && lname_fil!=-1 && lname_fil!="1" && email_fil!="1" && password_fil!="1" && password_fil!="-1" && email_fil!="-1")
                { 
                  var user_info={fname:packet.fname,lname:packet.lname,password:password,email:packet.email,gender:packet.gender,popularity:1,profile_pic:"",skills:"",about:"",number:"",tutorial:0};
  
                 // all are correct
	               connection(function(error,db){
	                  db.collection("users").insert(user_info,function(err,result){
	                    if(err)
	                      {
	                        console.log("error while inserting");
						    
	                      }
	                    else
	                      {
	                        console.log("all form data inserted successfully");
							_id=result.ops[0]._id;
							var cookie_email=_id;
					        console.log(_id);
					        
					       // res.cookie('cookie_email',_id, {expire : new Date() + 9999});
	                        res.json({fname_fil:fname_fil,lname_fil:lname_fil,email_fil:email_fil,password_fil:password_fil,cookie_email:cookie_email});
					  
	                       }
	  
	  
	                    });
	 
	 
	                });
	 
	 
	                // sending positive response to client
					
                }
                else
                {
                    // throw err to index.html
	                  res.json({fname_fil:fname_fil,lname_fil:lname_fil,email_fil:email_fil,password_fil:password_fil});
	
                }
		 
		 
		  
   });
		 
});
  
  
  var password_fil=filter_password(packet.password,packet.confirm_password);
  var gender=packet.gender;
  var password=encrypt(packet.password);
  
  
  
 
  
  
  
 
  
  
  
  
  
  function filter_fname(fname)
  { if(fname==""){return -1;}
    var special=["1","2","3","4","5","6","7","8","9","0","~","`","!","@","#","$","%","^","&","*","(",")","-","_","+","=","|","?","<",">",".","/"];
	
	   var er="";
       for(var i=0;i<special.length;i++)
       {
         if(fname.indexOf(special[i])!=-1)
	      {
	        break;
	       }
        }
		if(i!=special.length)
		{
		   er=1;
		}
		else
		{
		  er=0;
		}
		return er;
  }
  
  function filter_lname(lname)
  { if(lname==""){return -1;}
     var special=["1","2","3","4","5","6","7","8","9","0","~","`","!","@","#","$","%","^","&","*","(",")","-","_","+","=","|","?","<",">",".","/"];
	
	   var er="";
       for(var i=0;i<special.length;i++)
       {
         if(lname.indexOf(special[i])!=-1)
	      {
	        break;
	       }
        }
		if(i!=special.length)
		{
		   er=1;
		}
		else
		{
		  er=0;
		}
		return er;
  }
  
  function filter_email(email)
  {
   var ok="";
	if(email.indexOf("@")!=-1)
	{
	    return 0;
	}
	else
	{
	  return 1;
	}
  }
  
  function filter_password(password,confirm_password)
  {
     if(password.length<5)
	 {
	   return -1;
	 }
	 else if(password===confirm_password)
	 {
	   return 0;
	 }
	 else
	 {
	    return 1;
	 }
  }
  

})



/////////////////////////////////////////////////////////////
var fileUpload = require('express-fileupload');
var path=require('path');

// default options
app.use(fileUpload({
    limits: { fileSize: 1024*1024*5},
}));
app.use("/uploads",express.static("uploads"));


app.get('/feeds', function(req, res) {
       
	   
	   
	 var type=deviceType(req);
 if(type.desktop==true)
 {
	res.sendFile("feeds.html",{root:'./'});
 }
 else
 {
	 res.sendFile("mobile_feeds.html",{root:'./'});
 }
	   
	   
    });
	
	app.get("/mobile_feeds",function(req,res){
		
		res.sendFile("mobile_feeds.html",{root:'./'});
	});
	
	app.get("/mobile_feeds",function(req,res){
		
		res.sendFile("mobile_feeds.html",{root:'./'});
	});


var send_fpath="";
app.post('/upload', function(req, res) {
	  var sampleFile;
	  console.log("uploads");
	 
    sampleFile = req.files.sampleFile;
	//console.log(req.files.sampleFile);
	  var extname=path.extname(sampleFile.name);
	  var email=req.cookies.cookie_email;
      var email=decrypt(email);
	if(sampleFile.name=="")
	{
	  res.send("Empty");
	}
	
	else if(extname!==".jpg" && extname!==".JPG" && extname!==".PNG" && extname!==".png" && extname!==".GIF" && extname!==".gif")
	{
	   res.send("-1");
	}
	else
	{
	  var fs=require("fs");
	   var num=Math.random();
	   num=num*10000000000000000000;
	   var fpath="./uploads/"  + num + ".jpg";
	   
	   sampleFile.mv(fpath, function(err) {
        if (err) {
            res.status(500).send(err);
			console.log(err);
			console.log("nahi hui upload");
        }
        else {
		      
		var	send_fpath="/uploads/" + num + ".jpg";
			 console.log("upload ho gai");
            res.send(send_fpath);
        }
	  });
	}
	
	
	
});


app.post("/show_post",function(req,res){
 // var ints=req.body.interests;
	 // var int_length=ints.length;
	 // console.log(int_length);
     connection(function(error,db){
	 
	   if(!error)
	   {
	       db.collection("feeds").aggregate([
		   
		   {  
		      $lookup:
			          {
						  from:"users",
						  localField:"user_id",
						  foreignField:"_id",
						  as:"user_info"
					  }
		   
		   }
		   ]).sort({"time":-1}).limit(4).skip(0).toArray(function(err,result){
		   
		      if(err)
			  {
			    console.log("Cannot run query to retrive feeds");
			  }
			  else
			  {
			    //console.log(result.length);
				//console.log(result[0]);
				//console.log(result);
				res.send(result);
			    
			  }
		   
		   
		   });
	   }
	   else
	   {
	     console.log("Error cannot connect to db feeds module");
		 console.log(error);
	   }
	 
	 
	 });
  
  
  });
  
  
  app.post("/show_more_post",function(req,res){
  
	  var feed_shown=parseInt(req.body.feed_shown);
	  //console.log(feed_shown);
     connection(function(error,db){
	 
	   if(!error)
	   {
	       db.collection("feeds").aggregate([
		   
		    {  
		      $lookup:
			          {
						  from:"users",
						  localField:"user_id",
						  foreignField:"_id",
						  as:"user_info"
					  }
		   
		   }
		   
		   ]).sort({"time":-1}).skip(feed_shown).limit(2).toArray(function(er2,re2){
			   
			   //console.log(re2);
			   res.send(re2);
			   
		   });
	   }
	   else
	   {
	     console.log("Error cannot connect to db feeds module");
		 console.log(error);
	   }
	 
	 
	 });
  
  
  });
  
  
  
  
  app.post("/get_person_detalis",function(req,res){
	  
	  var user_id=new mongo.ObjectId(req.body.cookie_val);
	    connection(function(err,db){
			
			db.collection("users").find({"_id":user_id}).toArray(function(error,result){
				
				    var fname=result[0].fname;
					var lname=result[0].lname;
					var cname=fname + " "+lname;
					var popularity=result[0].popularity;
					var profile_pic=result[0].profile_pic;
					var gender=result[0].gender;
					var number=result[0].number;
					var tutorial=result[0].tutorial;
					res.json({cname:cname,popularity:popularity,profile_pic:profile_pic,gender:gender,number:number,tutorial:tutorial});
					
					db.collection("users").update({"_id":user_id},{$set:{"tutorial":1}});
				
			});
			
		});
	  
  });



function filter_post_text(post_text)
{if(post_text===""){return 2}
 if(post_text.length<25){return 3;}
    var special=["<",">"];
	
	   var er="";
       for(var i=0;i<special.length;i++)
       {
         if(post_text.indexOf(special[i])!=-1)
	      {
	        break;
	       }
        }
		if(i!=special.length)
		{
		   er=1;
		}
		else
		{
		  er=0;
		}
		return er;
}

function filter_post_title(post_title)
{if(post_title===""){return 2}
 if(post_title.length<25){return 3;}
var special=["<",">"];
	
	   var er="";
       for(var i=0;i<special.length;i++)
       {
         if(post_title.indexOf(special[i])!=-1)
	      {
	        break;
	       }
        }
		if(i!=special.length)
		{
		   er=1;
		}
		else
		{
		  er=0;
		}
		return er;
}

function filter_post_tags(post_tags)
{   if(post_tags===""){return 2}
 var special=["<",">"];
	
	   var er="";
       for(var i=0;i<special.length;i++)
       {
         if(post_tags.indexOf(special[i])!=-1)
	      {
	        break;
	       }
        }
		if(i!=special.length)
		{
		   er=1;
		}
		else
		{
		  er=0;
		}
		return er;
}

var just_inserted_id="";
io.on("connection",function(socket){

   socket.on("post_submit",function(packet){
        
		 packet=JSON.parse(packet);
		 var post_title_fil=filter_post_title(packet.post_title); // in sab functions ki body upar hai ^
		 var post_type=packet.post_type;
		 var post_text_fil=filter_post_text(packet.post_text);
		 var post_tags_fil=filter_post_tags(packet.tags);
		 var user_id=new mongo.ObjectId(packet.cookie_val);
		 var file_path=packet.file_path;
		 console.log(post_title_fil + " " +post_text_fil + " " + post_tags_fil);
		 //console.log(packet.post_title + " " + packet.post_text + " " +typeof(tags) + " " +send_fpath);
		 
	     if(post_text_fil==1 ||  post_text_fil==3 || post_tags_fil==1 || post_tags_fil==2 || post_title_fil==1 || post_title_fil==2 ||post_title_fil==3)
		 {   // if there is something error in post
		 io.sockets.emit("post_error_to_client",{post_text_fil:post_text_fil,cookie_val:packet.cookie_val,post_tags_fil:post_tags_fil,post_title_fil:post_title_fil});
		 }
		 else
		 {
		     //send error to client
		    io.sockets.emit("post_error_to_client",{post_text_fil:post_text_fil,cookie_val:packet.cookie_val,post_tags_fil:post_tags_fil,post_title_fil:post_title_fil,same_post:0});
			// insert data into the db
			
			connection(function(error,db){
			
			    if(error)
				{
				   console.log("I am post insert module. Cannot connect to the db! line 653");
				}
				else
				{   var post_title=packet.post_title;
					   db.collection("feeds").find({"post_title":post_title}).toArray(function(er1,re1){
						   
						   if(re1.length!=1)
						   {
							      // post submit ka data insert ho raha hai db me
			                          var time= Date();
				           var  post_data={user_id:user_id,post_type:packet.post_type,post_title:packet.post_title,post_text:packet.post_text,post_pic:file_path,post_tags:packet.tags,likes:0,like_by:"",dislike_by:"",time:time};
				   
				           db.collection("feeds").insert(post_data,function(err,result){
				   
				             if(err){console.log("Cannot insert post into the db")}
					           else{console.log("feeds inserted successfully");just_inserted_id=post_data._id;
					          //console.log(result);
					          db.collection("users").find({"_id":user_id}).toArray(function(er2,re2){
						   
						       var fname=re2[0].fname;
						       var lname=re2[0].lname;
						       var cname=fname + " " +lname;
						       var popularity=re2[0].popularity;
						        var dp=re2[0].profile_pic;
						        io.sockets.emit("new_post",{user_id:user_id,post_type:packet.post_type,post_title:packet.post_title,post_text:packet.post_text,post_pic:file_path,post_tags:packet.tags,just_inserted_id:just_inserted_id,cookie_val:packet.cookie_val,cname:cname,popularity:popularity,dp:dp});
						   
					           });
					        }
				   
				         });
				              // sending updated post to the all the clients in the world
	                         
						   }
						   else
						   {
							   console.log("Question already exsist!");
							   //send error to client
							   io.sockets.emit("post_error_to_client",{post_text_fil:post_text_fil,cookie_val:packet.cookie_val,post_tags_fil:post_tags_fil,post_title_fil:post_title_fil,same_post:-1});
							   
						   }
						   
					   });
					
					
					
			
				}
			
			});
			
			
			
		 }
       
   });
   
   
   socket.on("remove_pic",function(file_path){
     
	   var file=file_path.file_path;
	   file= "./" +file;
	   send_fpath="";
	   fs.unlinkSync(file);
   
   });
   
   socket.on("remove_ans_pic",function(global_pic){
     
	   var file=global_pic.global_pic;
	   file= "./" +file;
	   fs.unlinkSync(file);
       console.log("file remove ho gai");
   });

});






app.post("/login",function(req,res){

 var packet=req.body.packet;
 //console.log(packet);
 packet=JSON.parse(packet);
 //console.log(packet.user_email);
 var email_fil=filter_email(packet.user_email);
 var password_fil=filter_password(packet.user_password);
 
 
 if(email_fil!=1 && password_fil!=-1)
 { 
   //console.log("excepted");
   //var email=encrypt(packet.user_email);
   var password=encrypt(packet.user_password);
   //console.log(email + " " +password);
  connection(function(err,db){
  
   db.collection("users").find({$and:[{email:packet.user_email},{password:password}]}).toArray(function(error,result){
   
      if(error)
	  {
	     console.log("login wala module database se connect nahi ho pa raha hai line no 562");
	  }
	  else
	  {
	     
		 if(result.length==1)
		 {// send successful login to the index.html
		   console.log("User exsist");
		   
		  
		      _id=result[0]._id;
			  var cookie_val=_id;
			
		  
		  
		   
		   res.json({user_email:"ok",user_password:"ok",cookie_val:cookie_val});
		 }
		 else
		 { 
		    // user name or password incorrect
		   console.log("user dosen't exsist");
		   res.json({user_email:-2,user_password:-2});
		 }
	  }
   
   });
  
  
  });
   
   
   
   
   
 }
 else
 {
    // user ne password and email ka format hi galat dala h....db me check nahi karenge
   res.json({user_email:email_fil,user_password:password_fil});
 }

});

function filter_ans(ans_text)
{
	if(ans_text===""){return 2}
	if(ans_text.length<25){return 3;}
var special=["<script>","</script>"];
	
	   var er="";
       for(var i=0;i<special.length;i++)
       {
         if(ans_text.indexOf(special[i])!=-1)
	      {
	        break;
	       }
        }
		if(i!=special.length)
		{
		   er=1;
		}
		else
		{
		  er=0;
		}
		return er;
}

app.post('/upload_ans_pic', function(req, res) {
	  var sampleFile;
    sampleFile = req.files.sampleFile;
	//console.log(req.files.sampleFile);
	  var extname=path.extname(sampleFile.name);
	  var email=req.cookies.cookie_email;
      var email=decrypt(email);
	if(sampleFile.name=="")
	{
	  res.send("Empty");
	}
	
	else if(extname!==".jpg" && extname!==".JPG" && extname!==".PNG" && extname!==".png" && extname!==".GIF" && extname!==".gif")
	{
	   res.send("-1");
	}
	else
	{
	  var fs=require("fs");
	   var num=Math.random();
	   num=num*10000000000000000000;
	   var fpath="./uploads/"  + num + ".jpg";
	   
	   sampleFile.mv(fpath, function(err) {
        if (err) {
            res.status(500).send(err);
			console.log(err);
			console.log("nahi hui upload");
        }
        else {
		      
		var	send_fpath="/uploads/" + num + ".jpg";
			 console.log("upload ho gai");
            res.send(send_fpath);
        }
	  });
	}
	
	
	
});

io.on("connection",function(socket){
socket.on("/ans",function(packet){
	
	
	packet=JSON.parse(packet);
	var ans_text_fil=filter_ans(packet.ans_text);
	var user_id=new mongo.ObjectId(packet.cookie_val);
	var o_id=new mongo.ObjectId(packet.obId);
	
	if(ans_text_fil!=1 && ans_text_fil!=2 && ans_text_fil!=3)
	{
		console.log("okay");
		//send response to the server
		var time=Date();
		var ans_post={ques_id:o_id,user_id:user_id,ans_text:packet.ans_text,post_pic:packet.global_pic,likes:0,like_by:"",dislike_by:"",time:time};
	    connection(function(err,db){
			
		   db.collection("answers").insert(ans_post,function(error,result){
			      if(!error)
				  {
					    console.log("answer inserted successfully");
                     	var just_inserted_id=ans_post._id;
						
						db.collection("users").find({"_id":user_id}).toArray(function(er2,re2){
							
							var fname=re2[0].fname;
							var lname=re2[0].lname;
							var cname=fname + " " +lname;
							var popularity=re2[0].popularity;
							var dp=re2[0].profile_pic;
							io.sockets.emit("new_ans",{ans_text:packet.ans_text,post_pic:packet.global_pic,likes:0,cname:cname,popularity:popularity,just_inserted_id:just_inserted_id,user_id:user_id,dp:dp});
							
							var question_id=o_id;
							db.collection("feeds").find({"_id":question_id}).toArray(function(er3,re3){
								
								question_asker_id=new mongo.ObjectId(re3[0].user_id);
								// now insert new notification into the notification collection
								
								var data={asker_id:question_asker_id,question_id:question_id,ans_text:packet.ans_text,ans_give_id:user_id,user_id:question_asker_id,ans_id:just_inserted_id,seen:0};
								db.collection("notifications").insert(data,function(er4,re4){
									
									if(!er4){
										
										console.log("Notification inserted");
										// show notification to asker
										// ans_give_id se name utha raha hu
										db.collection("users").find({"_id":user_id}).toArray(function(er4,re4){
											
											var fname=re4[0].fname;
											var lname=re4[0].lname;
											var total_name=fname + " " +lname;
											var profile_pic=re4[0].profile_pic;
											io.sockets.emit("notification_aya",{ans_giver_name:user_id,total_name:total_name,question_id:question_id,asker_id:question_asker_id,ans_text:packet.ans_text,dp:profile_pic});
											
											
											//question asker ka mobile number nikalo db me se..sms send kerne ke liye
											/*db.collection("users").find({"_id":question_asker_id}).toArray(function(er5,re5){
												
												  var number=re5[0].number;
												  if(number!="")
												  {     number="+91" +number;
													  // send sms of this notification to user no
											
									                      var accountSid = 'ACd0b16534d9646350c28f90718ad08584'; 
                                                           var authToken = 'bfa35c01c51886768cf1844a43388574'; 
                                                           var notific=total_name + " answerd your question";
                                                           //require the Twilio module and create a REST client 
                                                           var client = require('twilio')(accountSid, authToken); 
                                                           client.messages.create({ 
                                                           to:number, 
                                                           from: "+18452624264", 
                                                           body:notific, 
                                                           }, function(err, message) { 
                                                           // console.log(message.sid); 
                                                           });

												  }
												   
											});*/
											
											
											
										})
										
										}
									
									
									
								});
								
								
							});
							
							
							
							
						});
					    
				  }
				  else
				  {
					  console.log("ans_text database me insert nahi ho pa raha hai");
				  }
		   });	
			
		});
	}
	else
	{
		// send error msg (to all the clients)
		io.sockets.emit("ans_error_response",{cookie_val:packet.cookie_val,ans_text_fil:ans_text_fil});
	}
	
});
  
});

app.post("/get_notifications",function(req,res){
	
	var user_id=new mongo.ObjectId(req.body.cookie_val);
	connection(function(err,db){
		
		db.collection("notifications").aggregate([
		
		{
			$match:{
				
				user_id:user_id
			}
		},{
			$lookup:{
				  from:"users",
				  localField:"ans_give_id",
				  foreignField:"_id",
				  as:"user_info"
				
			}
			
		}
		
		]).toArray(function(error,result){
			
			res.send(result);
		});
		
	});
	
});


app.get("/show_ans",function(req,res){
	
	
	var o_id=new mongo.ObjectId(req.query.obId);
    connection(function(err,db){
		
		db.collection("answers").aggregate([
		
		{
			$match:{
				    ques_id:o_id
			}
		},
		{
			$lookup:{
				
				      from:"users",
					  localField:"user_id",
					  foreignField:"_id",
					  as:"user_info"
				
			}
		}
		                                   
		
		]).sort({"likes":-1,"time":-1}).toArray(function(error,result){
			
			res.send(result);
			
			 
			 
		});
		
		
	});
	
});

function isValidObjectID(str) {
  // coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
  str = str + '';
  var len = str.length, valid = false;
  if (len == 12 || len == 24) {
    valid = /^[0-9a-fA-F]+$/.test(str);
  }
  return valid;
}

app.get("/get_ques",function(req,res){
var obid_fil=isValidObjectID(req.query.obId);
if(obid_fil==true)
{	
var obId=req.query.obId; // is obId ko filter kerna baaki hai.
var o_id=new mongo.ObjectId(obId);
var opener_id=req.query.cookie_val;

connection(function(err,db){
   
    if(err)
	{
	   console.log("error");
	 }
    else{	 
     db.collection("feeds").find({"_id":o_id}).toArray(function(error,result){
	 
	 
	    if(error)
		{
		   console.log("Discussion wala object feeds collection me se retrive nahi hua");
		}
		else
		{
		   if(result.length==0)
		   {
		     
			    var packet={content:-1};
				packet=JSON.stringify(packet);
				res.send(packet);
		      
		   }
		   else
		   {
			   var post_id=result[0]._id;
		      var post_type=result[0].post_type;
			  var post_title=result[0].post_title;
			  var post_text=result[0].post_text;
			  var post_pic=result[0].post_pic;
			  var post_tags=result[0].post_tags;
			  var likes=result[0].likes;
			  var like_by=result[0].like_by;
			  var user_id=result[0].user_id;
			  var dislike_by=result[0].dislike_by;
			  var time=result[0].time;
			  var s=like_by.search(opener_id);
			  like_color="g";
			  if(s!=-1)
			  {
				  like_color="b";
			  }

              var f=dislike_by.search(opener_id);
              dislike_color="g";
              if(f!=-1)
			  {
				    dislike_color="b";
			  }				  
			
			  // user ka naam ,popularity and image get kerne ke liye db me query chala raha hu
			  var user_id=new mongo.ObjectId(user_id);
			  db.collection("users").find({"_id":user_id}).toArray(function(er2,re2){
				  
				  var fname=re2[0].fname;
	              var lname=re2[0].lname;
				  var c_name=fname + " " +lname;
				  var popularity=re2[0].popularity;
				  var dp=re2[0].profile_pic;
				  var packet={content:1,post_type:post_type,post_title:post_title,post_text:post_text,post_pic:post_pic,post_tags:post_tags,likes:likes,c_name:c_name,popularity:popularity,like_color:like_color,dislike_color:dislike_color,user_id:user_id,time:time,post_id:post_id,dp:dp};
			      packet=JSON.stringify(packet);
			      res.send(packet);
				  //console.log(packet);
                  				  
			  });
			  
			 
		   }
		}
	 
	 });
	}
	 
  
  });
}
else
{
	var packet={content:-1};
				packet=JSON.stringify(packet);
				res.send(packet);
}

});
  

app.post("/thumb_up",function(req,res){
	
	var packet=req.body.packet;
	packet=JSON.parse(packet);
	var o_id=new mongo.ObjectId(packet.obId);
	var user_id=new mongo.ObjectId(packet.cookie_val);
		
	connection(function(err,db){
   var popularity="";
    var already_liked="";
	var like_by="";
    if(err)
	{
	   console.log("error! thumb up wala module connect nahi ho pa raha db se");
	}
    else{
             	  
		 db.collection("users").find({"_id":user_id}).toArray(function(error,result){
					 
		    var popularity=result[0].popularity;
			var _id=result[0]._id;
		  
		      db.collection("feeds").find({"_id":o_id}).toArray(function(er2,re2){
				  
				  var feed_user_id=re2[0].user_id;
				  var temp_like_by=re2[0].like_by;
				  var like_count=re2[0].likes;
				  var temp_dislike_by=re2[0].dislike_by;
				  var already_liked=temp_like_by.search(user_id);
				  var own_post=0;
				  var se=temp_dislike_by.search(packet.cookie_val);
		
		          var already_disliked=0;
				  if(se!=-1)
				  {
					  already_disliked=-1;
				  }
		
				  if(packet.cookie_val==feed_user_id)
				  {
					  
					  var own_post=-1;
					  console.log("aya");
				  }
				
				  if(already_liked==-1 && popularity>=5 && packet.cookie_val!=feed_user_id && already_disliked==0)
				  {
					  var new_like=temp_like_by + user_id + ",";
					  var new_like_count=++like_count;
					  db.collection("feeds").update({"_id":o_id},{$set:{"like_by":new_like,"likes":new_like_count}});
					  res.json({already_liked:already_liked,popularity:popularity,own_post:own_post,"like_by":new_like,"new_like_count":new_like_count,already_disliked:already_disliked});
					  console.log("okay like ker do");
					  feed_user_id=mongo.ObjectId(feed_user_id);
					  db.collection("users").update({"_id":feed_user_id},{$inc:{popularity:+3}});
					  
					  
					   // jiska ans thum up hua hai uski popularty nikalo
					 db.collection("users").find({"_id":feed_user_id}).toArray(function(er3,re3){
						 
						 
						 var popularity=re3[0].popularity+3;
						 var d=new Date();
						 var month=showMonth(d.getMonth());
						 var date=d.getDate();
						 total_date=month + date;
						 
						 // check karo ki aaj ka popularity record exsist kerta hai kya?
						 db.collection("popularity_record").find({$and:[{"user_id":feed_user_id},{"date":total_date}]}).toArray(function(er4,re4){
							 
							 if(re4.length!=0){
								 
								 //ha kerta hai....update karo
								 db.collection("popularity_record").update({"user_id":feed_user_id},{$set:{popularity:popularity}});
								 
							 }
							 else{
								 
								 // nahi kerta....new insert karo
								 db.collection("popularity_record").insert({"user_id":feed_user_id,popularity:popularity,date:total_date});
							 }
							 
						 });
						 
						 
						 
						 
						 
					 });
					  
					  
					  
				  }
				  else
				  {
					   console.log("something goes wrong like nahi ker sakte!");
					   res.json({already_liked:already_liked,popularity:popularity,own_post:own_post,already_disliked:already_disliked});
					   //console.log(already_liked + " " +popularity + " " +user_id);
				  }
				  
				  
			  });
		  
		  
		  
		 });  
		 
	}
	 
  
  });
	
	
});

app.post("/thumb_down",function(req,res){
	
	var packet=req.body.packet;
	packet=JSON.parse(packet);
	var user_id=new mongo.ObjectId(packet.cookie_val);
	var question_id=new mongo.ObjectId(packet.obId);
	
	connection(function(err,db){
		
		db.collection("users").find({"_id":user_id}).toArray(function(error,result){
			
			   //console.log(result);
			   var popularity=result[0].popularity;
			   var _id=result[0]._id;
			   
			   db.collection("feeds").find({"_id":question_id}).toArray(function(er2,re2){
				   
				   var feed_id=re2[0].user_id;
				   var like_by=re2[0].like_by;
				   var like_count=re2[0].likes;
				   var dislike_by=re2[0].dislike_by;
				   
				   own_post=0;
				   if(packet.cookie_val==feed_id){
					   
					   own_post=-1;
				   }
				   var s=like_by.search(packet.cookie_val);
				   already_liked=0;
				   if(s!=-1)
				   {
					   already_liked=-1;
				   }
				   
				   var se=dislike_by.search(user_id);
				   already_disliked=0;
				   if(se!=-1)
				   {
					   already_disliked=-1;
				   }
				   
				  // console.log(popularity + " " +own_post + " " +already_liked + " " +already_disliked);
				   if(popularity>=50 && own_post==0 && already_liked==0 && already_disliked==0)
				   {
					   console.log("okay dislike ker do");
					   
					    
					   var new_dislike=dislike_by + user_id + ",";
					   var new_like_count=--like_count;
					   db.collection("feeds").update({"_id":question_id},{$set:{"dislike_by":new_dislike,"likes":new_like_count}});
					   
					   res.json({popularity:popularity,own_post:own_post,already_liked:already_liked,already_disliked:already_disliked,new_like_count});
					   
					   feed_id=mongo.ObjectId(feed_id);
					   db.collection("users").update({"_id":feed_id},{$inc:{popularity:-1}});
					   
					   
					    // jiska ans thum up hua hai uski popularty nikalo
					 db.collection("users").find({"_id":feed_id}).toArray(function(er3,re3){
						 
						 console
						 var popularity=re3[0].popularity-1;
						 var d=new Date();
						 var month=showMonth(d.getMonth());
						 var date=d.getDate();
						 total_date=month + date;
						 
						 // check karo ki aaj ka popularity record exsist kerta hai kya?
						 db.collection("popularity_record").find({$and:[{"user_id":feed_id},{"date":total_date}]}).toArray(function(er4,re4){
							 
							 if(re4.length!=0){
								 
								 //ha kerta hai....update karo
								 db.collection("popularity_record").update({"user_id":feed_id},{$set:{popularity:popularity}});
								 
							 }
							 else{
								 
								 // nahi kerta....new insert karo
								 db.collection("popularity_record").insert({"user_id":feed_id,popularity:popularity,date:total_date});
							 }
							 
						 });
						 
						 
						 
						 
						 
					 });
					   
					   
				   }
				   else
				   {
					   console.log("something goes wrong dislike nahi ker sakte!");
					   res.json({popularity:popularity,own_post:own_post,already_liked:already_liked,already_disliked:already_disliked});
				   }
				   
				   
			   });
			   
			
		});
		
		
	});
	
});

app.get("/profile",function(req,res){
	
res.sendFile("profile.html",{root:'./'});
	
});

app.get("/mobile_profile",function(req,res){
	
res.sendFile("mobile_profile.html",{root:'./'});
	
});


app.post("/user_info",function(req,res){
	
	var user_id_fil=isValidObjectID(req.body.obId);
	if(user_id_fil==true)
	{
	var user_id=new mongo.ObjectId(req.body.obId);
	connection(function(err,db){
		
		db.collection("users").find({"_id":user_id}).toArray(function(error,result){
			
			if(result.length==1)
			{
				res.send(result);
			}
			else
			{
				res.json({"error":-1});
				
			}
			
			
		});
		
		
	});
	}
	else
	{
		res.json({"error":-1});
		console.log("Koi hacking ker raha hai profile vale page per");
	}
	
});


app.post("/show_all_ques",function(req,res){
	var user_id=new mongo.ObjectId(req.body.obId);
	connection(function(err,db){
		
		db.collection("feeds").find({"user_id":user_id}).toArray(function(error,result){
			
			res.send(result);
			
			
		});
		
		
	});
});


app.post("/show_ans_all",function(req,res){
	
    var user_id=new mongo.ObjectId(req.body.obId);
	connection(function(err,db){
		
	db.collection("answers").find({"user_id":user_id}).toArray(function(error,result){
		
		//console.log(result);
		res.send(result);
		
	});
		
	});
	
});



app.post("/ans_thumb_up",function(req,res){
	
	var packet=req.body.packet;
	packet=JSON.parse(packet);
	var o_id=new mongo.ObjectId(packet.obId);
	var user_id=new mongo.ObjectId(packet.cookie_val);
		
	connection(function(err,db){
   var popularity="";
    var already_liked="";
	var like_by="";
    if(err)
	{
	   console.log("error! thumb up wala module connect nahi ho pa raha db se");
	}
    else{
             	  
		 db.collection("users").find({"_id":user_id}).toArray(function(error,result){
					 
		    var popularity=result[0].popularity;
			var _id=result[0]._id;
		  
		      db.collection("answers").find({"_id":o_id}).toArray(function(er2,re2){
				  
				  var feed_user_id=re2[0].user_id;
				  var temp_like_by=re2[0].like_by;
				  var like_count=re2[0].likes;
				  var temp_dislike_by=re2[0].dislike_by;
				  var already_liked=temp_like_by.search(user_id);
				  var own_post=0;
				  var se=temp_dislike_by.search(packet.cookie_val);
		
		          var already_disliked=0;
				  if(se!=-1)
				  {
					  already_disliked=-1;
				  }
		
				  if(packet.cookie_val==feed_user_id)
				  {
					  
					  var own_post=-1;
					  console.log("aya");
				  }
				
				  if(already_liked==-1 && popularity>=5 && packet.cookie_val!=feed_user_id && already_disliked==0)
				  {
					  var new_like=temp_like_by + user_id + ",";
					  var new_like_count=++like_count;
					  db.collection("answers").update({"_id":o_id},{$set:{"like_by":new_like,"likes":new_like_count}});
					  res.json({already_liked:already_liked,popularity:popularity,own_post:own_post,"like_by":new_like,"new_like_count":new_like_count,already_disliked:already_disliked});
					  console.log("okay like ker do");
					   feed_user_id=mongo.ObjectId(feed_user_id);
					  db.collection("users").update({"_id":feed_user_id},{$inc:{popularity:+10}});
					  
					 // jiska ans thum up hua hai uski popularty nikalo
					 db.collection("users").find({"_id":feed_user_id}).toArray(function(er3,re3){
						 
						 console
						 var popularity=re3[0].popularity+10;
						 var d=new Date();
						 var month=showMonth(d.getMonth());
						 var date=d.getDate();
						 total_date=month + date;
						 
						 // check karo ki aaj ka popularity record exsist kerta hai kya?
						 db.collection("popularity_record").find({$and:[{"user_id":feed_user_id},{"date":total_date}]}).toArray(function(er4,re4){
							 
							 if(re4.length!=0){
								 
								 //ha kerta hai....update karo
								 db.collection("popularity_record").update({"user_id":feed_user_id},{$set:{popularity:popularity}});
								 
							 }
							 else{
								 
								 // nahi kerta....new insert karo
								 db.collection("popularity_record").insert({"user_id":feed_user_id,popularity:popularity,date:total_date});
							 }
							 
						 });
						 
						 
						 
						 
						 
					 });
					  
				  }
				  else
				  {
					   console.log("something goes wrong like nahi ker sakte!");
					   res.json({already_liked:already_liked,popularity:popularity,own_post:own_post,already_disliked:already_disliked});
					   //console.log(already_liked + " " +popularity + " " +user_id);
				  }
				  
				  
			  });
		  
		  
		  
		 });  
		 
	}
	 
  
  });
	
	
});


function showMonth(m)
{
	if(m==0)
	{
		return "Jan";
	}
	if(m==1)
	{
		return "Feb";
	}
	if(m==2)
	{
		return "Mar";
	}
	
	if(m==3)
	{
		return "Apr";
	}
	if(m==4){return "May";} if(m==5){return "Jun";} if(m==6){return "Jul";} if(m==7){return "Aug";} if(m==8){return "Sep";}
	if(m==9){return "Oct";} if(m==10){return "Nov";} if(m==11){return "Dec";}
}


app.post("/ans_thumb_down",function(req,res){
	
	var packet=req.body.packet;
	packet=JSON.parse(packet);
	var user_id=new mongo.ObjectId(packet.cookie_val);
	var question_id=new mongo.ObjectId(packet.obId);
	
	connection(function(err,db){
		
		db.collection("users").find({"_id":user_id}).toArray(function(error,result){
			
			   //console.log(result);
			   var popularity=result[0].popularity;
			   var _id=result[0]._id;
			   
			   db.collection("answers").find({"_id":question_id}).toArray(function(er2,re2){
				   
				   var feed_id=re2[0].user_id;
				   var like_by=re2[0].like_by;
				   var like_count=re2[0].likes;
				   var dislike_by=re2[0].dislike_by;
				   
				   own_post=0;
				   if(packet.cookie_val==feed_id){
					   
					   own_post=-1;
				   }
				   var s=like_by.search(packet.cookie_val);
				   already_liked=0;
				   if(s!=-1)
				   {
					   already_liked=-1;
				   }
				   
				   var se=dislike_by.search(user_id);
				   already_disliked=0;
				   if(se!=-1)
				   {
					   already_disliked=-1;
				   }
				   
				  // console.log(popularity + " " +own_post + " " +already_liked + " " +already_disliked);
				   if(popularity>=50 && own_post==0 && already_liked==0 && already_disliked==0)
				   {
					   console.log("okay dislike ker do");
					   
					    
					   var new_dislike=dislike_by + user_id + ",";
					   var new_like_count=--like_count;
					   db.collection("answers").update({"_id":question_id},{$set:{"dislike_by":new_dislike,"likes":new_like_count}});
					   
					   res.json({popularity:popularity,own_post:own_post,already_liked:already_liked,already_disliked:already_disliked,new_like_count});
					   feed_id=mongo.ObjectId(feed_id);
					   db.collection("users").update({"_id":feed_id},{$inc:{popularity:-1}});
					   
					   
					    // jiska ans thum up hua hai uski popularty nikalo
					 db.collection("users").find({"_id":feed_id}).toArray(function(er3,re3){
						 
						 
						 var popularity=re3[0].popularity-1;
						 var d=new Date();
						 var month=showMonth(d.getMonth());
						 var date=d.getDate();
						 total_date=month + date;
						 
						 // check karo ki aaj ka popularity record exsist kerta hai kya?
						 db.collection("popularity_record").find({$and:[{"user_id":feed_id},{"date":total_date}]}).toArray(function(er4,re4){
							 
							 if(re4.length!=0){
								 
								 //ha kerta hai....update karo
								 db.collection("popularity_record").update({"user_id":feed_id},{$set:{popularity:popularity}});
								 
							 }
							 else{
								 
								 // nahi kerta....new insert karo
								 db.collection("popularity_record").insert({"user_id":feed_id,popularity:popularity,date:total_date});
							 }
							 
						 });
						 
					 }); 
					   
				   }
				   else
				   {
					   console.log("something goes wrong dislike nahi ker sakte!");
					   res.json({popularity:popularity,own_post:own_post,already_liked:already_liked,already_disliked:already_disliked});
				   }
				   
				   
			   });
			   
			
		});
		
		
	});
	
});

function comment_filter(ans_text)
{
	if(ans_text===""){return 2}
	
var special=["<script>","</script>"];
	
	   var er="";
       for(var i=0;i<special.length;i++)
       {
         if(ans_text.indexOf(special[i])!=-1)
	      {
	        break;
	       }
        }
		if(i!=special.length)
		{
		   er=1;
		}
		else
		{
		  er=0;
		}
		return er;
}


io.on("connection",function(socket){
	
	
	socket.on("ques_comment_submit",function(packet){
		
	   var comment_text_fil=comment_filter(packet.comment_text); // filter answer wala function bhi same kaam ker raha hai
	   var ques_id=new mongo.ObjectId(packet.ques_id);
	   var comment_giver_id=new mongo.ObjectId(packet.comment_giver_id);
	  // console.log(comment_text + " " + ques_id + " " + comment_giver_id);
	   if(comment_text_fil==0)
	   {   var time=Date();
	  var comment_data={comment_text:packet.comment_text,ques_id:ques_id,comment_giver_id:comment_giver_id,time:time};
	   
	   
	  connection(function(error,db){
		   
		   db.collection("comments").insert(comment_data,function(err,result){
			   
			   if(!error)
			   {
				   console.log("comment inserted");
				   //console.log(result.ops[0]._id);
				  var comment_id=result.ops[0]._id;
				  db.collection("users").find({"_id":comment_giver_id}).toArray(function(er2,re2){
					  
					  var fname=re2[0].fname;
					  var lname=re2[0].lname;
					  var total_name=fname + " " +lname;
					  io.sockets.emit("show_instant_comment",{comment_giver_id:comment_giver_id,total_name:total_name,comment_text:packet.comment_text,comment_id:comment_id,ques_id:ques_id});
					  
				  });
				  
				  
			   }
			   else
			   {
				   console.log("comment insert nahi hua db me");
			   }
			   
		   })
		   
	   });
	   }
	   else
	   {
		   console.log("comment contains code");
		   socket.emit("comment_error",{comment_text_fil:comment_text_fil,comment_giver_id:comment_giver_id});
	   }
		
	});
});

app.get("/show_comments",function(req,res){
	
	var ques_id=new mongo.ObjectId(req.query.obId);
	connection(function(error,db){
		
		db.collection("comments").aggregate([
		
		
		{
			$match:{
				
				   ques_id:ques_id
				
			}
			
		},{
			
			$lookup:{
				
				      from:"users",
					  localField:"comment_giver_id",
					  foreignField:"_id",
					  as:"user_info"
			}
		}
		
		]).sort({_id:-1}).toArray(function(er2,re2){
			
			//console.log(re2);
			res.send(re2);
			
		});
		
	});
	
});

io.on("connection",function(socket){
	
	socket.on("comment_on_ans",function(packet){
		
		var ans_id=mongo.ObjectId(packet.ans_id);
        var ans_comment_text_fil=comment_filter(packet.ans_comment_text);
        var user_id=mongo.ObjectId(packet.cookie_val);

       // console.log(ans_id + " " +ans_comment_text + " " +user_id);
         // console.log(ans_comment_text_fil);
		 
		 if(ans_comment_text_fil==0)
		 {
			 connection(function(error,db){
				 
				 
				 if(!error){
					   var time=Date();
					  var comment={ans_id:ans_id,ans_comment_text:packet.ans_comment_text,comment_giver_id:user_id,time:time};
					 db.collection("ans_comments").insert(comment,function(er,re){
						 
						// console.log(re);
						 var comment_id=re.ops[0]._id;
						 console.log("Answer comment inserted");
						 
						 
						 db.collection("users").find({"_id":user_id}).toArray(function(er2,re2){
							 
							 var fname=re2[0].fname;
							 var lname=re2[0].lname;
							 var total_name= fname + " " +lname;
							 //console.log(user_id);
							 io.sockets.emit("new_ans_comment",{ans_id:ans_id,ans_comment_text:packet.ans_comment_text,comment_giver_name:total_name,comment_id:comment_id,user_id:user_id});
							 
							 
						 });
						 
					 });
					 
				 }
				 else{
					 
					 console.log("Ans_comment wala module db se connect nahi ho pa raha hai");
				 }
			 });
		 }
		 else
		 {
			 console.log("Invalid comment");
		 }
		
	});
	
});


app.get("/get_ans_comments",function(req,res){
	
	var ans_id=new mongo.ObjectId(req.query.ans_id);
	
	connection(function(error,db){
		
		if(!error){
			
			db.collection("ans_comments").aggregate([
			
			{
				
				$match:{
					
					ans_id:ans_id
				}
				
			},{
				
				$lookup:{
				
				      from:"users",
					  localField:"comment_giver_id",
					  foreignField:"_id",
					  as:"user_info"
			}
			}
			
			]).toArray(function(er2,re2){
				
				res.send(re2);
				
			});
			
		}
		
		
	});
	
});

app.get("/populaity_record",function(req,res){
	
	var user_id=new mongo.ObjectId(req.query.cookie_val);
	//console.log(user_id);
	connection(function(error,db){
		
		db.collection("popularity_record").find({"user_id":user_id}).toArray(function(er2,re2){
			
			//console.log(re2);
			res.send(re2);
		});
		
	});
	
});

app.post("/edit_ques",function(req,res){
	
	
	var obId=new mongo.ObjectId(req.body.obId);
	connection(function(error,db){
		
		db.collection("feeds").find({"_id":obId}).toArray(function(er1,re1){
			
			//console.log(re1);
			res.send(re1);
			
		});
		
	});
	
	
});



app.post("/save_ques_edits",function(req,res){
	
	//console.log(req.body.obId + " " +req.body.packet.post_title + " " +req.body.post_text + " "+req.body.post_tags);
	var ques_id=new mongo.ObjectId(req.body.obId);

	var post_title_fil=filter_post_title(req.body.packet.post_title);
    var post_text_fil=filter_post_text(req.body.packet.post_text);
    var post_tags_fil=filter_post_tags(req.body.packet.post_tags);
	
	if(post_title_fil==0 && post_text_fil==0 && post_tags_fil==0)
	{
		connection(function(error,db){
			
			db.collection("feeds").update({"_id":ques_id},{$set:{"post_title":req.body.packet.post_title,"post_text":req.body.packet.post_text,"post_tags":req.body.packet.post_tags}});
			var packet={"status":"ok"};
			res.send(packet);
			
		});
	}
	else
	{
		//send error to client
		res.json({"post_title_fil":post_title_fil,"post_text_fil":post_text_fil,"post_tags_fil":post_tags_fil,"status":"error"});
		
	}
	//console.log(post_title_fil + " " +post_text_fil + " " +post_tags_fil);
	
    	
});

app.get("/edit_ans",function(req,res){
	
	res.sendFile("edit_ans.html",{root:'./'});
})

app.post("/get_ans_for_edit",function(req,res){
	
	var user_id=new mongo.ObjectId(req.body.cookie_val);
	var ans_id=new mongo.ObjectId(req.body.obId);
	connection(function(error,db){
		
		db.collection("answers").find({$and:[{"_id":ans_id},{"user_id":user_id}]}).toArray(function(er1,re1){
			
			//console.log(re1);
			if(re1!="")
			{
			res.send(re1);
			}
			else
			{
				console.log("Unauthorized edit");
			}
		});
		
	});
	
});

app.post("/save_ans_edits",function(req,res){
	
	var ans_text_fil=filter_ans(req.body.ans_text);
	var ans_id=new mongo.ObjectId(req.body.obId);
	//console.log(ans_text + " " +ans_id);
	
	if(ans_text_fil==0)
	{
		connection(function(error,db){
			
			db.collection("answers").update({"_id":ans_id},{$set:{"ans_text":req.body.ans_text}});
			res.json({"status":"ok"});
		});
	}
	else
	{
		res.json({"status":"error","ans_text_fil":ans_text_fil});
	}
	
	
});


app.get("/edit_ques_comment",function(req,res){
	
	res.sendFile("edit_ques_comment.html",{root:'./'});
});


app.post("/get_ques_comment_for_edit",function(req,res){
	
	   var comment_id=new mongo.ObjectId(req.body.obId);
	   var user_id=new mongo.ObjectId(req.body.cookie_val);
	   console.log(comment_id + " " +user_id);
	   
	   
  connection(function(error,db){
		   
    db.collection("comments").find({$and:[{"_id":comment_id},{"comment_giver_id":user_id}]}).toArray(function(er2,re2){
		
		res.send(re2);
	});
		   
  });
	   
	
});

app.post("/save_ques_comment_edits",function(req,res){
	
	var comment_id=new mongo.ObjectId(req.body.obId);
	var comment_text_fil=comment_filter(req.body.comment_text);
	//console.log(comment_id + " " +comment_text);
	if(comment_text_fil==0)
	{
		connection(function(error,db){
			
			db.collection("comments").update({"_id":comment_id},{$set:{"comment_text":req.body.comment_text}});
			res.json({"status":"ok"});
		});
	}
	else
	{
		res.json({"status":"error","comment_text_fil":comment_text_fil});
	}
});


app.get("/edit_ans_comment",function(req,res){
	
	res.sendFile("edit_ans_comment.html",{root:'./'});
	
});

app.post("/get_ans_comment_for_edit",function(req,res){
	
	var comment_id=new mongo.ObjectId(req.body.obId);
	var user_id=new mongo.ObjectId(req.body.cookie_val);
	
	//console.log(comment_id + " " +user_id);   // Yaha per and operation nahi laga raha hu..kyunki yaha per ye nahi check ker raha hu comment_id user_id ke saath associated hai.   ..Yaha sirf uss comment ko find ker raha hu
	connection(function(error,db){
		
		db.collection("ans_comments").aggregate([
		
		{
				
				$match:{
					
					_id:comment_id
				}
				
			},{
				
				$lookup:{
				
				      from:"answers",
					  localField:"ans_id",
					  foreignField:"_id",
					  as:"ques_info"
			}
			}
		
		]).toArray(function(er2,re2){
			
			//console.log(re2);
			res.send(re2);
		});
		
	});
	
});

app.post("/save_ans_comment_edits",function(req,res){
	
	var comment_id=new mongo.ObjectId(req.body.obId);
	var comment_text_fil=comment_filter(req.body.comment_text);
	//console.log(comment_id + " " +comment_text);
	
	if(comment_text_fil==0)
	{
	connection(function(error,db){
		
		db.collection("ans_comments").update({"_id":comment_id},{$set:{"ans_comment_text":req.body.comment_text}});
		res.json({"status":"ok"});
		
	});
	}
	else
	{
		res.json({"status":"error","comment_text_fil":comment_text_fil});
	}
	
});


app.post('/upload_profile_pic', function(req, res) {
	  var sampleFile;
    sampleFile = req.files.sampleFile;
	//console.log(req.files.sampleFile);
	  var extname=path.extname(sampleFile.name);
	  var email=req.cookies.cookie_email;
      var email=decrypt(email);
	if(sampleFile.name=="")
	{
	  res.send("Empty");
	}
	else if(extname!==".jpg" && extname!==".JPG" && extname!==".PNG" && extname!==".png" && extname!==".GIF" && extname!==".gif")
	{
	   res.send("-1");
	}
	else
	{
	  var fs=require("fs");
	   var num=Math.random();
	   num=num*10000000000000000000;
	   var fpath="./dp/"  + num + ".jpg";
	   
	   sampleFile.mv(fpath, function(err) {
        if (err) {
            res.status(500).send(err);
			console.log(err);
			console.log("nahi hui upload");
        }
        else {
		      
		var	send_fpath="/dp/" + num + ".jpg";
			 console.log("upload ho gai");
            res.send(send_fpath);
        }
	  });
	}
	
	
	
});

io.on("connection",function(socket){
	
	socket.on("remove_dp",function(file_path){
     
	   var file=file_path.file_path;
	   file= "./" +file;
	   send_fpath="";
	   fs.unlinkSync(file);
   
   });
});


app.post("/get_details_for_edit",function(req,res){
	
	var user_id= new mongo.ObjectId(req.body.cookie_val);
	//console.log(user_id);
	connection(function(error,db){
		
		db.collection("users").find({"_id":user_id}).toArray(function(er1,re1){
			
			//console.log(re1);
			res.send(re1);
		});
		
	});
	
});

function name_filter(fname)
  {
    var special=["1","2","3","4","5","6","7","8","9","0","~","`","!","@","#","$","%","^","&","*","(",")","-","_","+","=","|","?","<",">",".","/"];
	
	   var er="";
       for(var i=0;i<special.length;i++)
       {
         if(fname.indexOf(special[i])!=-1)
	      {
	        break;
	       }
        }
		if(i!=special.length)
		{
		   er=1;
		}
		else
		{
		  er=0;
		}
		if(fname.length==0)
		{
			er=-1;
		}
		return er;
  }
  
 
  
function fil_number(num)
  {
     var pat1=/[A-Z]/g;
	 var match1=num.match(pat1);
	 var pat2=/[a-z]/g;
	 var match2=num.match(pat2);
	
	if(match1==null && match2==null && num.length==10)
	{
	    return 0;
	}
	else
	{
		return 1;
	}
  }
	
  


app.post("/save_edit_details",function(req,res){
	
	var fname_fil=name_filter(req.body.fname);
	var user_id=new mongo.ObjectId(req.body.cookie_val);
	var lname_fil=name_filter(req.body.lname);
	var password=req.body.password;
	var confirm_password=req.body.confirm_password;
	var email=req.body.email;
	var about_fil=filter_ans(req.body.about);
	var skills_fil=filter_ans(req.body.skills);
	var dp=req.body.dp;
	var number=req.body.number;
	if(number!="")
	{
	var num_fil=fil_number(req.body.number);
	if(num_fil==1){number="";}else{}
	}
	var fname=req.body.fname;
	var lname=req.body.lname;
	var about=req.body.about;
	var skills=req.body.skills;
	if(fname_fil==0 && lname_fil==0 && password==confirm_password)
	{
	connection(function(error,db){
		
		db.collection("users").find({"email":email}).toArray(function(err,re){
			        password=encrypt(password);
			     if(re.length<2)
				 {	 
				 db.collection("users").update({"_id":user_id},{$set:{"fname":fname,"lname":lname,"email":email,"about":about,"skills":skills,"profile_pic":dp,password:password,"number":number}});
				   console.log("profile updated");
				   res.json({"status":"ok"});
				 }
				 else
				 {
					 console.log("Email already");
				 }
			
		});
		
	});
    }
	else
	{
		res.json({"status":"error"});
	}
 
});

app.get("/get_interests",function(req,res){
	
	var user_id=new mongo.ObjectId(req.query.cookie_val);
	connection(function(error,db){
		
		db.collection("interests").find({"user_id":user_id}).toArray(function(err,re){
			
			//console.log(re);
			res.send(re);
			
		});
		
	});
	
});

app.get("/get_most_liked_ques",function(req,res){
	
	connection(function(error,db){
		
		db.collection("feeds").find({"likes":{$gt:0}}).limit(3).toArray(function(err,re){
			
			//console.log(re);
			res.send(re);
		});
		
	});
});


/*app.post("/ques_delete",function(req,res){
	
	var ques_id=new mongo.ObjectId(req.body.obId);
	connection(function(error,db){
		// removed the feed.
		db.collection("feeds").remove({"_id":ques_id});
       // remove the comments
	   db.collection("comments").remove({"ques_id":ques_id});
	   
	   //remove the answers
	   db.collection("answers").remove({"ques_id":ques_id});
	   
	   // remove the notifications
	   db.collection("notifications").remove({"question_id":ques_id});
		
	});
});*/

io.on("connection",function(socket){
	
    socket.on("/ques_delete",function(packet){
		
		var ques_id=new mongo.ObjectId(packet.obId);
		connection(function(error,db){
		// removed the feed.
		db.collection("feeds").remove({"_id":ques_id});
       // remove the comments
	   db.collection("comments").remove({"ques_id":ques_id});
	   
	   //remove the answers
	   db.collection("answers").remove({"ques_id":ques_id});
	   
	   // remove the notifications
	   db.collection("notifications").remove({"question_id":ques_id});
	   
	   io.sockets.emit("/ques_deleted_move_to_feeds",{"ques_id":ques_id});
		
	});
		
	});
	
	
	socket.on("/delete_ans",function(packet){
		var ans_id=new mongo.ObjectId(packet.post_id);
		
		var ques_id=packet.obId;
		connection(function(error,db){
			
			// remove answer
			db.collection("answers").remove({"_id":ans_id});
			
			//remove comments
			db.collection("ans_comment").remove({"ans_id":ans_id});
			
			//remove notification
			db.collection("notifications").remove({"ans_id":ans_id});
			
			io.sockets.emit("/ans_removed_reload_page",{"ans_id":ans_id,"ques_id":ques_id});
			
		});
	});
	
	
	socket.on("/delete_ques_comment",function(packet){
		
		comment_id=new mongo.ObjectId(packet.comment_id);
		connection(function(error,db){
			
			db.collection("comments").remove({"_id":comment_id});
			
			
		});
		
	});
	
	socket.on("/delete_ans_comment",function(packet){
		
		var comment_id=new mongo.ObjectId(packet.comment_id);
		connection(function(error,db){
			db.collection("ans_comments").remove({"_id":comment_id});
		});
	});
	
});

app.get("/test",function(req,res){
	res.sendFile("test.html",{root:'./'});
});

app.get("/seen_all_notification",function(req,res){
	
	var user_id=new mongo.ObjectId(req.query.cookie_val);
	connection(function(error,db){
		
		db.collection("notifications").update({"user_id":user_id},{$set:{"seen":1}},{multi:true});
		
	});
	
});


io.on("connection",function(socket){
	
	socket.on("/submit_anonymous_question",function(packet){
		
		
		//console.log(packet.ques_title + " " +packet.email_id + " " +packet.tags);
		var ques_title_fil=filter_ans(packet.ques_title);
		var email_id_fil=filter_email(packet.email_id);
		var tags_fil=filter_post_tags(packet.tags);
		
		if(email_id_fil==0 && ques_title_fil==0 && tags_fil==0)
		{
			connection(function(error,db){
				var email=packet.email_id;
				// check user exsist kerta hai ya nahi?
				db.collection("users").find({"email":email}).toArray(function(er,re){
					
					if(re.length==0)
					{     ques_title=packet.ques_title;
						// now check aisa question exsist kerta hai ya nahi
						db.collection("feeds").find({"post_title":ques_title}).toArray(function(er2,re2){
							
							  if(re2==0)
							  {
								  // check in anonymous questions
								  db.collection("anonymous_questions").find({"ques_title":ques_title}).toArray(function(er3,re3){
									 
									 if(re3==0)
									 {
										 // insert into anonymous
										 var time=Date();
										 packet={ques_title:ques_title,email:email,tags:packet.tags,time:time};
										 db.collection("anonymous_questions").insert(packet,function(er4,re4){
											 
											 if(!er4){console.log("question insert ho gaya");
											 
											    socket.emit("successfully_submit",{});
											 
											 }
											 
										 });
									 }
									 else
									 {
										 // question already exsist kerta hai anonymous collection me
										 console.log("question already exsist kerta hai anonymous collection me");
										 socket.emit("question_exsist",{});
									 }
									  
								  })
								 
							  }
							  else
							  {
								  // question aleady exsist kerta hai....link de do user ko
								  console.log("question aleady exsist kerta hai....link de do user ko");
								  socket.emit("question_exsist",{});
							  }
							
						});
					}
					else
					{
						// you already have an account, then why are you asking here
						console.log("you already have an account, then why are you asking here");
						socket.emit("already_account",{});
					}
				});
				
			});
		}
		else
		{
			socket.emit("format_error",{"ques_title_fil":ques_title_fil,"email_id_fil":email_id_fil,"tags_fil":tags_fil});
		}
		
	});
	
});


app.post("/get_anonymous_questions",function(req,res){
	
	connection(function(error,db){
		
		db.collection("anonymous_questions").find().toArray(function(er,re){
			
			//console.log(re);
			res.send(re);
			
		});
		
	});
});
 
 
app.get("/anonymous_discussion",function(req,res){
	
	res.sendFile("anonymous_discussion.html",{root:'./'});
});

app.get("/anonymous_mobile_discussion",function(req,res){
	res.sendFile("anonymous_mobile_discussion.html",{root:'./'});
});


app.get("/retrive_anonymous_ques",function(req,res){
	var obId=isValidObjectID(req.query.obId);
	if(obId==true)
	{
	var ques_id=new mongo.ObjectId(req.query.obId);
	connection(function(error,db){
		
		db.collection("anonymous_questions").find({"_id":ques_id}).toArray(function(er,re){
			
			//console.log(re);
			res.send(re);
		});
		
	});
	}
	else
	{
		res.json({status:-1});
	}
});


io.on("connection",function(socket){
	
	socket.on("/anonymous_ans",function(packet){
		
		
		var ans_text_fil=filter_ans(packet.ans_text);
		var ans_text=packet.ans_text;
		var user_id=new mongo.ObjectId(packet.cookie_val);
		var ques_id=new mongo.ObjectId(packet.obId);
		var post_pic=packet.global_pic;
		
		//console.log(ans_text_fil + " " +post_pic);
		if(ans_text_fil==0)
		{   connection(function(error,db){
			   
			 db.collection("answers").find({"ans_text":packet.ans_text}).toArray(function(er2,re2){
				
                  if(re2.length==0)
                  {   
			          var time=Date();
					  var packet={"ques_id":ques_id,"user_id":user_id,"ans_text":ans_text,"post_pic":post_pic,"likes":0,"like_by":"","dislike_by":"",time:time};
					  db.collection("answers").insert(packet,function(er3,re3){
						  
						  if(!er3)
						  {
							  console.log("Answer successfully submit");
							  db.collection("users").find({"_id":user_id}).toArray(function(er2,re2){
							var just_inserted_id=packet._id;
							var fname=re2[0].fname;
							var lname=re2[0].lname;
							var cname=fname + " " +lname;
							var popularity=re2[0].popularity;
							var dp=re2[0].profile_pic;
							io.sockets.emit("new_ans",{ans_text:packet.ans_text,post_pic:post_pic,likes:0,cname:cname,popularity:popularity,just_inserted_id:just_inserted_id,user_id:user_id,dp:dp});
							  });
						  }
						  
					  });
				  }	
				  else
				  {
					  console.log("This answer already exsists");
					  socket.emit("answer_already_exsist",{});
				  }
				  
				 
			 });
			 
			 
			
		      });
		}
		else
		{
			socket.emit("ans_error_response",{ans_text_fil:ans_text_fil});
		}
		
	});

});

app.get("/about",function(req,res){
	res.sendFile("about.html",{root:'./'});
});

var Facebook = require('facebook-node-sdk');
app.use(Facebook.middleware({ appId: '1867176583550873', secret: 'b3dba481bde11b23a5a68e626a10cf91' }));

app.get('/face', Facebook.loginRequired(), function (req, res) {
  req.facebook.api('/me', function(err, user) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, ' + user.name + '!');
  });
});
 
http.listen(8080);
