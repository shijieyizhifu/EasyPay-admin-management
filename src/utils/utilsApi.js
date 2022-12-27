import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'
const base64url = require('base64url')
const crypto = require('crypto')

const sysRsaPrivate = "-----BEGIN PRIVATE KEY-----\n" +"MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBAKVTGCD8/im8bZNP/ZHlHSXNF/Lr9/sA/skZOQ3huOyQvhRUi0ZcPN8hjsvpMJJVFLakIAKUnOMB+Brwur/gRQWIOiqgTN2j0KteXbOLp36kppgd9hZ8AO8C50pfPZRTJUwYrWhytK2aNNpC4og/hgPQXEUAr2fImlJbsSwVLqx7AgMBAAECgYEAgddr+OSZfQ/nAy5smPvXU4vrRjc7UGAsuqXboGJqCSl4j6ECrWTdzeSeMNnY8uRtWzA1j7FGMiemwwnTscSij3kqXci/WDpTEXVeykb5uGLkMk4N3A+atoXkc6eKNLT+TbTcX1GxD42/oCZVzfSg4cbL0MGrRKTGn7yNsW9wX+ECQQDyovID91GIzbXDGfhRMyncF+SYDuXmLtBJrOb1yGyWC7DA8XIkvURO2+PhFyPWCkYwwicdn1rE9rsnn6ngp8XRAkEArm4WzxwZ+euUSNCSmXyGqAlhhVXUH1BtBCBz7z1/oy6hzDegbcQoB90iI/3p0uBXWfPkz8eWezwTcyrR188EiwJBAKCRaKtrPc/UolZsl0HVI/x861Ade9KqZDh9bZJ1gjaBogTtQ2ZAwjWVmuZYk+SPhAe8VHpr/Huf9BayuI7tOCECQQCZr5fbLYhZok5JhbPVFlnSjkllYIUAfi0/WJStcwMVtQ2L0GtCq3UV0Km3Co5NZaqxL+onhFQ7CmicrVqsidMXAkEAtPoUlDZSWaYSFKGZE46PZCEMoujNMKBYqguaqNtsogr6RMHji4Fbx4xc78y3Bu77eu+rz8eYqnkZ6sXMFuwyDg==\n" + "-----END PRIVATE KEY-----"

const axiosIns = axios.create({
    // You can add your headers here
    // ================================
    baseURL: process.env.NODE_ENV === 'production' ?  '/v1' : '/v1',
    // timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'}
})

axiosIns.interceptors.request.use((config) => {
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    const token = localStorage.getItem('token')
    if(token && token != config.headers['X-Token']) {
        config.headers['X-Token'] = token
    }
    if (['/order/excelOrder', '/order/excelPayOut'].indexOf(config.url) > -1) {
        config.responseType = 'blob';
    }
    return config
})

