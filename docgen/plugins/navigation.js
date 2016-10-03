import forEach from 'lodash/forEach';

export default function() {
  return function(files, metalsmith, done) {
    const categories = {};
    forEach(files, (data, path) => {
      if (!path.match(/\.html$/)) return;
      const category = data.category || 'other';
      categories[category] = categories[category] || [];
      categories[category].push({
        path,
        title: data.title,
        navWeight: data.navWeight,
      });
    });

    forEach(files, (data, path) => {
      if (!path.match(/\.html$/)) return;
      const category = data.category || 'other';
      data.navigation = categories[category].sort((a, b) => {
        if (a.navWeight === b.navWeight || a.navWeight === undefined || b.navWeight === undefined) {
          return a.title.localeCompare(b.title);
        } else {
          return b.navWeight - a.navWeight;
        }
      });
      data.navPath = path;
    });

    done();
  };
}
