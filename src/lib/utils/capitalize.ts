function capitalize(text: string): string {
  return (
    text
      .toString()
      .charAt(0)
      .toUpperCase() + text.toString().slice(1)
  );
}

export default capitalize;
