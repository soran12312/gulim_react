const axios = require("axios");
const cors = require('cors');
const { unsubscribe } = require("diagnostics_channel");
const express = require("express");
const app = express();
const fs = require('fs');
const options = {
    key: fs.readFileSync('./server/key/key.pem'),
    cert: fs.readFileSync('./server/key/.cert.pem')
  };
const https = require('https');
const server = https.createServer(options,app);
const io = require('socket.io')(server, {
  cors: {
    origin: "https://192.168.0.68:3000",
    methods: ["GET", "POST"]
  }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use(cors({
  origin: '*',
}));
app.use(express.static("client"));
app.use("/peerjs", peerServer);

const userR = {};
var users = {};

const addUser = (roomId, userId, socketId, peerId, streamId) => {
  if(users[roomId]){
    users[roomId][userId] = {socketId:socketId, peerId:peerId, streamId:streamId};
  }else{
    users[roomId] = {};
    users[roomId][userId] = {socketId:socketId, peerId:peerId, streamId:streamId};
  }
}

const deleteUser = (roomId, userId) => {
  if(users[roomId]){
    delete users[roomId][userId];
    if (Object.keys(users[roomId]).length === 0) {
      delete users[roomId];
    }
  }
}

function findUserByStreamId(streamId) {
  for (const roomId in users) {
    const room = users[roomId];
    for (const userId in room) {
      const user = room[userId];
      if (user.streamId === streamId) {
        return { roomId, userId };
      }
    }
  }
  return null;
}


io.on("connection", (socket) => {
    // 유저 입장 시
    socket.on("join-room", (roomId, userId, peerId, streamId) => {
      console.log("join-room:",userId);
      socket.join(roomId);
      // 유저정보 저장
      addUser(roomId, userId, socket.id, peerId, streamId);
      console.log(users);
      socket.broadcast.to(roomId).emit("user-connected", peerId, userId, users);
      socket.emit("userInfo", users);
  
      socket.on("message", (message) => {
        //console.log(message);
        socket.broadcast.to(roomId).emit("newMessage", userId, message);
      });

      socket.on("refrash", () => {
        console.log("refrash");
        socket.broadcast.to(roomId).emit("refrash");
      });

      socket.on("giveDice", (streamId, diceFace, diceCount) => {
        var user = findUserByStreamId(streamId);
        var diceRoller = users[user.roomId][user.userId].socketId;
        socket.broadcast.to(diceRoller).emit("getDice", diceFace, diceCount);
      });

      socket.on("diceRoll", (dResult, sum) => {
        console.log(dResult,"///", sum);
        socket.broadcast.to(roomId).emit("diceResult", dResult, sum);
      });

      socket.on("disconnect", () => {
        console.log("user disconnect: ", peerId);
        console.log("leng :", Object.entries(users[roomId]).length);
        if(users[roomId] && Object.entries(users[roomId]).length !== 1){
          console.log("user-disconnected emit");
          socket.broadcast.to(roomId).emit("user-disconnected", peerId, streamId);
        }
        deleteUser(roomId, userId);
        console.log(users);
      });

      socket.on("ignoreUser",(streamId) => {
        var user = findUserByStreamId(streamId);
        var ignoreUserSocketId = users[user.roomId][user.userId].socketId;
        // 강퇴당한 유저에게 보내기
        socket.broadcast.to(ignoreUserSocketId).emit("ignored");
        // 강퇴당한 유저를 제외한 다른 유저에게 보내기
        socket.broadcast.to(roomId).except(ignoreUserSocketId).emit("userIgnored", user.userId);

      });
    });

    console.log("connection");

    socket.on("join_admin", (adminId) => {
      console.log("어드민 아이디:", adminId);
      socket.join(`admin`);

      socket.on("join_chat",(userId) => {
        socket.leave("admin");
        socket.join(userId);

        socket.broadcast.to(userId).emit("admin_joined");

        socket.on("chatting", (chat) => {
          socket.broadcast.to(userId).emit("chatting_arrive", chat, "admin");
        });

      });

    });
  
    // 유저가 방에 들어옴
    socket.on("join_customer", (userId) => {
      console.log("유저 아이디:", userId);
      socket.join(userId);
      // 관리자에게 유저 아이디를 보냅니다.
      socket.to(`admin`).emit("user_joined", userId);

      socket.on("chatting", (chat) => {
        socket.broadcast.to(userId).emit("chatting_arrive", chat, userId);
      });

    });
  
    
});




const port = 3030;
server.listen(port, () => {
    console.log(`port : ${port}`);
});