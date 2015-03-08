var fs = require('fs');
var app = module.parent.parent.exports.app;

exports.index = function(req, res){
	fs.readdir(app.rootpath + '/public/minutes', function(err, data){
		if (err)
			console.log(err);
		data.sort();
		data.reverse();
		res.render('board/index', { title: 'Highland Pointe Online - Board', "files": data });
	});
};
