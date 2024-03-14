<!--
 * @Author: ShawnPhang
 * @Date: 2022-03-25 15:19:02
 * @Description: 版权声明
 * @LastEditors: ShawnPhang <site: book.palxp.com>
 * @LastEditTime: 2023-08-08 10:09:59
-->
<template>
  <tool-tip title="注意" :width="340" :content="content">
    <div>
      <slot />
    </div>
  </tool-tip>
</template>

<script lang="ts" setup>
import toolTip from '@/components/common/PopoverTip.vue'

const content = '海报渲染时间较长，请耐心等待！'
</script>

<style lang="less" scoped>
.text {
  color: #33383e;
  font-size: 14px;
}
</style>
