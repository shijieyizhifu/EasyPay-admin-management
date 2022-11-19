import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'

const axiosIns = axios.create({
    // You can add your headers here
    // ================================
    // baseURL: process.env.NODE_ENV === 'production' ?  'http://1.13.253.193' : '',
    // timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'}
})

axiosIns.interceptors.request.use((config) => {
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    const token = localStorage.getItem('token')
    if(token && token != config.headers['X-Token']) {
        config.headers['X-Token'] = token
    }
    return config
})

axiosIns.interceptors.response.use((response) => {
    const data = response.data
    if(data.data?.token){
        localStorage.setItem('token',data.data?.tokenHead + data.data?.token)
    }
    if(data && data.code != 0 && data.code != 2001){
        try {
            if(data.image || data.length > 0 || data.buttonText){
                return data
            }
            Message({
                showClose: true,
                message: data.message,
                type: 'error'
              })
            return data
        } catch (error) {
            return data
        }
    }
    if(data.code == 2001){
        Message({
            showClose: true,
            message: '请重新登录！',
            type: 'warning'
          })
        sessionStorage.clear()
        // store.commit('user/update_user', {})
        router.push('/login')
        return data
    }
    return data
},
err => {
    Message({
        showClose: true,
        message: err,
        type: 'error'
    })
}
)

const utilsApi = {

}

const toFromData = (obj) => {
    let data = new FormData()
    for(let i in obj){
        data.append(i, obj[i])
    }
    return data
}

const formatParams = (obj) => {
    const str = [];
    Object.keys(obj).sort().forEach((key) => {
      if (obj.hasOwnProperty(key)) {
        str.push(key + '=' + obj[key])
      }
    });
    return str.join('&')
}

//登录
utilsApi.login = async (params) => {
    let reslut = await axiosIns.post("/v1/adminUser/login",params)
    return reslut
}

//修改密码
utilsApi.updatePassword = async (params) => {
    let reslut = await axiosIns.post("/v1/adminUser/updatePassword",params)
    return reslut
}

//退出登录
utilsApi.logout = async (params) => {
    let reslut = await axiosIns.get("/v1/adminUser/logout",params)
    return reslut
}

//---------------------------------线下流水--------------------------------

//查询线下流水
utilsApi.offlineRecordPage = async (params) => {
    let reslut = await axiosIns.post("/v1/offlineRecord/pageAll",params)
    return reslut
}

//新增
utilsApi.offlineRecordSave = async (params) => {
    let reslut = await axiosIns.post("/v1/offlineRecord/save",params)
    return reslut
}

//修改
utilsApi.offlineRecordUpdate = async (params) => {
    let reslut = await axiosIns.post("/v1/offlineRecord/update",params)
    return reslut
}

//删除
utilsApi.offlineRecordDel = async (params) => {
    let reslut = await axiosIns.post("/v1/offlineRecord/del",toFromData(params))
    return reslut
}

//---------------------------------权限控制--------------------------------

//查询用户拥有的权限
utilsApi.getPermission = async (params) => {
    let reslut = await axiosIns.get("/v1/adminUser/permission",params)
    return reslut
}

//查询所有的权限
utilsApi.getAllPermission = async (params) => {
    let reslut = await axiosIns.get("/v1/permission/getAll",params)
    return reslut
}

//新增或者修改权限
utilsApi.updatePermission = async (params) => {
    let reslut = await axiosIns.post("/v1/permission/save",params)
    return reslut
}

//删除权限
utilsApi.delPermission = async (params) => {
    let reslut = await axiosIns.get("/v1/permission/del?id=" + params)
    return reslut
}

//---------------------------------角色管理--------------------------------

//查询角色
utilsApi.getRoles = async (params) => {
    let reslut = await axiosIns.get("/v1/adminRole/getAllPage?" + formatParams(params))
    return reslut
}

//新增修改角色
utilsApi.updateRole = async (params) => {
    let reslut = await axiosIns.post("/v1/adminRole/save",params)
    return reslut
}

