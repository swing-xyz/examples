# Gasless Cross-chain Swaps using the Swing API in Next.js

This example demonstrates how to perform **gasless cross-chain transactions** using Swing's API, built with:

- [@thirdweb-dev/react](https://portal.thirdweb.com/react)
- [@thirdweb-dev/sdk](https://portal.thirdweb.com/typescript)
- [Next.js App Router](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)

## Demo

View the live demo [https://swaps-api-nextjs-evm-gasless.vercel.app](https://swaps-api-nextjs-evm-gasless.vercel.app/)

## Gasless Transactions Overview

Gasless transactions allow users to perform cross-chain swaps without paying gas fees upfront. Instead of sending a traditional transaction, users sign an [EIP-712](https://eips.ethereum.org/EIPS/eip-712) typed data message that gets executed on their behalf.

For more detailed information about gasless transactions, visit the [Swing Gasless Transactions Documentation](https://docs-git-feat-gasless-trans-update-swing-xyz.vercel.app/gasless-transactions).

### Key Benefits:

- No upfront gas fees for users
- Enhanced user experience
- Seamless cross-chain swaps
- EIP-712 signature-based execution

## Swing Integration

> The implementation of Swing's [Cross-chain API](https://developers.swing.xyz/reference/api) for gasless transactions can be found in [src/components/Swap.tsx](./src/components/Swap.tsx).

This example demonstrates how you can perform gasless cross-chain transactions between different chains. The process for performing a gasless transaction includes:

- Getting a [gasless quote](https://developers.swing.xyz/reference/api/cross-chain/1169f8cbb6937-request-a-transfer-quote) with `mode: "gasless"`
- Checking token allowance (if needed)
- Approving token spending (if needed)
- Sending a [gasless transaction](https://developers.swing.xyz/reference/api/cross-chain/d83d0d65028dc-send-transfer) with EIP-712 signature

> For gasless transactions, real-time updates via the [status](https://developers.swing.xyz/reference/api/cross-chain/6b61efd1b798a-transfer-status) endpoint are essential for tracking transaction progress.

## Getting started

To get started with this template, first install the required npm dependencies:

```bash
yarn install
```

Next, launch the development server by running the following command:

```bash
yarn dev --filter=swaps-api-nextjs-evm-gasless
```

Finally, open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Getting a Gasless Quote

To perform a gasless swap, we first need to get a gasless quote from Swing's Cross-Chain API by including the **`mode: "gasless"`** parameter.

URL: [https://swap.prod.swing.xyz/v0/transfer/quote](https://swap.prod.swing.xyz/v0/transfer/quote)

**Parameters**:

| Property           | Example                                      | Description                                             |
| ------------------ | -------------------------------------------- | ------------------------------------------------------- |
| `tokenAmount`      | 1000000000000000000                          | Amount of the source token being sent (in wei for ETH). |
| `fromChain`        | `base`                                       | Source Chain slug                                       |
| `fromUserAddress`  | 0x018c15DA1239B84b08283799B89045CD476BBbBb   | Sender's wallet address                                 |
| `fromTokenAddress` | 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913   | Source Token Address                                    |
| `tokenSymbol`      | `USDC`                                       | Source Token slug                                       |
| `toTokenAddress`   | `0x3c499c542cef5e3811e1192ce70d8cc03d5c3359` | Destination Token Address                               |
| `toTokenSymbol`    | `USDC`                                       | Destination Token slug                                  |
| `toChain`          | `polygon`                                    | Destination Chain slug                                  |
| `toUserAddress`    | 0x018c15DA1239B84b08283799B89045CD476BBbBb   | Receiver's wallet address                               |
| `mode`             | `gasless`                                    | **Required for gasless transactions**                   |
| `projectId`        | `replug`                                     | [Your project's ID](https://platform.swing.xyz/)        |

Navigating to our `src/services/requests.ts` file, you will find our method for getting a gasless quote called `getQuoteRequest()`:

```typescript
export const getQuoteRequest = async (
  queryParams: QuoteQueryParams,
): Promise<QuoteAPIResponse> => {
  try {
    const response = await axios.get<QuoteAPIResponse>(
      `${baseUrl}/transfer/quote`,
      { params: { ...queryParams, projectId, mode: "gasless", debug: true } },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching quote:", error);
    throw error;
  }
};
```

The response provides gasless-compatible routes with fee structures optimized for signature-based execution.

## Allowance and Approval (ERC-20 Tokens)

For ERC-20 tokens, you may need to check and approve token spending before executing the gasless transaction.

### Check Allowance

URL: [https://swap.prod.swing.xyz/v0/transfer/allowance](https://swap.prod.swing.xyz/v0/transfer/allowance)

```typescript
export const getAllowanceRequest = async (
  queryParams: AllowanceQueryParams,
): Promise<AllowanceAPIResponse> => {
  try {
    const response = await axios.get<AllowanceAPIResponse>(
      `${baseUrl}/transfer/allowance`,
      { params: { ...queryParams, projectId } },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching allowance:", error);
    throw error;
  }
};
```

### Get Approval Transaction

URL: [https://swap.prod.swing.xyz/v0/transfer/approve](https://swap.prod.swing.xyz/v0/transfer/approve)

```typescript
export const getApproveRequest = async (
  queryParams: ApproveQueryParams,
): Promise<ApproveAPIResponse> => {
  try {
    const response = await axios.get<ApproveAPIResponse>(
      `${baseUrl}/transfer/approve`,
      { params: { ...queryParams, projectId } },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching approve transaction:", error);
    throw error;
  }
};
```

## Sending a Gasless Transaction

After getting a gasless quote and handling approvals, you'll send a gasless transaction to Swing's API.

### Making a `/send` Request for Gasless

The `/send` endpoint for gasless transactions returns EIP-712 typed data instead of regular transaction data:

```typescript
export const sendTransactionRequest = async (
  payload: SendTransactionPayload,
): Promise<SendTransactionApiResponse> => {
  try {
    const response = await axios.post<SendTransactionApiResponse>(
      `${baseUrl}/transfer/send`,
      { ...payload, projectId, mode: "gasless" },
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

### EIP-712 Signature Flow

For gasless transactions, instead of sending a regular transaction, you sign EIP-712 typed data:

```typescript
// src/components/Swap.tsx

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
  tokenAmount: tokenAmount,
  route: transferRoute.route,
  type: "swap",
});

if (transfer?.tx.meta) {
  // For gasless transactions, extract EIP-712 data from meta
  const tx = JSON.stringify(transfer.tx);
  const txInfo = JSON.parse(tx);
  const txObj = txInfo.meta;

  const JAM_DOMAIN = txObj.domain;
  const JAM_ORDER_TYPES = txObj.types;
  const toSign = txObj.value;

  const types = {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    ...JAM_ORDER_TYPES,
  };

  const message = toSign;
  const msgParams = JSON.stringify({
    domain: JAM_DOMAIN,
    primaryType: Object.keys(JAM_ORDER_TYPES)[0],
    message,
    types,
  });

  // Sign the EIP-712 typed data
  const account = (window as any).ethereum.selectedAddress;
  const signature = await(window as any).ethereum.request({
    method: "eth_signTypedData_v4",
    params: [account, msgParams],
  });

  console.log("EIP-712 Signature:", signature);

  // Poll transaction status with the signature
  pollTransactionStatus(transfer.id.toString(), signature);
}
```

## Complete Gasless Transaction Flow

Here's the complete flow for a gasless transaction:

```typescript
async function startTransfer() {
  // 1. Switch to correct chain
  const chainIdMap = {
    polygon: "0x89",
    base: "0x2105",
  };

  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: chainIdMap[transferParams.fromChain] }],
  });

  // 2. Check allowance (for ERC-20 tokens)
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

  // 3. Approve if needed
  if (Number(checkAllowance?.allowance || "0") <= 0) {
    const getApprovalTxData = await getApproveRequest({
      tokenAmount: tokenAmount,
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

    const txData = {
      data: getApprovalTxData?.tx?.at(0)?.data!,
      from: getApprovalTxData?.tx?.at(0)?.from!,
      to: getApprovalTxData?.tx?.at(0)?.to!,
    };

    const txResponse = await signer?.sendTransaction(txData);
    await txResponse?.wait();
  }

  // 4. Execute gasless transaction with EIP-712 signature
  const transfer = await sendTransactionRequest({
    // ... transaction parameters
    mode: "gasless",
  });

  // 5. Sign EIP-712 typed data (as shown above)
  // 6. Poll for transaction status
}
```

## API Restrictions for Gasless Transactions

When using gasless transactions, be aware of the following API restrictions:

- **Mode Parameter**: Always include `mode: "gasless"` in quote and send requests
- **EIP-712 Signatures**: Only EIP-712 signatures are supported, not regular transactions
- **Chain Support**: Gasless transactions are available on supported EVM chains
- **Token Approvals**: Standard ERC-20 approvals may still be required before gasless execution

## Polling Transaction Status

After signing the EIP-712 typed data, poll the transaction status using the signature:

```typescript
async function pollTransactionStatus(transId: string, signature: string) {
  const transactionStatus = await getTransationStatus({
    id: transId,
    txHash: signature, // Use signature as txHash for gasless transactions
  });

  setTransStatus(transactionStatus);

  if (pendingStatuses.includes(transactionStatus?.status)) {
    setTimeout(
      () => pollTransactionStatus(transId, signature),
      transactionPollingDuration,
    );
  } else {
    setTransferRoute(null);
    toast({
      title: "Transaction Successful",
      description: "Gasless bridge completed successfully",
    });
  }
}
```

## Default Configuration

Here's the default configuration for Base → Polygon USDC gasless transfers:

```typescript
const defaultTransferParams: TranferParams = {
  tokenAmount: "1",
  fromChain: "base",
  fromUserAddress: "0xE1e0992Be9902E92460AC0Ff625Dcc1c485FCF6b",
  fromTokenAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  fromTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/usdc.png",
  fromChainDecimal: 6,
  tokenSymbol: "USDC",
  toTokenAddress: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
  toTokenSymbol: "USDC",
  toChain: "polygon",
  toTokenIconUrl:
    "https://raw.githubusercontent.com/Pymmdrza/Cryptocurrency_Logos/mainx/PNG/usdc.png",
  toUserAddress: "0xE1e0992Be9902E92460AC0Ff625Dcc1c485FCF6b",
  toChainDecimal: 6,
};
```

## Customizing

You can start editing this template by modifying the files in the `/src` folder. The site will auto-update as you edit these files.

For more information about gasless transactions and advanced configuration, visit the [Swing Gasless Documentation](https://docs-git-feat-gasless-trans-update-swing-xyz.vercel.app/gasless-transactions).
