import * as Sentry from '@sentry/node';
import '@sentry/tracing';
import cheerio from 'cheerio';
import { forEach } from 'ramda';
import PropertySet from './utils/PropertySet';
import { IClass } from './types/IClass';

require('dotenv').config(); // eslint-disable-line
const { assert } = console;
console.assert = function (cond: boolean, text: string, dontThrow: boolean) {
  assert(cond);
  if (!cond) {
    if (dontThrow) debugger;
    throw new Error(text || 'Assertion Failed');
  }
};

Sentry.init({
  dsn: 'https://773b12dfa0d5486e8f17984a436cc32c@o4504557293469696.ingest.sentry.io/4504557296549888',
  integrations: [
    Sentry.rewriteFramesIntegration({
      root: global.__rootdir__,
    }),
  ],
});

try {
  const classes = await (async () => {
    try {
      // Fetch the webpage with headers to make it more browser-like
      const response = await fetch('https://class-schedule.app.utah.edu/main/1254/class_list.html?subject=ECE', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          Connection: 'keep-alive',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();

      // Verify we got some HTML content
      if (!html || html.trim().length === 0) {
        throw new Error('Received empty HTML content');
      }

      const $ = cheerio.load(html);

      const classes: PropertySet<IClass> = new PropertySet('name');
      const cards = $('div.class-info');
      const classList = cards
        .map((_, card) => {
          const name = $(card)
            .find('h3')
            ?.text()
            .split('\n')
            ?.join(' ')
            .replace(/[-]\s+\d+/, '')
            .replace(/\s{2,}/g, ' ')
            .trim();

          const crossListedEl = $(card).find('.card-footer li');
          const crossListed = crossListedEl.length ? crossListedEl.map((_, el) => $(el).text()).toArray() : [];
          const id = $(card).attr('id');
          const code = /^(ECE \d+)/.exec(name)?.[1] ?? '?';
          return {
            id,
            name,
            code,
            crossListed,
          };
        })
        .filter((_, { name }) => /^ECE (?!6960)\d{4,}/.test(name))
        .toArray();

      if (classList.length === 0) {
        console.warn('No matching elements found. The page structure might have changed.');
      }

      forEach((cls) => {
        classes.add(cls);
      }, classList);

      console.log(`Found ${classes.size} classes`);

      return classes;
    } catch (error) {
      console.error('Error during scraping:', error.message);
      if (error.cause) {
        console.error('Caused by:', error.cause);
      }
      throw error;
    }
  })();
  global.CLASS_LIST = classes;
} catch (error) {
  console.warn('Failed to scrape classes.', error);
}

declare global {
  var __rootdir__: string; // eslint-disable-line
  var CLASS_LIST: Set<IClass>; // eslint-disable-line
}
