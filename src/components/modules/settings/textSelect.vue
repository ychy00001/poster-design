<!--
 * @Author: ShawnPhang
 * @Date: 2022-03-30 15:18:12
 * @Description:  
 * @LastEditors: Rain
 * @LastEditTime: 2024-03-04 16:21:29
-->
<template>
  <div class="text-input">
    <p v-if="label" class="input-label">{{ label }}</p>
    <div :class="{ 'input-wrap': true}">
      <el-select
        v-model="innerValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @change="changeValue"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

type TProps = {
  options: any
  label?: string
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}
type TEmits = {
  (event: 'finish', data: string): void
}

const emit = defineEmits<TEmits>()
const props = withDefaults(defineProps<TProps>(), {
  options: [],
  label: '',
  modelValue: '',
  placeholder: '',
  disabled: false,
})

const innerValue = computed(() => {
  return props.modelValue
})

function changeValue(value) {
  emit('finish', value)
}
</script>

<style lang="less" scoped>
.text-input {
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  font-size: 12px;
  line-height: 12px;
  width: 100%;
  .input-label {
    padding-right: 14px;
    line-height: 28px;
    font-size: 14px;
    color: #9da3ac;
  }
  .input-wrap {
    border-radius: 3px;
    // border: 1px solid #e1e1e1;
    flex: 1;
    padding: 5px;
    .real-input {
      border-radius: 3px;
      border: 0px;
      outline: none;
      width: 100%;
    }
    .real-input.disable {
      color: #666666;
      cursor: not-allowed;
    }
  }
  .input-wrap.active {
    border: 1px solid rgba(59, 116, 241, 0.7);
    box-shadow: 1px 1px 5px 2px rgba(59, 116, 241, 0.1);
  }
}
</style>
