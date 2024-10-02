import { ethers } from "ethers";

/**
 * Converts ETH to Wei.
 *
 * @param {string | number} ethAmount The amount in ETH to convert.
 * @returns {string} The amount in Wei as a string.
 */
export const convertEthToWei = (ethAmount: string, decimals = 18) => {
  // Convert the amount to a string to handle both string and number inputs
  const weiAmount = ethers.utils.parseUnits(ethAmount.toString(), decimals);
  return weiAmount.toString();
};

export const convertWeiToEth = (weiAmount: string, decimals = 18) => {
  // Convert the amount to a string to handle both string and number inputs
  const ethAmount = ethers.utils.formatUnits(weiAmount.toString(), decimals);
  return Number(ethAmount.toString()).toFixed(2).trim();
};
