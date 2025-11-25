#!/usr/bin/env node
import Parser from 'rss-parser';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const RSS_URL = 'https://www.microsoft.com/releasecommunications/api/v2/azure/rss';
const OUTPUT_PATH = './frontend/public/data/rss.json';

async function fetchRss() {
  console.log('Fetching Azure RSS feed...');
  const parser = new Parser({ timeout: 30000 });

  const feed = await parser.parseURL(RSS_URL);
  const items = (feed.items || []).map(i => ({
    id: i.guid || i.link || i.title || '',
    title: i.title || '',
    link: i.link || '',
    published: i.isoDate || i.pubDate || '',
    summary: String(i.contentSnippet || i.content || ''),
    categories: i.categories || []
  }));

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    items
  }, null, 2));

  console.log(`Saved ${items.length} items to ${OUTPUT_PATH}`);
}

fetchRss().catch(err => {
  console.error('Failed to fetch RSS:', err);
  process.exit(1);
});
