const fs = require('fs');
const http = require('http');
const path = require('path');
const gameLogic = require('./gameLogic');
const stats = require('./stats'); // Add this line

const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname.startsWith('/public/')) {
        const filePath = path.join(__dirname, url.pathname);
        const extname = path.extname(filePath);
        let contentType = 'text/html';

        switch (extname) {
            case '.css':
                contentType = 'text/css';
                break;
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.svg':
                contentType = 'image/svg+xml';
                break;
        }

        fs.readFile(filePath, (error, content) => {
            if (error) {
                console.error('Error reading file:', error);
                response.writeHead(404);
                response.end('File not found');
                return;
            }
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        });
        return;
    }

    switch (url.pathname) {
        case '/':
            if (request.method === 'GET') {
                const name = url.searchParams.get('name');
                console.log(name);

                response.writeHead(200, {
                    'Content-type': 'text/html'
                });

                fs.createReadStream('index.html').pipe(response);
            } else if (request.method === 'POST') {
                handlePostResponse(request, response);
            }
            break;

        case '/stats':  // Add this route
            if (request.method === 'GET') {
                const gameStats = stats.getStats();
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(gameStats), 'utf-8');
            }
            break;

        default:
            response.writeHead(404, {
                'Content-type': 'text/html'
            });

            fs.createReadStream('404.html').pipe(response);
            break;
    }
});

const port = process.env.PORT || 4001;
server.listen(port, '0.0.0.0', () => {
    console.log(`Server is listening on port ${port}`);
});

const makeSvg = () => {

};

const handlePostResponse = (request, response) => {
    request.setEncoding('utf8');

    let body = '';
    request.on('data', function(chunk) {
        body += chunk;
    });

    request.on('end', function() {
        const playerChoice = body;
        const serverChoice = gameLogic.getRandomChoice();
        const result = gameLogic.determineWinner(playerChoice, serverChoice);

        stats.updateStats(playerChoice, result.result); 

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({                        
            message: `You selected ${playerChoice}. ${result.message}`,
            serverChoice: serverChoice                       
        }));
    });
}