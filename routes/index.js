var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'YARTC - Yet Another Real Time Chat' });
});


router.get('/create', function(req,res){

   // Generate unique id for the room
   var id = Math.round((Math.random() * 1000000));

   // Redirect to the random room
   res.redirect('/chat/'+id);
});



router.get('/chat/:id', function(req,res){

   // Render the chant.html view
   res.render('chat');
});


module.exports = router;
