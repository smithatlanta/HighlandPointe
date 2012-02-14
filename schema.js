var mongoose = require("mongoose"),
Schema = mongoose.Schema;

var Post = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
	addedDate: {
		type: Date,
		default: Date.now
	}
});

var User = new Schema({
    login: {
        type: String,
        index: true
    },
    password: {
        type: String,
        index: true
    },
    role: {
        type: String
    }
});

User.static({
    authenticate: function(login, password, callback) {
        this.findOne({
            login: login,
            password: password
        },
        function(err, doc) {
            callback(doc);
        });
    }
});

mongoose.model('Post', Post);
mongoose.model('User', User);