import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'
const base64url = require('base64url')
const crypto = require('crypto')

const sysRsaPrivate = "-----BEGIN PRIVATE KEY-----\n" +"MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBAKVTGCD8/im8bZNP/ZHlHSXNF/Lr9/sA/skZOQ3huOyQvhRUi0ZcPN8hjsvpMJJVFLakIAKUnOMB+Brwur/gRQWIOiqgTN2j0KteXbOLp36kppgd9hZ8AO8C50pfPZRTJUwYrWhytK2aNNpC4og/hgPQXEUAr2fImlJbsSwVLqx7AgMBAAECgYEAgddr+OSZfQ/nAy5smPvXU4vrRjc7UGAsuqXboGJqCSl4j6ECrWTdzeSeMNnY8uRtWzA1j7FGMiemwwnTscSij3kqXci/WDpTEXVeykb5uGLkMk4N3A+atoXkc6eKNLT+TbTcX1GxD42/oCZVzfSg4cbL0MGrRKTGn7yNsW9wX+ECQQDyovID91GIzbXDGfhRMyncF+SYDuXmLtBJrOb1yGyWC7DA8XIkvURO2+PhFyPWCkYwwicdn1rE9rsnn6ngp8XRAkEArm4WzxwZ+euUSNCSmXyGqAlhhVXUH1BtBCBz7z1/oy6hzDegbcQoB90iI/3p0uBXWfPkz8eWezwTcyrR188EiwJBAKCRaKtrPc/UolZsl0HVI/x861Ade9KqZDh9bZJ1gjaBogTtQ2ZAwjWVmuZYk+SPhAe8VHpr/Huf9BayuI7tOCECQQCZr5fbLYhZok5JhbPVFlnSjkllYIUAfi0/WJStcwMVtQ2L0GtCq3UV0Km3Co5NZaqxL+onhFQ7CmicrVqsidMXAkEAtPoUlDZSWaYSFKGZE46PZCEMoujNMKBYqguaqNtsogr6RMHji4Fbx4xc78y3Bu77eu+rz8eYqnkZ6sXMFuwyDg==\n" + "-----END PRIVATE KEY-----"

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
utilsApi.uploadImgUrl =  '/v1/file/uploadImage'

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
    let reslut = await axiosIns.post("/v1/adminUser/login",params)
    return reslut
}

//修改密码
utilsApi.updatePassword = async (params) => {
    let reslut = await axiosIns.post("/v1/adminUser/updatePassword",params)
    return reslut
}

//获取一个谷歌验证器
utilsApi.genSecret = async (params) => {
    let reslut = await axiosIns.get("/v1/adminUser/genSecret",params)
    return reslut
}


//获取当前的用户信息
utilsApi.userInfo = async (params) => {
    let reslut = await axiosIns.get("/v1/adminUser/userInfo")
    return reslut
}

//绑定谷歌验证器
utilsApi.bindGooleAuth = async (params) => {
    let reslut = await axiosIns.post("/v1//adminUser/bindGooleAuth",toFormData(params))
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
    let reslut = await axiosIns.post("/v1/offlineRecord/del",toFormData(params))
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
    let reslut = await axiosIns.post("/v1/dictionary/del" , toFormData(params))
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

//---------------------------------集群管理--------------------------------

//新增和修改集群
utilsApi.clusterSave = async (params) => {
    let reslut = await axiosIns.post("/v1/cluster/save", params)
    return reslut
}

//删除集群
utilsApi.delCluster = async (params) => {
    let reslut = await axiosIns.post("/v1/cluster/delCluster", toFormData(params))
    return reslut
}

//分页查询集群数据
utilsApi.clusterPage = async (params) => {
    let reslut = await axiosIns.post("/v1/cluster/page", params)
    return reslut
}

//重置集群商户
utilsApi.resetClusterMerchant = async (params) => {
    let reslut = await axiosIns.post("/v1/cluster/resetMerchant", params)
    return reslut
}

//新增集群商户
utilsApi.insterClusterMerchant = async (params) => {
    let reslut = await axiosIns.post("/v1/cluster/insterMerchant", params)
    return reslut
}

//删除集群商户
utilsApi.delClusterMerchant = async (params) => {
    let reslut = await axiosIns.post("/v1/cluster/delClusterMerchant", toFormData(params))
    return reslut
}

//查询集群的商户
utilsApi.findClusterMerchant = async (params) => {
    let reslut = await axiosIns.get("/v1/cluster/findClusterMerchant?" + formatParams(params))
    return reslut
}

//查询集群可绑定 和未绑定的商户
utilsApi.findAllClusterMerchant = async (params) => {
    let reslut = await axiosIns.get("/v1/cluster/findMerchant?" + formatParams(params))
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
    let reslut = await axiosIns.post("/v1/agent/insertMerchantBusiness", toFormData(params))
    return reslut
}

//查询代理开通某个业务的商户
utilsApi.getMerchantByBusiness = async (params) => {
    let reslut = await axiosIns.get("/v1/merchant/getMerchantByBusiness?" + formatParams(params))
    return reslut
}

//修改代理商费率
utilsApi.updateAgentBusinessRate = async (params) => {
    let reslut = await axiosIns.post("/v1/agent/updateBusinessRate",params)
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

//修改商户业务的状态
utilsApi.updateBusinessStatus = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/updateBusinessStatus",  toFormData(params))
    return reslut
}

//修改商户状态
utilsApi.updateMerchantStatus = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/updateMerchantStatus",  toFormData(params))
    return reslut
}

