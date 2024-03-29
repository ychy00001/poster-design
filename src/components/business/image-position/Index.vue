<!--
 * @Author: ShawnPhang
 * @Date: 2024-03-03 19:00:00
 * @Description: 裁剪组件
 * @LastEditors: ShawnPhang <site: book.palxp.com>, Jeremy Yu <https://github.com/JeremyYu-cn>
 * @Date: 2024-03-03 19:00:00
-->
<template>
  <el-dialog v-model="state.show" title="位置设置" align-center width="70vw" @close="handleClose">
    <div class="content">
      <div v-if="state.fgImage == ''">
        <h3>暂无产品图</h3>
      </div>
      <div v-show="state.fgImage" class="cv-container">
        <!-- 这里放canvas填充背景大小和位置 -->
        <canvas ref="canvasRef" id="position_canvas" class="canvas-transparent-bg"></canvas>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button v-show="state.fgImage" v-loading="state.loading" type="primary" plain @click="setDone"> {{ state.loading ? '设置中..' : '完成设置' }} </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { reactive, nextTick, ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import { fabric } from 'fabric'

export type TImagePositionState = {
    show: boolean;
    fgImage: string;
    left: number;
    top: number;
    width: number;
    height: number;
    bgWidth: number;
    bgHeight: number;
    loading: boolean;
}

const store = useStore()
const state = reactive<TImagePositionState>({
  show: false,
  fgImage: '',
  left: 0,
  top: 0,
  width: 450,
  height: 450,
  bgWidth: 560,
  bgHeight: 560,
  loading: false,
})

const emits = defineEmits<{
  (event: "done", data: Array<number>): void
}>()

let canvas: any = null
let canvasRef: any = null
let fgImgLayer: any = null
let globalRatio = 1

onMounted(() => {
})
const open = (fgImg: string, bgWidth:number, bgHeight:number, position: Array<number>) => {
  state.loading = false
  state.show = true
  store.commit('setShowMoveable', false)
  nextTick(() =>{
    if (fgImg) {
      state.fgImage = fgImg
      state.left = position[0]
      state.top = position[1]
      state.width = position[2]
      state.height = position[3]
      state.bgWidth = bgWidth;
      state.bgHeight = bgHeight;
      initCanvas(bgWidth, bgHeight)
    }
  })
}

const initCanvas = (bgWidth:number, bgHeight:number) =>{
  // 计算缩放比例
  let canvasContainer = document.getElementsByClassName("cv-container")[0]
  let canvasContent = document.getElementsByClassName("content")[0]
  let parentHeightStr = window.getComputedStyle(canvasContainer).height
  let parentWidthStr = window.getComputedStyle(canvasContent).width
  console.log(parentWidthStr)
  // 移除px
  let parentHeight = parseFloat(parentHeightStr.slice(0,-2))
  let parentWidth = parseFloat(parentWidthStr.slice(0,-2))

  let ratioHeight = parentHeight / bgHeight
  let ratioWidth = parentWidth / bgWidth
  console.log(ratioHeight, ratioWidth)
  globalRatio = Math.min(ratioHeight, ratioWidth)
  // globalRatio = ratioHeight
  if(canvas != null){
    canvas.dispose()
  }
  canvas = new fabric.Canvas('position_canvas',{
    width : bgWidth * globalRatio,
    height : bgHeight * globalRatio,
    noScaleCache: true,
    strokeUniform: true,
  })
  // 设置背景大小
  // canvasRef.width = bgWidth
  // canvasRef.height = bgHeight
  fabric.Image.fromURL(state.fgImage, (img: any, err: any) => {
    if(!err) {
      fgImgLayer = img
      console.log(img)
      // 根据设置的宽高 更改缩放比例
      img.set({
        left: state.left * globalRatio, // 左上角位置
        top:  state.top * globalRatio, // 左上角位置
        // width: state.width * globalRatio,
        // height: state.height * globalRatio,
        scaleX: (state.width/img.width) * globalRatio,
        scaleY: (state.height/img.height) * globalRatio,
        crossOrigin: 'anonymous' // 使用的图片跨域时，配置此参数，有时会失效
      })
      canvas.add(img)
    }
  })
}

const setDone = () => {
  // console.log(Math.floor(fgImgLayer.left/globalRatio), 
  //   Math.floor(fgImgLayer.top/globalRatio), 
  //   Math.floor((fgImgLayer.width * fgImgLayer.scaleX )/globalRatio), 
  //   Math.floor((fgImgLayer.height * fgImgLayer.scaleY)/globalRatio))
  emits('done', [
    Math.floor(fgImgLayer.left/globalRatio), 
    Math.floor(fgImgLayer.top/globalRatio), 
    Math.floor((fgImgLayer.width * fgImgLayer.scaleX )/globalRatio), 
    Math.floor((fgImgLayer.height * fgImgLayer.scaleY)/globalRatio)
  ])
  canvas.clear()
  state.show = false
  handleClose()
}

defineExpose({
  open
})

const handleClose = () => {
  store.commit('setShowMoveable', true)
}

</script>

<style lang="less" scoped>
.uploader {
  &__box {
    color: #333333;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
}
.content {
  position: relative;
  display: flex;
  justify-content: center;
  width: 65vw;
  background-color: #F6F7F9;
}
.cv-container {
  position: relative;
  height: 60vh;
  display: flex;
  justify-content: center;
  align-self: center;
  align-items:center
  // overflow: hidden;
}

.canvas-transparent-bg {
  background-color: #f0f0f0;
  background-image: linear-gradient(to top right, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff), linear-gradient(to top right, #fff 25%, transparent 25%, transparent 75%, #fff 75%, #fff);
  background-position: 0 0, 8px 8px;
  background-size: 16px 16px;
}
</style>


