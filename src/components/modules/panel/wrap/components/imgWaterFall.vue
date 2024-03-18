<!--
 * @Author: ShawnPhang
 * @Date: 2021-12-16 16:20:16
 * @Description: 瀑布流组件
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @Date: 2024-03-06 21:16:00
-->
<template>
  <div ref="imgWaterFall" :style="{ height: state.countHeight + 'px' }" class="img-water-fall">
    <!-- backgroundImage: `url(${item.cover})` -->
    <div
      v-for="(item, i) in state.list" :key="i + 'iwf'"
      :style="{ top: item.top + 'px', left: item.left + 'px', width: state.width + 'px', height: item.height + 'px' }"
      class="img-box" @click.stop="selectItem(item, i)"
    >
      <div class="del" @click.stop="delItem(Number(item.id), String(item.title))">
        <i class="iconfont icon-delete-fill"></i>
      </div>
      <edit-model v-if="edit" :options="props.edit" :data="{ item, i }">
        {{ item.isDelect }}
        <div v-if="item.isDelect" class="list__mask">已删除</div>
        <el-image v-if="!item.fail" class="img" :src="item.cover" lazy loading="lazy" @error="loadError(item)" />
        <div v-else class="fail_img">{{ item.title }}</div>
      </edit-model>
      <el-image v-else class="img" :src="item.cover" lazy loading="lazy" @error="loadError(item)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
// const NAME = 'img-water-fall'
import { IGetTempListData } from '@/api/home';
import { reactive, watch } from 'vue'
import {ElMessageBox, ElMessage} from 'element-plus'


type TProps = {
  listData: IGetTempListData[]
  edit?: Record<string, any>
}

type TState = {
  width: number
  countHeight: number
  list: IGetTempListData[]
}

type TEmits = {
  (event: 'select', data: IGetTempListData): void
  (event: 'load'): void
  (event: 'del-item'): void
}

const props = defineProps<TProps>()
const emit = defineEmits<TEmits>()

const state = reactive<TState>({
  width: 146, // 图片的宽度
  list: [],
  countHeight: 0,
})

const columnHeights: number[] = [] // 列的高度
const columnNums = 2 // 总共有多少列
const gap = 7 // 图片之间的间隔

watch(
  () => props.listData,
  () => {
    columnHeights.length = 0
    const widthLimit = state.width * columnNums //  + gap * (columnNums - 1) // 每行宽度
    const cloneList = JSON.parse(JSON.stringify(props.listData))
    for (let i = 0; i < cloneList.length; i++) {
      let index = i % columnNums
      const item = cloneList[i]
      item.height = (item.height / item.width) * state.width // 图片高度
      item.left = index * (widthLimit / columnNums + gap) // 定位
      item.top = columnHeights[index] + gap || 0 // 定位
      // columnHeights[index] = isNaN(columnHeights[index]) ? item.height : item.height + columnHeights[index] + gap // 记录列高度
      // 找出最短边
      if (isNaN(columnHeights[index])) {
        columnHeights[index] = item.height
      } else {
        index = columnHeights.indexOf(Math.min(...columnHeights))
        item.left = index * (widthLimit / columnNums + gap)
        item.top = columnHeights[index] + gap || 0
        columnHeights[index] = item.height + columnHeights[index] + gap
      }
    }
    state.countHeight = Math.max(...columnHeights)
    state.list = cloneList
  },
)

const delItem = (id:number, title:string) => {
  ElMessageBox.confirm(
    '是否删除海报: ' + id + ":" +title + "?",
    'Warning',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      emit('del-item', id)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
}
const load = () => {
  emit('load')
}
const selectItem = (value: IGetTempListData, index: number) => {
  emit('select', value)
}
const loadError = (item: IGetTempListData) => {
  item.fail = true
}

defineExpose({
  load,
  selectItem,
  loadError,
})
</script>

<style lang="less" scoped>
.fail_img {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
}
.img-water-fall {
  position: relative;
  margin-left: 14px;
  .img-box {
    position: absolute !important;
    cursor: pointer;
    position: relative;
    background-size: cover;
    border-radius: 5px;
    border: 1px solid #e0e5ea;
    overflow: hidden;
    margin: 0 auto;
    .img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  .img-box:hover::before {
    content: ' ';
    background: rgba(0, 0, 0, 0.3);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
  }
}
.list {
  &__mask {
    position: absolute;
    z-index: 2;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.del {
  display:none;
  position: absolute;
  z-index: 3;
  bottom: 10px;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgb(219, 228, 228);
  font-weight: 100;
  font-size: 0.3rem;
}
.img-box:hover .del{
  display:block !important;
}
.del .iconfont {
  z-index: 3;
  font-size: 30px;
  transition: all 0.2s ease-in;
}

/* 鼠标移入悬浮效果 */
.del .iconfont:hover{    
  font-size: 33px;
  color:rgb(89, 196, 196);
  // -webkit-box-shadow: 0 0 30px rgba(0,0,0,0.1);
  // box-shadow: 0 0 30px rgba(0,0,0,0.15);
  -webkit-transform: translate3d(0, 0px, -2px);
  transform: translate3d(0, 1px, -2px);    
}
</style>
