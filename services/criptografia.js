const { safeStorage } = require('electron')

function encrypt(senha){
    const encryptedBuffer = safeStorage.encryptString(senha);
    const base64Encrypted = encryptedBuffer.toString('base64');

    return base64Encrypted
}

function decrypt(senha){
    const encryptedBufferFromBase64 = Buffer.from(senha, 'base64');
    const decrypted = safeStorage.decryptString(encryptedBufferFromBase64);
    return decrypted
}

module.exports = {encrypt, decrypt}