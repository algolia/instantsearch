export default function ignore(regex) {
  return (files, metalsmith, cb) => {
    Object
      .keys(files)
      .forEach(fileName => {
        if (regex.test(fileName)) delete files[fileName];
      });

    cb(null);
  };
}
