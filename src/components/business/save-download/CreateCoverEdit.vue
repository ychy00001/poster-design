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

<script lang="ts">
import { defineComponent, reactive, toRefs, watch, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { mapGetters, mapActions } from 'vuex'
import html2canvas from 'html2canvas'
import api from '@/api'
import {uuid} from '@/utils/utils'
import { ElMessage as ElMsg } from 'element-plus'

export default defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue'],
  setup(props, context) {
    const { proxy }: any = getCurrentInstance() as ComponentInternalInstance

    async function createCover(cb: any) {
      const nowZoom = proxy?.dZoom
      // 取消选中元素
      proxy?.selectWidget({
        uuid: '-1',
      })
      proxy?.updateZoom(100)
      const opts = {
        useCORS: true, // 跨域图片
        scale: 0.2,
      }
      setTimeout(async () => {
        const clonePage: HTMLElement = document.getElementById('page-design-canvas')?.cloneNode(true)
        clonePage.setAttribute('id', 'clone-page')
        document.body.appendChild(clonePage)
        html2canvas(document.getElementById('clone-page'), opts).then((canvas: any) => {
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
                cb(result)
              }else{
                cb(null)
              }
            },
            'image/jpeg',
            0.7,
          )
          proxy?.updateZoom(nowZoom)
          clonePage.remove()
        })
      }, 100)
    }

    return {
      createCover,
    }
  },
  computed: {
    ...mapGetters(['dZoom']),
  },
  methods: {
    ...mapActions(['selectWidget', 'updateZoom']),
  },
})
</script>

<style lang="less">
#clone-page {
  position: absolute;
  z-index: 99999;
  left: -99999px;
}
</style>
