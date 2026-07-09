// fetch-channel.mjs — get latest video IDs from ישיבת פאר יוסף YouTube channel
// Uses YouTube oEmbed + RSS feed (no API key needed)
import https from 'https';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Channel handle: @הרבאשרעבאדיעטרתמנשההיכלמוהרן
// Try RSS feed for uploads
const channelId = 'UCqW4RLKgmhMm87lkGjnXMnA'; // will try to discover
const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

try {
  const xml = await get(rssUrl);
  const ids = [...xml.matchAll(/<yt:videoId>([^<]+)<\/yt:videoId>/g)].map(m => m[1]);
  if (ids.length > 0) {
    console.log('Found video IDs:');
    ids.slice(0, 5).forEach((id, i) => console.log(`  [${i+1}] ${id}  →  https://youtube.com/watch?v=${id}`));
  } else {
    console.log('No IDs found via RSS, channel ID may be wrong');
    // Show first 500 chars to debug
    console.log(xml.slice(0, 300));
  }
} catch(e) {
  console.error('Error:', e.message);
}
