import WebTorrent from 'webtorrent'
import { announceList } from 'create-torrent'
import wrtc from '@koush/wrtc'
import glob from 'fast-glob'
import { lstat } from 'fs/promises'
import { promisify } from 'util'

if (process.argv.length < 3) {
  console.error('Usage: webkonsumer <DIR__OR_FILES_TO_SHARE>')
  process.exit(1)
}

// polyfill for node
globalThis.WRTC = wrtc

// add a better announceList
globalThis.WEBTORRENT_ANNOUNCE = announceList
  .map(arr => arr[0])
  .filter(url => url.indexOf('wss://') === 0 || url.indexOf('ws://') === 0)

let [,, ...infiles] = process.argv

const files = []

// normalize directories and files into a big list of files, glob directories
for (const f of infiles) {
  try {
    const info = await lstat(f)

    if (info.isDirectory()) {
      for (const fg of await glob(`${f}/**/*`)) {
        console.log(fg)
        files.push(fg)
      }
    }
    if (info.isFile()) {
      files.push(f)
    }

  }catch(e) {}
}

const client = new WebTorrent()
client.seed(files, (torrent) => {
  console.log(`${files.length} files shared in https://instant.io/#${torrent.infoHash}`)
})