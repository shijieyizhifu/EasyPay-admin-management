import axios from 'axios'
import { Message } from 'element-ui'
import router from '@/router'
const base64url = require('base64url')
const crypto = require('crypto')

const sysRsaPrivate = "-----BEGIN PRIVATE KEY-----\n" + "MIICeQIBADANBgkqhkiG9w0BAQEFAASCAmMwggJfAgEAAoGBAKVTGCD8/im8bZNP/ZHlHSXNF/Lr9/sA/skZOQ3huOyQvhRUi0ZcPN8hjsvpMJJVFLakIAKUnOMB+Brwur/gRQWIOiqgTN2j0KteXbOLp36kppgd9hZ8AO8C50pfPZRTJUwYrWhytK2aNNpC4og/hgPQXEUAr2fImlJbsSwVLqx7AgMBAAECgYEAgddr+OSZfQ/nAy5smPvXU4vrRjc7UGAsuqXboGJqCSl4j6ECrWTdzeSeMNnY8uRtWzA1j7FGMiemwwnTscSij3kqXci/WDpTEXVeykb5uGLkMk4N3A+atoXkc6eKNLT+TbTcX1GxD42/oCZVzfSg4cbL0MGrRKTGn7yNsW9wX+ECQQDyovID91GIzbXDGfhRMyncF+SYDuXmLtBJrOb1yGyWC7DA8XIkvURO2+PhFyPWCkYwwicdn1rE9rsnn6ngp8XRAkEArm4WzxwZ+euUSNCSmXyGqAlhhVXUH1BtBCBz7z1/oy6hzDegbcQoB90iI/3p0uBXWfPkz8eWezwTcyrR188EiwJBAKCRaKtrPc/UolZsl0HVI/x861Ade9KqZDh9bZJ1gjaBogTtQ2ZAwjWVmuZYk+SPhAe8VHpr/Huf9BayuI7tOCECQQCZr5fbLYhZok5JhbPVFlnSjkllYIUAfi0/WJStcwMVtQ2L0GtCq3UV0Km3Co5NZaqxL+onhFQ7CmicrVqsidMXAkEAtPoUlDZSWaYSFKGZE46PZCEMoujNMKBYqguaqNtsogr6RMHji4Fbx4xc78y3Bu77eu+rz8eYqnkZ6sXMFuwyDg==\n" + "-----END PRIVATE KEY-----"

const axiosIns = axios.create({
    // You can add your headers here
    // ================================
    baseURL: process.env.NODE_ENV === 'production' ? 'https://api.qg-pay.com' : '/v1',
    // timeout: 1000,
    // headers: {'X-Custom-Header': 'foobar'}
})

axiosIns.interceptors.request.use((config) => {
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    const token = localStorage.getItem('token')
    if (token && token != config.headers['X-Token']) {
        config.headers['X-Token'] = token
    }
    if (['/order/excelOrder', '/order/excelPayOut'].indexOf(config.url) > -1) {
        config.responseType = 'blob';
    }
    return config
})

