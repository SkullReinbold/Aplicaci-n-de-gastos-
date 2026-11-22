import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import aesjs from 'aes-js';

const KEY_NAME = 'db_enc_key';

// La llave AES-256 vive en Keystore/Keychain (SecureStore), no en la base de datos.
async function getKey(): Promise<Uint8Array> {
  let hex = await SecureStore.getItemAsync(KEY_NAME);
  if (!hex) {
    hex = aesjs.utils.hex.fromBytes(Crypto.getRandomBytes(32));
    await SecureStore.setItemAsync(KEY_NAME, hex);
  }
  return aesjs.utils.hex.toBytes(hex);
}

export async function encrypt(text: string): Promise<string> {
  if (!text) return '';
  const iv = Crypto.getRandomBytes(16);
  const ctr = new aesjs.ModeOfOperation.ctr(await getKey(), new aesjs.Counter(iv));
  const data = ctr.encrypt(aesjs.utils.utf8.toBytes(text));
  return aesjs.utils.hex.fromBytes(iv) + aesjs.utils.hex.fromBytes(data);
}

export async function decrypt(payload: string): Promise<string> {
  if (!payload) return '';
  const iv = aesjs.utils.hex.toBytes(payload.slice(0, 32));
  const data = aesjs.utils.hex.toBytes(payload.slice(32));
  const ctr = new aesjs.ModeOfOperation.ctr(await getKey(), new aesjs.Counter(iv));
  return aesjs.utils.utf8.fromBytes(ctr.decrypt(data));
}
