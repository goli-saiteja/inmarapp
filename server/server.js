var express = require("express");
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var webpack =  require("webpack");
var webpackMiddleware =  require("webpack-dev-middleware");
var webpackHotMiddleware =  require("webpack-hot-middleware");
var webpackConfig = require("../webpack.config.dev");
var config = require('./config');
var morgan = require('morgan');
var ms = require('./public/services/modelService');
var fu = require('./public/services/functionalUtils');
var app = express();

ms.mongooseConnect();
const compiler = webpack(webpackConfig);
app.use(webpackMiddleware(compiler));
app.use(webpackHotMiddleware(compiler));
app.use('/static', express.static(__dirname + '/public'));

var config = {
	"secret": "ilovescotchyscotch",
}
app.set('superSecret', config.secret);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));

//Load Data from CSV to Database
var fs = require('fs');
var parse = require('csv-parse');

var insertOrUpdate = function(model, data) {
		var options = { upsert: true, new: true, setDefaultsOnInsert: true };
		return new Promise(function(resolve, reject) {
				model.findOneAndUpdate(data, data, options, function(error, result) {
						if (error) {
								reject(error);
						} else {
								resolve(result);
								// console.log(result)
						}
				});
		})
}
var update = function(model, olddata, newdata) {
		var options = { upsert: true, new: true, setDefaultsOnInsert: true };
		return new Promise(function(resolve, reject) {
				model.findOneAndUpdate(olddata, newdata, options, function(error, result) {
						if (error) {
								reject(error);
						} else {
								resolve(result);
								// console.log(result)
						}
				});
		})
}
var loadDB = function () {
		var updatepath = (path, data) => path == null ? `,${data},`: `${path}${data},`;
    return new Promise(function(resolve, reject) {
        ms.items.collection.drop();
        var csvData=[];
        fs.createReadStream(__dirname + '/public/models/Full-Stack-Data.csv')
            .pipe(parse({delimiter: ':'}))
            .on('data', function(csvrow) {
                csvData.push(csvrow);
            })
            .on('end',function() {
                for(var i=1;i< csvData.length;i++) {
                    let rd = csvData[i][0].replace(/\uFFFD/g, '').split(',');
                    insertOrUpdate(ms.items,{"name":rd[2],"path":"," + rd[2] + ",","type":"location"}).then(function (result) {
                      insertOrUpdate(ms.items,{"name":rd[3],"path":updatepath(result.path,rd[3]),"type":"department"}).then(function (result) {
                          insertOrUpdate(ms.items,{"name":rd[4],"path":updatepath(result.path,rd[4]),"type":"category"}).then(function (result) {
                              insertOrUpdate(ms.items,{"name":rd[5],"path":updatepath(result.path,rd[5]),"type":"subcategory"}).then(function (result) {
                                  insertOrUpdate(ms.items,{"name":rd[1],"path":updatepath(result.path,rd[1]),"type":"sku"}).then(function (result) {
                                      resolve('Data Loaded Successfully');
                                  })
                              })
                          })
                      })
                    })
                }
            });
    })
}
//Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

