import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { checkPublishedMedia } from './check_published_media.mjs';

const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const atom = name => { const b = Buffer.alloc(8); b.writeUInt32BE(8); b.write(name,4); return b; };
const mp4 = Buffer.concat(['ftyp','moov','mdat'].map(atom));
function fixture(t, bytes = mp4, name = 'demo.mp4') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'published-media-test-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const media = path.join(root,'site/media'); fs.mkdirSync(media,{recursive:true});
  fs.writeFileSync(path.join(media,name),bytes);
  const item = { name, sha256:sha(bytes), width:64, height:64, codec:'h264', frameRate:60, durationSeconds:1, audio:false };
  const save = () => fs.writeFileSync(path.join(media,'media-manifest.json'),JSON.stringify({schemaVersion:2,deliveries:[item]}));
  save();
  const facts = { streams:[{codec_type:'video',codec_name:'h264',width:64,height:64,avg_frame_rate:'60/1',pix_fmt:'yuv420p',color_space:'bt709',color_transfer:'bt709',color_primaries:'bt709',color_range:'tv'}],format:{duration:'1'} };
  const calls = [];
  const run = (command,args) => { calls.push({command,args}); return {status:0,stderr:'',stdout:command==='ffprobe'?JSON.stringify(facts):''}; };
  return {root,media,item,facts,calls,run,save,check: options => checkPublishedMedia({root,run,...options})};
}

test('reviewed valid delivery passes; full decode explicitly maps all streams', t => {
  const f = fixture(t);
  assert.deepEqual(f.check(),{errors:[],count:1});
  assert.equal(f.calls.some(c=>c.command==='ffmpeg'),false);
  assert.deepEqual(f.check({decode:true}),{errors:[],count:1});
  const decode = f.calls.find(c=>c.command==='ffmpeg');
  assert.ok(decode.args.includes('-xerror'));
  assert.equal(decode.args[decode.args.indexOf('-map')+1],'0');
});

test('structural MP4 and WebP failures propagate instead of passing on a good probe', t => {
  const badMp4 = fixture(t,Buffer.concat(['ftyp','mdat','moov'].map(atom)));
  assert.match(badMp4.check().errors.join('\n'),/not fast-started/);
  const badWebp = fixture(t,Buffer.from('not a WebP file'),'demo.webp');
  badWebp.item.codec='webp'; badWebp.save(); badWebp.facts.streams[0].codec_name='webp';
  assert.match(badWebp.check().errors.join('\n'),/missing RIFF\/WEBP signature/);
});

test('missing, null or nonnumeric review measurements cannot bypass comparisons', t => {
  const f=fixture(t);
  for (const [key,value] of [['frameRate',undefined],['frameRate','60'],['durationSeconds',null],['durationSeconds',0],['width',1.5],['audio',undefined],['codec','hevc']]) {
    const original=f.item[key]; f.item[key]=value; f.save();
    assert.match(f.check().errors.join('\n'),/invalid delivery contract/,`${key}=${value}`);
    f.item[key]=original;
  }
});

test('unavailable probe measurements fail instead of NaN comparisons passing', t => {
  const f=fixture(t);
  for (const value of ['0/0','60/0','N/A',undefined]) {
    f.facts.streams[0].avg_frame_rate=value;
    assert.match(f.check().errors.join('\n'),/frame rate differs.*unavailable/);
  }
  f.facts.streams[0].avg_frame_rate='60/1';
  for (const value of ['N/A',undefined,'0']) {
    f.facts.format.duration=value;
    assert.match(f.check().errors.join('\n'),/duration differs.*unavailable/);
  }
});

test('probe launch errors, malformed JSON, and decoder failure all fail cleanly', t => {
  const f=fixture(t);
  assert.match(f.check({run:()=>({status:null,error:new Error('ENOENT'),stderr:null})}).errors.join('\n'),/ffprobe failed: ENOENT/);
  assert.match(f.check({run:()=>({status:0,stdout:'garbage',stderr:''})}).errors.join('\n'),/invalid JSON/);
  assert.match(f.check({decode:true,run:(command,args)=>command==='ffprobe'?f.run(command,args):{status:1,stderr:'invalid packet'}}).errors.join('\n'),/full decode failed/);
});

test('checksum changes, extra streams, unreviewed files and HTML references are rejected', t => {
  const f=fixture(t);
  f.item.sha256='0'.repeat(64); f.save();
  f.facts.streams.push({codec_type:'audio'});
  fs.writeFileSync(path.join(f.media,'unreviewed.webp'),'x');
  fs.writeFileSync(path.join(f.root,'site/index.html'),"<img src='media/missing.webp'>");
  const errors=f.check().errors.join('\n');
  assert.match(errors,/checksum differs/); assert.match(errors,/unexpected stream/);
  assert.match(errors,/audio stream count/); assert.match(errors,/unreviewed file/);
  assert.match(errors,/references unreviewed media missing.webp/);
});

