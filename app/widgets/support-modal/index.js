'use strict';

var Ractive = require('hive-modal')
var db = require('hive-db')
var showError = require('hive-flash-modal').showError
var sendRequest = require('hive-zendesk')
var getNetwork = require('hive-network')

function fetchDetails(){
  db.get(function(err, doc){
    if(err) return showError(err);

    openModal({
      name: doc.userInfo.firstName,
      email: doc.userInfo.email
    })
  })
}

function openModal(data){
  var ractive = new Ractive({
    partials: {
      content: require('./content.ract').template
    }
  })

  var params = {}
  ractive.on('submit-details', function(){
    ['name', 'email', 'description'].forEach(function(field){
      if(isBlankField(field)) {
        return showError({message: field + " can't be blank"})
      }

      params[field] = ractive.get(field)
    })

    params['subject'] = 'Support request from Hive web for ' + getNetwork()
    sendRequest(params, function(){
      ractive.fire('cancel')
    })
  })

  ractive.on('close', function(){
    ractive.fire('cancel')
  })

  function isBlankField(field){
    var value = ractive.get(field)
    return (!value || value.toString().trim() === '')
  }

  return ractive
}

module.exports = fetchDetails

