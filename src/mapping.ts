import {BigInt} from "@graphprotocol/graph-ts";
import {
    BookOfLore,
    LoreAdded,
    LoreStruck,
    LoreUpdated,
} from "../generated/BookOfLore/BookOfLore";
import {Lore, Wizard} from "../generated/schema";

function getLoreKey(wizardId: BigInt, loreIndex: BigInt):string {
    return wizardId.toString().padStart(4, "0") + "-" + loreIndex.toString().padStart(4, "0");
}

export function handleLoreAdded(event: LoreAdded): void {
    let loreKey = getLoreKey(event.params.wizardId, event.params.loreIdx);

    let lore = new Lore(loreKey);
    let wizard = new Wizard(event.params.wizardId.toString());
    wizard.save();

    lore.wizard = wizard.id;
    lore.index = event.params.loreIdx;

    let contract = BookOfLore.bind(event.address)
    let loreFromContract = contract.loreAt(event.params.wizardId, event.params.loreIdx, event.params.loreIdx)[0];

    lore.assetAddress = loreFromContract.assetAddress;
    lore.loreMetadataURI = loreFromContract.loreMetadataURI;
    lore.tokenId = loreFromContract.tokenId;
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
    let loreKey = getLoreKey(event.params.wizardId, event.params.loreIdx);

    let lore = new Lore(loreKey);

    let contract = BookOfLore.bind(event.address)
    let loreFromContract = contract.loreAt(event.params.wizardId, event.params.loreIdx, event.params.loreIdx)[0];

    // Only metadata and nsfw are updateable
    lore.loreMetadataURI = loreFromContract.loreMetadataURI;
    lore.nsfw = loreFromContract.nsfw;

    lore.save()
}

export function handleLoreStruck(event: LoreStruck): void {
    const loreKey = `${event.params.wizardId}-${event.params.loreIdx}`;

    let lore = new Lore(loreKey);

    lore.struck = true;

    lore.save()
}


// export function handleNarrativeAdded(event: NarrativeAdded): void {}
//
// export function handleNarrativeUpdated(event: NarrativeUpdated): void {}
//
// export function handleOwnershipTransferred(event: OwnershipTransferred): void {}
