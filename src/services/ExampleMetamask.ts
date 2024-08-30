import { AllowanceKey, AllowanceType, TokenBalanceWithMetadata, TokenClassKey, type ConstructorArgs, type FetchTokenClassesResponseBody, type GalaChainResponse, type TokenBalanceBody, type TokenBurnBody, type TokenClassBody, type TokenClassKeyBody, type TokenInstanceKeyBody } from '@gala-chain/api';
import { MetamaskConnectClient, GalachainClient, WalletUtils } from '@gala-chain/connect';
import { ref, type Ref } from 'vue';
import type { FetchBalancesWithTokenMetadataBody } from '../../../../sdk/chain-api/lib/src';


const tokenContract = new MetamaskConnectClient(
    'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/token-contract'
);
const publicKeyContract = new MetamaskConnectClient(
    'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/public-key-contract'
);

const tokenClient = new GalachainClient(tokenContract);
const publicKeyClient = new GalachainClient(publicKeyContract);

export const message = ref('');
export const connectedUser = ref<string | null>(null);
export const createdUser = ref<string | null>(null);

const arbitraryToken: TokenClassKeyBody = {
    additionalKey: 'fakeTokenKey',
    category: 'fakeCategory',
    collection: 'fakeCollection',
    type: 'fakeType'
}

const arbitraryTokenInstance: TokenInstanceKeyBody = { ...arbitraryToken, instance: '0' }

function convertToGCAddress(ethAddress: string) {
    return ethAddress.replace("0x", "eth|");
}
export const initialize = async () => {
    console.log("called")
    // connectedUser.value = await client.getAccount();
    console.log("done")

}

export const isConnected = () => {
    return connectedUser.value != null;
};

export async function connectToMetaMask() {
    try {

        const connectionResult = await tokenContract.connect();
        const connectionResult2 = await publicKeyContract.connect();
        message.value = `Connected! User: ${connectionResult}`;
        connectedUser.value = connectionResult;

        // Listening to account changes
        tokenContract.on('accountChanged', (account: string | null) => {
            console.log(`Account changed, ${account}`);
            message.value = `Account Changed! User: ${account}`;
            connectedUser.value = account;
        });
        publicKeyContract.on('accountChanged', (account: string | null) => {
            console.log(`Account changed, ${account}`);
            message.value = `Account Changed! User: ${account}`;
            connectedUser.value = account;
        });
    } catch (error) {
        message.value = 'Failed to connect!';
        console.error(error);
    }
}

export async function generateWallet() {
    try {
        const wallet = await WalletUtils.createAndRegisterRandomWallet(
            'https://dex-api-platform-dex-stage-gala.gala.com/v1/CreateHeadlessWallet'
        );
        message.value = `Wallet Generated and registered. Address: ${wallet.ethAddress}.\n Private key in console (this is not super secure, please only use this for testing)`;
        createdUser.value = wallet.ethAddress;
        console.log(wallet.privateKey);
    } catch (error) {
        message.value = 'Failed to generate wallet!';
        console.error(error);
    }
}

export async function createTokenClass(): Promise<GalaChainResponse<any>> {
    return tokenClient.CreateTokenClass({
        name: 'test',
        description: 'test2',
        image: 'foo.png',
        symbol: 'foo',
        tokenClass: {
            additionalKey: 'key',
            category: 'category',
            collection: 'collection',
            type: 'type',
        },
        maxSupply: '1',
    });

}



export function updateTokenClass(): Promise<GalaChainResponse<any>> {
    return tokenClient.UpdateTokenClass({
        name: 'test',
        description: 'test1234',
        image: 'foo.png',
        symbol: 'foo',
        tokenClass: {
            additionalKey: 'key',
            category: 'category',
            collection: 'colection',
            type: 'type'
        }
    });
}

