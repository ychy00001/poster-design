import app_config from '@/config'
export const config = app_config

/**
 * 星期换算
 * @param {String} 'YYYY-MM-DD'
 */
// export const transformDate = (date: string) => {
//   const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
//   const myDate = new Date(date.replace(/-/g, '/'))
//   if (weekDay[myDate.getDay()]) {
//     return weekDay[myDate.getDay()]
//   } else {
//     return ''
//   }
// }
/**
 * 返回正确时间
 */
// export const getDate = (date: string) => {
//   const reDate = new Date(date.replace(/-/g, '/'))
//   return reDate
// }
/**
 * 短日期
 */
// export const getMinDate = (d: string, type: string) => {
//   const mydate = new Date(d.replace(/-/g, '/'))
//   if (isNaN(mydate.getDate())) {
//     return d
//   }
//   if (type === 'ym') {
//     return mydate.getFullYear() + ' - ' + (mydate.getMonth() + 1)
//   } else if (type === 'md') {
//     return mydate.getMonth() + 1 + '-' + mydate.getDate()
//   } else {
//     return String(mydate.getMonth() + 1).padStart(2, '0')
//   }
// }
// 判断是否在数组中并返回下标
export const isInArray = (arr: Type.Object[], value: any) => {
  if (arr.indexOf && typeof arr.indexOf === 'function') {
    const index = arr.indexOf(value)
    if (index >= 0) {
      return index
    }
  }
  return false
}
/** 删除多个对象元素 */
export const deleteSome = (obj: Type.Object, arr: string[]) => {
  arr.forEach((key) => {
    delete obj[key]
  })
  return obj
}
/** 拾取对象元素 */
export const pickSome = (obj: Type.Object, arr: string[]) => {
  const newObj: Type.Object = {}
  arr.forEach((key) => {
    newObj[key] = obj[key]
  })
  return newObj
}
/** String长度 */
// export const getBLen = (str: string | any) => {
//   if (str === null) {
//     return 0
//   }
//   return String(str).replace(/[^\x00-\xff]/g, '01').length
// }
/** 随机 */
export const rndNum = (n: number, m: number) => {
  const random = Math.floor(Math.random() * (m - n + 1) + n)
  return random
}

// 生成指定长度指定进制的uuid 
// uuid(8, 2)  //  "01001010"
// uuid(8, 10) // "47473046"
// uuid(8, 16) // "098F4D35"
export const uuid = (len:any, radix:any) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid = []; let i;
  radix = radix || chars.length;
 
  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
  } else {
     // rfc4122, version 4 form
    let r;
     // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random()*16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
  }
 return uuid.join('');
}

export default {}
