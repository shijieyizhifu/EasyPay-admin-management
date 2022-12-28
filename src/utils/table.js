/*
 * @Author: hanjiangyanhuo hjpyh@foxmail.com
 * @Date: 2022-10-27 17:37:09
 * @LastEditors: hanjiangyanhuo hjpyh@foxmail.com
 * @LastEditTime: 2022-12-28 13:58:18
 * @FilePath: /vue-element-admin/src/utils/table.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

/*
formRules：简单的校验规则
字段：表格，搜索表单，表单编辑
label：展现标题
key：字段键值
value：存储字段实际值
required：表单是否必填
editDisabled：表单编辑是否禁用
filter：是否列为搜索项
width：表格列宽度，表单字段描述宽度
type：默认是input，可选值select
list：当type为select时，存储选项
listType：默认来源数据字典，可选值custom（用来自定义查询）
listKey：自定义数据字段key
*/
export const formRules = (item) => {
    if(!item.required){
        return {}
    }
    if(!item.type){
        return {required: true, message: `${item.label}不能为空`, trigger: ['blur','change']}
    }
    if(item.type == 'select'){
        return {required: true, message: `请选择${item.label}`, trigger: 'change'}
    }
}
//数据字典
export const dataDictionary = [
    {
        label: '字典类型',
        key: 'type',
        value: '',
        required: true,
        editDisabled: true,
        filter: true,
        width: '140px'
    },
    {
        label: '字典名称',
        key: 'name',
        value: '',
        required: true,
        filter: true
    },{
        label: '字典值',
        key: 'value',
        value: '',
        required: true,
        filter: true
    },{
        label: '排序号',
        key: 'sort',
        value: '',
        required: true
    },{
        label: '字典描述',
        value: '',
        key: 'details',
    }
]

//交易通道
export const tradingChannel = [
    {
        label: '上游通道名称',
        key: 'name',
        value: '',
        required: true,
        filter: true,
        width: '140px'
    },
    {
        label: '上游通道编码',
        key: 'code',
        value: '',
        required: true,
        editDisabled: true,
        filter: true,
        width: '140px'
    },
    {
        label: '状态',
        key: 'status',
        value: '',
        required: true,
        filter: true,
        type: 'select',
        list: []
    },{
        label: '调用方式',
        key: 'runType',
        value: '',
        required: true,
        type: 'select',
        list: []
    },{
        label: '代收下单地址',
        key: 'payUrl',
        value: '',
        required: true,
        width: '140px'
    },{
        label: '代付下单地址',
        key: 'payOutUrl',
        value: '',
        required: true,
        width: '140px'
    },{
        label: '备注',
        key: 'remake',
        value: '',
    },
]

//通道业务
export const tradingBusiness = [
    {
        label: '上游通道编码',
        key: 'agencyCode',
        value: '',
        required: true,
        width: '140px',
        editDisabled: true,
    },{
        label: '业务名称',
        key: 'name',
        value: '',
        required: true,
    },{
        label: '类型',
        key: 'type',
        value: '',
        required: true,
        type: 'select',
        listKey: 'type',
        list: []
    },
    {
        label: '平台业务编码',
        key: 'businessCode',
        value: '',
        required: true,
        type: 'select',
        listType: 'custom',
        list: []
    },
    {
        label: '业务编码',
        key: 'code',
        value: '',
        required: true,
    },{
        label: '结算类型',
        key: 'settleType',
        value: '',
        required: true,
        type: 'select',
        list: []
    },{
        label: '状态',
        key: 'status',
        value: '',
        required: true,
        type: 'select',
        list: []
    },{
        label: '备注',
        key: 'remake',
        value: '',
    }
]

//平台业务
export const platformBusiness = [
    {
        label: '平台业务名称',
        key: 'name',
        value: '',
        required: true,
        filter: true,
    },{
        label: '平台业务编码',
        key: 'code',
        value: '',
        required: true,
        filter: true,
    },{
        label: '类型',
        key: 'type',
        value: '',
        required: true,
        type: 'select',
        listKey: 'type',
        filter: true,
        list: []
    },{
        label: '国家',
        key: 'country',
        value: '',
        required: true,
    },{
        label: '币种',
        key: 'currency',
        value: '',
        required: true,
    },{
        label: '状态',
        key: 'status',
        value: '',
        required: true,
        type: 'select',
        list: []
    },{
        label: '备注',
        key: 'remake',
        value: '',
    }
]

