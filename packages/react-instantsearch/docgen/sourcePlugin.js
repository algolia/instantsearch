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
        // Yep
        Object.assign(files, processedFiles);
        callback(err);
      });
}
