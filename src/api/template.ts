/*
 * @Author: ShawnPhang
 * @Date: 2021-08-27 14:42:15
 * @Description: AI相关接口
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-10-13 00:07:19
 */
import cw_fetch from '@/utils/cw_axios'

// 获取模版
export const get = (params: Type.Object = {}) => cw_fetch('/template/get', params, 'get')

// 获取模版
export const page = (params: Type.Object = {}) => cw_fetch('/template/page', params, 'get')

// 保存模版
export const update = (params: Type.Object = {}) => cw_fetch('/template/update', params, 'put')

// 保存模版
export const create = (params: Type.Object = {}) => cw_fetch('/template/create', params, 'post')

// 删除模版
export const del = (params: Type.Object = {}) => cw_fetch('/template/delete', params, 'delete')