//平台业务关联的通道
export const tradingChannelSim = [
    {
        label: '上游通道编码',
        key: 'agencyCode',
        value: '',
        required: true,
        width: '140px',
        editDisabled: true,
    },{
        label: '平台业务编码',
        key: 'businessCode',
        width: '140px',
        value: '',
        required: true,
    },{
        label: '通道业务编码',
        key: 'code',
        width: '140px',
        value: '',
        required: true,
    },{
        label: '通道业务名称',
        key: 'name',
        width: '140px',
        value: '',
        required: true,
    },{
        label: '类型',
        key: 'type',
        value: '',
        required: true,
        type: 'select',
        listKey: 'type',
        list: []
    },{
        label: '结算类型',
        key: 'settleType',
        value: '',
        required: true,
        type: 'select',
        list: []
    },{
        label: '状态',
        key: 'status',
        value: '',
        required: true,
        type: 'select',
        list: []
    }
]

//通道商户
export const ChannelMerchant = [
    {
        label: '通道商户名称',
        key: 'merchantName',
        value: '',
        required: true,
        filter: true,
    },{
        label: '通道商户',
        key: 'merchant',
        value: '',
        required: true,
        editDisabled: true,
        filter: true,
    },{
        label: '上游通道编码',
        key: 'agencyCode',
        value: '',
        required: true,
        type: 'select',
        editDisabled: true,
        filter: true,
        listType: 'custom',
        list: []
    },{
        label: '状态',
        key: 'status',
        value: '',
        required: true,
        filter: true,
        type: 'select',
        list: []
    },{
        label: 'md5私钥',
        key: 'md5Private',
        value: '',
    },{
        label: 'rsa私钥',
        key: 'rsaPrivate',
        value: '',
    },{
        label: 'rsa公钥',
        key: 'rsaPublic',
        value: '',
    },{
        label: '平台公钥',
        key: 'agencyPublic',
        value: '',
    },{
        label: '备注',
        key: 'remake',
        value: '',
    }
]

//通道商户费率
export const ChannelMerchantRate = [
    {
        label: '商户号',
        key: 'merchant',
        value: '',
        required: true,
        width: '140px',
        editDisabled: true,
    },
    {
        label: '通道编码',
        key: 'agencyCode',
        value: '',
        required: true,
        width: '140px',
        editDisabled: true,
    },
    {
        label: '平台业务编码',
        key: 'businessCode',
        value: '',
        required: true,
        width: '140px',
        hidden: 'table and form',
        editDisabled: true,
    },
    {
        label: '业务名称',
        key: 'businessName',
        value: '',
        required: true,
        type: 'select',
        editDisabled: true,
        listType: 'custom',
        list: []
    },
    {
        label: '支付类型',
        key: 'payType',
        value: '',
        required: true,
        type: 'select',
        list: []
    },{
        label: '费率比例',
        key: 'rate',
        value: '',
        required: true,
    },
    // {
    //     label: '状态',
    //     key: 'status',
    //     value: '',
    //     required: true,
    //     filter: true,
    //     type: 'select',
    //     list: []
    // },
    {
        label: '最低手续费',
        key: 'mixFee',
        value: '-1',
        required: true,
    },{
        label: '每笔固定手续费',
        key: 'fee',
        value: '-1',
        required: true,
    },{
        label: '最高手续费',
        key: 'maxFee',
        value: '-1',
        required: true,
    },{
        label: '订单最小金额限制',
        key: 'mixPriceLimit',
        value: '-1',
        required: true,
    },{
        label: '订单最大金额限制',
        key: 'maxPriceLimit',
        value: '-1',
        required: true,
    },{
        label: '每日订单数量限制',
        key: 'dayCountLimit',
        value: '-1',
        required: true,
    },{
        label: '每月订单数量限制',
        key: 'monthCountLimit',
        value: '-1',
        required: true,
    },{
        label: '每日上限金额',
        key: 'dayPriceLimit',
        value: '-1',
        required: true,
    },{
        label: '每月上限金额',
        key: 'monthPriceLimit',
        value: '-1',
        required: true,
    }
]

//代理商 
export const agent = [
    {
        label: '代理商编码',
        key: 'code',
        value: '',
        filter: true,
    },
    {
        label: '代理商名字',
        key: 'name',
        value: '',
        required: true,
        filter: true,
    },
    {
        label: '代理商手机号',
        key: 'phone',
        value: '',
        required: true,
        filter: true,
    },
    {
        label: '登录名',
        key: 'logName',
        value: '',
        required: true,
    },
]

