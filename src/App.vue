<script setup lang="ts">
import { ref } from 'vue'
// import { FetchBalancesDto, TokenClassKey, type CreateTokenClassDto } from '@jonathan-testing/api'
import {
  FetchBalancesDto,
  FetchBalancesWithPaginationDto,
  TokenClassKey,
  type CreateTokenClassDto
} from '@gala-chain/api'
import { RouterLink, RouterView } from 'vue-router'
import { GalachainConnectClient, TokenClient } from '@gala-chain/connect'

const isConnected = ref(false)
const message = ref('')

const client = new GalachainConnectClient(
  'https://int-galachain-gateway-chain-platform-stage-chain-platform-eks.stage.galachain.com/api/asset/token-contract'
)
const tokenClient = new TokenClient(client)

const tokenClassKey = new TokenClassKey()
tokenClassKey.additionalKey = 'foo'
tokenClassKey.category = 'foo2'
tokenClassKey.collection = 'foo3'
tokenClassKey.type = 'foo4'

async function connectToMetaMask() {
  try {
    const connectionResult = await client.connectToMetaMask()
    isConnected.value = true
    message.value = `Connected! User: ${connectionResult}`
  } catch (error) {
    message.value = 'Failed to connect!'
    console.error(error)
  }
}

async function mintToken() {
  if (!isConnected.value) {
    message.value = 'Please connect to MetaMask first.'
    return
  }

  try {
    // const test = await tokenClient.FetchBalances({
    //   name: 'foo',
    //   description: 'test',
    //   image: 'foo.png',
    //   tokenClass: tokenClassKey,
    //   symbol: ''
    // } as any)
    // message.value = `Token minted successfully! ${test}`
    // const foo = { category: 'UNIT', collection: '' } as any as FetchBalancesDto
    // const signed = (await client.provider?.getSigner())?.signMessage(JSON.stringify(foo))
    // console.log(`Signed: ${signed}`)
    const test = await tokenClient.MintTokenWithAllowance({})
    // message.value = `Token minted successfully! ${test}`
  } catch (error) {
    message.value = 'Failed to mint the token!'
    console.error(error)
  }
}
</script>

<template>
  <div>
    <button @click="connectToMetaMask">Connect to MetaMask</button>
    <button @click="mintToken" :disabled="!isConnected">Mint Token</button>
    <p>{{ message }}</p>
    <RouterView />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
