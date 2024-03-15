/*
 * @Author: ShawnPhang
 * @Date: 2021-08-27 14:42:15
 * @Description: AI相关接口
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-10-13 00:07:19
 */
import cw_fetch from '@/utils/cw_axios'

// 上传接口
export const file_upload = (file: File, cb: Function) => {
  const formData = new FormData()
  formData.append('file', file)
  const extra = {
    responseType: 'blob',
    onUploadProgress: (progress: any) => {
      cb(Math.floor((progress.loaded / progress.total) * 100), 0)
    },
    onDownloadProgress: (progress: any) => {
      cb(100, Math.floor((progress.loaded / progress.total) * 100))
    },
  }
  return cw_fetch('/poster/upload', formData, 'post', {}, extra)
}

// 生成海报
export const poster_generate = (params: Type.Object = {}) => cw_fetch('/poster/generate', params, 'post')

// 获取模版
export const page = (params: Type.Object = {}) => cw_fetch('/poster/page', params, 'get')

// 获取海报
export const get = (params: Type.Object = {}) => cw_fetch('/poster/get', params, 'get')

// 保存海报
export const update = (params: Type.Object = {}) => cw_fetch('/poster/update', params, 'put')
