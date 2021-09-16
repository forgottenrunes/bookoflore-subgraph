import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  BookOfLore,
  LoreAdded,
  LoreStruck,
  LoreUpdated
} from "../generated/BookOfLore/BookOfLore";
import { Lore, LoreToken } from "../generated/schema";

// Currently, Graph only lets us sort by one field, so we build this key for an
// easy sort
function getLoreKey(
  tokenContract: Address,
  tokenId: BigInt,
  loreIndex: BigInt
): string {
  return (
    tokenContract.toHexString() + "-" + tokenId.toString().padStart(10, "0") + "-" + loreIndex.toString().padStart(10, "0")
  );
}

function getLoreTokenKey(tokenContract: Address, tokenId: BigInt): string {
  return tokenContract.toHexString() + "-" + tokenId.toString().padStart(10, "0");
}

export function handleLoreAdded(event: LoreAdded): void {
  let params = event.params;
  let tokenContract = params.tokenContract;
  let tokenId = params.tokenId;
  let loreIdx = params.loreIdx;

  let loreKey = getLoreKey(tokenContract, tokenId, loreIdx);

  let lore = new Lore(loreKey);

  let loreToken = new LoreToken(getLoreTokenKey(tokenContract, tokenId));
  loreToken.tokenContract = tokenContract;
  loreToken.tokenId = tokenId;
  loreToken.save();
  lore.loreToken = loreToken.id;

  lore.tokenContract = tokenContract;
  lore.tokenId = tokenId;
  lore.index = loreIdx;

  let contract = BookOfLore.bind(event.address);
  let loreFromContract = contract.loreAt(
    tokenContract,
    tokenId,
    loreIdx,
    loreIdx
  )[0];

  lore.loreMetadataURI = loreFromContract.loreMetadataURI;
  lore.creator = loreFromContract.creator;
  lore.nsfw = loreFromContract.nsfw;
  lore.parentLoreId = loreFromContract.parentLoreId;
  lore.struck = loreFromContract.struck;

  lore.txHash = event.transaction.hash.toHex();
  lore.createdAtTimestamp = event.block.timestamp;
  lore.createdAtBlock = event.block.number;

  lore.save();
}

export function handleLoreUpdated(event: LoreUpdated): void {
  let loreKey = getLoreKey(
    event.params.tokenContract,
    event.params.tokenId,
    event.params.loreIdx
  );

  let lore = new Lore(loreKey);

  let contract = BookOfLore.bind(event.address);
  let loreFromContract = contract.loreAt(
    event.params.tokenContract,
    event.params.tokenId,
    event.params.loreIdx,
    event.params.loreIdx
  )[0];

  // Only metadata and nsfw are updateable
  lore.loreMetadataURI = loreFromContract.loreMetadataURI;
  lore.nsfw = loreFromContract.nsfw;

  lore.save();
}

export function handleLoreStruck(event: LoreStruck): void {
  let loreKey = getLoreKey(
    event.params.tokenContract,
    event.params.tokenId,
    event.params.loreIdx
  );

  let lore = new Lore(loreKey);

  lore.struck = true;
  lore.save();
}
