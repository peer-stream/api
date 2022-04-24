const buildMessage = (address, nonce) => `!! PLEASE DON'T change this message as this will fail your login request. !!\n
  You requested to login with your wallet and when you sign this message we'll sign you in.\n
  It will NOT cost you anything.\n
  Wallet Address: ${address}\n\n
  Unique request ID which your wallet and our app will handshake upon is: [${nonce}]`

module.exports = buildMessage;
