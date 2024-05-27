# Cross-chain Swaps using the Swing API in Next.js For Solana

This example is built with:

- [@swing.xyz/sdk](https://developers.swing.xyz/reference/sdk)
- [@thirdweb-dev/react](https://portal.thirdweb.com/react)
- [@thirdweb-dev/sdk](https://portal.thirdweb.com/typescript)
- [@solana/web3.js](https://www.npmjs.com/package/@solana/web3.js)
- [Next.js App Router](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)

## Demo

View the live demo [https://swaps-api-nextjs-solana.vercel.app](https://swaps-api-nextjs-solana.vercel.app/)

## Swing Integration

> The implementation of Swing's [Cross-chain API](https://developers.swing.xyz/reference/api) and [Platform API](https://developers.swing.xyz/reference/api/platform/a2glq2e1w44ad-project-configuration) can be found in [src/components/Swap.tsx](./src/components/Swap.tsx)

This example demonstrates how you can perform a cross-chain transaction between the Solana and Ethereum chains using Swing's Cross-Chain and Platform APIs via Swing's SDK.

In this example, we will be using thirdweb's SDK and `@solana/web3.js` wallet connector to connect to a user's Ethereum and Solana wallets, respectively. We will also demonstrate how to utilize Swing's SDK exported API functions, namely `crossChainAPI` and `platformAPI`, to build out a fully functionaly cross-chain application.

The process/steps for performing a SOL to ETH transaction, and vice versa, are as follows:

- Getting a [quote](https://developers.swing.xyz/reference/api/cross-chain/1169f8cbb6937-request-a-transfer-quote) and selecting the best route
- Sending a [token approval](https://developers.swing.xyz/reference/api/contract-calls/approval) request for ERC20 Tokens. (Optional for SOL > ETH Route)
- Sending a [transaction](https://developers.swing.xyz/reference/api/cross-chain/d83d0d65028dc-send-transfer)

> Although not essential for performing a swap transaction, providing your users with real-time updates on the transaction's status by polling the [status](https://developers.swing.xyz/reference/api/cross-chain/6b61efd1b798a-transfer-status) can significantly enhance the user experience.

## Getting started

To get started with this template, first install the required npm dependencies:

```bash
yarn install
```

Next, launch the development server by running the following command:

```bash
yarn dev --filter=swaps-api-nextjs-solana
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Initializing Swing's SDK

Swing's SDK contains two (2) vital objects that are crucial to our API integration. Namely, the `platformAPI` and the `crossChainAPI` objects. These objects are a wrapper for all of Swing's Cross-Chain and Platform APIs removing the need for developers to make API requests using libraries like `fetch` or `axios`. The SDK handles those API requests from behind the scenes.

We've included all the necessary request and response interfaces in the `src/interfaces` folder to aid development.

Navigating to our `src/services/requests.ts`, let's start by initializing Swing's SDK in our `SwingServiceAPI` class:

```typescript
import { SwingSDK } from "@swing.xyz/sdk";

export class SwingServiceAPI implements ISwingServiceAPI {
  private readonly swingSDK: SwingSDK;

  constructor() {
    this.swingSDK = new SwingSDK({
      projectId: "replug",
      debug: true,
    });
  }
}
```

The `SwingSDK` constructor accepts a `projectId` as a mandatory parameter and a few other optional parameters:

| Property      | Example      | Description                                                      |
| ------------- | ------------ | ---------------------------------------------------------------- |
| `projectId`   | `replug`     | [Swing Platform project identifier](https://platform.swing.xyz/) |
| `debug`       | `true`       | Enable verbose logging                                           |
| `environment` | `production` | Set's SwingAPI to operate either on testnet or mainnet chains    |
| `analytics`   | `false`      | Enable analytics and error reporting                             |

> You can get your `projectId` by signing up to [Swing!](https://platform.swing.xyz/)

## Getting a Quote

To perform a swap between ETH and SOL, we first have to get a quote from Swing's Cross-Chain API.

URL: [https://swap.prod.swing.xyz/v0/transfer/quote](https://swap.prod.swing.xyz/v0/transfer/quote)

**Parameters**:

| Property           | Example                                      | Description                                             |
| ------------------ | -------------------------------------------- | ------------------------------------------------------- |
| `tokenAmount`      | 1000000000000000000                          | Amount of the source token being sent (in wei for ETH). |
| `fromChain`        | `ethereum`                                   | Source Chain slug                                       |
| `fromUserAddress`  | 0x018c15DA1239B84b08283799B89045CD476BBbBb   | Sender's wallet address                                 |
| `fromTokenAddress` | 0x0000000000000000000000000000000000000000   | Source Token Address                                    |
| `tokenSymbol`      | `ETH`                                        | Source Token slug                                       |
| `toTokenAddress`   | `11111111111111111111111111111111`           | Destination Token Address.                              |
| `toTokenSymbol`    | `SOL`                                        | Destination Token slug                                  |
| `toChain`          | `solana`                                     | Destination Chain slug                                  |
| `toUserAddress`    | ELoruRy7quAskANEgC99XBYfEnCcrVGSqnwGETWKZtsU | Receiver's wallet address                               |
| `projectId`        | `replug`                                     | [Your project's ID](https://platform.swing.xyz/)        |

Navigating to our `src/services/requests.ts` file, you will find our method for getting a quote from Swing's Cross-Chain API called `getQuoteRequest()`.

```typescript
async getQuoteRequest(
  queryParams: QuoteQueryParams,
): Promise<QuoteAPIResponse | undefined> {
  try {
    const response = await this.swingSDK.crossChainAPI.GET(
      "/v0/transfer/quote",
      {
        params: {
          query: queryParams,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error;
  }
}
```

The response received from the `getQuoteRequest` endpoint provides us with the `fees` a user will have to pay when performing a transaction, as well as a list of possible `routes` for the user to choose from.

The definition for the `getQuoteRequest` response can be found in `src/interfaces/quote.interface.ts.`

```typescript
export interface QuoteAPIResponse {
  routes: Route[];
  fromToken: Token;
  fromChain: Chain;
  toToken: Token;
  toChain: Chain;
}
```

Each `Route` contains a `gasFee`, `bridgeFee` and the amount of tokens the destination wallet will receive.

Here's an example response that contains the route data:

```json
"routes": [
    {
        "duration": 1,
        "gas": "2770874189563960",
        "quote": {
            "integration": "debridge",
            "type": "swap",
            "bridgeFee": "20867118",
            "bridgeFeeInNativeToken": "1000000000000000",
            "amount": "482153281",
            "decimals": 9,
            "amountUSD": "69.869",
            "bridgeFeeUSD": "3.024",
            "bridgeFeeInNativeTokenUSD": "2.931",
            "fees": [
                {
                    "type": "bridge",
                    "amount": "20867118",
                    "amountUSD": "3.024",
                    "chainSlug": "solana",
                    "tokenSymbol": "SOL",
                    "tokenAddress": "11111111111111111111111111111111",
                    "decimals": 9,
                    "deductedFromSourceToken": true
                },
                {
                    "type": "bridge",
                    "amount": "1000000000000000",
                    "amountUSD": "2.931",
                    "chainSlug": "ethereum",
                    "tokenSymbol": "ETH",
                    "tokenAddress": "0x0000000000000000000000000000000000000000",
                    "decimals": 18,
                    "deductedFromSourceToken": false
                },
                {
                    "type": "gas",
                    "amount": "2770874189563960",
                    "amountUSD": "8.123",
                    "chainSlug": "ethereum",
                    "tokenSymbol": "ETH",
                    "tokenAddress": "0x0000000000000000000000000000000000000000",
                    "decimals": 18,
                    "deductedFromSourceToken": false
                },
                {
                    "type": "partner",
                    "amount": "0",
                    "amountUSD": "0",
                    "chainSlug": "ethereum",
                    "tokenSymbol": "ETH",
                    "tokenAddress": "0x0000000000000000000000000000000000000000",
                    "decimals": 18,
                    "deductedFromSourceToken": true
                }
            ]
        },
        "route": [
            {
                "bridge": "debridge",
                "bridgeTokenAddress": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                "steps": [
                    "allowance",
                    "approve",
                    "send"
                ],
                "name": "USDC",
                "part": 100
            }
        ],
        "distribution": {
            "debridge": 1
        },
        "gasUSD": "8.123"
    }
]
```

Navigating to our `src/components/Swap.tsx` file, you'll find our `defaultTransferParams` object which will store the default transaction config for our example:

```typescript
const defaultTransferParams: TransferParams = {
  tokenAmount: "1",
  fromChain: "ethereum",
  tokenSymbol: "ETH",
  fromUserAddress: "",
  fromTokenAddress: "0x0000000000000000000000000000000000000000",
  fromNativeTokenSymbol: "ETH",
  fromTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/eth.png",
  fromChainIconUrl:
    "https://raw.githubusercontent.com/polkaswitch/assets/master/blockchains/ethereum/info/logo.png",
  fromChainDecimal: 18,
  toTokenAddress: "11111111111111111111111111111111",
  toTokenSymbol: "SOL",
  toNativeTokenSymbol: "SOL",
  toChain: "solana",
  toTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/SVG/sol.svg",
  toChainIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/SVG/sol.svg",
  toUserAddress: "", //solana wallet address
  toChainDecimal: 9,
};
```

## Sending a Token Approval Request for ERC20 Tokens (Optional for SOL > ETH Route)

If you're attempting to bridge an ERC20 token from a user's wallet to Solana, you need to prompt the user to approve the required amount of tokens to be bridged.

Navigating to our `src/components/Swap.tsx` file, inside our `startTransfer()` method, you will find our implementation of the `getAllowanceRequest()` and `getApprovalTxDataRequest()` methods. Before approving, you have to perform two checks:

- First, we will check if we're performing a native currency swap by comparing the values of `tokenSymbol` and `fromNativeTokenSymbol` on the source chain. If we're not dealing with a native currency swap, we then proceed to ask for an allowance.
- Next, we will check if an allowance has already been made by Swing on a user's wallet by calling the `getAllowanceRequest()` method. If no approved allowance is found, we will then proceed to make an approval request by calling the `getApprovalTxDataRequest()` method.

Since the `/approval` and `/approve` endpoints are specific to EVM chains, we have to check that source chain via `fromChain` is anything but `solana`. Skipping this check will result in the `/approval` endpoint returning an error to the user:

```json
{
  "statusCode": 400,
  "message": "Non-evm is not supported for approval method: solana",
  "error": "Bad Request"
}
```

Let's execute these steps:

```typescript
if (
  transferParams.tokenSymbol !== transferParams.fromNativeTokenSymbol &&
  transferParams.fromChain !== "solana"
) {
  const checkAllowance = await getAllowanceRequest({
    bridge: transferRoute.quote.integration,
    fromAddress: transferParams.fromUserAddress,
    fromChain: transferParams.fromChain,
    tokenAddress: transferParams.fromTokenAddress,
    tokenSymbol: transferParams.tokenSymbol,
    toChain: transferParams.toChain,
    toTokenAddress: transferParams.toTokenAddress!,
    toTokenSymbol: transferParams.toTokenSymbol!,
    contractCall: false,
  });

  if (checkAllowance.allowance === tokenAmount) {
    setTransStatus({
      status: `Wallet Interaction Required: Approval Token`,
    });

    const getApprovalTxData = await getApprovalTxDataRequest({
      tokenAmount: Number(tokenAmount),
      bridge: transferRoute.quote.integration,
      fromAddress: transferParams.fromUserAddress,
      fromChain: transferParams.fromChain,
      tokenAddress: transferParams.fromTokenAddress,
      tokenSymbol: transferParams.tokenSymbol,
      toChain: transferParams.toChain,
      toTokenAddress: transferParams.toTokenAddress!,
      toTokenSymbol: transferParams.toTokenSymbol!,
      contractCall: false,
    });

    const txData: TransactionDetails = {
      data: getApprovalTxData.tx[0].data,
      from: getApprovalTxData.tx[0].from,
      to: getApprovalTxData.tx[0].to,
    };

    const txResponse = await signer?.sendTransaction(txData);

    const receipt = await txResponse?.wait();
    console.log("Transaction receipt:", receipt);

    setTransStatus({ status: "Token allowance approved" });
  }
}
```

## Sending a Transaction

After getting a quote, you'll next have to send a transaction to Swing's Cross-Chain API.

The steps for sending a transaction are as followed:

- First, we will make a request to [`https://swap.prod.swing.xyz/v0/transfer/send`](https://developers.swing.xyz/reference/api/cross-chain/d83d0d65028dc-send-transfer)
- Using the `txData` returned from the `/send` request, sign the transaction by using a user's wallet

### Making a `/send` Request

Navigating to our `src/services/requests.ts`, you'll find our request implemenation for the `/send` endpoint:

```typescript
async sendTransactionRequest(
  payload: SendTransactionPayload,
): Promise<SendTransactionApiResponse | undefined> {
  try {
    const response = await this.swingSDK.crossChainAPI.POST(
      "/v0/transfer/send",
      {
        body: payload,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
}
```

The `SendTransactionPayload` body payload contains the `source chain`, `destination chain`, `tokenAmount`, and the desired `route`.

URL: [https://swap.prod.swing.xyz/v0/transfer/send](https://swap.prod.swing.xyz/v0/transfer/send)

**Parameters**:

| Key                | Example                                          | Description                                             |
| ------------------ | ------------------------------------------------ | ------------------------------------------------------- |
| `fromChain`        | ethereum                                         | The blockchain where the transaction originates.        |
| `fromTokenAddress` | 0x0000000000000000000000000000000000000000       | Source Token Address                                    |
| `fromUserAddress`  | 0x018c15DA1239B84b08283799B89045CD476BBbBb       | Sender's wallet address                                 |
| `tokenSymbol`      | ETH                                              | Source Token slug                                       |
| `toTokenAddress`   | 11111111111111111111111111111111                 | Destination Token Address.                              |
| `toChain`          | solana                                           | Destination Source slug                                 |
| `toTokenAmount`    | 4000000                                          | Amount of the destination token being received.         |
| `toTokenSymbol`    | SOL                                              | Destination Chain slug                                  |
| `toUserAddress`    | ELoruRy7quAskANEgC99XBYfEnCcrVGSqnwGETWKZtsU     | Receiver's wallet address                               |
| `tokenAmount`      | 1000000000000000000                              | Amount of the source token being sent (in wei for ETH). |
| `type`             | swap                                             | Type of transaction.                                    |
| `projectId`        | `replug`                                         | [Your project's ID](https://platform.swing.xyz/)        |
| `route`            | see `Route` in`src/interfaces/send.interface.ts` | Selected Route                                          |

Since performing a swap will change the state of a user's wallet, the next step of this transaction must be done via a `Smart Contract` Transaction and not via Swing's Cross-Chain API. The response received from the `sendTransactionRequest` endpoint provides us with the necessary `txData/callData` needed to be passed on to a user's wallet to sign the transaction.

The `txData` from the `sendTransactionRequest` will look something like this:

```json
{
   ....
    "tx": {
        "from": "0x018c15DA1239B84b08283799B89045CD476BBbBb",
        "to": "0x39E3e49C99834C9573c9FC7Ff5A4B226cD7B0E63",
        "data": "0x301a3720000000000000000000000000eeeeeeeeeeee........",
        "value": "0x0e35fa931a0000",
        "gas": "0x06a02f"
    }
   ....
}

```

To demonstrate, we first make a request by calling the `sendTransactionRequest` method.

```typescript
// src/components/Swaps.tsx

const transfer = await sendTransactionRequest({
  fromChain: transferParams.fromChain,
  fromTokenAddress: transferParams.fromTokenAddress,
  fromUserAddress: transferParams.fromUserAddress,
  tokenSymbol: transferParams.tokenSymbol,

  toTokenAddress: transferParams.toTokenAddress!,
  toChain: transferParams.toChain,
  toTokenAmount: transferRoute.quote.amount,
  toTokenSymbol: transferParams.toTokenSymbol!,
  toUserAddress: transferParams.toUserAddress!,

  tokenAmount: convertEthToWei(
    transferParams.tokenAmount,
    transferParams.fromChainDecimal,
  ),
  route: transferRoute.route,
  type: "swap",
});
```

Next, we'll extract the `txData`:

```typescript
// src/components/Swaps.tsx

let txData: any = {
  data: transfer.tx.data,
  from: transfer.tx.from,
  to: transfer.tx.to,
  value: transfer.tx.value,
  gasLimit: transfer.tx.gas,
};
```

Using our wallet provider, we will send a transaction to the user's wallet.

```typescript
// src/components/Swaps.tsx

const txResponse = await signer?.sendTransaction(txData); // <- `txResponse` contains the `txHash` of our transaction. You will need this later for getting a transaction's status.

const receipt = await txResponse?.wait();

console.log("Transaction receipt:", receipt);
```

The definition for the `sendTransactionRequest` response can be found in `src/interfaces/send.interface.ts.`

```typescript
export interface SendTransactionApiResponse {
  id: number;
  fromToken: Token;
  toToken: Token;
  fromChain: Chain;
  toChain: Chain;
  route: Route[];
  tx: TransactionDetails;
}
```

> The `sendTransactionRequest` will return and `id` whilst the `txResponse` will contain a `txHash` which we will need later for checking the status of a transaction.

### Sending a Solana Transaction to the Network

If you decided to perform a cross chain swap with Solana as the source chain, you'll need to sign the transaction using a wallet provider that supports Solana like [Phantom](https://phantom.app/).

> Remember, you'll have to call the `/send` endpoint via `sendTransactionRequest` before signing the transaction.

We will sign the `txData` returned from the `/send` endpoint using the `@solana/web3.js` library. To begin, let's include the necessary imports into our app:

```typescript
import { Transaction, VersionedTransaction } from "@solana/web3.js";
```

For our next steps, we will read the raw transaction data by decoding the value of the `data` property in our `txData`:

```typescript
const rawTx = Uint8Array.from(Buffer.from(txData.data as any, "hex"));
```

Next, we will create a transaction object by deserializing the raw transaction data. If it fails as a regular transaction, we attempt to deserialize it as a [Versioned Transaction](https://solana.com/docs/advanced/versions):

```typescript
let transaction: Transaction | VersionedTransaction;
try {
  // Attempt to deserialize the transaction as a regular transaction
  transaction = Transaction.from(rawTx);
} catch (error) {
  // If the transaction is not a regular transaction, attempt to deserialize it as a versioned transaction
  transaction = VersionedTransaction.deserialize(rawTx);
}
```

Next, we will proceed to sign and send the transaction over to the network.

```typescript
try {
  // Attempt to deserialize the transaction as a regular transaction
  transaction = Transaction.from(rawTx);
} catch (error) {
  // If the transaction is not a regular transaction, attempt to deserialize it as a versioned transaction
  transaction = VersionedTransaction.deserialize(rawTx);
}

const response = await window.solana?.signAndSendTransaction(transaction);
```

## Polling Transaction Status

After sending a transaction over to the network, for the sake of user experience, it's best to poll the transaction status endpoint by periodically checking to see if the transaction is complete. This will let the user using your dapp know in realtime, the status of the current transaction.

Navigating to our `src/services/requests.ts` file, you will find our method for getting a transaction status called `getTransationStatus()`.

```typescript
async getTransationStatusRequest(
  queryParams: TransactionStatusParams,
): Promise<TransactionStatusAPIResponse | undefined> {
  try {
    const response = await this.swingSDK.platformAPI.GET(
      "/projects/{projectId}/transactions/{transactionId}",
      {
        params: {
          path: {
            transactionId: queryParams.id,
            projectId,
          },
          query: {
            txHash: queryParams.txHash,
          },
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    throw error;
  }
}
```

The `TransactionStatusParams` params contains the three properties, namely: `id`, `txHash` and `projectId`

URL: [https://platform.swing.xyz/api/v1/projects/{projectId}/transactions/{transactionId}](https://developers.swing.xyz/reference/api/platform/ehwqfo1kv00ce-get-transaction)

**Parameters**:

| Key         | Example                             | Description                                      |
| ----------- | ----------------------------------- | ------------------------------------------------ |
| `id`        | 239750                              | Transaction ID from `/send` response             |
| `txHash`    | 0x3b2a04e2d16489bcbbb10960a248..... | The transaction hash identifier.                 |
| `projectId` | `replug`                            | [Your project's ID](https://platform.swing.xyz/) |

To poll the `/status` endpoint, we'll be using `setTimeout()` to to retry `getTransationStatus()` over a period of time. We will define a function, `pollTransactionStatus()`, which will recursively call `getTransStatus()` until the transaction is completed.

```typescript
// src/components/Swaps.tsx

async function getTransStatus(transId: string, txHash: string) {
  const transactionStatus = await swingServiceAPI?.getTransationStatusRequest({
    id: transId,
    txHash,
  });

  setTransStatus(transactionStatus);

  return transactionStatus;
}

async function pollTransactionStatus(transId: string, txHash: string) {
  const transactionStatus = await getTransStatus(transId, txHash);

  if (transactionStatus?.status! === "Pending") {
    setTimeout(
      () => pollTransactionStatus(transId, txHash),
      transactionPollingDuration,
    );
  } else {
    if (transactionStatus?.status === "Success") {
      toast({
        title: "Transaction Successful",
        description: `Bridge Successful`,
      });
    } else if (transactionStatus?.status === "Failed") {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: transStatus?.errorReason,
      });
    }

    setTransferRoute(null);
    setIsTransacting(false);
    (sendInputRef.current as HTMLInputElement).value = "";
  }
}
```

In our `startTransfer()` method, we will execute the `pollTransactionStatus()` right after our transaction is sent over the network

```typescript
// src/components/Swaps.tsx

let txHash = "";

if (transferParams.fromChain === "solana") {
  const hash = await sendSolTrans({
    ...txData,
    from: transferParams.fromUserAddress,
  });
  txHash = hash!;
} else {
  const txResponse = await signer?.sendTransaction({
    data: txData.data,
    from: txData.from,
    to: txData.to,
    value: txData.value,
    gasLimit: txData.gasLimit,
  });
  // Wait for the transaction to be mined

  const receipt = await txResponse?.wait();
  console.log("Transaction receipt:", receipt);
  txHash = txResponse?.hash!;
}

pollTransactionStatus(transfer?.id.toString()!, txHash);
```

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.
