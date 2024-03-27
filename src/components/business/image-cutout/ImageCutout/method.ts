/*
 * @Author: Jeremy Yu
 * @Date: 2024-03-03 19:00:00
 * @Description: 裁剪组件公共方法
 * @LastEditors: Jeremy Yu <https://github.com/JeremyYu-cn>
 * @Date: 2024-03-03 19:00:00
 */

import { TCommonUploadCb, TUploadErrorResult } from "@/api/ai"
import { TImageCutoutState } from "./index.vue"
import api from "@/api"
import { getImage } from '@/common/methods/getImgDetail'
import _config from '@/config'
import { Ref } from 'vue'
import { ElMessage as ElMsg } from 'element-plus'

/** 选择图片 */
export const selectImageFile = async (
  state: TImageCutoutState,
  raw: Ref<HTMLElement | null>,
  file: File,
  successCb?: (result: MediaSource, fileName: string) => void,
  uploadCb?: TCommonUploadCb,
) => {
  if (file.size > 1024 * 1024 * 2) {
    alert('上传图片超出限制')
    return false
  }
  if (!raw.value) return
  // 显示选择的图片
  raw.value.addEventListener('load', () => {
    state.offsetWidth = (raw.value as HTMLElement).offsetWidth
  })
  state.rawImage = URL.createObjectURL(file)

  // 返回抠图结果
  const result = await api.poster.segmentation(file, (up: number, dp: number) => {
    uploadCb && uploadCb(up, dp)
    if (dp) {
      state.progressText = dp === 100 ? '' : '导入中..'
      state.progress = dp
    } else {
      state.progressText = up < 100 ? '上传中..' : '正在处理，请稍候..'
      state.progress = up < 100 ? up : 0
    }
  })
  if (typeof result == 'object' && (result as TUploadErrorResult).type !== 'application/json') {
    successCb && successCb(result as MediaSource, file.name)
  } else alert('服务器繁忙，请稍等下重新尝试~')
}

export async function uploadCutPhotoToCloud(cutImage: string) {
  try {
    const response = await fetch(cutImage)
    const buffer = await response.arrayBuffer()
    const file = new File([buffer], `cut_image_${Math.random()}.png`)
    // upload
    const url = await api.minio.fileUpload(file)
    if(url){
      const { width, height } = await getImage(file)
      await api.material_new.create({
        name: '我的抠图',
        type: 2,
        value: url,
        width,
        height
      })
      return url
    }else{
      ElMsg.error('图片上传服务器失败，请删除重试!')
    }
  } catch(e) {
    console.error(`upload cut file error: msg: ${e}`)
    return ''
  }
}
