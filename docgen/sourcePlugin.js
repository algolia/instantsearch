import metalsmith from 'metalsmith';

export default function source(dir, only, processFiles) {
  return (files, m, callback) =>
    metalsmith(dir)
      .source('.')
      .ignore(`!${only}`)
      .process((err, newFiles) => {
        const processedFiles = Object.entries(newFiles).reduce((res, [name, file]) => {
          const [newName, newFile] = processFiles(name, file);
          return {
            ...res,
            [newName]: newFile,
          };
        }, {});
        // We modify previous metalsmith files by reference, this
        // is how metalsmith works
        // https://github.com/metalsmith/metalsmith#useplugin
        Object.assign(files, processedFiles);
        callback(err);
      });
}
