var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
      showTitle: true,

      helpers: {
          foo: function(){
              return 'Hello Ben';
          }
      }
  });
});

module.exports = router;