var apiRoutes = express.Router();
apiRoutes.post('/gettoken', function(req, res) {
	// find the user
	ms.users.findOne(Object.assign({email: req.body.email, password: req.body.password}), function (err, user) {
			if(user) {
				var payload = {user: user.email};
				var token = jwt.sign(payload, app.get('superSecret'), {
					expiresIn: 86400 // expires in 24 hours
				});
				res.send(200, {"message": "Enjoy your token!", "type":"success", "token": token, "username": user.username, "email": user.email});
			} else if(user == null) {
				res.send(200, {"message": "Authentication failed. Wrong email or password.", "type":"error"});
			} else {
				res.send(200, {"message": "Authentication failed. Wrong email or password.", "type":"error"});
			}
	})
});
apiRoutes.post('/signup', function(req, res) {  // GET 'http://www.example.com/admin/new'
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var role = req.body.role;
	var queryObj = Object.assign({},username && {username}, email && {email}, role && {role}, password && {password});
	if (username && email && password) {
		ms.users.findOne(Object.assign({}, email && {email}), function (err, user) {
				if(user) {
					res.send(200, {"message": "User already exists", "type":"warning"});
				} else if(user == null) {
					ms.users.create(queryObj);
					res.send(200, {"message": "User created Successfully", "type":"success"});
				} else {
					res.send(200, {"message": "Error Inserting Data", "type":"error"});
				}
		})
	} else {
		res.send(200, {"message": "Invalid Data", "type":"error"});
	}
});
apiRoutes.get('/istokenvalid', function(req, res) {
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];
	console.log("token ---->", token);
	if (token) {
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if (err) {
				res.send(200, {"message": "Failed to authenticate token.", "type":"error"});
			} else {
				res.send(200, {"message": "Is Valid Token", "type":"success"});
			}
		});
	} else {
		res.send(200, {"message": "No token provided.", "type":"error"});
	}
});
// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function(req, res, next) {
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];
	console.log("token ---->", token);
	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if (err) {
				console.log(err);
				return res.json({ type: "error", message: 'Failed to authenticate token.' });
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});
	} else {
		// if there is no token
		// return an error
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});
	}
});


//API GET handler
var _get = function (req, res, query)  {
  ms.items.find(query, function (err, docs) {
      if (err) {
          handleError(res, err.message, "No Results found for model" + query.type);
      } else {
          res.status(200).json(docs);
      }
  })
}
//API POST handler
var _post = function (req, res, query) {
  if(!req.body.name) {
    res.status(422).json({"error": "'name' can't be blank (value: undefined)"});
  }
  var query = {"name": req.body.name, "type": query.type};
  ms.items.find(query, function (err, docs) {
    if (err) {
      handleError(res, err.message, "No Results found for model" + query.type);
    } else {
      if(docs.length > 0) {
        res.status(200).json(docs);
      } else {
        ms.items.create(query,function (err, doc) {
            res.status(200).json(doc);
        })
      }
    }
  })
}
//API PUT handler
var _put = function (req, res, query) {
  if(!req.body.name) {
    res.status(422).json({"error": "'name' can't be blank (value: undefined)"});
  }
  var options = { upsert: true, new: true, setDefaultsOnInsert: true };
  var query = {"name": req.body.name, "type": query.type};
  ms.items.findOneAndUpdate(query, query, options, function(error, doc) {
      if (error) {
          handleError(res, err.message, "No Results found for model" + query.type);
      } else {
          res.status(200).json(doc);
      }
  });
}
//API DELETE handler
var _delete = function (req, res, query) {
    var on_delete = new Promise(function(resolve, reject) {
        var getChildren = function (query) {
            var query  = query;
            if((!!query) && (query.constructor === Array)) {
                query = { "parent": { "$in" : query} };
            }
            var children = [];
            ms.items.find(query, function (err, docs) {
                if(docs.length > 0) {
                    docs.forEach(function(v,k){
                        children.push(v._id);
                    })
                    ms.items.remove({ "_id":{"$in":children}}, function (err) {});
                    getChildren(children);
                } else {
                    //debugger;
                    resolve('Deleted Successfully');
                }
            })
        }
        getChildren(query)
    })
    on_delete.then(function(data) {
        res.send(200, data);
    })
}

