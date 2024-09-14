---
slug: "/blog/hls-m3u8"
title: "HLS流媒体 m3u8视频播放"
date: "2022-08-30 19:17:35"
brief: "在工作中遇到了需要播放实时监控视频的需求，第一次接触，于是记录下来，并且进行一个简单的组件封装，以便日后复用。"
tag: "react"
---



## 概念简介

### HLS (HTTP Live Streaming)

- 苹果公司开发的一种**基于 HTTP 的流媒体传输协议**，广泛应用于**实时视频传输**。
- 工作原理是**把整个流分成一个个小的基于 HTTP 的文件来下载，每次只下载一些**。当媒体流正在播放时，客户端可以选择从许多不同的备用源中以不同的速率下载同样的资源，允许流媒体会话适应不同的数据速率。
- 主要用于PC和Apple终端的音视频服务。包括一个**m3u(8)的索引文件**，**TS媒体分片文件**和key加密串文件。



## 视频播放地址测试

在线测试地址：

```
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
```



使用Chrome扩展程序播放测试：

- Native HLS Playback

  ![chrome-extension-2](/images/2022-08-30/chrome-extension-2.png)

- Play HLS M3u8

  ![chrome-extension-1](/images/2022-08-30/chrome-extension-1.png)

测试结果：

![result-2](/images/2022-08-30/result-2.png)

可以正确播放！



接下来，打开控制台看看：

![result-1](/images/2022-08-30/result-1.png)



m3u8文件里的内容是这样的：

```python
#EXTM3U
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-TARGETDURATION:2

#EXTINF:2,
800kbit/seq-0.ts
#EXTINF:2,
800kbit/seq-1.ts
#EXTINF:2,
800kbit/seq-2.ts
#EXTINF:2,
800kbit/seq-3.ts
#EXTINF:2,
800kbit/seq-4.ts
#EXTINF:2,
800kbit/seq-5.ts
#EXTINF:2,
800kbit/seq-6.ts
#EXTINF:2,
800kbit/seq-7.ts
#EXTINF:2,
800kbit/seq-8.ts
#EXTINF:2,
800kbit/seq-9.ts
#EXTINF:2,
800kbit/seq-10.ts
...
#EXTINF:2,
800kbit/seq-440.ts
#EXTINF:2,
800kbit/seq-441.ts
#EXTINF:2,
800kbit/seq-442.ts
#EXTINF:2,
800kbit/seq-443.ts

#EXT-X-ENDLIST
```

m3u8文件中的 m3u8标签与属性说明感兴趣的可以自行百度。

这里用到的标签含义如下：

```python
#EXTM3U
每个M3U文件第一行必须是这个tag，起标示作用

#EXT-X-MEDIA-SEQUENCE
每一个media URI在PlayList中只有唯一的序号，相邻之间序号+1;
一个media URI并不是必须要包含的，如果没有，默认为0

#EXT-X-TARGETDURATION
指定最大的媒体段时间长（秒）。所以#EXTINF中指定的时间长度必须小于或是等于这个最大值。
这个tag在整个PlayList文件中只能出现一次
（在嵌套的情况下，一般有真正ts url的m3u8才会出现该tag）

#EXT-X-ENDLIST
duration指定每个媒体段(ts)的持续时间（秒），仅对其后面的URI有效

#EXT-X-ENDLIST
表示PlayList的末尾了，它可以在PlayList中任意位置出现，但是只能出现一个
```



ts媒体分片文件是这样的：

![result-3](/images/2022-08-30/result-3.png)



## 功能实现

该自己动手实现视频播放功能了！



### 方案1：直接引入一个播放器

