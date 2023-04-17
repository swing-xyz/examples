import  { useEffect, useState } from "react";
import ChainContainer, { ChainType } from "./components/Chain";
import InputContainer from "./components/Input";
import TokenContainer, { TokenType } from "./components/Token";
import useAuth from "./hooks/useAuth";
import SwingSDK, { TransferParams } from "@swing.xyz/sdk";
import { ethers } from "ethers";

declare var window: any;

const sdk = new SwingSDK({ 
  projectId: 'basic-sdk-example',
  debug: true
});
sdk.on('TRANSFER', (transfer) => {
  switch (transfer.status) {
    case 'PENDING':
      console.log(`Creating a transaction for the ${transfer.step} step`);
      break;
    case 'CHAIN_SWITCH_REQUIRED':
      // Handle switching chains or alert the user to do it manually
      break;
    case 'ACTION_REQUIRED':
      console.log('Please complete the required action within your connected wallet');
      break;
    case 'CONFIRMING':
      console.log(`Waiting for the transaction from the ${transfer.step} step to complete`);
      break;
    case 'SUCCESS':
      console.log(`Transfer has completed the ${transfer.step} step`);
      break;
    case 'FAILED':
      console.log(`Transfer failed at the ${transfer.step} step:`, transfer.error);
      break;
  }
});

const Home = () => {
  const { account, chainId, connect } = useAuth();
  const [chains, setChains] = useState<ChainType[]>([]);
  const [fromChain, setFromChain] = useState<ChainType>();
  const [toChain, setToChain] = useState<ChainType>();
  const [fromToken, setFromToken] = useState<TokenType>();
  const [toToken, setToToken] = useState<TokenType>();
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    sdk.init().then(() => {
      setChains(sdk.chains);
      setFromChain(sdk.chains[0]);
      setToChain(sdk.chains[0]);
    });
  }, []);

  useEffect(() => {
    if (fromChain) setFromToken(fromChain.tokens && fromChain.tokens[0]);
  }, [fromChain]);

  useEffect(() => {
    if (toChain) setToToken(toChain.tokens && toChain.tokens[0]);
  }, [toChain]);

  const onChangeFromChain = (e: any) => {
    const chain = chains.find((c) => Number(c.chainId) === Number(e.target.value));
    setFromChain(chain);
  };
  const onChangeToChain = (e: any) => {
    const chain = chains.find((c) => Number(c.chainId) === Number(e.target.value));
    setToChain(chain);
  };
  const onChangeFromToken = (e: any) => {
    const token = fromChain?.tokens?.find((t) => t.address === e.target.value);
    setFromToken(token);
  };
  const onChangeToToken = (e: any) => {
    const token = toChain?.tokens?.find((t) => t.address === e.target.value);
    setToToken(token);
  };

  const getButtonName = () => {
    if (!account) return 'Connect Wallet';
    if (Number(fromChain?.chainId) !== Number(chainId)) return `Switch to ${fromChain?.name || 'Ethereum'}`;
    return 'Send';
  };

  const onChangeAmount = (e: any) => {
    setAmount(Number(e.target.value));
  };

  const onClick = async () => {
    if (!account) {
      console.log('Please connect to account');
      return connect();
    }

    if (!fromChain || !toChain || !fromToken || !toToken || !amount) {
      console.log('Please check chain and tokens');
      return;
    }

    if (Number(fromChain?.chainId) !== Number(chainId)) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${fromChain.chainId.toString(16)}` }],
        });
      } catch(e) {
        console.log('Error switching chain:', e);
        // await window.ethereum.request({
        //   method: 'wallet_addEthereumChain',
        //   params: [fromChain],
        // });
      }
      return;
    }

    if (window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await sdk.wallet.connect(provider, 'ethereum');
    } else {
      alert("Provider is not available");
      return;
    }
    
    // console.log('api:', sdk.api); return;

    const transactions = await sdk.wallet.getTransactions(account);

    console.log('Tx list:', transactions);
    // Alert your user to take action on any transactions require a claim
    // for (const tx of transactions) {
    //   if (tx.status === 'Pending Destination Chain' && tx.needClaim) {
    //     // This is only required if the user closes the browser before claiming their tokens during the transfer process
    //     console.log('Claim Tx:', tx);
    //     await sdk.claim(tx);
    //   }
    // }

    const transferParams: TransferParams = {
      fromChain: fromChain.slug as any,
      toChain: toChain.slug as any,
    
      fromToken: fromToken.symbol as any,
      toToken: toToken.symbol as any,
    
      amount: amount.toString(),
    
      fromUserAddress: account,
      toUserAddress: account,
    };

    console.log('Getting quote...');
    const quote = await sdk.getQuote(transferParams);

    console.log('Quote:', quote);
    const transferRoute = quote.routes[0];

    console.log('Sending transfer...', transferRoute);
    await sdk.transfer(transferRoute, transferParams);
  };

  return (
    <div className="mx-auto mt-40 w-128">
      <h1 className="text-2xl font-bold text-white">
        CROSS-CHAIN TRANSFER (DEMO SDK)
      </h1>
      <div className="p-8 mt-4 bg-white border rounded-xl border-slate-300">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col w-1/2 gap-4">
            <p>From</p>
            <ChainContainer data={chains} onChange={onChangeFromChain} value={fromChain} />
            <TokenContainer data={fromChain?.tokens} onChange={onChangeFromToken} value={fromToken} />
          </div>
          <div className="flex flex-col w-1/2 gap-4">
            <p>To</p>
            <ChainContainer data={chains} onChange={onChangeToChain} value={toChain} />
            <TokenContainer data={toChain?.tokens} onChange={onChangeToToken} value={toToken}/>
          </div>
        </div>

        <div className="flex flex-row gap-4 mt-4">
          <div className="flex flex-col justify-center w-1/2 gap-4">
            <p>Amount <span className="p-2 font-bold text-white cursor-pointer bg-stone-400 rounded-xl">Max</span></p>
          </div>
          <div className="flex flex-col w-1/2 gap-4">
            <InputContainer onChange={onChangeAmount} />
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button
            className="w-full px-6 py-4 text-white bg-blue-400 rounded hover:bg-blue-500 active:bg-blue-600"
            onClick={onClick}
          >
            {getButtonName()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
