export function normalizeSnapshot(html: string) {
  return (
    html
      // Vue renders a useless extra space between list item elements
      .replace(/<\/li> <li/g, '</li><li')
      // Vue renders a useless extra space between last list item element and closing list tag
      .replace(/<\/li> <\/ul>/g, '</li></ul>')
  );
}
