<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { type Row } from './helpers/utils';
import { GalaChainResponse } from '@gala-chain/api';
import {
  burnTokens,
  connectToMetaMask,
  createTokenClass,
  fetchTokenClasses,
  fetchTokenClassesWithPagination,
  fetchBalances,
  initialize,
  isConnected,
  lockToken,
  updateTokenClass,
  generateWallet,
  createdUser,
  grantAllowance,
  refreshAllowances,
  fullAllowanceCheck,
  fetchAllowances,
  deleteAllowances,
  requestMint,
  highThroughputMint,
  fetchMintRequests,
  mintToken,
  mintTokenWithAllowance,
  batchMintToken,
  lockTokens,
  unlockToken,
  unlockTokens,
  getProfile,
  registerUser,
  registerEthUser
} from './services/ExampleMetamask';

const message = ref('');

// const client = new GalachainClient(
//   'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/token-contract'
// );

//TODO: Use public key contract and methods
// const client2 = new GalachainConnectClient(
//   'https://galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/public-key-contract'
// );

initialize();

async function wrapAndCallMethod(
  method: (message: Ref<string>) => Promise<GalaChainResponse<any> | string>,
  message: Ref<string>
) {
  if (!isConnected) {
    message.value = 'Please connect to MetaMask first.';
    return;
  }
  const result = await method(message);
  if (typeof result === 'object') {
    if (result.Status === 1) {
      message.value = `Success! ${JSON.stringify(result.Data)}`;
    } else {
      message.value = `Error. Code: ${result.ErrorCode}, ${result.Message}`;
    }
  }

  return;
}
const rows = ref<Row[]>([
  {
    title: 'Token Class Methods',
    buttons: [
      {
        name: 'Create Token Class',
        methodToCall: () => wrapAndCallMethod(createTokenClass, message)
      },
      {
        name: 'Update Token Class',
        methodToCall: () => wrapAndCallMethod(updateTokenClass, message)
      },
      {
        name: 'Fetch Token Classes',
        methodToCall: () => wrapAndCallMethod(fetchTokenClasses, message)
      },
      {
        name: 'Fetch Token Classes (Paginated)',
        methodToCall: () => wrapAndCallMethod(fetchTokenClassesWithPagination, message)
      }
    ]
  },
  {
    title: 'Token Management',
    buttons: [
      {
        name: 'Get Balances',
        methodToCall: () => wrapAndCallMethod(fetchBalances, message)
      },
      {
        name: 'Burn Token',
        methodToCall: () => wrapAndCallMethod(burnTokens, message)
      },
      {
        name: 'Request Mint',
        methodToCall: () => wrapAndCallMethod(requestMint, message)
      },
      {
        name: 'Mint Token',
        methodToCall: () => wrapAndCallMethod(mintToken, message)
      },
      {
        name: 'Mint Token With Allowance',
        methodToCall: () => wrapAndCallMethod(mintTokenWithAllowance, message)
      },
      {
        name: 'Batch Mint Token',
        methodToCall: () => wrapAndCallMethod(batchMintToken, message)
      },
      {
        name: 'High Throughput Mint',
        methodToCall: () => wrapAndCallMethod(highThroughputMint, message)
      },
      {
        name: 'Fetch Mint Requests',
        methodToCall: () => wrapAndCallMethod(fetchMintRequests, message)
      }
      // {
      //   name: 'Transfer Token',
      //   methodToCall: () => wrapAndCallMethod(tra, message)
      // }
    ]
  },
  {
    title: 'Lock/Unlock Tokens',
    buttons: [
      {
        name: 'Lock Token',
        methodToCall: () => wrapAndCallMethod(lockToken, message)
      },
      {
        name: 'Lock Tokens',
        methodToCall: () => wrapAndCallMethod(lockTokens, message)
      },
      {
        name: 'Unlock Token',
        methodToCall: () => wrapAndCallMethod(unlockToken, message)
      },
      {
        name: 'Unlock Tokens',
        methodToCall: () => wrapAndCallMethod(unlockTokens, message)
      }
    ]
  },
  {
    title: 'Allowance Methods',
    buttons: [
      {
        name: 'Full Allowance Check',
        methodToCall: () => wrapAndCallMethod(fullAllowanceCheck, message)
      }
    ]
  },
  {
    title: 'Allowance Methods Requiring Other Wallet',
    guard: 'newWalletCreated',
    buttons: [
      {
        name: 'Grant Allowance',
        methodToCall: () => wrapAndCallMethod(grantAllowance, message)
      },
      {
        name: 'Refresh Allowance',
        methodToCall: () => wrapAndCallMethod(refreshAllowances, message)
      },
      {
        name: 'Full Allowance Check',
        methodToCall: () => wrapAndCallMethod(fullAllowanceCheck, message)
      },
      {
        name: 'Fetch Allowances',
        methodToCall: () => wrapAndCallMethod(fetchAllowances, message)
      },
      {
        name: 'Delete Allowances',
        methodToCall: () => wrapAndCallMethod(deleteAllowances, message)
      },
      {
        name: 'Fetch Allowances',
        methodToCall: () => wrapAndCallMethod(fetchAllowances, message)
      },
      {
        name: 'Delete Allowances',
        methodToCall: () => wrapAndCallMethod(deleteAllowances, message)
      }
    ]
  },
  {
    title: 'Public Key Methods',
    buttons: [
      { name: 'Get Profile', methodToCall: () => wrapAndCallMethod(getProfile, message) },
      { name: 'Register User', methodToCall: () => wrapAndCallMethod(registerUser, message) },
      { name: 'Register Eth User', methodToCall: () => wrapAndCallMethod(registerEthUser, message) }
    ]
  }
]);

const getError = (rowInfo: Row) => {
  if (rowInfo.guard) {
    switch (rowInfo.guard) {
      case 'newWalletCreated':
        if (!createdUser.value) {
          return 'Please create a new wallet before using this row.';
        }
    }
  }
  return false;
};
</script>

<template>
  <button @click="connectToMetaMask" v-if="!isConnected()">Connect to MetaMask</button>
  <button @click="generateWallet" v-if="!!isConnected()">Generate Wallet</button>
  <p v-if="createdUser">Generated Wallet Address: {{ createdUser }}</p>
  <div class="container">
    <div v-for="(row, rowIndex) in rows" :key="rowIndex" class="row-item">
      <h3>{{ row.title }}</h3>
      <p v-if="!!getError(row)" class="tooltip">{{ getError(row) }}</p>
      <div class="item">
        <div v-for="(button, buttonIndex) in row.buttons" :key="buttonIndex">
          <button
            class="btn"
            @click="button.methodToCall"
            :disabled="!isConnected() || !!getError(row)"
          >
            {{ button.name }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="message">{{ message }}</div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 40px;
}

.row-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
}

.btn:hover {
  background-color: #ddd;
}

h3 {
  margin: 0;
  font-size: 1.2em;
  font-weight: bold;
}
</style>
