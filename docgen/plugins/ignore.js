export default function ignore(testFn) {
  return (files, metalsmith, cb) => {
    Object
      .keys(files)
      .forEach(fileName => {
        if (testFn(fileName) === true) delete files[fileName];
      });

    cb(null);
  };
}
