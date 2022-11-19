import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import componentsRouter from './modules/components'
import chartsRouter from './modules/charts'
import tableRouter from './modules/table'
import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/offlineRecord',
    component: Layout,
    redirect: '/offlineRecord/index',
    alwaysShow: true,
    name: 'Offline',
    meta: {
      title: '流水管理',
      icon: 'el-icon-s-operation',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views1/offlineRecord/index'),
        name: 'OfflineRecord',
        meta: { title: '流水记录' }
      }
    ]
  },
  {
    path: '/merchantManagement',
    component: Layout,
    redirect: '/merchantManagement/index',
    alwaysShow: true,
    name: 'merchantManagement',
    meta: {
      title: '商户管理',
      icon: 'el-icon-user-solid',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views1/merchantManagement/index'),
        name: 'MerchantManagement',
        meta: { title: '商户' }
      }
    ]
  },
  {
    path: '/orderManagement',
    component: Layout,
    redirect: '/orderManagement/index',
    alwaysShow: true,
    name: 'orderManagement',
    meta: {
      title: '订单管理',
      icon: 'el-icon-s-order',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views1/orderManagement/index'),
        name: 'OrderManagement',
        meta: { title: '代收订单' }
      },
      {
        path: 'payOut',
        component: () => import('@/views1/orderManagement/payOut'),
        name: 'OrderPayOutManagement',
        meta: { title: '代付订单' }
      }
    ]
  },
  {
    path: '/agentManagement',
    component: Layout,
    redirect: '/agentManagement/index',
    alwaysShow: true,
    name: 'agentManagement',
    meta: {
      title: '代理商管理',
      icon: 'el-icon-s-custom',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views1/agentManagement/index'),
        name: 'AgentManagement',
        meta: { title: '代理商' }
      }
    ]
  },
  {
    path: '/channelManagement',
    component: Layout,
    redirect: '/channelManagement/index',
    alwaysShow: true,
    name: 'channelManagement',
    meta: {
      title: '通道管理',
      icon: 'el-icon-s-management',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views1/channelManagement/index'),
        name: 'tradingChannel',
        meta: { title: '交易通道' }
      },
      {
        path: 'business',
        component: () => import('@/views1/channelManagement/business'),
        name: 'business',
        meta: { title: '平台业务' }
      },
      {
        path: 'channelMerchant',
        component: () => import('@/views1/channelManagement/channelMerchant'),
        name: 'channelMerchant',
        meta: { title: '通道商户' }
      }
    ]
  },
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/index',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: '系统管理',
      icon: 'el-icon-setting',
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views1/permission/index'),
        name: 'PermissionManager',
        meta: {
          title: '权限管理',
        }
      },
      {
        path: 'role',
        component: () => import('@/views1/permission/role'),
        name: 'RolePermission',
        meta: {
          title: '角色管理',
        }
      },
      {
        path: 'user',
        component: () => import('@/views1/permission/user'),
        name: 'UserPermission',
        meta: {
          title: '用户管理',
        }
      },
      {
        path: 'dataDictionary',
        component: () => import('@/views1/permission/dataDictionary'),
        name: 'DataDictionary',
        meta: {
          title: '数据字典',
        }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes.concat(asyncRoutes)
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
