const {Schema, model} = require("mongoose");

const cohortSchema = new Schema({
    id_GoogleSpreadsheet : {type:String, require : true},
    cohort : String,
    users : [{
        name : String,
        email : String,
        row : Number,
        id_user_slack : String
    }]
} , {timestamps:true})

const Cohort = model('Cohort', cohortSchema);

module.exports = Cohort;