import { useState } from "react";
import { AccountData } from "@cosmjs/launchpad";
import { Keplr } from "@keplr-wallet/types";
import { SigningStargateClient } from "@cosmjs/stargate";
import { Coin } from "cosmjs-types/cosmos/base/v1beta1/coin";
import { IBC_CHAINS } from "../utils/constants";
import { sendOsmosisTx } from "../utils";

require("dotenv");

declare const window: Window &
  typeof globalThis & {
    keplr: any;
    ethereum: any;
  };

const activeChain = IBC_CHAINS.osmosis;

const KeplrWallet = () => {
  const [tx, setTx] = useState("");
  const [txHash, setTxHash] = useState("");
  const [balance, setBalance] = useState("");
  const [wallet, setWallet] = useState<Keplr>();
  const [keplrAccount, setKeplrAccount] = useState<AccountData>();

  const connect = async () => {
    const keplr = window.keplr;
    if (!keplr) {
      alert("Please install keplr extension");
      return;
    }

    keplr.enable(activeChain.chainId);
    setWallet(keplr);

    const offlineSigner = await keplr.getOfflineSignerAuto(activeChain.chainId);
    const [account] = await offlineSigner.getAccounts();
    setKeplrAccount(account);
  };

  const disconnect = async () => {};

  const getBalance = async () => {
    if (!wallet) {
      alert("Please install keplr extension");
      return;
    }
    if (!keplrAccount) {
      alert("Please connect Keplr wallet");
      return;
    }

    const offlineSigner = await wallet.getOfflineSignerAuto(
      activeChain.chainId
    );

    const client = await SigningStargateClient.connectWithSigner(
      activeChain.rpcEndpoint,
      offlineSigner
    );

    const coinInfo = await client.getBalance(
      keplrAccount.address,
      activeChain.testToken
    );
    console.log("Balance:", keplrAccount.address, "evmos", coinInfo);
    setBalance(coinInfo.amount);
  };

  const runKeplrTx = async () => {
    if (!wallet) {
      alert("Please install keplr extension");
      return;
    }
    if (!keplrAccount) {
      alert("Please connect Keplr wallet");
      return;
    }

    const offlineSigner = await wallet.getOfflineSignerAuto(
      activeChain.chainId
    );

    const client = await SigningStargateClient.connectWithSigner(
      activeChain.rpcEndpoint,
      offlineSigner
    );

    // IBC transfer
    try {
      const txObj = JSON.parse(tx || '{}');
      const recipient = txObj.to;
      const meta = txObj.meta;

      const {
        sourcePort,
        sourceChannel,
        timeoutTimestamp,
        fee,
        memo,
      } = meta || {};

      if (activeChain.chainId === "cosmoshub-4") {
        const res = await client.sendIbcTokens(
          keplrAccount.address,
          recipient,
          Coin.fromPartial(meta.token),
          sourcePort,
          sourceChannel,
          undefined,
          timeoutTimestamp,
          fee,
          memo
        );
        setTxHash(res.transactionHash);
        console.log("Sent comos successfully", res);
      } else if (activeChain.chainId === "osmosis-1") {
        const res = await sendOsmosisTx(wallet, tx);
        setTxHash(res.transactionHash);
        console.log("Sent osmosis successfully", res);
      }
    } catch (e) {
      console.log("Tx running error:", e);
    }
  };

  return (
    <div>
      <div className="mt-10">
        <p>Keplr Wallet ({activeChain.chainId} -&gt; Evm Chains)</p>
        <div className="flex gap-4">
          <button
            className="bg-orange-400 px-6 py-4 rounded text-white hover:bg-orange-500 active:bg-orange-600"
            onClick={() => (!!wallet ? disconnect() : connect())}
          >
            {!!wallet ? "Disconnect Keplr" : "Connect Keplr"}
          </button>
          <button
            className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
            onClick={() => runKeplrTx()}
          >
            Run Transaction
          </button>
          <button
            className="bg-blue-400 px-6 py-4 rounded text-white hover:bg-blue-500 active:bg-blue-600"
            onClick={() => getBalance()}
          >
            Get Balance
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <p>
          Keplr Status: {!!keplrAccount?.address ? "Connected" : "Disconnected"}
        </p>
        <p>Keplr Network: {activeChain.chainId ?? ""}</p>
        <p>Keplr Address: {keplrAccount?.address}</p>
        <p>Returned TxHash: {txHash ?? ""}</p>
        <p>
          Balance: {balance}/{activeChain.testToken}
        </p>
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

export default KeplrWallet;
