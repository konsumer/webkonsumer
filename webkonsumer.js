import WebTorrent from 'webtorrent'
import glob from 'fast-glob'
import { lstat } from 'fs/promises'
import { promisify } from 'util'

if (process.argv.length < 3) {
  console.error('Usage: webkonsumer <DIR__OR_FILES_TO_SHARE>')
  process.exit(1)
}

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

for (const file of files) {
  client.seed(file, (torrent) => {
    console.log(`Seeding "${file}" at "${torrent.magnetURI}"`)
  })
}