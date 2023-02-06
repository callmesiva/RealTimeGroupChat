const http = require('http');
const express = require("express");
const bodyParser = require('body-parser');
const socketio = require('socket.io');
const cors = require('cors')
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const formatmessage = require('./utils/message');
const route = require("./server/router/userRoute");
const userJoin = require('./utils/userJoin');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(cookieParser());
app.use(cors())
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

const handlebars = exphbs.create({extname:".hbs"});
app.engine('hbs',handlebars.engine);
app.set("view engine","hbs");
app.use(express.static("public"));

app.use("/",route);
let botName = "ChatBot";

io.on('connection', socket=>{
    
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        socket.broadcast.to(user.room).emit("message",formatmessage(botName, `${user.username} has joined the chat`));
    });

    socket.on("chatMessage", (msg) => {
        io.to(msg.room).emit("message", formatmessage(msg.username, msg.text));
    });
})

server.listen(4400);



