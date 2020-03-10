import queryString from 'query-string';
import parseurl from 'parseurl';
import isString from 'lodash/isString';

import RESERVED_WORDS from './queryStringReservedWords';

// remove leading and trailing whitespace and remove double spaces
export function formatQueryString(qs: string): string {
  return qs.trim().replace(/\s+/g, ' ');
}

export function addQueryParamsToExistingUrl(
  origUrl: string,
  queryParams: object
): string {
  const url = parseurl({url: origUrl});
  if (!url) {
    return '';
  }
  // Order the query params alphabetically.
  // Otherwise ``queryString`` orders them randomly and it's impossible to test.
  const params = JSON.parse(JSON.stringify(queryParams));
  const query = url.query ? {...queryString.parse(url.query), ...params} : params;

  return `${url.protocol}//${url.host}${url.pathname}?${queryString.stringify(query)}`;
}

type QueryValue = string | string[] | undefined | null;

/**
 * Append a tag key:value to a query string.
 *
 * Handles spacing and quoting if necessary.
 */
export function appendTagCondition(
  query: QueryValue,
  key: string,
  value: string
): string {
  if (RESERVED_WORDS.includes(key)) {
    //Use the explicit tag syntax to handle the case when the tag name (key) is a
    //reserved keyword.
    //https://docs.sentry.io/workflow/search/?platform=node#explicit-tag-syntax
    key = `tags[${key}]`;
  }

  let currentQuery = Array.isArray(query) ? query.pop() : isString(query) ? query : '';

  if (isString(value) && value.indexOf(' ') > -1) {
    value = `"${value}"`;
  }
  if (currentQuery) {
    currentQuery += ` ${key}:${value}`;
  } else {
    currentQuery = `${key}:${value}`;
  }

  return currentQuery;
}

export default {
  formatQueryString,
  addQueryParamsToExistingUrl,
  appendTagCondition,
};