axiosIns.interceptors.response.use((response) => {
    const data = response.data
    if (['/v1/order/excelOrder', '/v1/order/excelPayOut'].indexOf(response.config.url) > -1) {
        return data
    }
    if (data.data?.token) {
        localStorage.setItem('token', data.data?.tokenHead + data.data?.token)
    }
    if (data && data.code != 0 && data.code != 2001) {
        try {
            if (data.image || data.length > 0 || data.buttonText) {
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
    if (data.code == 2001) {
        Message({
            showClose: true,
            message: '??????????????????',
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
    for (let i in obj) {
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

//??????????????????
utilsApi.uploadImgUrl = '/file/uploadImage'

//????????????
utilsApi.imgUrl = process.env.NODE_ENV === 'production' ? 'https://api.qg-pay.com/image/' : 'http://8.218.2.19:8000/image/'

function encryptRSABL(prik, str) {
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
        cache.forEach(o => { result.push(o) })
        i++
        offSet = i * length
    }
    return base64url.fromBase64(new Buffer.from(result).toString('base64'))
}
//????????????????????????
utilsApi.sign = function (data, rsaPrivate) {
    let formatData = formatParams(data)
    let rsaPri = rsaPrivate ? `-----BEGIN PRIVATE KEY-----\n${rsaPrivate}\n-----END PRIVATE KEY-----` : sysRsaPrivate
    return encryptRSABL(rsaPri, formatData)
}

//??????
utilsApi.login = async (params) => {
    let reslut = await axiosIns.post("/adminUser/login", params)
    return reslut
}

//????????????
utilsApi.updatePassword = async (params) => {
    let reslut = await axiosIns.post("/adminUser/updatePassword", params)
    return reslut
}

//???????????????????????????
utilsApi.genSecret = async (params) => {
    let reslut = await axiosIns.get("/adminUser/genSecret", params)
    return reslut
}

//?????????????????????
utilsApi.clearAuth = async (params) => {
    let reslut = await axiosIns.post("/adminUser/clearAuth", toFormData(params))
    return reslut
}


//???????????????????????????
utilsApi.userInfo = async (params) => {
    let reslut = await axiosIns.get("/adminUser/userInfo")
    return reslut
}

//?????????????????????
utilsApi.bindGooleAuth = async (params) => {
    let reslut = await axiosIns.post("/adminUser/bindGooleAuth", toFormData(params))
    return reslut
}

//????????????
utilsApi.sendCode = async (params) => {
    let reslut = await axiosIns.get("/adminUser/sendCode?" + formatParams(params))
    return reslut
}

//????????????
utilsApi.logout = async (params) => {
    let reslut = await axiosIns.get("/adminUser/logout", params)
    return reslut
}

//---------------------------------??????--------------------------------
//??????????????????????????????
utilsApi.todayData = async (params) => {
    let reslut = await axiosIns.get("/index/todayData", params)
    return reslut
}

//??????????????????(????????????)
utilsApi.timeStatistics = async (params) => {
    let reslut = await axiosIns.get("/index/timeStatistics?" + formatParams(params))
    return reslut
}

//---------------------------------????????????--------------------------------

//??????????????????
utilsApi.offlineRecordPage = async (params) => {
    let reslut = await axiosIns.post("/offlineRecord/pageAll", params)
    return reslut
}

//??????
utilsApi.offlineRecordSave = async (params) => {
    let reslut = await axiosIns.post("/offlineRecord/save", params)
    return reslut
}

//??????
utilsApi.offlineRecordUpdate = async (params) => {
    let reslut = await axiosIns.post("/offlineRecord/update", params)
    return reslut
}

//??????
utilsApi.offlineRecordDel = async (params) => {
    let reslut = await axiosIns.post("/offlineRecord/del", toFormData(params))
    return reslut
}

//---------------------------------????????????--------------------------------

//???????????????????????????
utilsApi.getPermission = async (params) => {
    let reslut = await axiosIns.get("/adminUser/permission", params)
    return reslut
}

//?????????????????????
utilsApi.getAllPermission = async (params) => {
    let reslut = await axiosIns.get("/permission/getAll", params)
    return reslut
}

//????????????????????????
utilsApi.updatePermission = async (params) => {
    let reslut = await axiosIns.post("/permission/save", params)
    return reslut
}

//????????????
utilsApi.delPermission = async (params) => {
    let reslut = await axiosIns.get("/permission/del?id=" + params)
    return reslut
}

//---------------------------------????????????--------------------------------

//????????????
utilsApi.getRoles = async (params) => {
    let reslut = await axiosIns.get("/adminRole/getAllPage?" + formatParams(params))
    return reslut
}

//??????????????????
utilsApi.updateRole = async (params) => {
    let reslut = await axiosIns.post("/adminRole/save", params)
    return reslut
}

//???????????????????????????
utilsApi.getRolePermission = async (params) => {
    let reslut = await axiosIns.get("/adminRole/getRolePermission?" + formatParams(params))
    return reslut
}

//????????????
utilsApi.delRole = async (params) => {
    let reslut = await axiosIns.get("/adminRole/del?" + formatParams(params))
    return reslut
}

//---------------------------------????????????--------------------------------

//????????????
utilsApi.getUsers = async (params) => {
    let reslut = await axiosIns.post("/adminUser/getAllPage", params)
    return reslut
}

//??????????????????
utilsApi.updateUser = async (params) => {
    let reslut = await axiosIns.post("/adminUser/save", params)
    return reslut
}

//???????????????????????????
utilsApi.getAllRoles = async (params) => {
    let reslut = await axiosIns.get("/adminRole/getAll")
    return reslut
}

//??????????????????
utilsApi.resetUser = async (params) => {
    let reslut = await axiosIns.post("/adminUser/reset", params)
    return reslut
}

//????????????
utilsApi.delUser = async (params) => {
    let reslut = await axiosIns.get("/adminUser/del?" + formatParams(params))
    return reslut
}

//---------------------------------????????????--------------------------------

//????????????
utilsApi.dictionaryFindPage = async (params) => {
    let reslut = await axiosIns.get("/dictionary/findPage?" + formatParams(params))
    return reslut
}

//??????????????????
utilsApi.updateDictionary = async (params) => {
    let reslut = await axiosIns.post("/dictionary/save", params)
    return reslut
}

//????????????
utilsApi.delDictionary = async (params) => {
    let reslut = await axiosIns.post("/dictionary/del", toFormData(params))
    return reslut
}

//---------------------------------????????????--------------------------------

//---------------------------------????????????--------------------------------

//??????????????????
utilsApi.agencyFindAll = async (params) => {
    let reslut = await axiosIns.get("/agency/findAll")
    return reslut
}

//??????
utilsApi.agencyPage = async (params) => {
    let reslut = await axiosIns.post("/agency/page", params)
    return reslut
}

//??????
utilsApi.saveAgency = async (params) => {
    let reslut = await axiosIns.post("/agency/save", params)
    return reslut
}

//??????????????????
utilsApi.updateStatusAgency = async (params) => {
    let reslut = await axiosIns.post("/agency/updateStatus", params)
    return reslut
}

//?????????????????????????????????
utilsApi.findAgencyCode = async (params) => {
    let reslut = await axiosIns.get("/agencyBusiness/findAgencyCode?" + formatParams(params))
    return reslut
}

//??????????????????????????????
utilsApi.agencyBusinessSave = async (params) => {
    let reslut = await axiosIns.post("/agencyBusiness/save", params)
    return reslut
}

//---------------------------------????????????--------------------------------

//??????????????????
utilsApi.businessFindAll = async (params) => {
    let reslut = await axiosIns.get("/business/findAll")
    return reslut
}

//??????????????????
utilsApi.businessPage = async (params) => {
    let reslut = await axiosIns.post("/business/page", params)
    return reslut
}

//????????????
utilsApi.insterBusiness = async (params) => {
    let reslut = await axiosIns.post("/business/inster", params)
    return reslut
}

//????????????
utilsApi.updateBusiness = async (params) => {
    let reslut = await axiosIns.post("/business/update", params)
    return reslut
}

//???????????????????????????????????????
utilsApi.findAgencyBusiness = async (params) => {
    let reslut = await axiosIns.get("/business/findAgencyBusiness?" + formatParams(params))
    return reslut
}

//---------------------------------????????????--------------------------------

//?????????????????????
utilsApi.clusterSave = async (params) => {
    let reslut = await axiosIns.post("/cluster/save", params)
    return reslut
}

//????????????
utilsApi.delCluster = async (params) => {
    let reslut = await axiosIns.post("/cluster/delCluster", toFormData(params))
    return reslut
}

//????????????????????????
utilsApi.clusterPage = async (params) => {
    let reslut = await axiosIns.post("/cluster/page", params)
    return reslut
}

//??????????????????
utilsApi.resetClusterMerchant = async (params) => {
    let reslut = await axiosIns.post("/cluster/resetMerchant", params)
    return reslut
}

//??????????????????
utilsApi.insterClusterMerchant = async (params) => {
    let reslut = await axiosIns.post("/cluster/insterMerchant", params)
    return reslut
}

//??????????????????
utilsApi.delClusterMerchant = async (params) => {
    let reslut = await axiosIns.post("/cluster/delClusterMerchant", toFormData(params))
    return reslut
}

//?????????????????????
utilsApi.findClusterMerchant = async (params) => {
    let reslut = await axiosIns.get("/cluster/findClusterMerchant?" + formatParams(params))
    return reslut
}

//????????????????????? ?????????????????????
utilsApi.findAllClusterMerchant = async (params) => {
    let reslut = await axiosIns.get("/cluster/findMerchant?" + formatParams(params))
    return reslut
}

//---------------------------------????????????--------------------------------

//??????????????????
utilsApi.agencyMerchantPage = async (params) => {
    let reslut = await axiosIns.post("/agencyMerchant/page", params)
    return reslut
}

//????????????????????????
utilsApi.agencyMerchantFindBalance = async (params) => {
    let reslut = await axiosIns.get("/agencyMerchant/findBalance?" + formatParams(params))
    return reslut
}

//????????????????????????
utilsApi.saveAgencyMerchant = async (params) => {
    let reslut = await axiosIns.post("/agencyMerchant/save", params)
    return reslut
}

//???????????????????????????
utilsApi.findAgencyMerchantRate = async (params) => {
    let reslut = await axiosIns.get("/agencyMerchant/findMerchantRate?" + formatParams(params))
    return reslut
}

//???????????????????????????
utilsApi.merchantRateSave = async (params) => {
    let reslut = await axiosIns.post("/agencyMerchant/merchantRateSave", params)
    return reslut
}

//???????????????????????????????????????
utilsApi.agencyMerchant = async (params) => {
    let reslut = await axiosIns.get("/agencyMerchant/findMerchant?" + formatParams(params))
    return reslut
}

//---------------------------------?????????--------------------------------

//???????????????
utilsApi.agentPage = async (params) => {
    let reslut = await axiosIns.post("/agent/page", params)
    return reslut
}

//???????????????
utilsApi.agentInsert = async (params) => {
    let reslut = await axiosIns.post("/agent/insert", params)
    return reslut
}

//?????????????????????
utilsApi.agentInsterbusiness = async (params) => {
    let reslut = await axiosIns.post("/agent/insterbusiness", params)
    return reslut
}

//??????????????????????????????????????????
utilsApi.findAgentType = async (params) => {
    let reslut = await axiosIns.get("/agent/findBusinessType?" + formatParams(params))
    return reslut
}

//???????????????????????????
utilsApi.findAgentRate = async (params) => {
    let reslut = await axiosIns.get("/agent/findBusiness?" + formatParams(params))
    return reslut
}

//?????????????????????
utilsApi.agentFindAll = async (params) => {
    let reslut = await axiosIns.get("/agent/findAll")
    return reslut
}

//???????????????????????????
utilsApi.findAgentBusinessMerchant = async (params) => {
    let reslut = await axiosIns.get("/agent/agentBusinessMerchant?" + formatParams(params))
    return reslut
}

//?????????????????????????????????
utilsApi.agentInsertMerchantBusiness = async (params) => {
    let reslut = await axiosIns.post("/agent/insertMerchantBusiness", toFormData(params))
    return reslut
}

//???????????????????????????????????????
utilsApi.getMerchantByBusiness = async (params) => {
    let reslut = await axiosIns.get("/merchant/getMerchantByBusiness?" + formatParams(params))
    return reslut
}

//?????????????????????
utilsApi.updateAgentBusinessRate = async (params) => {
    let reslut = await axiosIns.post("/agent/updateBusinessRate", params)
    return reslut
}

//---------------------------------??????--------------------------------

//????????????
utilsApi.merchantPage = async (params) => {
    let reslut = await axiosIns.post("/merchant/page", params)
    return reslut
}

//????????????
utilsApi.merchantSave = async (params) => {
    let reslut = await axiosIns.post("/merchant/save", params)
    return reslut
}

//????????????
utilsApi.merchantUpdate = async (params) => {
    let reslut = await axiosIns.post("/merchant/update", params)
    return reslut
}

//???????????????????????????
utilsApi.updateBusinessStatus = async (params) => {
    let reslut = await axiosIns.post("/merchant/updateBusinessStatus", toFormData(params))
    return reslut
}

//??????????????????
utilsApi.updateMerchantStatus = async (params) => {
    let reslut = await axiosIns.post("/merchant/updateMerchantStatus", toFormData(params))
    return reslut
}

//????????????????????????
utilsApi.merchantInsterbusiness = async (params) => {
    let reslut = await axiosIns.post("/merchant/insertBusiness", params)
    return reslut
}

//?????????????????????
utilsApi.updateMerchantBusinessRate = async (params) => {
    let reslut = await axiosIns.post("/merchant/updateBusiessRate", params)
    return reslut
}

//????????????????????????
utilsApi.findMerchantRate = async (params) => {
    let reslut = await axiosIns.get("/merchant/findBusiness?" + formatParams(params))
    return reslut
}

//??????????????????
utilsApi.resetLogPassword = async (params) => {
    let reslut = await axiosIns.post("/merchant/resetLogPassword", toFormData(params))
    return reslut
}

//??????????????????
utilsApi.resetPayPassword = async (params) => {
    let reslut = await axiosIns.post("/merchant/resetPayPassword", toFormData(params))
    return reslut
}

//????????????
utilsApi.ipVerify = async (params) => {
    let reslut = await axiosIns.post("/merchant/ipVerify", toFormData(params))
    return reslut
}

//??????????????????
utilsApi.clearMercahntGoolAuth = async (params) => {
    let reslut = await axiosIns.post("/merchant/clearMercahntGoolAuth", toFormData(params))
    return reslut
}


//---------------------------------??????--------------------------------

//??????????????????
utilsApi.orderPage = async (params) => {
    let reslut = await axiosIns.post("/order/page", params)
    return reslut
}

//??????????????????
utilsApi.orderNotify = async (params) => {
    let reslut = await axiosIns.get("/orderNotify?" + formatParams(params))
    return reslut
}

//??????????????????
utilsApi.orderPayOutPage = async (params) => {
    let reslut = await axiosIns.post("/order/payOutPage", params)
    return reslut
}

//?????? ??????excel
utilsApi.excelOrder = async (params) => {
    let reslut = await axiosIns.post("/order/excelOrder", params)
    return reslut
}

//????????????excel
utilsApi.excelPayOut = async (params) => {
    let reslut = await axiosIns.post("/order/excelPayOut", params)
    return reslut
}

//????????????
utilsApi.orderPay = async (params) => {
    let reslut = await axiosIns.post("/orderPay", params)
    return reslut
}

//????????????
utilsApi.singleOrder = async (params) => {
    let reslut = await axiosIns.post("/singleOrder", params)
    return reslut
}

//??????????????????
utilsApi.finishPayOut = async (params) => {
    let reslut = await axiosIns.post("/order/finishPayOut", toFormData(params))
    return reslut
}

//??????????????????
utilsApi.finishOrder = async (params) => {
    let reslut = await axiosIns.post("/order/finishOrder", toFormData(params))
    return reslut
}

//??????????????????
utilsApi.payOutNotify = async (params) => {
    let reslut = await axiosIns.get("/payOutNotify?" + formatParams(params))
    return reslut
}

//??????????????????
utilsApi.orderStatistic = async (params) => {
    let reslut = await axiosIns.post("/order/orderStatistic", params)
    return reslut
}

//??????????????????
utilsApi.payOutStatistic = async (params) => {
    let reslut = await axiosIns.post("/order/payOutStatistic", params)
    return reslut
}

//---------------------------------?????????????????????????????????--------------------------------
utilsApi.searchBalances = async (params) => {
    let reslut = await axiosIns.get("/account/findByCode?" + formatParams(params))
    return reslut
}

//---------------------------------???u??????--------------------------------

//???????????????U ??????
utilsApi.merchantOfflinePage = async (params) => {
    let reslut = await axiosIns.post("/merchantOffline/page", params)
    return reslut
}

//??????/?????? ???U??????
utilsApi.updateOffline = async (params) => {
    let reslut = await axiosIns.post("/merchantOffline/updateOffline", params)
    return reslut
}

//---------------------------------????????????--------------------------------

//???????????????
utilsApi.accountFreeze = async (params) => {
    let reslut = await axiosIns.post("/account/freeze", params)
    return reslut
}

//???????????? ??????????????????
utilsApi.accountPage = async (params) => {
    let reslut = await axiosIns.post("/account/page", params)
    return reslut
}

//????????????
utilsApi.accountReview = async (params) => {
    let reslut = await axiosIns.post("/account/review", toFormData(params))
    return reslut
}

//???????????? ??????
utilsApi.balanceOperate = async (params) => {
    let reslut = await axiosIns.post("/account/balanceOperate", params)
    return reslut
}

//?????? ??????????????????
utilsApi.balancePage = async (params) => {
    let reslut = await axiosIns.post("/account/balancePage", params)
    return reslut
}

//??????????????????
utilsApi.balanceReview = async (params) => {
    let reslut = await axiosIns.post("/account/balanceReview", toFormData(params))
    return reslut
}

export default utilsApi