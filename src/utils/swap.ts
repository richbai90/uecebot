const swap = <T>(arr1: T[], arr2: T[], predicate: (a: T, b: T) => boolean): T[] => {
  const swapped: T[] = [...arr1];
  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr2.length; j++) {
      swapped[i] = predicate(arr1[i], arr2[j]) ? arr2[j] : arr1[i];
    }
  }
  return swapped;
};

export default swap;
