<script setup lang="ts">
import { ref } from 'vue';
import { type Row } from '../helpers/utils';
import { isConnected, createdUser } from '../services/ExampleMetamask';

const rows = ref<Row[]>([]);

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
