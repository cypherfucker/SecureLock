<p align="center">
  
<img width="100" height="100" alt="Untitled design (4)" src="https://github.com/user-attachments/assets/501e847f-a102-4548-95c0-1e332f9c86f2" />



<h1 align="center">SecureLock 🔒</h1>

# **Secure File Encryption**

SecureLock is a privacy-focused lightweight encryption web-app that allows you to encrypt and decrypt any file type locally in your browser without any data ever leaving your device. Built with security and privacy as core principles.

## Purpose

SecureLock provides AES-256-GCM encryption for any file type, ensuring your sensitive data remains completely private. Whether you're protecting personal documents, business files, or media content, SecureLock offers enterprise-level security with consumer-friendly simplicity.

**Key Features:**
- 🔐 **AES-256-GCM Encryption** - Natively implemented using [Libsodium library](https://github.com/jedisct1/libsodium) for cryptographic algorithms
- 📁 **Universal File Support** - Encrypt any file type (documents, images, videos, etc.)
- 🚫 **No Size Limits** - Handle files of any size without restrictions  
- 🌐 **Local Processing** - Zero server communication, complete privacy
- 🎯 **Zero Knowledge** - We never see your files or passwords
- 📱 **Cross-Platform** - Works on any device with a modern browser
- 🆓 **[Open Source](https://github.com/cypherfucker/SecureLock)** - Fully auditable code under [CC0](https://github.com/cypherfucker/SecureLock/blob/main/LICENSE) license

## 📖 Usage

### Getting Started
1. Visit the [SecureLock 🔒](https://securelock.cypherfucker.com) web application
2. Choose your encryption method: Password or [PGP Key](https://pgp.cypherfucker.com)
3. Drag and drop your file or click to select
4. Enter a strong password (minimum 16 characters with numbers, uppercase, and special characters)
5. Click "Encrypt File" to secure your data
6. Download the encrypted file with `.encrypted` extension

### Decryption
1. Select "Decrypt" mode
2. Upload your encrypted `.encrypted` file
3. Enter the same password used for encryption
4. Click "Decrypt File" to restore your original file
5. Download the decrypted file

### Password Requirements
For maximum security, passwords must include:
- ✅ At least 16 characters
- ✅ At least one number
- ✅ At least one uppercase letter  
- ✅ At least one special character


## ⚠️  Limitations

### File Signature

Files encrypted with hat.sh are identifiable by looking at the file signature that is used by the app to verify the content of a file, Such signatures are also known as magic numbers or Magic Bytes. These Bytes are authenticated and cannot be changed.

### Safari and Mobile Browsers

Safari and Mobile browsers are limited to a single file with maximum size of 1GB due to some issues related to service-workers. In addition, this limitation also applies when the app fails to register the service-worker (e.g FireFox Private Browsing).

- **Password Recovery**: If you forget your password, your files cannot be recovered. There is no "forgot password" option by design.
- **Browser Compatibility**: Requires a modern browser with Web Crypto API support (Chrome 37+, Firefox 34+, Safari 7+, Edge 12+)
- **Memory Usage**: Very large files may consume significant browser memory during processing
- **File Associations**: Encrypted files lose their original file associations and must be manually renamed after decryption

## 🛡️ Security Architecture

Z3R0 implements industry-standard cryptographic practices:

- **Encryption Algorithm**: AES-256 [Galois/Counter Mode](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- **Key Derivation**: [PBKDF2](https://en.wikipedia.org/wiki/PBKDF2) with 100,000 iterations
- **Salt Generation**: Cryptographically secure random 16-byte salt per file
- **IV Generation**: Unique 12-byte initialization vector per encryption
- **Authentication**: Built-in authentication tag prevents tampering
- **Implementation**: The Libsodium library API


## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
\`\`\`bash
git clone https://github.com/cypherfucker/SecureLock.git
cd SecureLock
npm install
npm run dev
\`\`\`

### Building
\`\`\`bash
npm run build
\`\`\`

## 📄 License

**CC0 1.0 Universal (CC0 1.0) Public Domain Dedication**

This work is dedicated to the public domain. You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

See [LICENSE](https://github.com/cypherfucker/SecureLock/blob/main/LICENSE) for details.

## 🔗 Links

- **Web-app**: [SecureLock 🔒](https://securelock.cypherfucker.com)
- **Repository**: [GitHub](https://github.com/cypherfucker/SecureLock)
- **License**: [CC0 Public Domain](https://github.com/cypherfucker/SecureLock/blob/main/LICENSE)

---
