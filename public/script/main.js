const baseURL = `http://localhost:4400`;

const chatform = document.getElementById('chat-form');
const room = document.getElementsByTagName("h1")[0].textContent;
const groupId = document.getElementsByTagName("p")[0].textContent;

const socket =io();

async function getmsg(){
  await axios.get(`${baseURL}/getmessages/${groupId}`).then((res)=>{
    res.data.forEach(element => {
      let message={username:element.name,message:element.message};
      outputMessage(message);
    });
  })
  .catch((err)=>{
    console.log(err);
  })
}; getmsg();

(async function() {
  await axios.get(`${baseURL}/getusername`).then((res)=>{
    let username =  res.data;
    socket.emit('joinRoom', { username, room });
  })
  .catch((err)=>{
    console.log(err);
  })
})();

socket.on('message',message=>{
  let MessageDetails = {from:message.username, message:message.message, groupId:groupId};
  
  (async function() {
    await axios.post(`${baseURL}/storemessageonDB`, MessageDetails)
    .then((res)=>{})
    .catch((err)=>{console.log(err);})
  })();

  outputMessage(message);
})

chatform.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const msg = e.target.elements.msg.value;
   
  await axios.get(`${baseURL}/getusername`).then((result)=>{
    let message = {username:result.data, room:room, text:msg};
     socket.emit('chatMessage',message);  
    })
  .catch((err)=>{
    console.log(err);
  })
   
  e.target.elements.msg.value="";
  e.target.elements.msg.focus();
})


async function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML =`<h5 class="meta">${message.username+":"} ${message.message}</h5>`;
  document.querySelector('.chat-messages').appendChild(div);
}