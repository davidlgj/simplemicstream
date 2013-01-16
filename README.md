Simple Mic Stream
=================

Simple streaming of an USB Mic via arecord to **one** client via the html5 <audio> tag.

Usage:
------
Start server, optional port nr as argument (defaults to 9000)
```bash
$ node server.js 9090
```

Go to the server, ie something like ```http://localhost:9090```, with your favorite browser to get 
an audio player. Just press play. It has a couple of seconds  of lag due to buffering, probably 
browser specific but for me it feels like 2-3s.

You can also open the wav stream directly with with VLC with the url ```/audio.wav```
```bash
$ vlc http://loclhost:9090/audio.wav
```

The server can only support one listener at a time and you need to close the HTTP connection for it to release the mic to someone else, this means
closing the tab/browser, not just pressing pause.

GPL Licensed.