//查询角色拥有的权限
utilsApi.getRolePermission = async (params) => {
    let reslut = await axiosIns.get("/v1/adminRole/getRolePermission?" + formatParams(params))
    return reslut
}

//删除角色
utilsApi.delRole = async (params) => {
    let reslut = await axiosIns.get("/v1/adminRole/del?" + formatParams(params))
    return reslut
}

//---------------------------------用户管理--------------------------------

//查询用户
utilsApi.getUsers = async (params) => {
    let reslut = await axiosIns.post("/v1/adminUser/getAllPage",params)
    return reslut
}

//新增修改用户
utilsApi.updateUser = async (params) => {
    let reslut = await axiosIns.post("/v1/adminUser/save",params)
    return reslut
}

//查询用户可选的角色
utilsApi.getAllRoles = async (params) => {
    let reslut = await axiosIns.get("/v1/adminRole/getAll")
    return reslut
}

//重置用户密码
utilsApi.resetUser = async (params) => {
    let reslut = await axiosIns.post("/v1/adminUser/reset",params)
    return reslut
}

//删除用户
utilsApi.delUser = async (params) => {
    let reslut = await axiosIns.get("/v1/adminUser/del?" + formatParams(params))
    return reslut
}

//---------------------------------数据字典--------------------------------

//查询字典
utilsApi.dictionaryFindPage = async (params) => {
    let reslut = await axiosIns.get("/v1/dictionary/findPage?" + formatParams(params))
    return reslut
}

//新增修改字典
utilsApi.updateDictionary = async (params) => {
    let reslut = await axiosIns.post("/v1/dictionary/save",params)
    return reslut
}

//删除字典
utilsApi.delDictionary = async (params) => {
    let reslut = await axiosIns.post("/v1/dictionary/del" , toFromData(params))
    return reslut
}

//---------------------------------通道管理--------------------------------

//---------------------------------交易通道--------------------------------

//查询所有通道
utilsApi.agencyFindAll = async (params) => {
    let reslut = await axiosIns.get("/v1/agency/findAll")
    return reslut
}

//查询
utilsApi.agencyPage = async (params) => {
    let reslut = await axiosIns.post("/v1/agency/page" , params)
    return reslut
}

//新增
utilsApi.insertAgency = async (params) => {
    let reslut = await axiosIns.post("/v1/agency/insert",params)
    return reslut
}

//修改通道状态
utilsApi.updateStatusAgency = async (params) => {
    let reslut = await axiosIns.post("/v1/agency/updateStatus",params)
    return reslut
}

//查询上游通道开通的业务
utilsApi.findAgencyCode = async (params) => {
    let reslut = await axiosIns.get("/v1/agencyBusiness/findAgencyCode?" + formatParams(params))
    return reslut
}

//新增修改上游通道业务
utilsApi.agencyBusinessSave = async (params) => {
    let reslut = await axiosIns.post("/v1/agencyBusiness/save", params)
    return reslut
}

//---------------------------------平台业务--------------------------------

//查询所有业务
utilsApi.businessFindAll = async (params) => {
    let reslut = await axiosIns.get("/v1/business/findAll")
    return reslut
}

//查询平台业务
utilsApi.businessPage = async (params) => {
    let reslut = await axiosIns.post("/v1/business/page", params)
    return reslut
}

//新增业务
utilsApi.insterBusiness = async (params) => {
    let reslut = await axiosIns.post("/v1/business/inster", params)
    return reslut
}

//修改业务
utilsApi.updateBusiness = async (params) => {
    let reslut = await axiosIns.post("/v1/business/update", params)
    return reslut
}

//查询平台业务关联的通道业务
utilsApi.findAgencyBusiness = async (params) => {
    let reslut = await axiosIns.get("/v1/business/findAgencyBusiness?" + formatParams(params))
    return reslut
}

//---------------------------------通道商户--------------------------------

