function capitalize(string: string) {
  return (
    string
      .toString()
      .charAt(0)
      .toUpperCase() + string.toString().slice(1)
  );
}

export default capitalize;