export function fetchTokenClasses(): Promise<GalaChainResponse<any[]>> {
    return tokenClient.FetchTokenClasses({
        tokenClasses: [
            {
                additionalKey: 'key',
                category: 'category',
                collection: 'colection',
                type: 'type'
            },
            {
                additionalKey: 'key2',
                category: 'category',
                collection: 'colection',
                type: 'type'
            }
        ]
    });
}

export function fetchTokenClassesWithPagination(): Promise<GalaChainResponse<any>> {
    return tokenClient.FetchTokenClassesWithPagination({
        additionalKey: 'key',
        category: 'category',
        collection: 'colection',
        type: 'type'
    });
}
export function grantAllowance(): Promise<GalaChainResponse<any>> {
    if (!createdUser.value) throw new Error(`Before testing this, please generate a new wallet`);
    return tokenClient.GrantAllowance({
        tokenInstance: {
            additionalKey: 'key',
            category: 'category',
            collection: 'colection',
            type: 'type'
        },
        quantities: [{ quantity: '1', user: convertToGCAddress(createdUser.value) }],
        allowanceType: AllowanceType.Mint,
        uses: '1',
    });
}

export function fullAllowanceCheck(): Promise<GalaChainResponse<any>> {
    return tokenClient.FullAllowanceCheck({
        additionalKey: 'key',
        category: 'category',
        collection: 'colection',
        type: 'type'
    });
}

export function fetchAllowances(): Promise<GalaChainResponse<any>> {
    if (!createdUser.value) throw new Error(`Before testing this, please generate a new wallet`);
    return tokenClient.FetchAllowances({
        additionalKey: 'key',
        category: 'category',
        collection: 'colection',
        type: 'type',
        grantedTo: createdUser.value
    });
}

export function deleteAllowances(): Promise<GalaChainResponse<any>> {
    if (!createdUser.value) throw new Error(`Before testing this, please generate a new wallet`);
    return tokenClient.DeleteAllowances({
        additionalKey: 'key',
        category: 'category',
        collection: 'colection',
        type: 'type',
        grantedTo: convertToGCAddress(createdUser.value)
    });
}


export function refreshAllowances(): Promise<GalaChainResponse<any>> {
    if (!createdUser.value) throw new Error(`Before testing this, please generate a new wallet`);
    const user = connectedUser.value;
    if (!user) {
        throw new Error(`No User!`)
    }
    return tokenClient.RefreshAllowances({
        allowanceKey: {
            ...arbitraryToken,
            allowanceType: AllowanceType.Lock,
            grantedTo: createdUser.value,
            instance: '0',
            grantedBy: user,
            created: 0
        },
        uses: '1',
        expires: 111110
    });
}

export function fetchBalances(): Promise<GalaChainResponse<TokenBalanceBody[]>> {
    const user = connectedUser.value;
    if (!user) {
        throw new Error(`No User!`)
    }
    return tokenClient.FetchBalances({
        owner: user
    });
}

export function fetchBalancesWithTokenMetadata(): Promise<GalaChainResponse<FetchBalancesWithTokenMetadataBody>> {
    const user = connectedUser.value;
    if (!user) {
        throw new Error(`No User!`)
    }
    return tokenClient.FetchBalancesWithTokenMetadata({
        owner: user
    });
}

export async function transferToken() {
    if (!createdUser.value) throw new Error(`Before testing this, please generate a new wallet`);

    return tokenClient.TransferToken({
        quantity: '1',
        to: convertToGCAddress(createdUser.value),
        tokenInstance: arbitraryTokenInstance
    })
}

export function lockToken(): Promise<GalaChainResponse<TokenBalanceBody>> {
    return tokenClient.LockToken({
        quantity: '1',
        tokenInstance: {
            collection: 'GALA',
            category: 'Unit',
            additionalKey: 'none',
            instance: '0',
            type: 'none'
        }
    });
}

