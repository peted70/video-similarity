const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const ffprobe = require('@ffprobe-installer/ffprobe');

let optObj = {};
let hashBits = optObj.hashBits || 8;
let strength = optObj.strength || 1;

const vHash = require('video-hash')({
    ffmpegPath: ffmpeg.path,
    ffprobePath: ffprobe.path,
    hashBits: hashBits,
    strength: strength
});

const {
    performance
} = require('perf_hooks');
  
const fs = require('fs');
const util = require('util');
const path = require('path');
const fetch = require("node-fetch");

const unlink = util.promisify(fs.unlink);

async function hashVideo(videoPath) {
    const video = vHash.video(videoPath);
    try {
        let hash = await video.hash();
        return hash;
    } catch (err) {
        throw err;
    }
}

function streamFile(res, filename) {
    return new Promise((success, error) => {
        const dest = fs.createWriteStream(filename);
        res.body.pipe(dest);
        res.body.on('end', () => success());
        dest.on('error', error);
    });
}

/*
    {
        videourl: 'https://contentsimilaritystore.blob.core.windows.net/input/Big_Buck_Bunny_1080_10s_30MB.mp4',
        hashbits: 8,
        strength: 1
    }
*/
module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    let startTime = performance.now();

    /** First, we need to download the file locally as we can't stream to the video hash service */
    let response = await fetch(req.body.videourl);
    if (response.status !== 200) {
        context.log(`Looks like there was a problem. Status Code: ${response.status}`);
        return;
    }
  
    /** Create a unique-ish filename */
    let localFilename = process.env.tmp + '/' + new Date().toISOString().replace(/[-:.]/g,"") + path.extname(req.body.videourl);
    context.log(`${localFilename} to create`);        

    // This works but will load the whole video into memory
    // let buff = await response.buffer();
    // fs.writeFileSync(localFilename, buff, "binary");

    try {
        // Instead stream the file to disk 
        await streamFile(response, localFilename);
    } catch (ex) {
        context.log(`Error ${localFilename}: ${ex}`);        
    }

    context.log(`created ${localFilename}`);        

    let hash = '';
    try {
        /** Initialize the hasbits and strength parameters */
        vHash.options.hashBits = req.body.hashbits || hashBits;
        vHash.options.strength = req.body.srength || strength;

        /** It is possible to pass a stream here but we hit an error in ffmpeg so will use a local file */
        hash = await hashVideo(localFilename)
    } finally {
        await unlink(localFilename);
        context.log(`deleted ${localFilename}`);        

        let processingTime = performance.now() - startTime;
        context.log(`processed ${req.body.videourl} in ${new Date(processingTime).toISOString().slice(11, -1)}`);
    }

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: hash
    };
}