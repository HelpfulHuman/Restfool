var $ = require('jquery')
var moment = require('moment')

$('date').each(function () {
  var $date = $(this)
  var date  = moment($date.attr('timestamp'))
  setInterval(function () {
    $date.html(date.fromNow())
  }, 60000)
})
