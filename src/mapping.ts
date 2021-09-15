import {Address, BigInt} from "@graphprotocol/graph-ts";
import {
    BookOfLore,
    LoreAdded,
    LoreStruck,
    LoreUpdated,
} from "../generated/BookOfLore/BookOfLore";
import {Lore, Wizard} from "../generated/schema";

function getLoreKey(tokenContract: Address, tokenId: BigInt, loreIndex: BigInt):string {
    let keyPrefix = 'unknown';

    if (isWizardContract(tokenContract)) {
        keyPrefix = 'wizards';
    }

    return keyPrefix + "-" + tokenId.toString().padStart(5, "0") + "-" + loreIndex.toString().padStart(4, "0");
}

function isWizardContract(contractAddress:Address):boolean {
    return contractAddress == Address.fromString('0x521f9c7505005cfa19a8e5786a9c3c9c9f5e6f42');
}

export function handleLoreAdded(event: LoreAdded): void {
    let loreKey = getLoreKey(event.params.tokenContract, event.params.tokenId, event.params.loreIdx);

    let lore = new Lore(loreKey);

    if (isWizardContract(event.params.tokenContract)) {
        let wizard = new Wizard(event.params.tokenId.toString());
        wizard.save();
        lore.wizard = wizard.id;
    }

    lore.tokenContract = event.params.tokenContract;
    lore.tokenId = event.params.tokenId;
    lore.index = event.params.loreIdx;

    let contract = BookOfLore.bind(event.address)
    let loreFromContract = contract.loreAt(event.params.tokenContract, event.params.tokenId, event.params.loreIdx, event.params.loreIdx)[0];

    lore.loreMetadataURI = loreFromContract.loreMetadataURI;
    lore.creator = loreFromContract.creator;
    lore.nsfw = loreFromContract.nsfw;
    lore.parentLoreId = loreFromContract.parentLoreId;
    lore.struck = loreFromContract.struck;

    lore.txHash = event.transaction.hash.toHex();
    lore.createdAtTimestamp = event.block.timestamp;
    lore.createdAtBlock = event.block.number;

    lore.save()
}

export function handleLoreUpdated(event: LoreUpdated): void {
    let loreKey = getLoreKey(event.params.tokenContract, event.params.tokenId, event.params.loreIdx);

    let lore = new Lore(loreKey);

    let contract = BookOfLore.bind(event.address)
    let loreFromContract = contract.loreAt(event.params.tokenContract, event.params.tokenId, event.params.loreIdx, event.params.loreIdx)[0];

    // Only metadata and nsfw are updateable
    lore.loreMetadataURI = loreFromContract.loreMetadataURI;
    lore.nsfw = loreFromContract.nsfw;

    lore.save()
}

export function handleLoreStruck(event: LoreStruck): void {
    let loreKey = getLoreKey(event.params.tokenContract, event.params.tokenId, event.params.loreIdx);

    let lore = new Lore(loreKey);

    lore.struck = true;
    lore.save()
}
