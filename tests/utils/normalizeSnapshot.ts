export function normalizeSnapshot(html: string) {
  return (
    html
      // Vue renders a useless extra space between list item elements
      .replace(/<\/li> <li/g, '</li><li')
      // Vue renders extra whitespace inside option item elements
      .replace(/>\s+([\w() ]+?)\s+<\/option>/gs, '>$1</option>')
      // Vue renders extra whitespace inside button elements
      .replace(
        /(<button[^>]*>)\s+(.+?)\s+(<\/button>)/gs,
        (_, open, content, close) => `${open}${content.trim()}${close}`
      )
      // Vue's `<AisClearRefinements>` widget uses `type="reset"` unlike other flavors
      .replace(/(type="reset")(.+class="ais-ClearRefinements-button)/gs, '$2')
      // Vue uses XHTML syntax
      .replace(/disabled="disabled"/gs, 'disabled=""')
      // Vue renders a useless extra space between last list item element and closing list tag
      .replace(/<\/li> <\/ul>/g, '</li></ul>')
      // Vue renders a useless extra space between last anchor item element and opening list tag
      .replace(/<\/a>\s+<ul/g, '</a><ul')
      // Vue renders extra whitespace between span elements
      .replace(/<\/span> <span/g, '</span><span')
      // Vue renders an empty comment for falsy v-if predicates
      .replace(/(\s+)?<!---->(\s+)?/g, '') // Vue 2
      .replace(/(\s+)?<!--v-if-->(\s+)?/g, '') // Vue 3
      // Vue 3 preserves user comments
      .replace(/(\s+)?<!--.*?-->(\s+)?/gs, '') // Vue 3
      // Vue renders extra whitespace after list elements
      .replace(/<\/ul> </g, '</ul><')
      // Vue renders extra whitespace before label elements
      .replace(/\s(<label.+?>)/gs, '$1')
      // Vue renders extra whitespace before input elements
      .replace(/\s(<input.+?>)/gs, '$1')
      // Vue renders extra whitespace after input elements
      .replace(/(<input.+?>)\s/gs, '$1')
      // Vue renders extra whitespace before button elements
      .replace(/\s(<button.+?>(.+?)<\/button>)/gs, '$1')
      // Vue renders extra whitespace after button elements
      .replace(/(<button.+?>(.+?)<\/button>)\s/gs, '$1')
      // Vue renders extra whitespace after div elements
      .replace(/(<div.+?>(.+?)<\/div>)\s/gs, '$1')
      // Vue renders extra whitespace after circle elements
      .replace(/(<circle.+?>)\s/gs, '$1')
  );
}
