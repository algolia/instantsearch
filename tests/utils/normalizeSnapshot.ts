export function normalizeSnapshot(html: string) {
  return (
    html
      // Vue renders a useless extra space between list item elements
      .replace(/<\/li> <li/g, '</li><li')
      // Vue renders extra whitespace inside option item elements
      .replace(/>\s+?(\w+?)\s+?<\/option>/gs, '>$1</option>')
      // Vue renders a useless extra space between last list item element and closing list tag
      .replace(/<\/li> <\/ul>/g, '</li></ul>')
  );
}
