const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');

function templateHTML(body) {
    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>게시판</title>
        <style>
        body {
            background-color: #e7cdca;
        }
        .Header {
            color: #0e706f;
            display: flex;
            flex-direction: row;
            align-items: right;
            justify-content: right;
        }
        .Title1 {
            margin-right: 200px;
            margin-top: 90px;
            line-height: 30px;
            text-align:right;
        }
        #title1 {
            font-family: Georgia, serif ;
            font-weight: normal;
            font-size: 300%;
        }
        #sub-title1 {
            font-family: san-serif ;
            font-weight: lighter;
            font-size: 110%;
            border-bottom: 4px solid #0e706f;
            padding-bottom:5px;
        }
        #sub-title2 {
            font-family: san-serif ;
            font-weight: lighter;
            font-size: 110%;
        }
        .Menu {
            text-align: right;
            margin: 400px;
        }
        table{
            border-spacing: 10px;
            border-bottom : 1px solid #0e706f;
            border-collapse : collapse;
            width: 60%;
            margin: auto;
            margin-top: 3%;
        }
         
        td,th {
            margin-left: 300px;
            width : 100px;
            height : 30px;
        }
        th {
            padding: 10px;
            font-family: san-serif ;
            font-weight: lighter;
            font-size: 130%;
            letter-spacing : 1px;
            background-color: #0e706f;
            color: #b5b3ab;            ;
            text-align: left;
        }
        td {
            padding: 20px 0px 50px 30px;
            font-size: 120%;
            font-family: san-serif ;
            font-weight: lighter;
            border-bottom : 5px solid #0e706f;
            border-collapse : collapse;
            background-color: ;
        }
        a {
            text-decoration: none;
            color: #0e706f;
        }
        .Title2 {
            margin-right: 70px;
            margin-top: 50px;
            line-height: 30px;
            text-align: left;
            display: flex;
            flex-direction: column;
            align-items: left;
            justify-content: left;
            margin-left: 300px;
            text-align: left;
            line-height: 50px;
        }
        #title2 {
            font-family: Georgia, serif ;
            font-weight: normal;
            font-size: 300%;
            color: #0e706f;
        }
        #date {
            font-family: san-serif ;
            font-weight: lighter;
            font-size: 110%;
            color: #0e706f;
        }
        </style>
    </head>
    <body style="margin:0; padding:0;">
    <div class = "Board">
        <div class="Header" style= "background-image: url('title.jpeg');">
            <div class="Title1">
                <span id="title1">community</span><br>
                <span id="sub-title1">conversation free, talking, & smile</span><br>
                <span id="sub-title2">2021 camellia 174, 12173.</span>
            </div>
        </div>
            <div class="Title2">
                <span id="title2">board</span>
                <span id="date">October 3rd, 2021.</span>
            </div>
        
        ${body}
        <div class="Menu">
            <a href="/write">글쓰기</a>
        </div>
    </div>
    </body>
    </html>`;
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var pathName = url.parse(_url, true).pathname;
    var qs = require('querystring');

    if(_url == '/'){
        title = "giLog:)";
    }

     if(pathName === '/') {
        if(queryData.id === undefined) {
            fs.readdir('./data', function(error, filelist) {
                var list = '';
                var i =0;
                while(i<filelist.length){
                    list=list+`<tr><td><a href="/?id=${filelist[i]}">${filelist[i]}</a></td>`
                    i=i+1;
                    list=list+'</tr>';
            }
            var template = templateHTML(`
            <table>
            <thead>
                <th>TITLE</th>
            </thead>
            <tbody>
                ${list}
            </tbody>
            </table>`);//, `<p>${title}</p>${data}`, `<a href="/write">write</a>`);
            response.writeHead(200);
            response.end(template);
            })
        } else {
        fs.readFile(`data/${title}`, 'utf8', function(err, data) {
            var template = templateHTML(`<p>${title}</p>${data}<p><a href="/update?id=${title}">update</a> <a href="/delete?id=${title}">delete</a></p>`);
            response.writeHead(200);
            response.end(template);
        });
    }
     } else if(pathName === '/write') {
        var template = templateHTML(`
        <form action="/diary_read" method="post">
            <p>
            <input type="text" name="title" placeholder="제목">
            </p>
            <p>
                <textarea name="description" placeholder="내용을 입력하세요"></textarea>
            </p>
            <p>
                <input type="submit"></input>
            </p>
        </form>`);
        response.writeHead(200);
        response.end(template);
     } else if(pathName === '/diary_read') {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8',
            function(err) {
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end('success');
            })
        });
     } else if(pathName === '/update') {
        fs.readFile(`data/${title}`, 'utf8', function(err, data) {
            var template = templateHTML(`<p>${title}</p>${data}
            <form action="/diary_update" method="post">
            <input type="hidden" name="id" value="${title}">
            <p>
                <input type="text" name="title" value="${title}" placeholder="제목">
            </p>
            <p>
                <textarea name="description" placeholder="내용을 입력하세요">${data}</textarea>
            </p>
            <p>
                <input type="submit"></input>
            </p>
            </form>
           `);
            response.writeHead(200);
            response.end(template);
        });
    } else if(pathName === '/diary_update') {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`,`data/${title}`, function(error){
                fs.writeFile(`data/${title}`, description, 'utf8',
                function(err) {
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                })
            })
        });
    } else if(pathName === '/delete') {
        fs.readFile(`data/${title}`, 'utf8', function(err, data) {
             var template = templateHTML(`<p>${title}</p>${data}
            <form action="/diary_delete" method="post">
            <input type="hidden" name="id" value="${title}">
            <p>삭제하시나요?</p>
            <p>
                <input type="submit"></input>
            </p>
            </form>
           `);
            response.writeHead(200);
            response.end(template);
        });
    //     fs.unlink(`./data/${post.id}`,(err)=>{ 
    //     console.log(post.id);
    //     response.writeHead(302, {Location: `/`});
    //     response.end(); 
    // });
    } else if(pathName === '/diary_delete') {
        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`,
            function(err) {
                response.writeHead(302, {Location: `/?id=${id}`});
                response.end('success');
            })
        });
    } else {
        response.writeHead(404);
        response.end("Not Found");
     }
});
app.listen(3000);