//代理商费率
export const agentRate = [
    {
        label: '支付类型',
        key: 'payType',
        value: '',
        required: true,
        type: 'select',
        list: []
    },{
        label: '费率比例',
        key: 'rate',
        value: '',
        required: true,
    },{
        label: '最低手续费',
        key: 'mixFee',
        value: '-1',
        required: true,
    },{
        label: '每笔固定手续费',
        key: 'fee',
        value: '-1',
        required: true,
    },{
        label: '最高手续费',
        key: 'maxFee',
        value: '-1',
        required: true,
    },{
        label: '订单最小金额限制',
        key: 'mixPriceLimit',
        value: '-1',
        required: true,
    },{
        label: '订单最大金额限制',
        key: 'maxPriceLimit',
        value: '-1',
        required: true,
    },{
        label: '每日订单数量限制',
        key: 'dayCountLimit',
        value: '-1',
        required: true,
    },{
        label: '每月订单数量限制',
        key: 'monthCountLimit',
        value: '-1',
        required: true,
    },{
        label: '每日上限金额',
        key: 'dayPriceLimit',
        value: '-1',
        required: true,
    },{
        label: '每月上限金额',
        key: 'monthPriceLimit',
        value: '-1',
        required: true,
    }
]

//商户
export const merchant = [
    {
        label: '商户编码',
        key: 'merchantCode',
        value: '',
        filter: true,
        hidden: 'form',
        required: true,
    },
    {
        label: '商户名字',
        key: 'name',
        value: '',
        required: true,
        filter: true,
    },
    {
        label: '状态',
        key: 'status',
        value: '',
        filter: true,
        type: 'select',
        list: []
    },
    {
        label: 'IP认证',
        key: 'ipVerify',
        value: '',
        filter: true,
        type: 'select',
        list: []
    },
    {
        label: '商户手机号',
        key: 'phone',
        value: '',
        required: true,
        filter: true,
    },
    {
        label: '代理商编码',
        key: 'agentCode',
        value: '',
        hidden: 'form',
        required: true,
        filter: true,
    },
    {
        label: '代理商名字',
        key: 'agentName',
        hidden: 'form',
        filter: true,
        value: '',
    },
    {
        label: '登录名',
        key: 'logName',
        value: '',
        required: true,
    },
]

//商户费率
export const merchantRate = [
    {
        label: '平台业务',
        key: 'businessCode',
        value: '',
        required: true,
        type: 'select',
        editDisabled: true,
        filter: true,
        listType: 'custom',
        list: []
    },
    {
        label: '支付类型',
        key: 'payType',
        value: '',
        required: true,
        type: 'select',
        list: []
    },{
        label: '状态',
        key: 'status',
        value: '',
        type: 'select',
        list: []
    },{
        label: '费率比例',
        key: 'rate',
        value: '',
        required: true,
    },{
        label: '最低手续费',
        key: 'mixFee',
        value: '-1',
        required: true,
    },{
        label: '每笔固定手续费',
        key: 'fee',
        value: '-1',
        required: true,
    },{
        label: '最高手续费',
        key: 'maxFee',
        value: '-1',
        required: true,
    },{
        label: '订单最小金额限制',
        key: 'mixPriceLimit',
        value: '-1',
        required: true,
    },{
        label: '订单最大金额限制',
        key: 'maxPriceLimit',
        value: '-1',
        required: true,
    },{
        label: '每日订单数量限制',
        key: 'dayCountLimit',
        value: '-1',
        required: true,
    },{
        label: '每月订单数量限制',
        key: 'monthCountLimit',
        value: '-1',
        required: true,
    },{
        label: '每日上限金额',
        key: 'dayPriceLimit',
        value: '-1',
        required: true,
    },{
        label: '每月上限金额',
        key: 'monthPriceLimit',
        value: '-1',
        required: true,
    }
]

//代收订单 
export const payOrder = [
    {
        label: '商户号',
        key: 'merchant',
        value: '',
        filter: true
    },{
        label: '商户名称',
        key: 'merchantName',
        value: '',
        filter: true,
        // type: 'select',
        // list: [],
        // listKey: 'payStatus',
    },{
        label: '商户订单号',
        key: 'merchantOrderNo',
        value: '',
        filter: true
    },{
        label: '系统订单号',
        key: 'orderNo',
        value: '',
        width: '120px',
        filter: true
    },{
        label: '代理商编码',
        key: 'agentCode',
        value: '',
        filter: true
    },{
        label: '代理商名称',
        key: 'agentName',
        value: '',
        filter: true
    },{
        label: '通道编码',
        key: 'agencyCode',
        value: '',
        filter: true,
        type: 'select',
        listType: 'custom',
        list: []
    },{
        label: '业务编码',
        key: 'businessCode',
        value: '',
        // filter: true
    },{
        label: '业务名称',
        key: 'businessName',
        value: '',
        filter: true,
        type: 'select',
        listType: 'custom',
        list: []
    },{
        label: '状态',
        key: 'status',
        value: '',
        type: 'select',
        list: [],
        listKey: 'payStatus',
        filter: true
    },{
        label: '通知状态',
        key: 'notifyStatus',
        value: '',
        type: 'select',
        list: [],
    },{
        label: '日期',
        key: 'date',
        value: '',
        filter: true,
        type: 'date'
    }
]

