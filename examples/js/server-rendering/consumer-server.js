import http from 'node:http';

async function handler(req, res) {
  const { templates, resources } = await fetch(
    `http://localhost:3000?url=${encodeURIComponent(req.url)}`
  ).then((response) => response.json());

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
  <html>
    <head>
      <meta charset="utf-8" />
      <title>This is the consumer</title>
      ${templates.styles}
      <style>
        body {
          font-family: sans-serif;
        }
      </style>
    </head>
    <body>
      <header>${templates.header}</header>
      <main style="display: grid; grid-template-columns: 1fr 3fr">
        <div>${templates.filters}</div>
        <div>${templates.body}</div>
      </main>
      ${resources.scripts}
    </body>
  </html>`);
}

http.createServer(handler).listen(8080);
