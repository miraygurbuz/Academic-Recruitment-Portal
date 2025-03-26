const toUpperCaseTr = (str) => {
    const letters = { 'i': 'İ', 'ı': 'I', 'ğ': 'Ğ', 'ü': 'Ü', 'ş': 'Ş', 'ö': 'Ö', 'ç': 'Ç' };
    return str.replace(/[iığüşöç]/g, letter => letters[letter]).toUpperCase();
  };

export { toUpperCaseTr };