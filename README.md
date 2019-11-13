### Streaming and recording application with Telegram-based video storage and Redis-based metadata storage
#### Usage
Run "npm i" inside relevant application folder before usage
##### Recorder
Recording application relies on ffmpeg as hls stream source. Once the chunk is encoded and sent to local HTTP server using PUT method it's uploaded to Telegram servers using Bot API by sending to several private chats(it's better to use more than one to prevent "429 Too Many Requests" errors). Each fragment is expected to last 1 second and contain UNIX timestamp in it's name.
It's required to fill config with your Telegram Bot API token, chat identificators and Redis endpoint URL. You can also adjust other settings to better fit your device:
```javascript
{
    "redisEndpoint": "redis://:<KEY>@<URL>:<PORT>",
    "telegramToken": "<TOKEN>",
    "telegramChats": [0, 1, 2, 3],
    "inputSettings": "-f video4linux2 -input_format yuyv422 -video_size 640x480 -i /dev/video0",
    "codecSettings": "-c:v libx264 -crf 21 -preset veryfast -g 30 -sc_threshold 0",
    "hlsSettings": "-f hls -hls_time 1 -hls_start_number_source epoch -hls_flags omit_endlist -hls_list_size 1",
    "overlaySettings": "-vf drawtext=text=%{localtime}:borderw=2:bordercolor=white",
    "internalPort": 8000,
    "cameraName": "webcam"
}
```
##### Client
Client requires only Telegram Bot API token and Redis endpoint URL
```javascript
{
    "redisEndpoint": "redis://:<KEY>@<URL>:<PORT>",
    "telegramToken": "<TOKEN>"
}
```
With server running, client web application is available at port 8000. Playlist links are intended to be used in media players(e.g VLC)
