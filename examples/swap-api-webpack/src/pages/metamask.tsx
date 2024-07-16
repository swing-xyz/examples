import { useState } from "react";
import { sendTransaction } from '../utils';
import useAuth from "../hooks/useAuth";

declare const window: Window &
  typeof globalThis & {
    keplr: any,
    ethereum: any
  }

const MetamaskWallet = () => {
  const { account, chainId, connect, disconnect } = useAuth();
  const [tx, setTx] = useState('');
  const [txHash, setTxHash] = useState('');
  const [encryptionPublicKey, setEncryptionPublicKey] = useState('');
  const [decryptedData, setDecryptedData] = useState('');

  const runTx = async () => {
    try {
      const txObj = JSON.parse(tx);
      const hash = await sendTransaction(txObj);
      setTxHash(hash);
    } catch (e) {
      console.log('Tx running error:', e);
    }
  }

  const signMessage = async () => {
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [tx, account],
      });
      setTxHash(signature);
    } catch (e) {
      console.log('Signing error:', e);
    }
  }

  const getEncPubKey = async () => {
    try {
      const encryptionPublicKey = await window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [account],
      });
      setEncryptionPublicKey(encryptionPublicKey);
    } catch (e) {
      console.log('Encryption error:', e);
    }
  }

  const decryptMessage = async () => {
    try {
      const callData = await window.ethereum.request({
        method: 'eth_decrypt',
        params: [tx, account]
      });
      setDecryptedData(callData);
    } catch (e) {
      console.log('Encryption error:', e);
    }
  }

  return (
    <div>
			<div className="mt-10">
				<p>Metamask</p>
				<div className="flex gap-4">
					<button
						className="bg-orange-400 px-6 py-4 rounded text-white hover:bg-orange-500 active:bg-orange-600"
						onClick={() => !!account ? disconnect() : connect()}
					>
						{!!account ? 'Disconnect Metamask': 'Connect Metamask'}
					</button>
					<button
						className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
						onClick={() => runTx()}
					>
						Run Transaction
					</button>
					<button
						className="bg-blue-700 px-6 py-4 rounded text-white hover:bg-blue-800 active:bg-blue-900"
						onClick={() => signMessage()}
					>
						Sign Message
					</button>
					<button
						className="bg-purple-700 px-6 py-4 rounded text-white hover:bg-purple-800 active:bg-purple-900"
						onClick={() => getEncPubKey()}
					>
						Encryption Key
					</button>
					<button
						className="bg-orange-700 px-6 py-4 rounded text-white hover:bg-orange-800 active:bg-orange-900"
						onClick={() => decryptMessage()}
					>
						Decrypt Message
					</button>
				</div>
			</div>

      <div className="mt-10 flex flex-col gap-4">
        <p>Metamask Status: {!!account ? 'Connected' : 'Disconnected'}</p>
        <p>Metamask Network: {chainId ?? ''}</p>
        <p>Metamask Address: {account}</p>
        <p>Returned TxHash: {txHash ?? ''}</p>
        <p>Encryption Public Key: {encryptionPublicKey ?? ''}</p>
        <textarea
          className="border p-4 rounded"
          placeholder={`
            Copy & Paste your Postman result(txData or msg) here
            e.g.(tx)
            {
              "from": "...",
              "data": "...",
              "to": "..."
            }
            e.g.(msg for sign)
            string here
          `}
          rows={10}
          autoFocus
          onChange={(e) => setTx(e.target.value)}
        ></textarea>
        <p className="break-all">Decrypted Data: {decryptedData ?? ''}</p>
      </div>
    </div>
  );
}

export default MetamaskWallet;
