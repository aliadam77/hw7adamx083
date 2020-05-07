// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT
var path = require("path");
// include the express module
var express = require("express");

// create an express application
var app = express();

// helps in extracting the body portion of an incoming request stream
var bodyparser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// native js function for hashing messages with the SHA-256 algorithm
var crypto = require('crypto');

// include the mysql module
var mysql = require("mysql");

// apply the body-parser middleware to all incoming requests
app.use(bodyparser());

// required for reading XML files
var xml2js = require('xml2js');


var parser = new xml2js.Parser();
var DBinfo;

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false}
));

fs.readFile(__dirname + '/dbconfig-1.xml', function(err, data) {
  if (err) throw err;
    parser.parseString(data, function (err, result) {
    if (err) throw err;
    DBinfo = result;
  });
  });

// server listens on port 9007 for incoming connections
app.listen(process.env.PORT || 9001, () => console.log('Listening on port 9001!'));

app.get('/',function(req, res) {

	res.sendFile(__dirname + '/client/welcome.html');
});

// // GET method route for the contact page.
// It serves contact.html present in client folder
app.get('/contact',function(req, res) {
  //Add Details
  if(req.session.value)
  {
    res.sendFile(path.join(__dirname,'client','contact.html'));
  } 
  else
  {
    res.sendFile(path.join(__dirname,'client','login.html'));
  }

});

app.get('/admin',function(req, res) {
  //Add Details
  if(req.session.value)
  {
    res.sendFile(path.join(__dirname,'client','adminpage.html'));
  } 
  else
  {
    res.sendFile(path.join(__dirname,'client','login.html'));
  }

});

// GET method route for the addContact page.
// It serves addContact.html present in client folder
app.get('/addContact',function(req, res) {

  //Add Details
  if(req.session.value)
  {
    res.sendFile(path.join(__dirname,'client','addContact.html'));
  }
  else
  {
    res.sendFile(path.join(__dirname,'/client','login.html'));
  }


});


//GET method for stock page
app.get('/stock', function (req, res) {
  //Add Details
  if(req.session.value)
  {
    res.sendFile(path.join(__dirname,'client','stock.html'));
  }
  else
  {
    res.sendFile(path.join(__dirname,'/client','login.html'));
  }

});

// GET method route for the login page.
// It serves login.html present in client folder
app.get('/login',function(req, res) {
  //Add Details
  if(req.session.value)
  {
    res.sendFile(path.join(__dirname,'client','contact.html'));
  }
  else
  {
    res.sendFile(path.join(__dirname,'client','login.html'));
  }

});
app.get('/getUsers', function(req, res) {
  
  var con = mysql.createConnection({
  host: DBinfo.dbconfig.host[0],
  user: DBinfo.dbconfig.user[0], // replace with the database user provided to you
  password: DBinfo.dbconfig.password[0], // replace with the database password provided to you
  database: DBinfo.dbconfig.database[0], // replace with the database user provided to you
  port: DBinfo.dbconfig.port[0]
});

con.connect(function(err) {
  if (err) {
    throw err;
  };
   console.log("Connected to MYSQL database!");
});


con.query('SELECT * FROM tbl_accounts', function(err,rows,fields) {

  if (err) throw err;
  if (rows.length == 0){
    returnObj = {"contacts":[]}
    responseObj = {res:returnObj};
    res.send(returnObj);
  }else {
    accountArray = [];
    for (var i = 0 ; i < rows.length; i++){
      accountArray.push({"name":rows[i].acc_name,
                          "id":rows[i].acc_id,
                          "login":rows[i].acc_login});


  
    }
    ret_Obj = {"userList":accountArray};
    res_obj = {res:ret_Obj};
    res.send(res_obj);
  }
});



});








