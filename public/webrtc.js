var socket = io.connect();

var local_stream = null;
var remoteStream;
var peerConnection = null;
var started = false;
var mediaConstraints = {'mandatory': {
                          'OfferToReceiveAudio':true, 
                          'OfferToReceiveVideo':true }};

function sendMessage(message){
  var mymsg = JSON.stringify(message);
  console.log("send to websocket server : " + mymsg);
  socket.emit('message', mymsg);
}

socket.on('message', function(data){
  console.log("recieve : " + data);
  processSignalingMessage(data);  
});

socket.on('roomId', function(data){
  console.log("recieve : " + data);
});

function createPeerConnection(){
  try{
    var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
    peerConnection = new webkitRTCPeerConnection(pc_config);
    peerConnection.onicecandidate = onIceCandidate;
  }catch(err){
  console.log("Failed @ createPeerConnection" + err);
  }
  peerConnection.onaddstream = onRemoteStreamAdded;
}

function onRemoteStreamAdded(event){
  console.log("Added remote stream");
  remote_video.src = window.webkitURL.createObjectURL(event.stream);
}

function onIceCandidate(event){
  if(event.candidate){
    sendMessage({type: 'candidate',
                 label: event.candidate.sdpMLineIndex,
                 id: event.candidate.sdpMid,
                 candidate: event.candidate.candidate});
  }else{
    console.log("End of candidates.");
  }
}


function call(){
  if(!started && local_stream){
    console.log("Creating peerConnectionection...");
    createPeerConnection();
    peerConnection.addStream(local_stream);
    started = true;
    peerConnection.createOffer(setLocalAndSendMessage, null, mediaConstraints);
  }else{
    alert("reload this page ");
  }
}


function processSignalingMessage(message){
  var msg = JSON.parse(message);

  if(msg.type === 'offer'){
    if(!started && local_stream){
      createPeerConnection();
      console.log('Adding local stream...');
      peerConnection.addStream(local_stream);
      started = true;
      
      peerConnection.setRemoteDescription(new RTCSessionDescription(msg));
      console.log("Sending answer to peer.");
      peerConnection.createAnswer(setLocalAndSendMessage, null, mediaConstraints);
    }
  }else if(msg.type === 'answer' && started){
    peerConnection.setRemoteDescription(new RTCSessionDescription(msg));
  }else if (msg.type === 'candidate' && started){
    var candidate = new RTCIceCandidate({sdpMLineIndex:msg.label, candidate:msg.candidate});
    peerConnection.addIceCandidate(candidate);
  }
}

function setLocalAndSendMessage(sessionDescription){
  peerConnection.setLocalDescription(sessionDescription);
  sendMessage(sessionDescription);
}

function gotStream(stream){
  local_video.src = window.webkitURL.createObjectURL(stream);
  local_stream = stream;
  console.log("success getUserMedia");     
}

function err(err){
  console.log('err :  ' + err);
}

function generateRoomID(num){
  var chars ='0123456789abcdefghijklmnopqrstuvwxyz';
  var room_id = "#";
  for(var i = 0; i < num; i++){
    room_id += chars.charAt(Math.floor(Math.random() * chars.length)); 
  }
  console.log("room_id : " + room_id);
  return room_id;
}

function initVideoChat(){
  console.log("init");
  var local_video = document.getElementById('local_video');
  var remote_video = document.getElementById('remote_video');
  navigator.webkitGetUserMedia({video: true, audio:true}, gotStream, err);
}

function generatePrivateRoom(){
  location.href = location.href + generateRoomID(10);
  location.reload();
}

function enterPrivateRoom(){
  console.log("enterPrivateRoom");
  if("" === location.hash){ //shiitakeo.comにアクセスしたとき
    generatePrivateRoom();
  }else{  //generatePrivateroom()したとき．
    console.log("send roomId to server");
    socket.emit('roomId', location.hash);
    initVideoChat();
  }
}

window.onload = function(){
  console.log("onload");
  enterPrivateRoom();
}
