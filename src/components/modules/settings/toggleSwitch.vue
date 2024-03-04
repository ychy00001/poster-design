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
    <el-switch :value="modelValue" :disabled="disabled" @change="changeValue" /> 
  </div>
</template>

<script>
// 文本输入组件
const NAME = 'toggle-switch'

export default {
  name: NAME,
  props: {
    label: {
      default: '',
    },
    modelValue: {
      default: false,
    },
    disabled: {
      default: false,
    },
  },
  emits: ['finish'],
  data() {
    return {
      
    }
  },
  computed: {},
  mounted(){
    console.log(this.modelValue)
  },
  methods: {
    changeValue(value) {
      this.$emit('finish', value)
    },
  },
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
    user-select: none;
    padding-left: 0px;
    padding: 7px;
  }
  .input-wrap {
    border-radius: 3px;
    border: 1px solid #e1e1e1;
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
