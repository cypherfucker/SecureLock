import _sodium from "libsodium-wrappers-sumo"
import * as openpgp from "openpgp"

const CHUNK_SIZE = 64 * 1024 * 1024 // 64MB chunks for large file processing

let sodiumInstance: typeof _sodium | null = null

async function initSodium() {
  if (!sodiumInstance) {
    await _sodium.ready
    sodiumInstance = _sodium

    console.log("[v0] Sodium ready, typeof sodium:", typeof _sodium)
    console.log("[v0] Has crypto_pwhash:", typeof _sodium.crypto_pwhash)
    console.log("[v0] Has randombytes_buf:", typeof _sodium.randombytes_buf)
    console.log("[v0] Sample keys:", Object.keys(_sodium).slice(0, 10))
  }
  return sodiumInstance!
}

// Password-based encryption using XChaCha20-Poly1305
export async function encryptFile(
  file: File,
  secret: string,
  method: "password" | "pgp",
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  if (method === "password") {
    return encryptFileWithPassword(file, secret, onProgress)
  } else {
    return encryptFileWithPGP(file, secret, onProgress)
  }
}

export async function decryptFile(
  file: File,
  secret: string,
  method: "password" | "pgp",
  onProgress?: (progress: number) => void,
  pgpPassphrase?: string,
): Promise<{ blob: Blob; fileName: string }> {
  if (method === "password") {
    return decryptFileWithPassword(file, secret, onProgress)
  } else {
    return decryptFileWithPGP(file, secret, onProgress, pgpPassphrase)
  }
}

async function encryptFileWithPassword(
  file: File,
  password: string,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const sodium = await initSodium()

  console.log("[v0] Starting encryption, sodium ready")

  const salt = sodium.randombytes_buf(16)
  console.log("[v0] Generated salt")

  const key = sodium.crypto_pwhash(
    32, // keyLength
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  )

  console.log("[v0] Key derived successfully")

  const metadata = {
    name: file.name,
    type: file.type,
    size: file.size,
  }

  const metadataJson = JSON.stringify(metadata)
  const metadataBytes = new TextEncoder().encode(metadataJson)

  const streamInit = sodium.crypto_secretstream_xchacha20poly1305_init_push(key)
  const state = streamInit.state
  const header = streamInit.header

  const chunks: Uint8Array[] = []
  let offset = 0

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE)
    const chunkData = new Uint8Array(await chunk.arrayBuffer())

    const isLastChunk = offset + CHUNK_SIZE >= file.size
    const tag = isLastChunk
      ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
      : sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE

    const encryptedChunk = sodium.crypto_secretstream_xchacha20poly1305_push(state, chunkData, null, tag)

    chunks.push(encryptedChunk)
    offset += CHUNK_SIZE

    const progress = Math.min(Math.round((offset / file.size) * 100), 100)
    onProgress?.(progress)
  }

  const metadataLengthBytes = new Uint8Array(4)
  metadataLengthBytes[0] = metadataBytes.length & 0xff
  metadataLengthBytes[1] = (metadataBytes.length >> 8) & 0xff
  metadataLengthBytes[2] = (metadataBytes.length >> 16) & 0xff
  metadataLengthBytes[3] = (metadataBytes.length >> 24) & 0xff

  const parts: Uint8Array[] = [metadataLengthBytes, metadataBytes, salt, header, ...chunks]

  const totalSize = parts.reduce((acc, part) => acc + part.length, 0)
  const encryptedData = new Uint8Array(totalSize)

  let position = 0
  for (const part of parts) {
    encryptedData.set(part, position)
    position += part.length
  }

  return new Blob([encryptedData], { type: "application/octet-stream" })
}