test('a nonempty inventory is required and multiple audio tracks cannot hide behind audio=true', t => {
  const f=fixture(t); f.item.audio=true; f.save();
  f.facts.streams.push({codec_type:'audio'},{codec_type:'audio'});
  assert.match(f.check().errors.join('\n'),/audio stream count/);
  fs.writeFileSync(path.join(f.media,'media-manifest.json'),JSON.stringify({schemaVersion:2,deliveries:[]}));
  assert.throws(()=>f.check(),/nonempty/);
});

test('real ffprobe and full ffmpeg decode accept actual MP4, WebM and static WebP', t => {
  if (spawnSync('ffmpeg',['-version']).status!==0 || spawnSync('ffprobe',['-version']).status!==0) return t.skip('ffmpeg/ffprobe unavailable');
  const f=fixture(t); fs.unlinkSync(path.join(f.media,'demo.mp4'));
  const deliveries=[];
  for (const [ext,codec,options] of [
    ['mp4','h264',['-c:v','libx264','-preset','ultrafast','-movflags','+faststart']],
    ['webm','vp9',['-c:v','libvpx-vp9','-deadline','realtime']],
    ['webp','webp',['-frames:v','1','-c:v','libwebp']],
  ]) {
    const name=`actual.${ext}`, file=path.join(f.media,name);
    const result=spawnSync('ffmpeg',['-v','error','-f','lavfi','-i','color=c=blue:s=64x64:r=60','-t','1','-vf','setparams=range=limited:color_primaries=bt709:color_trc=bt709:colorspace=bt709',...options,
      '-pix_fmt','yuv420p','-colorspace','bt709','-color_trc','bt709','-color_primaries','bt709','-color_range','tv',file],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
    deliveries.push({...f.item,name,codec,sha256:sha(fs.readFileSync(file))});
  }
  fs.writeFileSync(path.join(f.media,'media-manifest.json'),JSON.stringify({schemaVersion:2,deliveries}));
  assert.deepEqual(checkPublishedMedia({root:f.root,decode:true}),{errors:[],count:3});
});


test('existing sRGB desktop captures remain valid but HDR transfer is rejected', t => {
  const f=fixture(t); f.facts.streams[0].color_transfer='iec61966-2-1';
  assert.deepEqual(f.check().errors,[]);
  f.facts.streams[0].color_transfer='smpte2084';
  assert.match(f.check().errors.join('\n'),/expected SDR/);
});

function payloadAtom(name,payload) {
  const header=atom(name); header.writeUInt32BE(8+payload.length);
  return Buffer.concat([header,payload]);
}
function webpChunk(name,payload) {
  const header=Buffer.alloc(8); header.write(name); header.writeUInt32LE(payload.length,4);
  return Buffer.concat([header,payload,Buffer.alloc(payload.length%2)]);
}
function webpFile(...chunks) {
  const bytes=Buffer.concat([Buffer.from('RIFF\0\0\0\0WEBP'),...chunks]);
  bytes.writeUInt32LE(bytes.length-8,4); return bytes;
}

test('email-like compressed MP4 sample bytes are ignored but actual metadata remains checked', t => {
  // The existing switch recording contains Lgo@K.EK inside mdat, not in its clean moov metadata.
  const accidentalText=Buffer.from('prefix Lgo@K.EK compressed sample');
  const sample=fixture(t,Buffer.concat([atom('ftyp'),atom('moov'),payloadAtom('mdat',accidentalText)]));
  assert.deepEqual(sample.check().errors,[]);
  const metadata=fixture(t,Buffer.concat([atom('ftyp'),payloadAtom('moov',accidentalText),atom('mdat')]));
  assert.match(metadata.check().errors.join('\n'),/contains an email address/);
  const slowStart=fixture(t,Buffer.concat([atom('ftyp'),payloadAtom('mdat',accidentalText),atom('moov')]));
  assert.match(slowStart.check().errors.join('\n'),/not fast-started/);
});

test('static WebP alpha layout passes without allowing animation or metadata chunks', t => {
  const extended=Buffer.alloc(10); extended[0]=0x10;
  const validChunks=[webpChunk('VP8X',extended),webpChunk('ALPH',Buffer.from([0])),webpChunk('VP8 ',Buffer.from([0]))];
  function check(bytes) {
    const f=fixture(t,bytes,'demo.webp'); f.item.codec='webp'; f.save(); f.facts.streams[0].codec_name='webp';
    return f.check().errors.join('\n');
  }
  assert.equal(check(webpFile(...validChunks)),'');
  assert.match(check(webpFile(...validChunks,webpChunk('EXIF',Buffer.from('private metadata')))),/invalid static WebP alpha layout/);
  const animated=Buffer.from(extended); animated[0]|=0x02;
  assert.match(check(webpFile(webpChunk('VP8X',animated),...validChunks.slice(1))),/feature and reserved flags/);
  assert.match(check(webpFile(validChunks[0],validChunks[2],validChunks[1])),/invalid static WebP alpha layout/);
  const truncated=webpFile(...validChunks).subarray(0,-1);
  assert.match(check(truncated),/RIFF length/);
});
