
const mongoose = require('mongoose')
const CodeSchema = new mongoose.Schema({

    code: {

        type: String

    }
})
module.exports = CodeSchema;
module.exports = mongoose.model("code", CodeSchema);