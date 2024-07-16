import { useState } from "react";
import { TonConnectButton, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import TonWeb from 'tonweb'

declare const window: Window &
  typeof globalThis & {
    keplr: any,
    ethereum: any
  }

const TonWallet = () => {
  const [tx, setTx] = useState('');
  const [txHash, setTxHash] = useState('');
  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const runTx = async () => {
    try {
      const txObj = JSON.parse(tx);
      const transactionRequest = {
        validUntil: Math.floor(Date.now() / 1000) + 150, // 2 minute
        messages: [
          {
            address: txObj.to,
            amount: txObj.value,
            payload: txObj.meta,
          },
        ],
    };
      const { boc } = await tonConnectUI.sendTransaction(transactionRequest)
      const hash = await TonWeb.boc.Cell.oneFromBoc(
        TonWeb.utils.base64ToBytes(boc)
      ).hash()
      const hexHash = TonWeb.utils.bytesToHex(hash)
      setTxHash(hexHash);
    } catch (e) {
      console.log('Tx running error:', e);
    }
  }

  return (
    <div>
			<div className="mt-10">
				<p>TON Connect</p>
				<div className="flex gap-4">
					<button>
						<TonConnectButton />
					</button>
					<button
						className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
						onClick={() => runTx()}
					>
						Run Transaction
					</button>
	
				</div>
			</div>

      <div className="mt-10 flex flex-col gap-4">
        <p>Ton Connect Status: {!!userFriendlyAddress ? 'Connected' : 'Disconnected'}</p>
        <p>Ton Connect Address: {userFriendlyAddress}</p>
        <p>Returned TxHash: {txHash ?? ''}</p>
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

      </div>
    </div>
  );
}

export default TonWallet;
