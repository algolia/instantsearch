import createSerializer from 'jest-serializer-html/createSerializer';

expect.addSnapshotSerializer(
  createSerializer({
    print: {
      sortAttributes: (names) => names.sort(),
    },
  })
);
