/*
 * @Author: Rain
 * @Date: 2021-08-27 14:42:15
 * @Description: AI相关接口
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-10-13 00:07:19
 */
import cw_fetch from '@/utils/cw_axios'

// 保存背景
export const create = (params: Type.Object = {}) => cw_fetch('/material/create', params, 'post')