async function decryptFileWithPassword(
  file: File,
  password: string,
  onProgress?: (progress: number) => void,
): Promise<{ blob: Blob; fileName: string }> {
  const sodium = await initSodium()

  const data = await file.arrayBuffer()
  const dataView = new Uint8Array(data)

  const minSize = 4 + 10 + 16 + 24
  if (data.byteLength < minSize) {
    throw new Error("INVALID_FILE_FORMAT")
  }

  let position = 0

  const metadataLength =
    dataView[position] | (dataView[position + 1] << 8) | (dataView[position + 2] << 16) | (dataView[position + 3] << 24)
  position += 4

  if (metadataLength > 10000 || metadataLength < 10) {
    throw new Error("INVALID_FILE_FORMAT")
  }

  const metadataBytes = dataView.slice(position, position + metadataLength)

  let metadata
  try {
    metadata = JSON.parse(new TextDecoder().decode(metadataBytes))
    if (!metadata.name || typeof metadata.name !== "string") {
      throw new Error("INVALID_FILE_FORMAT")
    }
  } catch (e) {
    throw new Error("INVALID_FILE_FORMAT")
  }

  position += metadataLength

  const salt = dataView.slice(position, position + 16)
  position += 16

  const header = dataView.slice(position, position + 24)
  position += 24

  const encryptedData = dataView.slice(position)

  const key = sodium.crypto_pwhash(
    32, // keyLength
    password,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13,
  )

  const state = sodium.crypto_secretstream_xchacha20poly1305_init_pull(header, key)

  const decryptedChunks: Uint8Array[] = []
  let encOffset = 0

  while (encOffset < encryptedData.length) {
    const chunkSize = Math.min(CHUNK_SIZE + 17, encryptedData.length - encOffset)
    const encChunk = encryptedData.slice(encOffset, encOffset + chunkSize)

    try {
      const result = sodium.crypto_secretstream_xchacha20poly1305_pull(state, encChunk)
      decryptedChunks.push(result.message)

      if (result.tag === sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL) {
        break
      }
    } catch (decryptError) {
      throw new Error("Decryption failed. Please check your password.")
    }

    encOffset += chunkSize

    const progress = Math.min(Math.round((encOffset / encryptedData.length) * 100), 100)
    onProgress?.(progress)
  }

  const totalDecryptedSize = decryptedChunks.reduce((acc, chunk) => acc + chunk.length, 0)
  const decryptedData = new Uint8Array(totalDecryptedSize)
  let decPosition = 0
  for (const chunk of decryptedChunks) {
    decryptedData.set(chunk, decPosition)
    decPosition += chunk.length
  }

  onProgress?.(100)

  return {
    blob: new Blob([decryptedData], { type: metadata.type }),
    fileName: metadata.name,
  }
}

async function encryptFileWithPGP(
  file: File,
  publicKeyArmored: string,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored })

  const metadata = {
    name: file.name,
    type: file.type,
    size: file.size,
  }
  const metadataStr = JSON.stringify(metadata)

  const fileData = await file.arrayBuffer()

  const metadataBytes = new TextEncoder().encode(metadataStr)
  const metadataLengthBuffer = new ArrayBuffer(4)
  const metadataLengthView = new DataView(metadataLengthBuffer)
  metadataLengthView.setUint32(0, metadataBytes.length, true)

  const combined = new Uint8Array(4 + metadataBytes.length + fileData.byteLength)

  combined.set(new Uint8Array(metadataLengthBuffer), 0)
  combined.set(metadataBytes, 4)
  combined.set(new Uint8Array(fileData), 4 + metadataBytes.length)

  onProgress?.(50)

  const encrypted = await openpgp.encrypt({
    message: await openpgp.createMessage({ binary: combined }),
    encryptionKeys: publicKey,
    format: "binary",
  })

  onProgress?.(100)

  return new Blob([encrypted as Uint8Array], { type: "application/octet-stream" })
}

async function decryptFileWithPGP(
  file: File,
  privateKeyArmored: string,
  onProgress?: (progress: number) => void,
  passphrase?: string,
): Promise<{ blob: Blob; fileName: string }> {
  let privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored })

  if (!privateKey.isDecrypted()) {
    try {
      privateKey = await openpgp.decryptKey({
        privateKey: privateKey,
        passphrase: passphrase || "",
      })
    } catch (err) {
      throw new Error(
        "Failed to decrypt PGP private key. Please check your passphrase or use an unencrypted private key.",
      )
    }
  }

  const encryptedData = await file.arrayBuffer()

  onProgress?.(20)

  const message = await openpgp.readMessage({
    binaryMessage: new Uint8Array(encryptedData),
  })

  onProgress?.(40)

  const { data: decrypted } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey,
    format: "binary",
  })

  onProgress?.(80)

  const decryptedData = decrypted as Uint8Array

  if (decryptedData.length < 4) {
    throw new Error("INVALID_FILE_FORMAT")
  }

  const metadataLengthView = new DataView(decryptedData.buffer, decryptedData.byteOffset, 4)
  const metadataLength = metadataLengthView.getUint32(0, true)

  const metadataBytes = decryptedData.slice(4, 4 + metadataLength)

  let metadata
  try {
    metadata = JSON.parse(new TextDecoder().decode(metadataBytes))
    if (!metadata.name || typeof metadata.name !== "string") {
      throw new Error("INVALID_FILE_FORMAT")
    }
  } catch (e) {
    throw new Error("INVALID_FILE_FORMAT")
  }

  const fileData = decryptedData.slice(4 + metadataLength)

  onProgress?.(100)

  return {
    blob: new Blob([fileData], { type: metadata.type }),
    fileName: metadata.name,
  }
}
