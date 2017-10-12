var app = require('express')();
var  server = require('http').Server(app);
var io = require('socket.io')(server);
var bp = require("body-parser");
var user;
var online = {};

const mongoose=require('mongoose');
const Mensaje=require('./model/mensaje');

mongoose.set(`debug`,true);

mongoose.connect('mongodb://localhost:27017/chat_node_mongo',(err,res)=>{
	if(err){
		return console.log('error al conectar con la BD:',err);
	}
	console.log('La Conexión con la base de datos es exitosa');

})




app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.set('port', process.env.PORT || 3000);

server.listen(3000);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});



io.on('connection',function(socket) {


	socket.on('New_user',function(data,callback) {
	      if (data in online) {
		  	callback(false);
		  } else {
		  	callback(true);
		  	socket.username = data;
		  	online[socket.username] = socket;
		  	//online.push(socket.username);
		  	console.log(data + '  is connected');
            updtng_nw_usr();
		  }
	    
	});

	socket.on('disconnect',function(){
		if (socket.username) {
			delete online[socket.username];
			//online.splice(online.indexOf(socket.username),1);
			updtng_nw_usr();
			console.log(socket.username + '  is disconnected');
		}
	});

	function updtng_nw_usr(){
	  var html = " ";
	  for (var i = 0; i < Object.keys(online).length; i++) {
	    html = Object.keys(online)[i] +'<br>' + html;
	  }
	  io.sockets.emit('all_users',html);
	}

	socket.on('msg_k',function(data , callback){
        var msg = data.trim();
        var border_pos = msg.indexOf('$');
        var pure_msg = msg.substr(0,border_pos);
        var to = msg.substr(border_pos+1)
        if (pure_msg.trim() !== '') {
          if (to.trim() !== '') {
          	 console.log("online: ");
          	 
          	 console.log(Object.keys(online));

          	 console.log("To: ");
          	 console.log(to);

          	 var keys = Object.keys(online);

          	 console.log("To in keys: ");
          	 console.log(to in keys);
          	 console.log(keys.indexOf(to));
          	 console.log("KEYS: ");
          	 console.log(keys);




//             if (to in online) { 
			  if (keys.indexOf(to)!=-1){
			  	console.log("ok");
                online[to].emit('call','<b>'+ socket.username +' :</b>'+'<span style="color:black;">'+pure_msg+'</span>');
                online[socket.username].emit('call','<b>'+ socket.username  +' :</b>'+'<span style="color:black;">'+pure_msg+'</span>');
              
			let mensaje = new Mensaje();         
			mensaje.nick  = socket.username;
			mensaje.mensaje = pure_msg;

			mensaje.pm  = true;
			mensaje.para = to;

			mensaje.save((err,mensajeStored)=>{
				console.log("mensajeStored");
				//console.log(mensajeStored);
				//if(err) return res.status(500).send({message:'Error al salvar el mensaje en la BD: ',err})
				//	res.status(200).send({mensaje:mensajeStored})
			});


              }else {
                callback('User is Not In Online...');
              }
          }else{//public msg when to box is empty
            io.sockets.emit('snd_mg','<b>'+ socket.username +' :</b>'+'<span style="color:red;">'+pure_msg+'</span>');

			let mensaje = new Mensaje();         
			mensaje.nick  = socket.username;
			mensaje.mensaje = pure_msg;

			mensaje.pm  = false;
			mensaje.para = '';

			mensaje.save((err,mensajeStored)=>{
				console.log("mensajeStored");
				//console.log(mensajeStored);
				//if(err) return res.status(500).send({message:'Error al salvar el mensaje en la BD: ',err})
				//	res.status(200).send({mensaje:mensajeStored})
			});

          }
        }
	});

	

	socket.on('typing_ray',function(data){
       socket.broadcast.emit('eva','<b>'+ socket.username +' :</b>'+'<span style="color:red;">Typyng...</span>');
	});

    socket.on('stop_ray',function(data){
       socket.broadcast.emit('eva','');
	});

});


    