/**
 * chat.js
 * Chat setup & route handlers with socket.io
 * @type {exports}
 */

// Use the gravatar module, to turn email addresses into avatar images:
var gravatar = require('gravatar');
var maxPeopleInRoom = 2;

// Export a function, so that we can pass the app and io instances from the app.js file:
module.exports = function(app,io){

   // Initialize a new socket.io application, named 'chat'
   var chat = io.of('/socket').on('connection', function (socket) {

      // When the client emits the 'load' event, reply with the
      // number of people in this chat room
      socket.on('load',function(data){

         if(chat.clients(data).length === 0 ) {
            socket.emit('peopleinchat', {number: 0});
         }
         else if(chat.clients(data).length === 1) {
            socket.emit('peopleinchat', {
               number: 1,
               user: chat.clients(data)[0].username,
               avatar: chat.clients(data)[0].avatar,
               id: data
            });
         }
         else if(chat.clients(data).length >= maxPeopleInRoom) {
            chat.emit('tooMany', {boolean: true});
         }
      });

      // When the client emits 'login', save his name and avatar,
      // and add them to the room
      socket.on('login', function(data) {

         // Only two people per room are allowed
         if(chat.clients(data.id).length < maxPeopleInRoom){

            // Use the socket object to store data. Each client gets
            // their own unique socket object
            socket.username = data.user;
            socket.room = data.id;
            socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});

            // Tell the person what he should use for an avatar
            socket.emit('img', socket.avatar);


            // Add the client to the room
            socket.join(data.id);

            if(chat.clients(data.id).length == maxPeopleInRoom) {

               var usernames = [],
                   avatars = [];

               usernames.push(chat.clients(data.id)[0].username);
               usernames.push(chat.clients(data.id)[1].username);

               avatars.push(chat.clients(data.id)[0].avatar);
               avatars.push(chat.clients(data.id)[1].avatar);

               // Send the startChat event to all the people in the
               // room, along with a list of people that are in it.
               chat.in(data.id).emit('startChat', {
                  boolean: true,
                  id: data.id,
                  users: usernames,
                  avatars: avatars
               });
            }

         }
         else {
            socket.emit('tooMany', {boolean: true});
         }
      });

      // Somebody left the chat
      socket.on('disconnect', function() {

         // Notify the other person in the chat room
         // that his partner has left
         socket.broadcast.to(this.room).emit('leave', {
            boolean: true,
            room: this.room,
            user: this.username,
            avatar: this.avatar
         });

         // leave the room
         socket.leave(socket.room);
      });


      // Handle the sending of messages
      socket.on('msg', function(data){
         // When the server receives a message, it sends it to the other person in the room.
         socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
      });

   });

};
