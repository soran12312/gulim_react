const axios = require("axios");
const cors = require('cors');
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

app.get('/chatData/:room', async (req, res) => {
  try {
    const room = req.params.room; // URL 파라미터(room) 가져오기
    const url = `https://192.168.0.68:8080/chatData/room/${room}`; // 새로운 URL 생성
    //console.log('/chatData/:room');
    const response = await axios.get(url, {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });
    console.log(url);
    const data = response.data;
    // 데이터 처리 로직
    res.json(data);
  } catch (error) {
    // 에러 처리 로직
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch data from the server.' });
  }
});


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
});

const port = 3030;
server.listen(port, () => {
    console.log(`port : ${port}`);
});