// GET method to return the list of contacts
// The function queries the tbl_contacts table for the list of contacts and sends the response back to client
app.get('/getListOfContacts', function(req, res) {

  var con = mysql.createConnection({
  host: DBinfo.dbconfig.host[0],
  user: DBinfo.dbconfig.user[0], // replace with the database user provided to you
  password: DBinfo.dbconfig.password[0], // replace with the database password provided to you
  database: DBinfo.dbconfig.database[0], // replace with the database user provided to you
  port: DBinfo.dbconfig.port[0]
});

con.connect(function(err) {
  if (err) {
    throw err;
  };
   console.log("Connected to MYSQL database!");
});


con.query('SELECT * FROM tbl_contacts', function(err,rows,fields) {
  if (err) throw err;
  if (rows.length == 0){
    returnObj = {"contacts":[]}
    responseObj = {res:returnObj};
    res.send(returnObj);
  }else {
    contactArray = [];
    for (var i = 0 ; i < rows.length; i++){
      contactArray.push({"name":rows[i].contact_name,
                          "email":rows[i].contact_email,
                          "address": rows[i].contact_address,
                          "phoneNumber":rows[i].contact_phone,
                          "favouritePlace":rows[i].contact_favoriteplace,
                          "favouritePlaceURL":rows[i].contact_favoriteplaceurl});

    }
    returnObj = {"contacts":contactArray};
    responseObj = {res:returnObj};
    res.send(returnObj);
  }
});



});

app.post('/addUser', function(req, res) {

    var con = mysql.createConnection({
    host: DBinfo.dbconfig.host[0],
    user: DBinfo.dbconfig.user[0], // replace with the database user provided to you
    password: DBinfo.dbconfig.password[0], // replace with the database password provided to you
    database: DBinfo.dbconfig.database[0], // replace with the database user provided to you
    port: DBinfo.dbconfig.port[0]
    });

    con.connect(function(err) {
      if (err) {
        throw err;
      };

    var login = req.body.login
    con.query('SELECT * FROM tbl_accounts WHERE acc_login = ?',login, function(err,rows,result) {

    if (err) throw err;
    if (rows.length == 0){
          
          var rowToBeInserted = {
            acc_name: req.body.name,
            acc_login: req.body.login,
            acc_password: crypto.createHash('sha256').update(req.body.password).digest('base64')
          };
          var sql = ``;
          con.query('INSERT tbl_accounts SET ?', rowToBeInserted, function(err, result) {
            if(err) {
              throw err;
            }
            console.log("Value inserted");
          });

          ret = {flag:true};
          console.log(ret);
          res.send(ret);
    }else{
      ret = {flag:false};
      console.log("cannot insert");
      res.send(ret);
    }
    });
  });
});

app.post('/deleteUser', function(req, res) {

  var con = mysql.createConnection({
  host: DBinfo.dbconfig.host[0],
  user: DBinfo.dbconfig.user[0], // replace with the database user provided to you
  password: DBinfo.dbconfig.password[0], // replace with the database password provided to you
  database: DBinfo.dbconfig.database[0], // replace with the database user provided to you
  port: DBinfo.dbconfig.port[0]
  });
    if (req.body.login == req.session.user){

        ret_obj = {flag : false};

        res.send(ret_obj);
      }
      else{
          con.connect(function(err) {
            if (err) {
              throw err;
            };
            console.log("Connected!");
          
            con.query('DELETE FROM tbl_accounts WHERE acc_login = ?', req.body.login , function(err, result) {
              if(err) {
                throw err;
              }
              console.log("Value delete");
            });
        });

    ret_obj = {flag : true};
    res.send(ret_obj);
  }
});