axiosIns.interceptors.response.use((response) => {
    const data = response.data
    if(['/v1/order/excelOrder', '/v1/order/excelPayOut'].indexOf(response.config.url) > -1){
        return data
    }
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
    axiosIns
}

const toFormData = (obj) => {
    let data = new FormData()
    for(let i in obj){
        data.append(i, obj[i])
    }
    return data
}

const formatParams = (obj) => {
    const str = [];
    Object.keys(obj).sort().forEach((key) => {
      if (obj.hasOwnProperty(key) && obj[key] && obj[key]) {
        str.push(key + '=' + obj[key])
      }
    });
    return str.join('&')
}

//上传图片地址
utilsApi.uploadImgUrl =  '/file/uploadImage'

//图片地址
utilsApi.imgUrl =  process.env.NODE_ENV === 'production' ?   'http://8.218.2.19:8000/image/' : 'http://8.218.2.19:8000/image/'

function encryptRSABL (prik, str) {
    console.log(str)
    let encryptString = Buffer.from(str)
    let result = []    
    let inputLen = encryptString.length    
    let offSet = 0    
    let length = 117    
    let i = 0    
    while (inputLen - offSet > 0) {        
        let cache = ''        
        if (inputLen - offSet > length) { 
            cache = crypto.privateEncrypt(prik, encryptString.slice(offSet, (offSet + length))) 
        } else {
            cache = crypto.privateEncrypt(prik, encryptString.slice(offSet, (offSet + (inputLen - offSet))))        
        }        
        cache.forEach(o => { result.push(o)        })
        i++        
        offSet = i * length    
    }    
    return base64url.fromBase64(new Buffer.from(result).toString('base64'))
}
//支付代付下单签名
utilsApi.sign = function (data,rsaPrivate) {
    let formatData = formatParams(data)
    let rsaPri = rsaPrivate ? `-----BEGIN PRIVATE KEY-----\n${rsaPrivate}\n-----END PRIVATE KEY-----` : sysRsaPrivate
    return encryptRSABL(rsaPri ,formatData)
}

//登录
utilsApi.login = async (params) => {
    let reslut = await axiosIns.post("/adminUser/login",params)
    return reslut
}

//修改密码
utilsApi.updatePassword = async (params) => {
    let reslut = await axiosIns.post("/adminUser/updatePassword",params)
    return reslut
}

//获取一个谷歌验证器
utilsApi.genSecret = async (params) => {
    let reslut = await axiosIns.get("/adminUser/genSecret",params)
    return reslut
}

//解绑固定验证器
utilsApi.clearAuth = async (params) => {
    let reslut = await axiosIns.post("/adminUser/clearAuth", toFormData(params))
    return reslut
}


//获取当前的用户信息
utilsApi.userInfo = async (params) => {
    let reslut = await axiosIns.get("/adminUser/userInfo")
    return reslut
}

//绑定谷歌验证器
utilsApi.bindGooleAuth = async (params) => {
    let reslut = await axiosIns.post("//adminUser/bindGooleAuth",toFormData(params))
    return reslut
}

//发送邮件
utilsApi.sendCode = async (params) => {
    let reslut = await axiosIns.get("/adminUser/sendCode?" + formatParams(params))
    return reslut
}

//退出登录
utilsApi.logout = async (params) => {
    let reslut = await axiosIns.get("/adminUser/logout",params)
    return reslut
}

//---------------------------------首页--------------------------------
//统计今日代收代付情况
utilsApi.todayData = async (params) => {
    let reslut = await axiosIns.get("/index/todayData",params)
    return reslut
}

//根据时间查询(默认本月)
utilsApi.timeStatistics = async (params) => {
    let reslut = await axiosIns.get("/index/timeStatistics?" + formatParams(params))
    return reslut
}

//---------------------------------线下流水--------------------------------

//查询线下流水
utilsApi.offlineRecordPage = async (params) => {
    let reslut = await axiosIns.post("/offlineRecord/pageAll",params)
    return reslut
}

//新增
utilsApi.offlineRecordSave = async (params) => {
    let reslut = await axiosIns.post("/offlineRecord/save",params)
    return reslut
}

//修改
utilsApi.offlineRecordUpdate = async (params) => {
    let reslut = await axiosIns.post("/offlineRecord/update",params)
    return reslut
}

//删除
utilsApi.offlineRecordDel = async (params) => {
    let reslut = await axiosIns.post("/offlineRecord/del",toFormData(params))
    return reslut
}

//---------------------------------权限控制--------------------------------

//查询用户拥有的权限
utilsApi.getPermission = async (params) => {
    let reslut = await axiosIns.get("/adminUser/permission",params)
    return reslut
}

//查询所有的权限
utilsApi.getAllPermission = async (params) => {
    let reslut = await axiosIns.get("/permission/getAll",params)
    return reslut
}

//新增或者修改权限
utilsApi.updatePermission = async (params) => {
    let reslut = await axiosIns.post("/permission/save",params)
    return reslut
}

//删除权限
utilsApi.delPermission = async (params) => {
    let reslut = await axiosIns.get("/permission/del?id=" + params)
    return reslut
}

//---------------------------------角色管理--------------------------------

//查询角色
utilsApi.getRoles = async (params) => {
    let reslut = await axiosIns.get("/adminRole/getAllPage?" + formatParams(params))
    return reslut
}

//新增修改角色
utilsApi.updateRole = async (params) => {
    let reslut = await axiosIns.post("/adminRole/save",params)
    return reslut
}

//查询角色拥有的权限
utilsApi.getRolePermission = async (params) => {
    let reslut = await axiosIns.get("/adminRole/getRolePermission?" + formatParams(params))
    return reslut
}

//删除角色
utilsApi.delRole = async (params) => {
    let reslut = await axiosIns.get("/adminRole/del?" + formatParams(params))
    return reslut
}

//---------------------------------用户管理--------------------------------

//查询用户
utilsApi.getUsers = async (params) => {
    let reslut = await axiosIns.post("/adminUser/getAllPage",params)
    return reslut
}

//新增修改用户
utilsApi.updateUser = async (params) => {
    let reslut = await axiosIns.post("/adminUser/save",params)
    return reslut
}

//查询用户可选的角色
utilsApi.getAllRoles = async (params) => {
    let reslut = await axiosIns.get("/adminRole/getAll")
    return reslut
}

//重置用户密码
utilsApi.resetUser = async (params) => {
    let reslut = await axiosIns.post("/adminUser/reset",params)
    return reslut
}

//删除用户
utilsApi.delUser = async (params) => {
    let reslut = await axiosIns.get("/adminUser/del?" + formatParams(params))
    return reslut
}

//---------------------------------数据字典--------------------------------

//查询字典
utilsApi.dictionaryFindPage = async (params) => {
    let reslut = await axiosIns.get("/dictionary/findPage?" + formatParams(params))
    return reslut
}

//新增修改字典
utilsApi.updateDictionary = async (params) => {
    let reslut = await axiosIns.post("/dictionary/save",params)
    return reslut
}

//删除字典
utilsApi.delDictionary = async (params) => {
    let reslut = await axiosIns.post("/dictionary/del" , toFormData(params))
    return reslut
}

//---------------------------------通道管理--------------------------------

//---------------------------------交易通道--------------------------------

//查询所有通道
utilsApi.agencyFindAll = async (params) => {
    let reslut = await axiosIns.get("/agency/findAll")
    return reslut
}

//查询
utilsApi.agencyPage = async (params) => {
    let reslut = await axiosIns.post("/agency/page" , params)
    return reslut
}

//新增
utilsApi.insertAgency = async (params) => {
    let reslut = await axiosIns.post("/agency/insert",params)
    return reslut
}

//修改通道状态
utilsApi.updateStatusAgency = async (params) => {
    let reslut = await axiosIns.post("/agency/updateStatus",params)
    return reslut
}

//查询上游通道开通的业务
utilsApi.findAgencyCode = async (params) => {
    let reslut = await axiosIns.get("/agencyBusiness/findAgencyCode?" + formatParams(params))
    return reslut
}

//新增修改上游通道业务
utilsApi.agencyBusinessSave = async (params) => {
    let reslut = await axiosIns.post("/agencyBusiness/save", params)
    return reslut
}

//---------------------------------平台业务--------------------------------

//查询所有业务
utilsApi.businessFindAll = async (params) => {
    let reslut = await axiosIns.get("/business/findAll")
    return reslut
}

//查询平台业务
utilsApi.businessPage = async (params) => {
    let reslut = await axiosIns.post("/business/page", params)
    return reslut
}

//新增业务
utilsApi.insterBusiness = async (params) => {
    let reslut = await axiosIns.post("/business/inster", params)
    return reslut
}

//修改业务
utilsApi.updateBusiness = async (params) => {
    let reslut = await axiosIns.post("/business/update", params)
    return reslut
}

//查询平台业务关联的通道业务
utilsApi.findAgencyBusiness = async (params) => {
    let reslut = await axiosIns.get("/business/findAgencyBusiness?" + formatParams(params))
    return reslut
}

//---------------------------------集群管理--------------------------------

//新增和修改集群
utilsApi.clusterSave = async (params) => {
    let reslut = await axiosIns.post("/cluster/save", params)
    return reslut
}

//删除集群
utilsApi.delCluster = async (params) => {
    let reslut = await axiosIns.post("/cluster/delCluster", toFormData(params))
    return reslut
}

//分页查询集群数据
utilsApi.clusterPage = async (params) => {
    let reslut = await axiosIns.post("/cluster/page", params)
    return reslut
}

//重置集群商户
utilsApi.resetClusterMerchant = async (params) => {
    let reslut = await axiosIns.post("/cluster/resetMerchant", params)
    return reslut
}

//新增集群商户
utilsApi.insterClusterMerchant = async (params) => {
    let reslut = await axiosIns.post("/cluster/insterMerchant", params)
    return reslut
}

//删除集群商户
utilsApi.delClusterMerchant = async (params) => {
    let reslut = await axiosIns.post("/cluster/delClusterMerchant", toFormData(params))
    return reslut
}

//查询集群的商户
utilsApi.findClusterMerchant = async (params) => {
    let reslut = await axiosIns.get("/cluster/findClusterMerchant?" + formatParams(params))
    return reslut
}

//查询集群可绑定 和未绑定的商户
utilsApi.findAllClusterMerchant = async (params) => {
    let reslut = await axiosIns.get("/cluster/findMerchant?" + formatParams(params))
    return reslut
}

//---------------------------------通道商户--------------------------------

//查询通道商户
utilsApi.agencyMerchantPage = async (params) => {
    let reslut = await axiosIns.post("/agencyMerchant/page", params)
    return reslut
}

//新增修改通道商户
utilsApi.saveAgencyMerchant = async (params) => {
    let reslut = await axiosIns.post("/agencyMerchant/save", params)
    return reslut
}

//查询商户绑定的汇率
utilsApi.findAgencyMerchantRate = async (params) => {
    let reslut = await axiosIns.get("/agencyMerchant/findMerchantRate?" + formatParams(params))
    return reslut
}

//新增和修改商户汇率
utilsApi.merchantRateSave = async (params) => {
    let reslut = await axiosIns.post("/agencyMerchant/merchantRateSave", params)
    return reslut
}

//查询平台业务关联的通道业务
utilsApi.agencyMerchant = async (params) => {
    let reslut = await axiosIns.get("/agencyMerchant/findMerchant?" + formatParams(params))
    return reslut
}

//---------------------------------代理商--------------------------------

//查询代理商
utilsApi.agentPage = async (params) => {
    let reslut = await axiosIns.post("/agent/page", params)
    return reslut
}

//新增代理商
utilsApi.agentInsert = async (params) => {
    let reslut = await axiosIns.post("/agent/insert", params)
    return reslut
}

//新增代理商业务
utilsApi.agentInsterbusiness = async (params) => {
    let reslut = await axiosIns.post("/agent/insterbusiness", params)
    return reslut
}

//查询代理上开通的业务（大类）
utilsApi.findAgentType = async (params) => {
    let reslut = await axiosIns.get("/agent/findBusinessType?" + formatParams(params))
    return reslut
}

//查询代理商业务费率
utilsApi.findAgentRate = async (params) => {
    let reslut = await axiosIns.get("/agent/findBusiness?" + formatParams(params))
    return reslut
}

//查询所有代理商
utilsApi.agentFindAll = async (params) => {
    let reslut = await axiosIns.get("/agent/findAll")
    return reslut
}

//查询代理商业务集群
utilsApi.findAgentBusinessMerchant = async (params) => {
    let reslut = await axiosIns.get("/agent/agentBusinessMerchant?" + formatParams(params))
    return reslut
}

//给代理业务绑定商户业务
utilsApi.agentInsertMerchantBusiness = async (params) => {
    let reslut = await axiosIns.post("/agent/insertMerchantBusiness", toFormData(params))
    return reslut
}

//查询代理开通某个业务的商户
utilsApi.getMerchantByBusiness = async (params) => {
    let reslut = await axiosIns.get("/merchant/getMerchantByBusiness?" + formatParams(params))
    return reslut
}

//修改代理商费率
utilsApi.updateAgentBusinessRate = async (params) => {
    let reslut = await axiosIns.post("/agent/updateBusinessRate",params)
    return reslut
}

//---------------------------------商户--------------------------------

//查询商户
utilsApi.merchantPage = async (params) => {
    let reslut = await axiosIns.post("/merchant/page", params)
    return reslut
}

//新增商户
utilsApi.merchantSave = async (params) => {
    let reslut = await axiosIns.post("/merchant/save", params)
    return reslut
}

//修改商户业务的状态
utilsApi.updateBusinessStatus = async (params) => {
    let reslut = await axiosIns.post("/merchant/updateBusinessStatus",  toFormData(params))
    return reslut
}

//修改商户状态
utilsApi.updateMerchantStatus = async (params) => {
    let reslut = await axiosIns.post("/merchant/updateMerchantStatus",  toFormData(params))
    return reslut
}

//新增商户业务费率
utilsApi.merchantInsterbusiness = async (params) => {
    let reslut = await axiosIns.post("/merchant/insertBusiness", params)
    return reslut
}

//修改商户商费率
utilsApi.updateMerchantBusinessRate = async (params) => {
    let reslut = await axiosIns.post("/merchant/updateBusiessRate", params)
    return reslut
}

//查询商户业务费率
utilsApi.findMerchantRate = async (params) => {
    let reslut = await axiosIns.get("/merchant/findBusiness?" + formatParams(params))
    return reslut
}

//重置登录密码
utilsApi.resetLogPassword = async (params) => {
    let reslut = await axiosIns.post("/merchant/resetLogPassword",toFormData(params))
    return reslut
}

//重置支付密码
utilsApi.resetPayPassword = async (params) => {
    let reslut = await axiosIns.post("/merchant/resetPayPassword",toFormData(params))
    return reslut
}

//安全校验
utilsApi.ipVerify = async (params) => {
    let reslut = await axiosIns.post("/merchant/ipVerify",toFormData(params))
    return reslut
}


//---------------------------------订单--------------------------------

//查询代收订单
utilsApi.orderPage = async (params) => {
    let reslut = await axiosIns.post("/order/page", params)
    return reslut
}

//补发订单通知
utilsApi.orderNotify = async (params) => {
    let reslut = await axiosIns.get("/orderNotify?" + formatParams(params))
    return reslut
}

//查询代付订单
utilsApi.orderPayOutPage = async (params) => {
    let reslut = await axiosIns.post("/order/payOutPage", params)
    return reslut
}

//导出 代收excel
utilsApi.excelOrder = async (params) => {
    let reslut = await axiosIns.post("/order/excelOrder", params)
    return reslut
}

//导出代付excel
utilsApi.excelPayOut = async (params) => {
    let reslut = await axiosIns.post("/order/excelPayOut", params)
    return reslut
}

//支付下单
utilsApi.orderPay = async (params) => {
    let reslut = await axiosIns.post("/orderPay", params)
    return reslut
}

//代付下单
utilsApi.singleOrder = async (params) => {
    let reslut = await axiosIns.post("/singleOrder", params)
    return reslut
}

//完成代付订单
utilsApi.finishPayOut = async (params) => {
    let reslut = await axiosIns.post("/order/finishPayOut",toFormData(params))
    return reslut
}

//完成代收订单
utilsApi.finishOrder = async (params) => {
    let reslut = await axiosIns.post("/order/finishOrder",toFormData(params))
    return reslut
}

//补发代付通知
utilsApi.payOutNotify = async (params) => {
    let reslut = await axiosIns.get("/payOutNotify?" + formatParams(params))
    return reslut
}

//代收订单统计
utilsApi.orderStatistic = async (params) => {
    let reslut = await axiosIns.post("/order/orderStatistic",params)
    return reslut
}

//代付订单统计
utilsApi.payOutStatistic = async (params) => {
    let reslut = await axiosIns.post("/order/payOutStatistic",params)
    return reslut
}

//---------------------------------查询商户或者代理商余额--------------------------------
utilsApi.searchBalances = async (params) => {
    let reslut = await axiosIns.get("/account/findByCode?" + formatParams(params))
    return reslut
}

//---------------------------------回u记录--------------------------------

//查询商户回U 数据
utilsApi.merchantOfflinePage = async (params) => {
    let reslut = await axiosIns.post("/merchantOffline/page", params)
    return reslut
}

//通过/驳回 回U申请
utilsApi.updateOffline = async (params) => {
    let reslut = await axiosIns.post("/merchantOffline/updateOffline", params)
    return reslut
}

//---------------------------------财务管理--------------------------------

//冻结和解冻
utilsApi.accountFreeze = async (params) => {
    let reslut = await axiosIns.post("/account/freeze", params)
    return reslut
}

//查询冻结 解冻记录列表
utilsApi.accountPage = async (params) => {
    let reslut = await axiosIns.post("/account/page", params)
    return reslut
}

//解冻审核
utilsApi.accountReview = async (params) => {
    let reslut = await axiosIns.post("/account/review", toFormData(params))
    return reslut
}

//加减余额 申请
utilsApi.balanceOperate = async (params) => {
    let reslut = await axiosIns.post("/account/balanceOperate", params)
    return reslut
}

//查询 加减余额列表
utilsApi.balancePage = async (params) => {
    let reslut = await axiosIns.post("/account/balancePage", params)
    return reslut
}

//审核加减余额
utilsApi.balanceReview = async (params) => {
    let reslut = await axiosIns.post("/account/balanceReview", toFormData(params))
    return reslut
}

export default utilsApi