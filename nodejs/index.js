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
        .Header {
            display: flex;
            flex-direction: row;
        }
        
        </style>
    </head>
    <body style="margin:0; padding:0;">
        <div class="Header">
            <h2>게시판</h2>
            <div class="Menu">
                <span>글쓰기</span>
                <span>글 목록보기</span>
            </div>
        </div>
        ${body}
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
                var data = "giLog:)";
                var list = '<ul>';
                var i =0;
                while(i<filelist.length){
                    list=list+`<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`
                    i=i+1;
            }
            list=list+'</ul>';
            var template = templateHTML(list);//, `<p>${title}</p>${data}`, `<a href="/write">write</a>`);
            response.writeHead(200);
            response.end(template);
            })
        } else {
        fs.readFile(`data/${title}`, 'utf8', function(err, data) {
            var template = templateHTML([]);//,`<p>${title}</p>${data}`,`<a href="/update?id=${title}">update</a> <a href="/delete?id=${title}">delete</a>`);
            response.writeHead(200);
            response.end(template);
        });
    }
     } else if(pathName === '/write') {
        // var template = templateHTML([]);,`
        // <form action="/diary_read" method="post">
        //     <p>
        //     <input type="text" name="title">
        //     </p>
        //     <p>
        //         <textarea name="description"></textarea>
        //     </p>
        //     <p>
        //         <input type="submit"></input>
        //     </p>
        // </form>`);
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
        //     var template = templateHTML([]);,`<p>${title}</p>${data}`,`
        //     <form action="/diary_update" method="post">
        //     <input type="hidden" name="id" value="${title}">
        //     <p>
        //         <input type="text" name="title" value="${title}">
        //     </p>
        //     <p>
        //         <textarea name="description">${data}</textarea>
        //     </p>
        //     <p>
        //         <input type="submit"></input>
        //     </p>
        //     </form>
        //    `);
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
             var template = templateHTML([]);//,`<p>${title}</p>${data}`,`
        //     <form action="/diary_delete" method="post">
        //     <input type="hidden" name="id" value="${title}">
        //     <p>삭제하시나요?</p>
        //     <p>
        //         <input type="submit"></input>
        //     </p>
        //     </form>
        //    `);
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