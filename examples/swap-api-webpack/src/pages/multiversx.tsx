import { useState } from 'react';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { Address, Transaction, TransactionPayload, TransactionVersion } from '@multiversx/sdk-core';
import axios from 'axios';

const GATEWAY_API_URL = 'https://gateway.multiversx.com';

const getNonce = async (account: string) => {
  let nonce = 0;
  try {
    const res = await axios.get(`${GATEWAY_API_URL}/address/${account}/nonce`);
    nonce = res.data.data.nonce;
  } catch (e) {
    console.log(e);
  }
  return nonce;
};

const getTxStatus = async (txHash: string) => {
  try {
    const { data } = await axios.get(`https://gateway.multiversx.com/transaction/${txHash}/status`);
    if (!data.data) return 'not found';
    return data.data.status;
  } catch (e) {
    console.log(e);
  }
  return 'Error';
};

const MultiversXWallet: React.FC = () => {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState<ExtensionProvider>();
  const [tx, setTx] = useState('');
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState('');
  
  const connect = async () => {
    const provider = ExtensionProvider.getInstance();
    await provider.init();
    await provider.login();
    const address = await provider.getAddress();
    setAccount(address);
    setProvider(provider);
  };

  const disconnect = async () => {
    await provider?.logout();
    const address = await provider?.getAddress();
    setAccount(address || '');
    setProvider(provider);
  };

  const runTx = async () => {
    const txObj = JSON.parse(tx);
    if (Array.isArray(txObj)) {
      await executeTransactions(txObj);
    } else {
      await executeTransaction(txObj);
    }

    const t = setInterval(async () => {
      if (!txHash) return;
      const status = await getTxStatus(txHash);
      setTxStatus(status);
      if (status !== 'pending' && status !== 'not found') {
        clearInterval(t);
      }
    }, 1000);
  };

  const executeTransaction = async (txObj: any) => {
    const nonce = await getNonce(account);

    const t: Transaction = new Transaction({
      nonce: txObj.nonce ?? nonce,
      value: txObj.value,
      receiver: new Address(txObj.to),
      sender: new Address(txObj.from),
      gasLimit: 50000000,
      data: new TransactionPayload(txObj.data),
      chainID: '1',
      version: new TransactionVersion(1),
    });

    const signedTx = await provider?.signTransaction(t);

    const params = {
      nonce: signedTx?.getNonce(),
      value: signedTx?.getValue().toString(),
      receiver: signedTx?.getReceiver().bech32(),
      sender: signedTx?.getSender().bech32(),
      gasPrice: signedTx?.getGasPrice(),
      gasLimit: signedTx?.getGasLimit(),
      data: signedTx?.getData().encoded(),
      signature: signedTx?.getSignature().hex(),
      chainID: signedTx?.getChainID(),
      version: signedTx?.getVersion().valueOf(),
      options: signedTx?.getOptions().valueOf(),
    };

    const { data } = await axios.post(`${GATEWAY_API_URL}/transaction/send`, params);
    const hash = data.data.txHash;

    setTxHash(hash);
  };

  const executeTransactions = async (txObjArr: any[]) => {
    let nonce = await getNonce(account);
    
    let transactions = [];
    for (const txObj of txObjArr) {
      const t: Transaction = new Transaction({
        nonce: txObj.nonce || nonce,
        value: txObj.value,
        receiver: new Address(txObj.to),
        sender: new Address(txObj.from),
        gasPrice: Number(txObj.gas),
        gasLimit: 50000000,
        data: new TransactionPayload(txObj.data),
        chainID: '1',
        version: new TransactionVersion(1),
      });
      nonce++;
      
      transactions.push(t);
    }
    
    const signedTxs = await provider?.signTransactions(transactions);

    if (!signedTxs) return;

    // Send signed transaction
    const paramsArr = [];
    for (const signedTx of signedTxs) {
      const params = {
        nonce: signedTx?.getNonce(),
        value: signedTx?.getValue().toString(),
        receiver: signedTx?.getReceiver().bech32(),
        sender: signedTx?.getSender().bech32(),
        gasPrice: signedTx?.getGasPrice(),
        gasLimit: signedTx?.getGasLimit(),
        data: signedTx?.getData().encoded(),
        signature: signedTx?.getSignature().hex(),
        chainID: signedTx?.getChainID(),
        version: signedTx?.getVersion().valueOf(),
        options: signedTx?.getOptions().valueOf(),
      };
      paramsArr.push(params);
    }

    const { data } = await axios.post(`${GATEWAY_API_URL}/transaction/send-multiple`, paramsArr);
    const hashes = data.data.txsHashes;

    setTxHash(hashes[0] + '\n' + hashes[1]);
  };

  return (
    <div>
			<div className="mt-10">
				<p>MultiversX Wallet (Elrond -&gt; Ethereum)</p>
				<div className="flex gap-4">
					<button
						className="bg-orange-400 px-6 py-4 rounded text-white hover:bg-orange-500 active:bg-orange-600"
						onClick={() => !account ? connect() : disconnect()}
					>
						{!!account ? 'Disconnect MultiversX': 'Connect MultiversX'}
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
        <p>Wallet Status: {!!account ? 'Connected' : 'Disconnected'}</p>
        <p>MultiversX Address: {account}</p>
        <p>Transaction: <a href={`https://explorer.multiversx.com/transactions/${txHash}`} className="text-blue-600" rel="noreferrer" target="_blank">{txHash}</a></p>
        <p>Tx Status: {txStatus}</p>
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
};

export default MultiversXWallet;