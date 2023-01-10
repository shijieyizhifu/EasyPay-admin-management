
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import utilsApi from '@/utils/utilsApi'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start()
  // set page title
  document.title = getPageTitle(to.meta.title)
  const hasToken = localStorage.getItem('token')
  if (hasToken) {
    if (to.path === '/login' || to.path.indexOf('/redirect') >= 0) {
      // if is logged in, redirect to the home page
      next()
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      const data = await utilsApi.userInfo()
      sessionStorage.setItem('user', JSON.stringify(data.data))
      const hasRoute = JSON.parse(sessionStorage.getItem('userRouter'))
      let userRouter = [], userFunction = []
      if (hasRoute && hasRoute.length > 0) {
        userRouter = hasRoute
        userFunction = JSON.parse(sessionStorage.getItem('userFunction'))
      } else {
        const res = await utilsApi.getPermission()
        let userPermissions = res.data
        for (let i of userPermissions) {
          if (i.type == 'function') {
            userFunction.push(i)
          } else {
            userRouter.push(i)
          }
        }
        sessionStorage.setItem('userRouter', JSON.stringify(userRouter))
        sessionStorage.setItem('userFunction', JSON.stringify(userFunction))
      }
      if (userRouter.map(item => item.router).includes(to.path)) {
        next()
      } else {
        next('/login')
        NProgress.done()
      }
    }
  } else {
    /* has no token*/
    if (to.path != '/login') {
      next('/login')
    } else {
      next()
    }
    NProgress.done()
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