app.post('/updateUser', function(req, res) {

    var con = mysql.createConnection({
    host: DBinfo.dbconfig.host[0],
    user: DBinfo.dbconfig.user[0], // replace with the database user provided to you
    password: DBinfo.dbconfig.password[0], // replace with the database password provided to you
    database: DBinfo.dbconfig.database[0], // replace with the database user provided to you
    port: DBinfo.dbconfig.port[0]
    });

    con.connect(function(err) {
            if (err) {
              throw err;
            };
            console.log("Connected!");
          
            var id = req.body.id;
            var name = req.body.name;
            var login = req.body.login;
            var password = crypto.createHash('sha256').update(req.body.password).digest('base64');

                con.query('SELECT * FROM tbl_accounts WHERE acc_login = ?',login, function(err,rows,result) {

                if (err) throw err;
                if (rows.length == 0){
          
                  con.query('UPDATE tbl_accounts SET acc_name = ?, acc_login= ?,acc_password = ? WHERE acc_id = ?'
                        , [name,login,password,id], function(err, result) {
                        if(err) {
                          throw err;
                        }
                        console.log("UPDATE Complete");
                      });
                  ret = {flag:true};
                  console.log(ret);
                  res.send(ret);
              }else{
                  ret = {flag:false};
                  console.log("Cannot UPDATE");
                  res.send(ret);
              }

           });            
        });

});










// POST method to insert details of a new contact to tbl_contacts table
app.post('/postContact', function(req, res) {

    var con = mysql.createConnection({
    host: DBinfo.dbconfig.host[0],
    user: DBinfo.dbconfig.user[0], // replace with the database user provided to you
    password: DBinfo.dbconfig.password[0], // replace with the database password provided to you
    database: DBinfo.dbconfig.database[0], // replace with the database user provided to you
    port: DBinfo.dbconfig.port[0]
  });

    con.connect(function(err) {
      if (err) {
        throw err;
      };
      console.log("Connected!");
////////////////////////////////////////////////////////////
      var rowToBeInserted = {
        contact_name: req.body.contactName, 
        contact_email: req.body.email, 
        contact_address: req.body.address,
        contact_phone: req.body.phoneNumber,
        contact_favoriteplace: req.body.favoritePlace, 
        contact_favoriteplaceurl: req.body.favoritePlaceURL
      };

      
      con.query('INSERT tbl_contacts SET ?', rowToBeInserted, function(err, result) {
        if(err) {
          throw err;
        }
        console.log("Value inserted");
      });
  });

    res.redirect("/contact");
});

// POST method to validate user login
// upon successful login, user session is created
app.post('/sendLoginDetails', function(req, res) {
  //Add Details
  var con = mysql.createConnection({
  host: DBinfo.dbconfig.host[0],
  user: DBinfo.dbconfig.user[0], // replace with the database user provided to you
  password: DBinfo.dbconfig.password[0], // replace with the database password provided to you
  database: DBinfo.dbconfig.database[0], // replace with the database user provided to you
  port: DBinfo.dbconfig.port[0]
  });

  con.connect(function(err) {
    if (err) {
     throw err;
   };
  });

  userID = req.body.username;
  password = req.body.password;


  hashedPassword = crypto.createHash('sha256').update(password).digest('base64')

  con.query('SELECT * FROM tbl_accounts Where acc_password = ? and acc_name = ?',[hashedPassword,userID],function(err,rows,fields) {
  if (err) throw err;
  if (rows.length == 0){
    req.session.flag = 1
    res.redirect("/login");}

  else {
    
      req.session.value = 1;
      req.session.user = userID;
      res.redirect("/contact");
     }
  });

});

app.get('/getflag',function(req,res) {
  var flag = req.session.flag;

  if (flag)
    res.send(flag.toString());
  else
    res.send(flag);
});

app.get('/userLogin',function(req,res) {
  var current_user = req.session.user;
  console.log(current_user)
  if (current_user)
    res.send(current_user.toString());
  else
    res.send(current_user);
});




// log out of the application
// destroy user session
app.get('/logout', function(req, res) {
  

    req.session.destroy();
    res.redirect("/login")
  
});

// middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));


// function to return the 404 message and error to client
app.get('*', function(req, res) {
  res.sendStatus(404);
});
