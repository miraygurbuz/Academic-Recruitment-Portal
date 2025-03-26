import soap from 'soap';
import { toUpperCaseTr } from '../utils/stringUtils.js';

const verifyTCKimlik = async (tcKimlik, name, surname, birthYear) => {
  try {
    const nameUpperCase = toUpperCaseTr(name);
    const surnameUpperCase = toUpperCaseTr(surname);
    
    const url = process.env.NVI_SERVICE_URL;
    const client = await soap.createClientAsync(url);
    
    const result = await client.TCKimlikNoDogrulaAsync({
      TCKimlikNo: tcKimlik,
      Ad: nameUpperCase,
      Soyad: surnameUpperCase,
      DogumYili: birthYear
    });
    
    if (!result || !result[0] || result[0].TCKimlikNoDogrulaResult === undefined) {
      throw new Error('Kimlik doğrulama servisinden geçersiz yanıt alındı.');
    }
    
    return result[0].TCKimlikNoDogrulaResult;
  } catch (error) {
    throw new Error('Kimlik doğrulama işlemi sırasında hata oluştu: ' + error.message);
  }
};

export { verifyTCKimlik };