//查询通道商户
utilsApi.agencyMerchantPage = async (params) => {
    let reslut = await axiosIns.post("/v1/agencyMerchant/page", params)
    return reslut
}

//新增修改通道商户
utilsApi.saveAgencyMerchant = async (params) => {
    let reslut = await axiosIns.post("/v1/agencyMerchant/save", params)
    return reslut
}

//查询商户绑定的汇率
utilsApi.findAgencyMerchantRate = async (params) => {
    let reslut = await axiosIns.get("/v1/agencyMerchant/findMerchantRate?" + formatParams(params))
    return reslut
}

//新增和修改商户汇率
utilsApi.merchantRateSave = async (params) => {
    let reslut = await axiosIns.post("/v1/agencyMerchant/merchantRateSave", params)
    return reslut
}

//查询平台业务关联的通道业务
utilsApi.agencyMerchant = async (params) => {
    let reslut = await axiosIns.get("/v1/agencyMerchant/findMerchant?" + formatParams(params))
    return reslut
}

//---------------------------------代理商--------------------------------

//查询代理商
utilsApi.agentPage = async (params) => {
    let reslut = await axiosIns.post("/v1/agent/page", params)
    return reslut
}

//新增代理商
utilsApi.agentInsert = async (params) => {
    let reslut = await axiosIns.post("/v1/agent/insert", params)
    return reslut
}

//新增代理商业务
utilsApi.agentInsterbusiness = async (params) => {
    let reslut = await axiosIns.post("/v1/agent/insterbusiness", params)
    return reslut
}

//查询代理上开通的业务（大类）
utilsApi.findAgentType = async (params) => {
    let reslut = await axiosIns.get("/v1/agent/findBusinessType?" + formatParams(params))
    return reslut
}

//查询代理商业务费率
utilsApi.findAgentRate = async (params) => {
    let reslut = await axiosIns.get("/v1/agent/findBusiness?" + formatParams(params))
    return reslut
}

//查询所有代理商
utilsApi.agentFindAll = async (params) => {
    let reslut = await axiosIns.get("/v1/agent/findAll")
    return reslut
}

//查询代理商业务集群
utilsApi.findAgentBusinessMerchant = async (params) => {
    let reslut = await axiosIns.get("/v1/agent/agentBusinessMerchant?" + formatParams(params))
    return reslut
}

//给代理业务绑定商户业务
utilsApi.agentInsertMerchantBusiness = async (params) => {
    let reslut = await axiosIns.post("/v1/agent/insertMerchantBusiness", toFromData(params))
    return reslut
}

//查询代理开通某个业务的商户
utilsApi.getMerchantByBusiness = async (params) => {
    let reslut = await axiosIns.get("/v1/merchant/getMerchantByBusiness?" + formatParams(params))
    return reslut
}

//---------------------------------商户--------------------------------

//查询商户
utilsApi.merchantPage = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/page", params)
    return reslut
}

//新增商户
utilsApi.merchantSave = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/save", params)
    return reslut
}

//新增商户业务费率
utilsApi.merchantInsterbusiness = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/insertBusiness", params)
    return reslut
}

//查询商户业务费率
utilsApi.findMerchantRate = async (params) => {
    let reslut = await axiosIns.get("/v1/merchant/findBusiness?" + formatParams(params))
    return reslut
}

//---------------------------------订单--------------------------------

//查询代收订单
utilsApi.orderPage = async (params) => {
    let reslut = await axiosIns.post("/v1/order/page", params)
    return reslut
}

//查询代付订单
utilsApi.orderPayOutPage = async (params) => {
    let reslut = await axiosIns.post("/v1/order/payOutPage", params)
    return reslut
}

//---------------------------------查询商户或者代理商余额--------------------------------
utilsApi.searchBalances = async (params) => {
    let reslut = await axiosIns.get("/v1/account/findByCode?" + formatParams(params))
    return reslut
}

export default utilsApi