'use strict'
let express = require('express');
let path = require('path');
let config = require('./config/config.js');
let fs = require('fs');
let watch = require('watch');
let chokidar = require('chokidar');

let child = require('child_process').spawn('java', ['-jar', 'done.jar']); 

child.stdout.on('data', function(data) {
    console.log(data.toString());
});

child.stderr.on("data", function (data) {
    console.log(data.toString());
});


let app = express();
let bodyParser = require('body-parser');
//req.body contains key-value pairs of data submitted in the request body. By default, it is undefined, and is populated when you use body-parsing middleware such as body-parser and multer.
let server = require('http').createServer(app);
let io = require('socket.io')(server);


app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 3000);
app.set('host', config.host);

require('./routes/routes.js')(express, app, fs);

//Reports the event twice. Wow, I can't believe the Node library had a bug...
//fs.watch("./textfiles/link.txt", function(){
//    fs.readFile("./textfiles/test.txt", "utf8", function (error, data) {
//            console.log(data);
//    });
//});
var clientSocket;
        io.of('/link').on('connection', function (socket) {
        console.log("3")
           clientSocket = socket; 
        });

chokidar.watch('./textfiles/test.txt').on("change", function(){
console.log("1")
    fs.readFile("./textfiles/test.txt", "utf8", function (error, data) {
        console.log("2")
        if (clientSocket !== undefined) {
            clientSocket.emit('news', data);
        }
        
    });
})

chokidar.watch('./textfiles/test2.txt').on("change", function(){
    fs.readFile("./textfiles/test2.txt", "utf8", function (error, data) {
        if (clientSocket !== undefined) {
            clientSocket.emit('news2', data);
        }
        
    });
})


//chokidar.watch('./textfiles').on("add", function(){
//    console.log("File was added!");
//})

//require('./socket/socket.js')(io, linkData);


//watch.watchTree('./textfiles', function (f, curr, prev) {
//    if (typeof f == "object" && prev === null && curr === null) {
//          // Finished walking the tree
//    } else if (prev === null) {
//      // f is a new file
//    } else if (curr.nlink === 0) {
//      // f was removed
//        fs.readFile("./textfiles/test.txt", "utf8", function (error, data) {
//            console.log(data);
//        });
//    } else {
//      // f was changed
//
//    }
//  })



server.listen(app.get('port'), function(){
    console.log('Project XXX working on port: ' + app.get('port'));
})