//REST Params resolver
var getRestParams = function (url) {
    var entities = [], endpoints = [];
		url = decodeURIComponent(url);
    url.replace(/^\/|\/$/g, '').split('/').forEach((v,k)=>{
        k%2 == 0 ? entities.push(v) : endpoints.push(v);
    })
    return {"entities":entities, "endpoints": endpoints};
}
//To check if API exist in the DB.
var is_model_available = function (req) {
    var entities = getRestParams(req).entities, endpoints = getRestParams(req).endpoints;
    var _check_model = function (entities, endpoints, parent, resolve, reject) {
        var type = entities.shift(), _id = endpoints.length > 0 ? ObjectId(endpoints.shift()) : null, parent = parent;
        var query = Object.assign({},type && {type}, parent && {parent}, _id && {_id});
        ms.items.find(query, function (err, docs) {
            if (docs) {
                if (entities.length > 0) {
                    _check_model(entities, endpoints, _id, resolve, reject);
                } else {
                    resolve(Object.assign({},type && {type}, parent && {parent}, _id && {_id}));
                }
            } else{
                reject(false);
            }
        });
    }
    return new Promise(function(resolve, reject) {
        var resolve = resolve, reject = reject;
        _check_model(entities, endpoints, null, resolve, reject);
    })
}
// ---------------------------------------------------------
// REST API route
// ---------------------------------------------------------
var get_children = function(skuobjects, pattern) {
  var _path = new RegExp(pattern);
  return skuobjects.filter(function(val, key) {
		console.log(val);
    if(val.path.match(_path)) {
      return true;
    }
  })
}
var genTreeData = function (dataarray,obj,pattern) {
	var current_children = get_children(dataarray,pattern);

		current_children.forEach(function(item, index){
			 var temp_obj = {};
			 temp_obj['name'] = item.name;
			 temp_obj['children'] = [];
			 console.log(obj);
			 obj['children'].push(temp_obj);
			 console.log(obj);
			 var _newpattern = pattern.replace('\\w+',item.name + '\\,\\w+');
			 genTreeData(dataarray,obj.children[index],_newpattern)
		})

}
apiRoutes.use('/gettreedata', function(req, res, next) {
	ms.items.find({}, function (err, items) {
			if(items.length > 0) {
					var myobj = {"children":[]};
					genTreeData(items,myobj, '^\\,\\w+\\,$');
					console.log(myobj);
					res.send(200, myobj);
			}
	})
})
var getSKUData = function (req, res) {
	ms.items.find({"type":"sku"}, function (err, items) {
			if(items.length > 0) {
					var dataarray = [];
					items.forEach(function(item,index) {
						 var path = item.path.replace(/(^,)|(,$)/g, "").split(",");
						 dataarray.push({"sku":item.name,"_id":item._id, "location":path[0], "department":path[1],"category": path[2], "subcategory": path[3]})
					})
					dataarray = fu.dynamicfilter(dataarray, JSON.parse(req.query.search));
					dataarray.sort(fu.dynamicSort(req.query.filter));
					res.send(200, dataarray);

			} else {

			}
	})
}
apiRoutes.use('/items/:query([^/]*)*?', function(req, res, next) {  // GET 'http://www.example.com/admin/new'
	const _query = req.params.query;
	//getSKUData();
	var _rparams = getRestParams(_query);
	var type =_rparams.entities.length  > 0 ? _rparams.entities[_rparams.entities.length - 1] : undefined;
	var path = _rparams.endpoints.length > 0 ? ("," + _rparams.endpoints.join(',') + ",") : undefined;
	var name = req.body.name;
	var queryObj = Object.assign({},type && {type}, path && {"path" : new RegExp('^' + path)});
	if (req.method == 'GET') {
		if(_query == undefined) {
			getSKUData(req, res);
		} else {
			ms.items.find(queryObj, function (err, items) {
					res.send(200, items);
			})
		}
	} else if (req.method == 'POST') {
		path = path || ",";
		path = path + name + ",";
		console.log(" req.params->",req.params, " req.body->", req.body," _rparams->", _rparams, " _query->", _query, " type->", type, " path->", path," name->", name," queryobj", queryObj, " Object", Object.assign({},type && {type}, path && {path}, name && {name}));
		ms.items.find(Object.assign({},type && {type}, path && {path}, name && {name}), function (err, items) {
				if(items.length > 0) {
					res.send(200, {"message": "Item already Exists", "type":"warning"});
				} else if(items.length == 0) {
					insertOrUpdate(ms.items, Object.assign({},type && {type}, path && {path}, name && {name})).then(function (result) {
							res.send(200, result);
					})
				} else {
					res.send(200, {"message": "Error Inserting Data", "type":"error"});
				}
		})

	} else if (req.method == 'PUT') {
		ms.items.findOne(Object.assign({},type && {type}, path && {path}), function (err, item) {
			if(err) {
				res.send(200, {"message": "Error Updating data", "type":"error"});
			} else if(!err) {
				console.log("item-->", item, "object", Object.assign({},type && {type}, path && {path}));
				var old_path = item.path;
				var new_path = item.path.replace(/(^,)|(,$)/g, "").split(","); new_path.pop(); new_path = new_path || [];
				console.log("new Path-->", new_path);
				new_path.push(name); new_path = `,${new_path.join(",")},`;
				update(ms.items,Object.assign({},type && {type}, path && {"path": old_path}), Object.assign({},type && {type}, path && {"path": new_path}, name && {name})).then(function (result) {
						ms.items.find({"path" : new RegExp('^' + old_path)}, function (err, updateitems) {
							updateitems.forEach(function(v,k){
								delete v._id;
								var oldchild = v;
								var newchild = v; newchild.path = newchild.path.replace(old_path, new_path)
								update(ms.items, oldchild, newchild)
							})
						})
						res.send(200, result);
				})
			}
		})
	} else if (req.method == 'DELETE') {
		ms.items.deleteMany(Object.assign({},path && {"path" : new RegExp('^' + path)}), function(err) {
			if (!err) {
				res.send(200, {"message": "Successfully Deleted", "type": "success"});
			} else {
				res.send(200, {"message": "Error Deletion", "type":"error"});
			}
		});
	}
});
apiRoutes.use('/users/:userid*?', function(req, res, next) {  // GET 'http://www.example.com/admin/new'
	const _userid = req.params.userid;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var role = req.body.role;
	var queryObj = Object.assign({},username && {username}, email && {email}, role && {role}, password && {password});
	if (req.method == 'GET') {
		ms.users.find(queryObj, function (err, items) {
				res.send(200, items);
		})
	} else if (req.method == 'POST') {
		if (username && email && password) {
			ms.users.findOne(Object.assign({}, email && {email}), function (err, user) {
					if(user) {
						res.send(200, {"message": "User already exists", "type":"warning"});
					} else if(user == null) {
						ms.users.create(queryObj);
						res.send(200, {"message": "User created Successfully", "type":"success"});
					} else {
							console.log("error-->", err);
						res.send(200, {"message": "Error Inserting Data", "type":"error"});
					}
			})
		} else {
			res.send(200, {"message": "Invalid Data", "type":"error"});
		}

	} else if (req.method == 'PUT') {

	} else if (req.method == 'DELETE') {

	}
});
//Load data into db
apiRoutes.use('/load', function(req, res, next) {  // GET 'http://www.example.com/admin/new'
    loadDB().then(function(data) {
        res.send(200, data);
    },function(err){
        handleError(res, err.message, "Error Loading Data");
    })
});
apiRoutes.use('/*', function(req, res, next) {  // GET 'http://www.example.com/admin/new'
    // is_model_available(req).then(function(query) {
        // if (req.method == 'GET') {
        //     _get(req, res, query)
        // } else if (req.method == 'POST') {
        //     _post(req, res, query)
        // } else if (req.method == 'PUT') {
        //     _put(req, res, query)
        // } else if (req.method == 'DELETE') {
        //     _delete(req, res, query)
        // }
    // },function(err){
    //     handleError(res, err.message, "No Results found for model");
    // })
});
app.use('/api', apiRoutes);

app.get('/*', (req,res) => {
	res.sendFile(__dirname+'/index.html');
});

//Starting Server
var server = app.listen(process.env.PORT || 8090, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});
