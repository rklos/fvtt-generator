export function <%= logFunctionName %>(message: string) {
  // eslint-disable-next-line no-console
  console.log(`%c<%= logPrefix %>%c ${message}`, 'background-color: <%= logColor %>; color: white; padding: 2px 6px; border-radius: 4px;', '');
}
