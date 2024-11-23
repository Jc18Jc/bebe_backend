import { createCipheriv, createDecipheriv, scryptSync } from 'crypto';

const getEncryptionKey = () => {
  const aesKey = process.env.AES_KEY;
  const aesSalt = process.env.AES_SALT;

  return scryptSync(aesKey, aesSalt, 24);
};

const algorithm = 'aes-192-cbc';
const iv = Buffer.alloc(16, 0); // 16-byte IV (고정값, 보안성 고려)

export function encrypt(data: string): Buffer {
  const key = getEncryptionKey();
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(data, 'utf8'); // Buffer로 암호화
  encrypted = Buffer.concat([encrypted, cipher.final()]); // Buffer로 결과 합치기

  return encrypted; // Base64 인코딩 없이 Buffer 반환
}

export function decrypt(encryptedData: Buffer): string {
  const key = getEncryptionKey();
  const decipher = createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData); // Buffer 처리
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8'); // 복호화된 결과를 utf8 문자열로 반환
}
