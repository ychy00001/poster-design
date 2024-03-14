<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-01 11:12:17
 * @Description: 前端出图 - 用于封面
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-09-13 17:36:36
-->
<template>
  <div id="cover-wrap"></div>
</template>

<script lang="ts" setup>
import { useStore } from 'vuex'
import html2canvas from 'html2canvas'
import api from '@/api'
import {uuid} from '@/utils/utils'
import { useSetupMapGetters } from '@/common/hooks/mapGetters'

const store = useStore();

const { dZoom } = useSetupMapGetters(['dZoom'])

async function createCover(cb: any) {
  const nowZoom = dZoom.value
  // 取消选中元素
  store.dispatch('selectWidget', {
    uuid: '-1',
  })
  store.dispatch('updateZoom', 100)
  const opts = {
    useCORS: true, // 跨域图片
    scale: 0.2,
  }
  setTimeout(async () => {
    const clonePage: HTMLElement = document.getElementById('page-design-canvas')?.cloneNode(true) as HTMLElement
    if (!clonePage) return
    clonePage.setAttribute('id', 'clone-page')
    document.body.appendChild(clonePage)
    html2canvas(clonePage, opts).then((canvas: any) => {
      canvas.toBlob(
        async (blobObj: Blob) => {
          // console.log(blobObj)
          // let a = new FileReader();
          // a.readAsDataURL(blobObj);
          // a.onload = function(e){
          //   let getBase64 = e.target.result;
          //   console.log("base64");
          //   console.log(getBase64);
          // }
          const uploadName = uuid(8,16) + ".jpeg"
          // console.log("uploadCoverName: %s", uploadName)
          // 上传至Minio
          const file = new File([blobObj], uploadName, {type: 'image/jpeg'})
          const result = await api.minio.fileUpload(file)
          if(result){
            console.log(result)
            cb(result)
          }else{
            console.log(null)
            cb(null)
          }
        },
        'image/jpeg',
        0.7,
      )
      store.dispatch('updateZoom', nowZoom)
      clonePage.remove()
    })
  }, 10)
}

defineExpose({
  createCover
})
</script>

<style lang="less">
#clone-page {
  position: absolute;
  z-index: 99999;
  left: -99999px;
}
</style>
