export function getTermId(): 1214 | 1218 | 1216 {
  const date = new Date();
  if (date.getMonth() <= 5) {
    return 1214;
  } else if (date.getMonth() >= 7) {
    return 1218;
  } else {
    return 1216;
  }
}

export function getTermName(id: 1214 | 1218 | 1216): 'spring' | 'fall' | 'summer' {
  switch (id) {
    case 1214:
      return 'spring';
    case 1218:
      return 'fall';
    default:
      return 'summer';
  }
}
