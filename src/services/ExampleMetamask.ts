import { AllowanceType, type CreateTokenClassParams, type TokenClassKeyBody, type TokenInstanceKeyBody } from '@gala-chain/api';
import { MetamaskConnectClient, PublicKeyApi, TokenApi, WalletUtils } from '@gala-chain/connect';
import { ref } from 'vue';


// const tokenClient = new MetamaskConnectClient(
//     'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/token-contract'
// );
// const publicKeyClient = new MetamaskConnectClient(
//     'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/public-key-contract'
// );

const metamastClient = new MetamaskConnectClient();
// const tokenClient = new TokenApi('https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/token-contract', metamastClient);
const tokenClient = new TokenApi('http://localhost:3001/asset/GalaChainToken', metamastClient);
const publicKeyClient = new PublicKeyApi('http://localhost:3001/asset/PublicKeyContract', metamastClient);
// const appleclient = new MetamaskConnectClient('http://localhost:3001/asset/AppleContract');

export const message = ref('');
export const connectedUser = ref<string | null>(null);
export const createdUser = ref<string | null>(null);

const arbitraryToken: TokenClassKeyBody = {
    additionalKey: 'fakeTokenKey',
    category: 'fakeCategory',
    collection: 'fakeCollection',
    type: 'fakeType',
}

const arbitraryTokenData: CreateTokenClassParams = {
    tokenClass: arbitraryToken,
    description: "this is a description",
    image: "shrek.png",
    name: "Foo",
    symbol: "foo",
    maxSupply: "100000",
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
        const connectionResult = await metamastClient.connect();
        message.value = `Connected! User: ${connectionResult}`;
        connectedUser.value = connectionResult;


        // Listening to account changes
        metamastClient.on('accountChanged', (account: string | null) => {
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

export async function createTokenClass() {
    return tokenClient.CreateTokenClass(
        arbitraryTokenData
    );

}



export function updateTokenClass() {
    return tokenClient.UpdateTokenClass({ ...arbitraryTokenData, description: `Description updated at :${new Date()}` });
}

export function fetchTokenClasses() {
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

export function fetchTokenClassesWithPagination() {
    return tokenClient.FetchTokenClassesWithPagination({
        additionalKey: 'key',
        category: 'category',
        collection: 'colection',
        type: 'type'
    });
}
export function grantAllowance() {
    if (!connectedUser.value) throw new Error(`Before testing this, please generate a new wallet`);
    const user = connectedUser.value;
    return tokenClient.GrantAllowance({
        tokenInstance: { ...arbitraryToken, instance: '0' },
        quantities: [{ quantity: '1', user }],
        allowanceType: AllowanceType.Mint,
        uses: '1000',
    });
}

export function fullAllowanceCheck() {
    return tokenClient.FullAllowanceCheck({
        additionalKey: 'key',
        category: 'category',
        collection: 'colection',
        type: 'type',
    });
}

// export function plantTree(){
//     return appleclient.plant
// }

export function fetchAllowances() {
    if (!connectedUser.value) throw new Error(`Before testing this, please generate a new wallet`);
    const user = connectedUser.value;
    return tokenClient.FetchAllowances({
        grantedTo: user
    });
}

export function deleteAllowances() {
    if (!createdUser.value) throw new Error(`Before testing this, please generate a new wallet`);
    return tokenClient.DeleteAllowances({
        additionalKey: 'key',
        category: 'category',
        collection: 'colection',
        type: 'type',
        grantedTo: convertToGCAddress(createdUser.value)
    });
}


export function refreshAllowances() {
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

export function fetchBalances() {
    const user = connectedUser.value;
    if (!user) {
        throw new Error(`No User!`)
    }
    return tokenClient.FetchBalances({
        owner: user
    });
}

export function fetchBalancesWithTokenMetadata() {
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

export function lockToken() {
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

export function lockTokens() {
    return tokenClient.LockTokens({
        tokenInstances: [{ tokenInstanceKey: arbitraryTokenInstance, quantity: '1' },
        { tokenInstanceKey: arbitraryTokenInstance, quantity: '1' }]
    });
}
export function unlockToken() {
    return tokenClient.UnlockToken({
        quantity: '1' as any,
        tokenInstance: {
            collection: 'GALA',
            category: 'Unit',
            additionalKey: 'none',
            instance: '0',
            type: 'none'
        }
    });
}

export function unlockTokens() {
    return tokenClient.UnlockTokens({
        tokenInstances: [{ tokenInstanceKey: arbitraryTokenInstance, quantity: '1' },
        { tokenInstanceKey: arbitraryTokenInstance, quantity: '1' }]
    });
}

export function burnTokens() {
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

export function fetchBurns() {
    const user = connectedUser.value;
    if (!user) {
        throw new Error(`No User!`)
    }
    return tokenClient.FetchBurns({
        burnedBy: user
    });
}



export function requestMint() {
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

export function highThroughputMint() {
    return tokenClient.HighThroughputMint({
        quantity: '1',
        tokenClass: arbitraryToken
    });
}

export function fetchMintRequests() {
    const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime();

    return tokenClient.FetchMintRequests({
        ...arbitraryToken,
        startTimestamp: oneMonthAgo,
        endTimestamp: new Date().getTime(),
    });
}

export function mintToken() {
    return tokenClient.MintToken({
        ...arbitraryToken,
        quantity: '1',
        tokenClass: arbitraryToken
    });
}


export function mintTokenWithAllowance() {
    return tokenClient.MintToken({
        ...arbitraryToken,
        quantity: '1',
        tokenClass: arbitraryToken
    });
}


export function batchMintToken() {
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


export function releaseToken() {
    return tokenClient.ReleaseToken({
        tokenInstance: arbitraryTokenInstance
    });
}

// export function getProfile() {
//     return publicKeyClient.GetMyProfile() as any;
// }

// Sign a message and recover the public key
export async function registerSelf() {
    // Step 1: Sign the message
    const signature = await metamastClient.getPublicKey();
    console.log("Recovered Public Key:", signature.publicKey);
    console.log("Recovered Address from Public Key:", signature.recoveredAddress);

    const result = await fetch(`http://localhost:3001/registerself/${signature.publicKey}`, { method: 'POST' });
    return result;
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