export function lockTokens(): Promise<GalaChainResponse<any>> {
    return tokenClient.LockTokens({
        tokenInstances: [{ tokenInstanceKey: arbitraryTokenInstance, quantity: '1' },
        { tokenInstanceKey: arbitraryTokenInstance, quantity: '1' }]
    });
}
export function unlockToken(): Promise<GalaChainResponse<any>> {
    return tokenClient.UnlockToken({
        quantity: '1',
        tokenInstance: {
            collection: 'GALA',
            category: 'Unit',
            additionalKey: 'none',
            instance: '0',
            type: 'none'
        }
    });
}

export function unlockTokens(): Promise<GalaChainResponse<any>> {
    return tokenClient.UnlockTokens({
        tokenInstances: [{ tokenInstanceKey: arbitraryTokenInstance, quantity: '1' },
        { tokenInstanceKey: arbitraryTokenInstance, quantity: '1' }]
    });
}

export function burnTokens(): Promise<GalaChainResponse<any>> {
    return tokenClient.BurnTokens({
        tokenInstances: [
            {
                quantity: '1',
                tokenInstanceKey: {
                    collection: 'GALA',
                    category: 'Unit',
                    additionalKey: 'none',
                    instance: '0',
                    type: 'none'
                }
            }
        ]
    });
}

export function fetchBurns(): Promise<GalaChainResponse<any>> {
    const user = connectedUser.value;
    if (!user) {
        throw new Error(`No User!`)
    }
    return tokenClient.FetchBurns({
        burnedBy: user
    });
}



export function requestMint(): Promise<GalaChainResponse<any>> {
    return tokenClient.RequestMint({
        tokenClass: {
            collection: 'GALA',
            category: 'Unit',
            additionalKey: 'none',
            type: 'none'
        },
        quantity: '1',
    });
}


//Used internally, intentionally left blank
// export function fulfillMint(): Promise<GalaChainResponse<any>> {

// }

export function highThroughputMint(): Promise<GalaChainResponse<any>> {
    return tokenClient.HighThroughputMint({
        quantity: '1',
        tokenClass: arbitraryToken
    });
}

export function fetchMintRequests(): Promise<GalaChainResponse<any>> {
    const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime();

    return tokenClient.FetchMintRequests({
        ...arbitraryToken,
        startTimestamp: oneMonthAgo,
        endTimestamp: new Date().getTime(),
    });
}

export function mintToken(): Promise<GalaChainResponse<any>> {
    return tokenClient.MintToken({
        ...arbitraryToken,
        quantity: '1',
        tokenClass: arbitraryToken
    });
}


export function mintTokenWithAllowance(): Promise<GalaChainResponse<any>> {
    return tokenClient.MintToken({
        ...arbitraryToken,
        quantity: '1',
        tokenClass: arbitraryToken
    });
}


export function batchMintToken(): Promise<GalaChainResponse<any>> {
    return tokenClient.BatchMintToken({
        mintDtos: [{
            ...arbitraryToken,
            quantity: '1',
            tokenClass: arbitraryToken
        },
        {
            ...arbitraryToken,
            quantity: '1',
            tokenClass: arbitraryToken
        }]
    });
}


// Unused, intentionally left out
// export function useToken(): Promise<GalaChainResponse<any>> {
//     return tokenClient.UseToken({
//         inUseBy: 'todo',
//         quantity: '1',
//         tokenInstance: arbitraryTokenInstance
//     });
// }


export function releaseToken(): Promise<GalaChainResponse<any>> {
    return tokenClient.ReleaseToken({
        tokenInstance: arbitraryTokenInstance
    });
}

export function getProfile() {
    return publicKeyClient.GetMyProfile() as any;
}

export function registerUser() {
    const wallet = WalletUtils.createRandom();

    return publicKeyClient.RegisterUser({
        publicKey: wallet.publicKey,
        user: `client|${wallet.ethAddress.replace("0x", "")}`
    })
}


export function registerEthUser() {
    const wallet = WalletUtils.createRandom();

    return publicKeyClient.RegisterEthUser({
        publicKey: wallet.publicKey,
        user: wallet.ethAddress
    })
}


//Intentionally Left out for now
// export function updatePublicKey() {
//     return publicKeyClient.UpdatePublicKey({

//     })
// }