> [Video.js 官方文档](https://videojs.com/) 



#### 引入

```shell
npm i -S video.js
```



#### 实现

官网有比较详细的代码，稍加改动就能实现一个简单的封装了。

```tsx
/* VideoPlayer/index.tsx */
import React, { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js';
import 'video.js/dist/video-js.css';
import styles from './index.less';

// 引入中文语言包
Reflect.set(window, 'videojs', videojs);
require('video.js/dist/lang/zh-CN');

export type VideoPlayerProps = {
  options?: any;
  onReady?: (player: VideoJsPlayer) => void;
};

const defaultOptions: VideoJsPlayerOptions = {
  autoplay: 'muted',
  controls: true,
  muted: true,
  retryOnError: true,
  language: 'zh-CN',
};

const VideoPlayer: FC<VideoPlayerProps> = (props) => {
  const { options = {}, onReady } = props;
  const [] = useState<any>();
  const videoDomRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoJsPlayer>();

  useEffect(() => {
    if (!playerRef.current) {
      if (!videoDomRef.current) return;

      const player = (playerRef.current = videojs(
        videoDomRef.current,
        videojs.mergeOptions(defaultOptions, options),
        () => {
          videojs.log('player is ready');
          onReady && onReady(player);
        },
      ));
    } else {
      // const player = playerRef.current;
      // player.autoplay(options.autoplay);
      // player.src(options.sources);
    }
  }, [options]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player) {
        player.dispose();
        playerRef.current = undefined;
      }

      Reflect.deleteProperty(window, 'videojs');
    };
  }, []);

  return (
    <div data-vjs-player style={{ width: '100%', height: 700 }}>
      <video
				ref={videoDomRef}
				className={`video-js vjs-default-skin ${styles.video}`} />
    </div>
  );
};

export default VideoPlayer;
```

```less
/* VideoPlayer/index.less */
.video {
  width: 100%;
  height: 100%;
  object-fit: contain;

  :global {
    .vjs-modal-dialog.vjs-text-track-settings {
      select {
        color: #000;
      }
    }
  }
}
```



组件使用

```tsx
/* HLSVideoTest.tsx */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FC } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import { VideoJsPlayer } from 'video.js';

type PageProps = {};

const Page: FC<PageProps> = (props) => {
  const {} = props;
  const playerRef = useRef<VideoJsPlayer>();
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>();
  const [videoUrl, setVideoUrl] = useState<string>('');

  const getVideoUrl = async () => {
    const res: any = await new Promise((resolve) => {
      resolve({
        title: '测试名称',
        url: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
      });
    });

    setVideoUrl(res.url);
  };

  useEffect(() => {
    getVideoUrl();
  }, []);

  useEffect(() => {
    if (playerRef.current && isPlayerReady) {
      if (videoUrl) {
        const player = playerRef.current;

        player.src({
          src: videoUrl,
          type: 'application/x-mpegURL',
        });

        player.on('loadedmetadata', () => {
          player.play();
        });
      }
    }
  }, [videoUrl, isPlayerReady]);

  const videoPlayerOptions = useMemo(
    () => ({
      bigPlayButton: false,
      disablePictureInPicture: true,
    }),
    [],
  );

  const onVideoPlayerReady = useCallback((player) => {
    playerRef.current = player;
    setIsPlayerReady(true);
  }, []);

  return (
    <div>
      <VideoPlayer options={videoPlayerOptions} onReady={onVideoPlayerReady} />
    </div>
  );
};

export default Page;
```



#### 效果

测试视频

![result-4](/images/2022-08-30/result-4.png)



然后替换成项目中的视频地址，出现了视频画面有时会变绿的问题。

![result-5](/images/2022-08-30/result-5.png)

不知道是不是内部解码有问题……换一个方案。



### 方案2：video标签 + hls.js

> [hls.js 官方文档](https://github.com/video-dev/hls.js/blob/master/docs/API.md) 



#### 引入

```shell
npm i -S hls.js
```



#### 实现

官方文档有比较详细的代码，差不多照搬就能实现功能了。

```tsx
/* HlsVideoPlayer/index.tsx */
import React, { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import Hls from 'hls.js';
import styles from './index.less';

export type HlsVideoPlayerProps = {
  url?: string;
  height?: number | string;
};

const HlsVideoPlayer: FC<HlsVideoPlayerProps> = (props) => {
  const { url, height = 700 } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const videoDomRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls>();

  const initHls = (url: string) => {
    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();

      const hls = (hlsRef.current = new Hls());

      hls.attachMedia(videoDomRef.current!);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(url);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          setErrMsg(null);
          videoDomRef.current!.play();
        });
      });

      hls.on(Hls.Events.ERROR, (event: any, data: { fatal: any; type: any }) => {
        if (data.fatal) {
          setLoading(false);

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('fatal network error encountered, try to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('fatal media error encountered, try to recover');
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setLoading(false);
              setErrMsg('视频因格式问题、服务器或网络问题无法正常加载');
              break;
          }
        }
      });
    }
  }

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.stopLoad();
        hlsRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    setLoading(true);

    if (url && url.length > 0) {
      initHls(url);
    }
  }, [url]);

  return (
    <div className={styles.videoWrapper} style={{ height }}>
      <video ref={videoDomRef} className={styles.video} muted autoPlay controls>
        <source type="'application/x-mpegURL'" />
      </video>

      {loading && (
        <div className={styles.prepareLayer}>
          <span>加载中...</span>
        </div>
      )}

      {
        !loading && errMsg && (
          <div className={styles.prepareLayer}>
            <span>{errMsg}</span>
          </div>
        )
      }
    </div>
  );
};

export default HlsVideoPlayer;
```

```less
/* HlsVideoPlayer/index.less */
.videoWrapper {
  position: relative;

  .video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .prepareLayer {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }
}
```