//代付订单 
export const payOutOrder = [
    {
        label: '商户号',
        key: 'merchant',
        value: '',
        filter: true
    },{
        label: '商户名称',
        key: 'merchantName',
        value: '',
        filter: true
    },{
        label: '商户订单号',
        key: 'merchantOrderNo',
        value: '',
        filter: true
    },{
        label: '系统订单号',
        key: 'orderNo',
        value: '',
        width: '120px',
        filter: true
    },{
        label: '代理商编码',
        key: 'agentCode',
        value: '',
        filter: true
    },{
        label: '代理商名称',
        key: 'agentName',
        value: '',
        filter: true
    },{
        label: '通道编码',
        key: 'agencyCode',
        value: '',
        filter: true,
        type: 'select',
        listType: 'custom',
        list: []
    },{
        label: '业务编码',
        key: 'businessCode',
        value: '',
        // filter: true
    },{
        label: '业务名称',
        key: 'businessName',
        value: '',
        filter: true,
        type: 'select',
        listType: 'custom',
        list: []
    },{
        label: '收款账户',
        key: 'accNo',
        value: '',
    },{
        label: '收款商户名称',
        key: 'accName',
        width: '120px',
        value: '',
    },{
        label: '银行编码',
        key: 'bankCode',
        value: '',
    },{
        label: '状态',
        key: 'status',
        value: '',
        type: 'select',
        list: [],
        listKey: 'payStatus',
        filter: true
    },{
        label: '回调状态',
        key: 'notifyStatus',
        value: '',
        type: 'select',
        list: [],
    },{
        label: '日期',
        key: 'date',
        value: '',
        filter: true,
        type: 'date'
    }
]

//回U记录
export const backUList = [
    {
        label: '商户编码',
        key: 'merchantCode',
        value: '',
        filter: true
    },
    // {
    //     label: '商户名称',
    //     key: 'merchantName',
    //     value: '',
    //     filter: true
    // },
    {
        label: '币种',
        key: 'currency',
        value: '',
        filter: true
    },{
        label: '金额',
        key: 'amount',
        value: '',
    },{
        label: '状态',
        key: 'status',
        value: '',
        type: 'select',
        list: [],
        listKey: 'backUStatus',
        filter: true
    },{
        label: '回U地址',
        key: 'merchantAddress',
        value: '',
    },{
        label: 'U的费率',
        key: 'usdtRate',
        value: '',
    },{
        label: '收款（U)',
        key: 'actualReceive',
        value: '',
    },{
        label: '付款 (U)',
        key: 'actualPayment',
        value: '',
    },{
        label: '利润（U）',
        key: 'profit',
        width: '120px',
        value: '',
    },{
        label: '通道商户',
        key: 'agencyCode',
        value: '',
    },
]

//解冻/冻结记录
export const fundsList = [
    {
        label: '商户/代理商编码',
        key: 'code',
        value: '',
        width: '140px',
        filter: true
    },{
        label: '商户/代理商名字',
        key: 'name',
        value: '',
        width: '140px',
        filter: true
    },{
        label: '备注',
        key: 'remake',
        value: '',
    },{
        label: '状态',
        key: 'status',
        value: '',
        type: 'select',
        list: [],
        listKey: 'fundsStatus',
        filter: true
    },{
        label: '类型',
        key: 'type',
        value: '',
        type: 'select',
        list: [],
        listKey: 'fundsType',
        filter: true
    },{
        label: '发起人',
        key: 'createName',
        value: '',
    },{
        label: '审核人',
        key: 'reviewName',
        value: '',
    }
]

//调账记录
export const adjustAccountsList = [
    {
        label: '商户/代理商编码',
        key: 'code',
        value: '',
        width: '140px',
        filter: true
    },{
        label: '商户/代理商名字',
        key: 'name',
        value: '',
        width: '140px',
        filter: true
    },{
        label: '备注',
        key: 'remake',
        value: '',
    },{
        label: '状态',
        key: 'status',
        value: '',
        type: 'select',
        list: [],
        listKey: 'fundsStatus',
        filter: true
    },{
        label: '类型',
        key: 'type',
        value: '',
        type: 'select',
        list: [],
        listKey: 'adjustAccountType',
        filter: true
    },{
        label: '发起人',
        key: 'createdName',
        value: '',
    },{
        label: '审核人',
        key: 'reviewName',
        value: '',
    }
]