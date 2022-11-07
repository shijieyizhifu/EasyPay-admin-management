/*
 * @Author: hanjiangyanhuo hjpyh@foxmail.com
 * @Date: 2022-09-26 11:29:36
 * @LastEditors: hanjiangyanhuo hjpyh@foxmail.com
 * @LastEditTime: 2022-11-03 21:33:53
 * @FilePath: /vue-element-admin/src/utils/get-page-title.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import defaultSettings from '@/settings'
import i18n from '@/lang'

const title = defaultSettings.title || '世界易支付'

export default function getPageTitle(key) {
  const hasKey = i18n.te(`route.${key}`)
  if (hasKey) {
    const pageName = i18n.t(`route.${key}`)
    return `${pageName} - ${title}`
  }
  return `${title}`
}
