/*
 * @Author: ShawnPhang
 * @Date: 2021-08-19 18:43:22
 * @Description:
 * @LastEditors: ShawnPhang <site: book.palxp.com>
 * @LastEditTime: 2023-07-24 13:01:10
 */
import fetch from '@/utils/axios'
import _config from '@/config'

const screenshot_url = window.location.protocol + '//' + window.location.host + '/cw_draw'
export const download = (params: Type.Object = {}) => `${_config.SCREEN_URL}/api/screenshots?id=${params.id}&width=${params.width}&height=${params.height}`
export const download_cw = (params: Type.Object = {}) => `${_config.SCREEN_URL}/api/screenshots?id=${params.id}&width=${params.width}&height=${params.height}&screenshot_url=${screenshot_url}`
export const download_cw_template = (params: Type.Object = {}) => `${_config.SCREEN_URL}/api/screenshots?tempid=${params.tempid}&width=${params.width}&height=${params.height}&screenshot_url=${screenshot_url}`
export const create_cover_cw = (params: Type.Object = {}) => `${_config.SCREEN_URL}/api/screenshots?id=${params.id}&width=${params.width}&height=${params.height}&screenshot_url=${screenshot_url}&type=cover`
export const create_cover_cw_template = (params: Type.Object = {}) => `${_config.SCREEN_URL}/api/screenshots?tempid=${params.tempid}&width=${params.width}&height=${params.height}&screenshot_url=${screenshot_url}&type=cover`

type IGetTempListParam = {
  search: string
  page: number
  pageSize: number
  cate: number | string
}
export type IGetTempListData = {
  bizName: string
  keyword: string
  cover: string
  height: number
  id: number
  state: number
  title: string
  width: number
  isDelect: boolean
  fail: boolean
  top: number
  left: number
  data?: string
  listWidth?: number
  gap?: number
  thumb?: string
  url: string
  model?: string
  color?: string
  aiParam: string
}
type IGetTempListResult = TPageRequestResult<IGetTempListData[]>

// 获取模板列表
export const getTempList = (params: IGetTempListParam) => fetch<IGetTempListResult>('design/list', params, 'get')

type TGetTempDetail = {
  id: number
  type?: number
}

export const getTempDetail = (params: TGetTempDetail) => fetch<{data: string}>('design/temp', params, 'get')

type TGetCategoriesParams = {
  type?: number
}
export type TGetCategoriesData = {
  id: number
  name: string
  pid: number
  type: number
}
type TgetCategoriesResult = TCommResResult<TGetCategoriesData>

export const getCategories = (params: TGetCategoriesParams) => fetch<TgetCategoriesResult[]>('design/cate', params, 'get')


// 保存模板
export const saveTemp = (params: Type.Object = {}) => fetch('design/edit', params, 'post')
// export const delTemp = (params: Type.Object = {}) => fetch('/api/template/temp_del', params)

// 组件相关接口
export const getCompList = (params: Type.Object = {}) => fetch('design/list', params, 'get')
export const removeComp = (params: Type.Object = {}) => fetch('design/del', params, 'post')
// export const getCompDetail = (params: Type.Object = {}) => fetch('/api/template/temp_info', params, 'get')

// 保存作品
export const saveWorks = (params: Type.Object = {}) => fetch('design/save', params, 'post')

// 保存个人模板
export const saveMyTemp = (params: Type.Object = {}) => fetch('design/user/temp', params, 'post')

// 获取作品
export const getWorks = (params: Type.Object = {}) => fetch('design/poster', params, 'get')

type TGetMyDesignParams = {
  page: number
  pageSize: number
}

type TGetMyDesignResult = TPageRequestResult<IGetTempListData[]>

// 作品列表
export const getMyDesign = (params: TGetMyDesignParams) => fetch<TGetMyDesignResult>('design/my', params, 'get')
