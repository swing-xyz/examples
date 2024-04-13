# Cross-chain Swaps using the Swing API in Next.js

This example is built with:

- [@thirdweb-dev/react](https://portal.thirdweb.com/react)
- [@thirdweb-dev/sdk](https://portal.thirdweb.com/typescript)
- [Next.js App Router](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)

## Demo

View the live demo https://swaps-api-nextjs-thirdweb-bitcoin.vercel.app/

## Swing Integration

> The implementation of Swing's [Cross-chain API](https://developers.swing.xyz/reference/api) can be found in [src/components/Swap.tsx](./src/components/Swap.tsx).

This example demonstrates how you can perform a cross-chain transaction between the Bitcoin and Ethereum chains.

In this example, we will be using thirdweb's SDK to connect to a user's wallet. The process/steps for performing a BTC to ETH transaction and vice versa, is as follows:

- Getting a [quote](https://developers.swing.xyz/reference/api/cross-chain/1169f8cbb6937-request-a-transfer-quote) and selecting the best route
- Sending a [transaction](https://developers.swing.xyz/reference/api/cross-chain/d83d0d65028dc-send-transfer)
- Poll transaction [status](https://developers.swing.xyz/reference/api/cross-chain/6b61efd1b798a-transfer-status)

## Getting started

To get started with this template, first install the npm dependencies:

```bash
yarn install
```

Next, run the development server:

```bash
yarn dev --filter=swaps-api-nextjs-thirdweb-bitcoin
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Getting a Quote

To perform a swap between ETH and BTC, we first have to get a quote from Swing's Cross-Chain API.

URL: https://swap.prod.swing.xyz/v0/transfer/quote

**Parameters**:

| Property           | Example                                    | Description                                             |
| ------------------ | ------------------------------------------ | ------------------------------------------------------- |
| `tokenAmount`      | 1000000000000000000                        | Amount of the source token being sent (in wei for ETH). |
| `fromChain`        | `ethereum`                                 | Source Chain slug                                       |
| `fromUserAddress`  | 0x018c15DA1239B84b08283799B89045CD476BBbBb | Sender's wallet address                                 |
| `fromTokenAddress` | 0x0000000000000000000000000000000000000000 | Source Token Address                                    |
| `tokenSymbol`      | `ETH`                                      | Source Token slug                                       |
| `toTokenAddress`   | `btc`                                      | Destination Token Address.                              |
| `toTokenSymbol`    | `BTC`                                      | Destination Token slug                                  |
| `toChain`          | `bitcoin`                                  | Destination Chain slug                                  |
| `toUserAddress`    | bc1qeegt8mserjpwmaylfmprfswcx6twa4psusas8x | Receiver's wallet address                               |
| `projectId`        | `replug`                                   | Your project's ID                                       |

Navigating to our `src/services/requests.ts` file, you will find our method for getting a qoute from Swing's Cross-Chain API called `getQuoteRequest()`.

```typescript
export const getQuoteRequest = async (
  queryParams: QuoteQueryParams,
): Promise<QuoteAPIResponse> => {
  try {
    const response = await axios.get<QuoteAPIResponse>(
      `${baseUrl}/transfer/quote`,
      { params: { ...queryParams, projectId } },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error;
  }
};
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

Navigating to our `src/components/Swap.tsx` file, you'll find.

Here's an example response that contains the route data:

```json
"routes": [
        {
            "duration": 1,
            "gas": "19865251299204366",
            "quote": {
                "integration": "dodo",
                "type": "swap",
                "bridgeFee": "908",
                "bridgeFeeInNativeToken": "0",
                "amount": "908326",
                "decimals": 6,
                "amountUSD": "0.908",
                "bridgeFeeUSD": "0.0009080",
                "bridgeFeeInNativeTokenUSD": "0",
                "fees": [
                    {
                        "type": "bridge",
                        "amount": "908",
                        "amountUSD": "0.0009080",
                        "chainSlug": "polygon",
                        "tokenSymbol": "USDC",
                        "tokenAddress": "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
                        "decimals": 6,
                        "deductedFromSourceToken": true
                    },
                    {
                        "type": "gas",
                        "amount": "19865251299204366",
                        "amountUSD": "0.01802",
                        "chainSlug": "polygon",
                        "tokenSymbol": "MATIC",
                        "tokenAddress": "0x0000000000000000000000000000000000000000",
                        "decimals": 18,
                        "deductedFromSourceToken": false
                    }
                ]
            },
            "route": [
                {
                    "bridge": "dodo",
                    "bridgeTokenAddress": "0x0000000000000000000000000000000000000000",
                    "steps": [
                        "allowance",
                        "approve",
                        "send"
                    ],
                    "name": "MATIC",
                    "part": 100
                }
            ],
            "distribution": {
                "BalancerV2": 1.3333333333333337,
                "DODOV1": 1.3333333333333337,
                "QuickSwap": 1.3333333333333337
            },
            "gasUSD": "0.01802"
        },
        ...
    ],
```

## Sending a Transaction

After getting a quote, you'll next have to send a transaction to Swing's Cross-Chain API.

The steps for sending a transaction are as followed:

- Making a request to [`https://swap.prod.swing.xyz/v0/transfer/send`](https://developers.swing.xyz/reference/api/cross-chain/1169f8cbb6937-request-a-transfer-quote)
- Signing a wallet transaction

### Making a `/send` Request

Navigating to our `src/services/requests.ts`, you'll find our request implemenation of the `/send` endpoint:

```typescript
export const sendTransactionRequest = async (
  payload: SendTransactionPayload,
): Promise<SendTransactionApiResponse> => {
  try {
    const response = await axios.post<SendTransactionApiResponse>(
      `${baseUrl}/transfer/send`,
      { ...payload, projectId },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
};
```

The `SendTransactionPayload` body payload contains the `source chain`, `destination chain`, `tokenAmount`, and the `route` selected by a user.

URL: https://swap.prod.swing.xyz/v0/transfer/send

**Parameters**:

| Key              | Example                                          | Description                                             |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------- |
| `fromChain`        | ethereum                                         | The blockchain where the transaction originates.        |
| `fromTokenAddress` | 0x0000000000000000000000000000000000000000       | Source Token Address                                    |
| `fromUserAddress`  | 0x018c15DA1239B84b08283799B89045CD476BBbBb       | Sender's wallet address                                 |
| `tokenSymbol`      | ETH                                              | Source Token slug                                       |
| `toTokenAddress`   | btc                                              | Destination Token Address.                              |
| `toChain`          | bitcoin                                          | Destination Source slug                                 |
| `toTokenAmount`    | 4376081                                          | Amount of the destination token being received.         |
| `toTokenSymbol`    | BTC                                              | Destination Chain slug                                  |
| `toUserAddress`    | bc1qeegt8mserjpwmaylfmprfswcx6twa4psusas8x       | Receiver's wallet address                               |
| `tokenAmount`      | 1000000000000000000                              | Amount of the source token being sent (in wei for ETH). |
| `type`             | swap                                             | Type of transaction.                                    |
| `projectId`        | replug                                           | Your project's ID                                       |
| `route`            | see `Route` in`src/interfaces/send.interface.ts` | Selected Route                                          |

Since performing a swap will change the state of a user's wallet, the next step of this transaction must be done via Smart Contracts and not via Swing's Cross-Chain API. The response received from the `sendTransactionRequest` endpoint provides us with the necessary `txData/callData` needed to be passed on to a user's wallet to sign the transaction.

The `txData` will look something like this:

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

> The `sendTransactionRequest` will return and `id` whilst the `txResponse` will contain a `txHash` which we will need for checking the status of a transaction.

### Sending a Bitcoin Transaction to the Network

> To perform a swap from a Non-EVM chain like Bitcoin, you'll need to send the transaction using a wallet provider that supports Bitcoin.

If you decided to perform a cross chain swap with Bitcoin as the source chain, you'll need to sign the transaction using a wallet provider that supports Bitcoin like xDEFI.

> Remember, you'll have to call the `/send` endpoint via `sendTransactionRequest` before signing the transaction.

Here's a simple demonstration using xDEFI's Injected SDK:

```typescript
 if (transfer.tx.meta) { //<- For Bitcoin to ETH, the send endpoint will return an object called `meta`

    const { from, recipient, amount, memo } = transfer.tx.meta; // extra txData from `meta` object

    window.xfi?.bitcoin.request( //<- Here, we're prompting a users wallet using xDEFI injected SDK
        {
        method: "transfer",
        params: [
            {
                from,
                recipient,
                amount,
                memo,
            },
        ],
        },
        (error: any, result: any) => {
            console.debug(error, result);
        },
    );

} else {
    console.warn("Please install xDEFI Wallet or any wallet that supports Bitcoin")
}
```

## Polling Transaction Status

After sending a transaction over to the network, for the sake of user experience, it's best to poll the transaction status endpoint by periodically checking to see if the transaction is complete. This will let the user using your dapp know in realtime, the status of the current transaction.

Navigating to our `src/services/requests.ts` file, you will find our method for getting a transaction status called `getTransationStatus()`.

```typescript
export const getTransationStatus = async (
  statusParams: TransactionStatusParams,
): Promise<TransactionStatusAPIResponse> => {
  try {
    const response = await axios.get<TransactionStatusAPIResponse>(
      `${baseUrl}/transfer/status`,
      { params: { ...statusParams, projectId } },
    );

    if (response.status === 404) {
      return { status: "Not Found " };
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction status:", error);

    return { status: "Transaction Failed" };
  }
};
```

The `TransactionStatusParams` params contains the three properties, namely: `id`, `txHash` and `projectId`

| Key       | Example                                                        | Description                              |
|-----------|--------------------------------------------------------------|------------------------------------------|
| `txHash`    | 0x3b2a04e2d16489bcbbb10960a248..... | The transaction hash identifier.         |
| `projectId` | replug                                               | Your project's ID.  |
| `id`        | 239750                                                       | Transaction ID from `/send` response |

To poll the `/status` endpoint, we'll be using `setTimeout()` to to retry `getTransationStatus()` over a period of time. We will define a function, `pollTransactionStatus()`, which will recursively call `getTransStatus()` until the transaction has either failed or become completed. 

```typescript
// src/components/Swaps.tsx

async function getTransStatus(transId: string, txHash: string) {
    const transactionStatus = await getTransationStatus({
        id: transId,
        txHash,
    });

    setTransStatus(transactionStatus);

    return transactionStatus;
}

async function pollTransactionStatus(transId: string, txHash: string) {
    const transactionStatus = await getTransStatus(transId, txHash);

    if (transactionStatus?.status !== "Completed") {
        setTimeout(
        () => pollTransactionStatus(transId, txHash),
        transactionPollingDuration,
        );
    } else if (
        transactionStatus?.status == "Completed" ||
        transactionStatus?.status == "Transaction Failed"
    ) {
        setTransferRoute(null);
    }
}
```

In our `startTransfer()` method, we will execute the `pollTransactionStatus()` right afte our transaction is sent over the network

```typescript
// src/components/Swaps.tsx

setTransStatus({ status: "Wallet Interaction Required" });

const txResponse = await signer?.sendTransaction(txData);

pollTransactionStatus(transfer.id.toString(), txResponse.hash);
```

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.