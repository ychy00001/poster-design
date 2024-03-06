/*
 * @Author: ShawnPhang
 * @Date: 2021-08-27 14:42:15
 * @Description: AI相关接口
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-10-13 00:07:19
 */
import cw_fetch from '@/utils/cw_axios'
import axios from 'axios'
import {uuid} from '@/utils/utils'

const upload_axios = axios.create({})

upload_axios.defaults.timeout = 30000

// 上传接口  uploadName : xxx/xxx.png
export const fileUpload = async (file: File, cb?: Function) => {
  const uploadName = uuid(8,16)+"_"+file.name
  const preSignedResult = await genPreSignedURL({
    objectName: uploadName
  })
  if(!preSignedResult.code){
    const preSignedUrl = preSignedResult.preSignedUrl
    const imgUrl = preSignedResult.imgUrl
    
    const remoteFilePromise = await fileUploadWithPresigned(preSignedUrl,file, cb)
    return Promise.resolve(imgUrl);
  }
  return null
}

// 根据预签名文件上传
export const fileUploadWithPresigned = (presignedUrl: string, file: File, cb?:Function) => {
  const extra = {
    responseType: 'blob',
    onUploadProgress: (progress: any) => {
      if(cb){
        cb(Math.floor((progress.loaded / progress.total) * 100), 0)
      }
    },
    onDownloadProgress: (progress: any) => {
      if(cb){
        cb(100, Math.floor((progress.loaded / progress.total) * 100))
      }
    },
  }
  if(cb){
    return cw_fetch(presignedUrl, file, 'put', {
      "Content-Type": "image/jpeg",
    }, extra)
  }else{
    return cw_fetch(presignedUrl, file, 'put', {
      "Content-Type": "image/jpeg",
    })
  }
}

// export const fileUploadWithPresigned = (presignedUrl: string, file: File) => {
//   return axios.put(presignedUrl, file, {
//     headers: {
//       "Content-Type": "image/jpeg",
//     }
//   });
// }

// 获取预签名上传路径
export const genPreSignedURL = (params: Type.Object = {}) => cw_fetch('/minio/presignedUrl', params, 'get')
