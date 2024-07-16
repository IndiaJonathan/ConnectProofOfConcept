<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { GalachainConnectClient, TokenClient, WalletUtils } from '@gala-chain/connect';

const isConnected = ref(false);
const message = ref('');
const connectedUser: Ref<string | null> = ref('');

const client = new GalachainConnectClient(
  'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/token-contract'
);

//TODO: Use public key contract and methods
// const client2 = new GalachainConnectClient(
//   'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/public-key-contract'
// );
const tokenClient = new TokenClient(client);

async function connectToMetaMask() {
  try {
    client.on('accountChanged', (account) => {
      console.log(`Account changed, ${account}`);
      message.value = `Account Changed! User: ${account}`;
      connectedUser.value = account;
    });
    const connectionResult = await client.connectToMetaMask();
    isConnected.value = true;
    message.value = `Connected! User: ${connectionResult}`;
    connectedUser.value = connectionResult;
  } catch (error) {
    message.value = 'Failed to connect!';
    console.error(error);
  }
}

async function generateWallet() {
  const wallet = await WalletUtils.createAndRegisterRandomWallet(
    'https://dex-api-platform-dex-stage-gala.gala.com/v1/CreateHeadlessWallet'
  );
  message.value = `Wallet Generated and registered. Address: ${wallet.ethAddress}.\n Private key in console (this is not super secure, please only use this for testing)`;
  console.log(wallet.privateKey);
}

async function getBalances() {
  const user = connectedUser.value;
  if (!isConnected.value || !user) {
    message.value = 'Please connect to MetaMask first.';
    return;
  }

  try {
    let res = await tokenClient.FetchBalances({
      owner: user
    });
    if (res.Data) {
      message.value = JSON.stringify(res.Data);
    } else {
      message.value = `Error fetching balances. ${res.Message}`;
    }
  } catch (error) {
    message.value = 'Failed to get balances!';
    console.error(error);
  }
}

async function transferToken() {
  if (!isConnected.value) {
    message.value = 'Please connect to MetaMask first.';
    return;
  }
  //TODO
}

async function lockToken() {
  if (!isConnected.value) {
    message.value = 'Please connect to MetaMask first.';
    return;
  }

  try {
    let res = await tokenClient.LockToken({
      quantity: '1',
      tokenInstance: {
        collection: 'GALA',
        category: 'Unit',
        additionalKey: 'none',
        instance: '0',
        type: 'none'
      }
    });
    if (res.Status === 1) {
      message.value = `Token locked successfully! ${JSON.stringify(res.Data)}`;
    } else {
      message.value = `Error locking token. Code: ${res.ErrorCode}, ${res.Message}`;
    }
  } catch (error) {
    message.value = 'Failed to lock the token!';
    console.error(error);
  }
}
async function burnToken() {
  if (!isConnected.value) {
    message.value = 'Please connect to MetaMask first.';
    return;
  }

  try {
    //todo: this should default to the selected user, not this
    let test = await tokenClient.BurnTokens({
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
    message.value = `Token locked successfully! ${JSON.stringify(test.Data)}`;
  } catch (error) {
    message.value = 'Failed to lock the token!';
    console.error(error);
  }
}
</script>

<template>
  <div>
    <button @click="connectToMetaMask">Connect to MetaMask</button>
    <button @click="generateWallet">Generate Wallet</button>
    <button @click="getBalances" :disabled="!isConnected">Get Balances</button>
    <button @click="lockToken" :disabled="!isConnected">Lock Token</button>
    <button @click="burnToken" :disabled="!isConnected">Burn Token</button>
    <p>{{ message }}</p>
  </div>
</template>
