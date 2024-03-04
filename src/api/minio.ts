/*
 * @Author: ShawnPhang
 * @Date: 2021-08-27 14:42:15
 * @Description: AI相关接口
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-10-13 00:07:19
 */
import cw_fetch from '@/utils/cw_axios'
import axios from 'axios'

const upload_axios = axios.create({})

upload_axios.defaults.timeout = 30000

// 上传接口  uploadName : xxx/xxx.png
export const fileUpload = (file: File, uploadName: string) => {
  console.log(file)
  const PreSignedPromise = genPreSignedURL({
    objectName: uploadName
  })
  PreSignedPromise.then((result:any)=>{
    console.log(result)
    const preSignedUrl = result.preSignedUrl
    const imgUrl = result.imgUrl
    const remoteFilePromise = fileUploadWithPresigned(preSignedUrl,file)
    remoteFilePromise.then((remoteObj:any)=>{
      return imgUrl;
    })
  })
  return null
}

// 根据预签名文件上传
export const fileUploadWithPresigned = (presignedUrl: string, file: File) => {
  return cw_fetch(presignedUrl, file, 'put', {
    "Content-Type": "image/jpeg",
  })
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
