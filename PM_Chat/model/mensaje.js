'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema

const MensajeSchema=Schema({
  mensaje: {
    type: String,
    required: 'Field required'
  },
  nick:{ 
    type: String,
    required: 'Field required'
  },
  pm:{ 
    type: Boolean,
    required: 'Field required'
  },
  para:{ 
    type: String
  }
})

module.exports=mongoose.model('mensaje',MensajeSchema);