//新增商户业务费率
utilsApi.merchantInsterbusiness = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/insertBusiness", params)
    return reslut
}

//修改商户商费率
utilsApi.updateMerchantBusinessRate = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/updateBusiessRate", params)
    return reslut
}

//查询商户业务费率
utilsApi.findMerchantRate = async (params) => {
    let reslut = await axiosIns.get("/v1/merchant/findBusiness?" + formatParams(params))
    return reslut
}

//重置登录密码
utilsApi.resetLogPassword = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/resetLogPassword",toFormData(params))
    return reslut
}

//重置支付密码
utilsApi.resetPayPassword = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/resetPayPassword",toFormData(params))
    return reslut
}

//安全校验
utilsApi.ipVerify = async (params) => {
    let reslut = await axiosIns.post("/v1/merchant/ipVerify",toFormData(params))
    return reslut
}


//---------------------------------订单--------------------------------

//查询代收订单
utilsApi.orderPage = async (params) => {
    let reslut = await axiosIns.post("/v1/order/page", params)
    return reslut
}

//补发订单通知
utilsApi.orderNotify = async (params) => {
    let reslut = await axiosIns.get("/v1/orderNotify?" + formatParams(params))
    return reslut
}

//查询代付订单
utilsApi.orderPayOutPage = async (params) => {
    let reslut = await axiosIns.post("/v1/order/payOutPage", params)
    return reslut
}

//支付下单
utilsApi.orderPay = async (params) => {
    let reslut = await axiosIns.post("/v1/orderPay", params)
    return reslut
}

//代付下单
utilsApi.singleOrder = async (params) => {
    let reslut = await axiosIns.post("/v1/singleOrder", params)
    return reslut
}

//完成代付订单
utilsApi.finishPayOut = async (params) => {
    let reslut = await axiosIns.post("/v1/order/finishPayOut",toFormData(params))
    return reslut
}

//完成代收订单
utilsApi.finishOrder = async (params) => {
    let reslut = await axiosIns.post("/v1/order/finishOrder",toFormData(params))
    return reslut
}

//补发代付通知
utilsApi.payOutNotify = async (params) => {
    let reslut = await axiosIns.get("/v1/payOutNotify?" + formatParams(params))
    return reslut
}

//---------------------------------查询商户或者代理商余额--------------------------------
utilsApi.searchBalances = async (params) => {
    let reslut = await axiosIns.get("/v1/account/findByCode?" + formatParams(params))
    return reslut
}

//---------------------------------回u记录--------------------------------

//查询商户回U 数据
utilsApi.merchantOfflinePage = async (params) => {
    let reslut = await axiosIns.post("/v1/merchantOffline/page", params)
    return reslut
}

//通过/驳回 回U申请
utilsApi.updateOffline = async (params) => {
    let reslut = await axiosIns.post("/v1/merchantOffline/updateOffline", params)
    return reslut
}

//---------------------------------财务管理--------------------------------

//冻结和解冻
utilsApi.accountFreeze = async (params) => {
    let reslut = await axiosIns.post("/v1/account/freeze", params)
    return reslut
}

//查询冻结 解冻记录列表
utilsApi.accountPage = async (params) => {
    let reslut = await axiosIns.post("/v1/account/page", params)
    return reslut
}

//解冻审核
utilsApi.accountReview = async (params) => {
    let reslut = await axiosIns.post("/v1/account/review", toFormData(params))
    return reslut
}

//加减余额 申请
utilsApi.balanceOperate = async (params) => {
    let reslut = await axiosIns.post("/v1/account/balanceOperate", params)
    return reslut
}

//查询 加减余额列表
utilsApi.balancePage = async (params) => {
    let reslut = await axiosIns.post("/v1/account/balancePage", params)
    return reslut
}

//审核加减余额
utilsApi.balanceReview = async (params) => {
    let reslut = await axiosIns.post("/v1/account/balanceReview", toFormData(params))
    return reslut
}

export default utilsApi